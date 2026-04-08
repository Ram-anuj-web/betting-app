const express = require("express");
console.log("Starting server...");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());
const fantasy11Routes = require('./fantasy11Routes');
app.use('/fantasy11', fantasy11Routes);
const fantasy11SettleRoutes = require('./fantasy11Settle');
app.use('/fantasy11-settle', fantasy11SettleRoutes);

const CRICKET_API_KEY = "0db27b38-9a1c-4e30-86f3-dda28ca1e0c8";
const ODDS_API_KEY    = "537f56e47ea1d0e79220de4ea5cbc780";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ─── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  password: String,
  points: { type: Number, default: 1000 },
  lockedPoints: { type: Number, default: 0 },
});

const betSchema = new mongoose.Schema({
  username: String,
  matchId: String,
  matchLabel: String,
  team: String,
  amount: Number,
  odds: { type: Number, default: 2.0 },
  status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const challengeSchema = new mongoose.Schema({
  challenger: String,
  opponent: String,
  sport: String,
  matchId: String,
  matchLabel: String,
  team1: { type: String, default: null },
  team2: { type: String, default: null },
  challengerTeam: String,
  opponentTeam: String,
  wager: Number,
  status: { type: String, enum: ["pending", "active", "settled", "cancelled"], default: "pending" },
  winner: { type: String, default: null },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  invitedPlayers: [{ type: String }],
  password: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  sport: { type: String, required: true },
  matchId: { type: String, default: "manual" },
  matchLabel: { type: String, required: true },
  team1: { type: String, default: null },
  team2: { type: String, default: null },
  entryFee: { type: Number, required: true },
  maxPlayers: { type: Number, default: 10, min: 2, max: 12 },
  participants: [
    {
      username: String,
      team: String,
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, enum: ["open", "locked", "settled", "cancelled"], default: "open" },
  winner: { type: String, default: null },
  winningTeam: { type: String, default: null },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  password: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const User      = mongoose.model("User", userSchema);
const Bet       = mongoose.model("Bet", betSchema);
const Challenge = mongoose.model("Challenge", challengeSchema);
const Contest   = mongoose.model("Contest", contestSchema);
// Fantasy11Team is handled in models.js — do not register it here

// ─── Fantasy11 Contest Settlement Helper ──────────────────────────────────────
async function settleContest(contest, winnerTeamName, totalPot) {
  const isF11 = contest.participants.every(p => p.team === "fantasy11");

  let winners = [];
  let winningTeam = winnerTeamName;

  if (isF11) {
    const Fantasy11Team = mongoose.models.Fantasy11Team;
    if (!Fantasy11Team) {
      console.log(`Fantasy11Team model not found for contest ${contest._id}, refunding`);
      for (const p of contest.participants) {
        const u = await User.findOne({ name: p.username });
        if (u) { u.points += contest.entryFee; await u.save(); }
      }
      contest.status = "settled";
      contest.winningTeam = "refund";
      contest.winner = "refund";
      await contest.save();
      return;
    }

    const rawId = contest.matchId.replace(/^ipl-?/, "");
    const matchIds = [
      contest.matchId,
      `ipl-${rawId}`,
      `ipl${rawId}`,
      rawId,
    ];

    const f11Teams = await Fantasy11Team.find({
      username: { $in: contest.participants.map(p => p.username) },
      matchId: { $in: matchIds },
      fantasyPoints: { $ne: null },
    }).lean();

    if (f11Teams.length === 0) {
      console.log(`No fantasy points found for contest "${contest.name}", refunding all`);
      for (const p of contest.participants) {
        const u = await User.findOne({ name: p.username });
        if (u) { u.points += contest.entryFee; await u.save(); }
      }
      contest.status = "settled";
      contest.winningTeam = "no_scores";
      contest.winner = "refund";
      await contest.save();
      return;
    }

    const maxPts = Math.max(...f11Teams.map(t => t.fantasyPoints));
    const topTeams = f11Teams.filter(t => t.fantasyPoints === maxPts);
    winners = contest.participants.filter(p => topTeams.some(t => t.username === p.username));
    winningTeam = `Fantasy11 (${maxPts} pts)`;
    console.log(`Fantasy11 contest "${contest.name}": top score ${maxPts} pts, winners: ${winners.map(w => w.username).join(", ")}`);
  } else {
    winners = contest.participants.filter(p => p.team === winnerTeamName);
  }

  if (winners.length === 0) {
    for (const p of contest.participants) {
      const u = await User.findOne({ name: p.username });
      if (u) { u.points += contest.entryFee; await u.save(); }
    }
    contest.winner = "refund";
  } else {
    const prize = Math.floor(totalPot / winners.length);
    const remainder = totalPot - prize * winners.length;
    for (let i = 0; i < winners.length; i++) {
      const u = await User.findOne({ name: winners[i].username });
      if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
    }
    contest.winner = winners.map(w => w.username).join(", ");
  }

  contest.status = "settled";
  contest.winningTeam = winningTeam;
  await contest.save();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password)
      return res.status(400).json({ message: "Name and password are required" });
    const existing = await User.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Username already taken!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, password: hashedPassword });
    await user.save();
    res.json({ name: user.name, points: user.points, lockedPoints: user.lockedPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: "User not found!" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password!" });
    res.json({ name: user.name, points: user.points, lockedPoints: user.lockedPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Place Bet ────────────────────────────────────────────────────────────────
app.post("/bet", async (req, res) => {
  try {
    const { name, amount, matchId, matchLabel, team, odds } = req.body;
    const user = await User.findOne({ name });
    if (!user || amount > user.points || amount <= 0)
      return res.status(400).json({ message: "Invalid bet" });
    const existingBet = await Bet.findOne({ username: name, matchId, status: "pending" });
    if (existingBet)
      return res.status(400).json({ message: "You already have a pending bet on this match!" });
    user.points -= amount;
    user.lockedPoints = (user.lockedPoints || 0) + amount;
    await user.save();
    const betOdds = (odds && odds > 1) ? parseFloat(odds.toFixed(2)) : 2.0;
    const bet = new Bet({ username: name, matchId, matchLabel, team, amount, odds: betOdds });
    await bet.save();
    res.json({ message: "Bet placed! Points locked until match ends.", points: user.points, lockedPoints: user.lockedPoints, bet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/bets/:username", async (req, res) => {
  try {
    const bets = await Bet.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── IPL Matches ──────────────────────────────────────────────────────────────
const IPL_MATCHES = [
  { id: "ipl-1",  team1: "RCB",  team2: "SRH",  date: "2026-03-28", time: "19:30", venue: "Bangalore" },
  { id: "ipl-2",  team1: "MI",   team2: "KKR",  date: "2026-03-29", time: "19:30", venue: "Mumbai" },
  { id: "ipl-3",  team1: "RR",   team2: "CSK",  date: "2026-03-30", time: "19:30", venue: "Guwahati" },
  { id: "ipl-4",  team1: "PBKS", team2: "GT",   date: "2026-03-31", time: "19:30", venue: "Mohali" },
  { id: "ipl-5",  team1: "LSG",  team2: "DC",   date: "2026-04-01", time: "19:30", venue: "Lucknow" },
  { id: "ipl-6",  team1: "KKR",  team2: "SRH",  date: "2026-04-02", time: "19:30", venue: "Kolkata" },
  { id: "ipl-7",  team1: "CSK",  team2: "PBKS", date: "2026-04-03", time: "19:30", venue: "Chennai" },
  { id: "ipl-8",  team1: "DC",   team2: "MI",   date: "2026-04-04", time: "15:30", venue: "Delhi" },
  { id: "ipl-9",  team1: "GT",   team2: "RR",   date: "2026-04-04", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-10", team1: "SRH",  team2: "LSG",  date: "2026-04-05", time: "15:30", venue: "Hyderabad" },
  { id: "ipl-11", team1: "RCB",  team2: "CSK",  date: "2026-04-05", time: "19:30", venue: "Bangalore" },
  { id: "ipl-12", team1: "KKR",  team2: "PBKS", date: "2026-04-06", time: "19:30", venue: "Kolkata" },
  { id: "ipl-13", team1: "RR",   team2: "MI",   date: "2026-04-07", time: "19:30", venue: "Jaipur" },
  { id: "ipl-14", team1: "DC",   team2: "GT",   date: "2026-04-08", time: "19:30", venue: "Delhi" },
  { id: "ipl-15", team1: "KKR",  team2: "LSG",  date: "2026-04-09", time: "19:30", venue: "Kolkata" },
  { id: "ipl-16", team1: "RR",   team2: "RCB",  date: "2026-04-10", time: "19:30", venue: "Jaipur" },
  { id: "ipl-17", team1: "PBKS", team2: "SRH",  date: "2026-04-11", time: "15:30", venue: "Mohali" },
  { id: "ipl-18", team1: "CSK",  team2: "DC",   date: "2026-04-11", time: "19:30", venue: "Chennai" },
  { id: "ipl-19", team1: "LSG",  team2: "GT",   date: "2026-04-12", time: "15:30", venue: "Lucknow" },
  { id: "ipl-20", team1: "MI",   team2: "RCB",  date: "2026-04-12", time: "19:30", venue: "Mumbai" },
  { id: "ipl-21", team1: "SRH",  team2: "RR",   date: "2026-04-13", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-22", team1: "CSK",  team2: "KKR",  date: "2026-04-14", time: "19:30", venue: "Chennai" },
  { id: "ipl-23", team1: "RCB",  team2: "LSG",  date: "2026-04-15", time: "19:30", venue: "Bangalore" },
  { id: "ipl-24", team1: "MI",   team2: "PBKS", date: "2026-04-16", time: "19:30", venue: "Mumbai" },
  { id: "ipl-25", team1: "GT",   team2: "KKR",  date: "2026-04-17", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-26", team1: "RCB",  team2: "DC",   date: "2026-04-18", time: "15:30", venue: "Bangalore" },
  { id: "ipl-27", team1: "SRH",  team2: "CSK",  date: "2026-04-18", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-28", team1: "KKR",  team2: "RR",   date: "2026-04-19", time: "15:30", venue: "Kolkata" },
  { id: "ipl-29", team1: "PBKS", team2: "LSG",  date: "2026-04-19", time: "19:30", venue: "Mohali" },
  { id: "ipl-30", team1: "GT",   team2: "MI",   date: "2026-04-20", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-31", team1: "SRH",  team2: "DC",   date: "2026-04-21", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-32", team1: "LSG",  team2: "RR",   date: "2026-04-22", time: "19:30", venue: "Lucknow" },
  { id: "ipl-33", team1: "MI",   team2: "CSK",  date: "2026-04-23", time: "19:30", venue: "Mumbai" },
  { id: "ipl-34", team1: "RCB",  team2: "GT",   date: "2026-04-24", time: "19:30", venue: "Bangalore" },
  { id: "ipl-35", team1: "DC",   team2: "PBKS", date: "2026-04-25", time: "15:30", venue: "Delhi" },
  { id: "ipl-36", team1: "RR",   team2: "SRH",  date: "2026-04-25", time: "19:30", venue: "Jaipur" },
  { id: "ipl-37", team1: "GT",   team2: "CSK",  date: "2026-04-26", time: "15:30", venue: "Ahmedabad" },
  { id: "ipl-38", team1: "LSG",  team2: "KKR",  date: "2026-04-26", time: "19:30", venue: "Lucknow" },
  { id: "ipl-39", team1: "DC",   team2: "RCB",  date: "2026-04-27", time: "19:30", venue: "Delhi" },
  { id: "ipl-40", team1: "PBKS", team2: "RR",   date: "2026-04-28", time: "19:30", venue: "Mohali" },
  { id: "ipl-41", team1: "MI",   team2: "SRH",  date: "2026-04-29", time: "19:30", venue: "Mumbai" },
  { id: "ipl-42", team1: "GT",   team2: "RCB",  date: "2026-04-30", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-43", team1: "RR",   team2: "DC",   date: "2026-05-01", time: "19:30", venue: "Jaipur" },
  { id: "ipl-44", team1: "CSK",  team2: "MI",   date: "2026-05-02", time: "19:30", venue: "Chennai" },
  { id: "ipl-45", team1: "SRH",  team2: "KKR",  date: "2026-05-03", time: "15:30", venue: "Hyderabad" },
  { id: "ipl-46", team1: "GT",   team2: "PBKS", date: "2026-05-03", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-47", team1: "MI",   team2: "LSG",  date: "2026-05-04", time: "19:30", venue: "Mumbai" },
  { id: "ipl-48", team1: "DC",   team2: "CSK",  date: "2026-05-05", time: "19:30", venue: "Delhi" },
  { id: "ipl-49", team1: "SRH",  team2: "PBKS", date: "2026-05-06", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-50", team1: "LSG",  team2: "RCB",  date: "2026-05-07", time: "19:30", venue: "Lucknow" },
  { id: "ipl-51", team1: "DC",   team2: "KKR",  date: "2026-05-08", time: "19:30", venue: "Delhi" },
  { id: "ipl-52", team1: "RR",   team2: "GT",   date: "2026-05-09", time: "19:30", venue: "Jaipur" },
  { id: "ipl-53", team1: "CSK",  team2: "LSG",  date: "2026-05-10", time: "15:30", venue: "Chennai" },
  { id: "ipl-54", team1: "RCB",  team2: "MI",   date: "2026-05-10", time: "19:30", venue: "Bangalore" },
  { id: "ipl-55", team1: "PBKS", team2: "DC",   date: "2026-05-11", time: "19:30", venue: "Mohali" },
  { id: "ipl-56", team1: "GT",   team2: "SRH",  date: "2026-05-12", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-57", team1: "RCB",  team2: "KKR",  date: "2026-05-13", time: "19:30", venue: "Bangalore" },
  { id: "ipl-58", team1: "PBKS", team2: "MI",   date: "2026-05-14", time: "19:30", venue: "Dharamsala" },
  { id: "ipl-59", team1: "LSG",  team2: "CSK",  date: "2026-05-15", time: "19:30", venue: "Lucknow" },
  { id: "ipl-60", team1: "KKR",  team2: "GT",   date: "2026-05-16", time: "19:30", venue: "Kolkata" },
  { id: "ipl-61", team1: "PBKS", team2: "RCB",  date: "2026-05-17", time: "15:30", venue: "Dharamsala" },
  { id: "ipl-62", team1: "DC",   team2: "RR",   date: "2026-05-17", time: "19:30", venue: "Delhi" },
  { id: "ipl-63", team1: "CSK",  team2: "SRH",  date: "2026-05-18", time: "19:30", venue: "Chennai" },
  { id: "ipl-64", team1: "RR",   team2: "LSG",  date: "2026-05-19", time: "19:30", venue: "Jaipur" },
  { id: "ipl-65", team1: "KKR",  team2: "MI",   date: "2026-05-20", time: "19:30", venue: "Kolkata" },
  { id: "ipl-66", team1: "CSK",  team2: "GT",   date: "2026-05-21", time: "19:30", venue: "Chennai" },
  { id: "ipl-67", team1: "SRH",  team2: "RCB",  date: "2026-05-22", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-68", team1: "LSG",  team2: "PBKS", date: "2026-05-23", time: "19:30", venue: "Lucknow" },
  { id: "ipl-69", team1: "MI",   team2: "RR",   date: "2026-05-24", time: "15:30", venue: "Mumbai" },
  { id: "ipl-70", team1: "KKR",  team2: "DC",   date: "2026-05-24", time: "19:30", venue: "Kolkata" },
];

const TEAM_NAME_MAP = {
  RCB:  ["Royal Challengers Bengaluru", "Royal Challengers Bangalore", "RCB"],
  MI:   ["Mumbai Indians", "MI"],
  CSK:  ["Chennai Super Kings", "CSK"],
  KKR:  ["Kolkata Knight Riders", "KKR"],
  SRH:  ["Sunrisers Hyderabad", "SRH"],
  RR:   ["Rajasthan Royals", "RR"],
  PBKS: ["Punjab Kings", "PBKS", "Kings XI Punjab"],
  GT:   ["Gujarat Titans", "GT"],
  LSG:  ["Lucknow Super Giants", "LSG"],
  DC:   ["Delhi Capitals", "DC"],
};

let oddsCache = { data: null, fetchedAt: 0 };

async function fetchIPLOdds() {
  const now = Date.now();
  if (oddsCache.data && now - oddsCache.fetchedAt < 30 * 60 * 1000) return oddsCache.data;
  try {
    const res = await fetch(`https://api.the-odds-api.com/v4/sports/cricket_ipl/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`);
    if (!res.ok) { console.error("Odds API error:", res.status); return oddsCache.data || []; }
    const data = await res.json();
    oddsCache = { data: data || [], fetchedAt: now };
    console.log(`Odds fetched: ${data.length} matches`);
    return data;
  } catch (err) { console.error("Odds fetch failed:", err.message); return oddsCache.data || []; }
}

function findOddsForMatch(oddsData, team1, team2) {
  if (!oddsData || oddsData.length === 0) return null;
  const aliases1 = TEAM_NAME_MAP[team1] || [team1];
  const aliases2 = TEAM_NAME_MAP[team2] || [team2];
  const match = oddsData.find(m => {
    if (!m.home_team || !m.away_team) return false;
    const home = m.home_team.toLowerCase(), away = m.away_team.toLowerCase();
    return aliases1.some(a => home.includes(a.toLowerCase()) || away.includes(a.toLowerCase())) &&
           aliases2.some(a => home.includes(a.toLowerCase()) || away.includes(a.toLowerCase()));
  });
  if (!match) return null;
  const team1Odds = [], team2Odds = [];
  for (const bookmaker of (match.bookmakers || [])) {
    for (const market of (bookmaker.markets || [])) {
      if (market.key !== "h2h") continue;
      for (const outcome of (market.outcomes || [])) {
        const name = outcome.name.toLowerCase();
        if (aliases1.some(a => name.includes(a.toLowerCase()))) team1Odds.push(outcome.price);
        if (aliases2.some(a => name.includes(a.toLowerCase()))) team2Odds.push(outcome.price);
      }
    }
  }
  if (team1Odds.length === 0 || team2Odds.length === 0) return null;
  const avg = arr => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  return { [team1]: avg(team1Odds), [team2]: avg(team2Odds) };
}

app.get("/odds/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const iplMatch = IPL_MATCHES.find(m => m.id === matchId);
    if (!iplMatch) return res.status(404).json({ message: "Match not found" });
    const oddsData = await fetchIPLOdds();
    const odds = findOddsForMatch(oddsData, iplMatch.team1, iplMatch.team2);
    if (!odds) return res.json({ matchId, team1: iplMatch.team1, team2: iplMatch.team2, odds: { [iplMatch.team1]: 1.9, [iplMatch.team2]: 1.9 }, source: "fallback" });
    res.json({ matchId, team1: iplMatch.team1, team2: iplMatch.team2, odds, source: "live" });
  } catch (err) { console.error("odds error:", err.message); res.status(500).json({ message: "Failed to fetch odds" }); }
});

app.get("/odds-bulk", async (req, res) => {
  try {
    const oddsData = await fetchIPLOdds();
    const today = new Date().toISOString().slice(0, 10);
    const upcomingMatches = IPL_MATCHES.filter(m => m.date >= today).slice(0, 10);
    const result = {};
    for (const match of upcomingMatches) {
      const odds = findOddsForMatch(oddsData, match.team1, match.team2);
      result[match.id] = odds || { [match.team1]: 1.9, [match.team2]: 1.9 };
    }
    res.json({ odds: result, source: oddsData.length > 0 ? "live" : "fallback" });
  } catch (err) { console.error("odds-bulk error:", err.message); res.status(500).json({ message: "Failed to fetch bulk odds" }); }
});

function getMatchesWithStatus() {
  const today = new Date();
  return IPL_MATCHES.map(m => {
    const matchDate = new Date(`${m.date}T${m.time}:00+05:30`);
    const endTime = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000);
    let status = "upcoming";
    if (today >= matchDate && today <= endTime) status = "live";
    else if (today > endTime) status = "completed";
    return { ...m, status };
  });
}

app.get("/ipl-matches", (req, res) => res.json({ matches: getMatchesWithStatus() }));
app.get("/ping", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get("/live-scores", async (req, res) => {
  try {
    const matchesWithStatus = getMatchesWithStatus();
    const today = new Date().toISOString().slice(0, 10);
    const todayMatches = matchesWithStatus.filter(m => m.date === today);
    if (todayMatches.length === 0) return res.json({ matches: [], message: "No IPL matches today." });
    const apiRes = await fetch(`https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`);
    const apiData = await apiRes.json();
    if (!apiData.data) return res.json({ matches: todayMatches, message: "Live data unavailable — showing schedule only.", apiStatus: apiData.status || "unknown" });
    const enriched = todayMatches.map(match => {
      const apiMatch = apiData.data.find(m => m.teams && m.teams.some(t => t.toUpperCase().includes(match.team1.toUpperCase())) && m.teams.some(t => t.toUpperCase().includes(match.team2.toUpperCase())));
      if (!apiMatch) return { ...match, liveData: null };
      return { ...match, liveData: { matchStarted: apiMatch.matchStarted || false, matchEnded: apiMatch.matchEnded || false, matchWinner: apiMatch.matchWinner || null, status: apiMatch.status || null, score: apiMatch.score || [], teams: apiMatch.teams || [], dateTimeGMT: apiMatch.dateTimeGMT || null } };
    });
    res.json({ matches: enriched });
  } catch (err) { console.error("live-scores error:", err.message); res.status(500).json({ message: "Failed to fetch live scores", error: err.message }); }
});

async function checkAndSettleBets() {
  try {
    const pendingBets = await Bet.find({ status: "pending" });
    if (pendingBets.length === 0) return;
    const matchIds = [...new Set(pendingBets.map(b => b.matchId))];
    for (const matchId of matchIds) {
      if (matchId.startsWith("ipl-")) {
        const iplMatch = IPL_MATCHES.find(m => m.id === matchId);
        if (!iplMatch) continue;
        const matchDate = new Date(`${iplMatch.date}T${iplMatch.time}:00+05:30`);
        const endTime = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000);
        if (new Date() < endTime) continue;
        try {
          const res = await fetch(`https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`);
          const data = await res.json();
          if (!data.data) continue;
          const apiMatch = data.data.find(m => m.matchEnded && m.teams && m.teams.some(t => t.toUpperCase().includes(iplMatch.team1.toUpperCase())) && m.teams.some(t => t.toUpperCase().includes(iplMatch.team2.toUpperCase())));
          if (!apiMatch || !apiMatch.matchWinner) { console.log(`No API result yet for ${matchId}`); continue; }
          const winner = apiMatch.matchWinner;
          const matchBets = pendingBets.filter(b => b.matchId === matchId);
          for (const bet of matchBets) {
            const user = await User.findOne({ name: bet.username });
            if (!user) continue;
            const won = winner.toLowerCase().includes(bet.team.toLowerCase());
            if (won) { const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0; user.points += Math.floor(bet.amount * multiplier); }
            user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
            await user.save(); bet.status = won ? "won" : "lost"; await bet.save();
            console.log(`Settled bet for ${bet.username} on ${matchId}: ${bet.status}`);
          }
        } catch (err) { console.error(`Error settling IPL match ${matchId}:`, err.message); }
      } else {
        try {
          const res = await fetch(`https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`);
          const data = await res.json();
          if (!data.data) continue;
          const apiMatch = data.data.find(m => m.id === matchId && m.matchEnded);
          if (!apiMatch || !apiMatch.matchWinner) continue;
          const winner = apiMatch.matchWinner;
          const matchBets = pendingBets.filter(b => b.matchId === matchId);
          for (const bet of matchBets) {
            const user = await User.findOne({ name: bet.username });
            if (!user) continue;
            const won = winner.toLowerCase().includes(bet.team.toLowerCase());
            if (won) { const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0; user.points += Math.floor(bet.amount * multiplier); }
            user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
            await user.save(); bet.status = won ? "won" : "lost"; await bet.save();
          }
        } catch (err) { console.error(`Error settling match ${matchId}:`, err.message); }
      }
    }
  } catch (err) { console.error("checkAndSettleBets error:", err.message); }
}

function isMatchHours() {
  const now = new Date();
  const istHour = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).getUTCHours();
  return istHour >= 15 && istHour <= 23;
}

async function checkAndSettleContests() {
  try {
    const openContests = await Contest.find({ status: { $in: ["open", "locked"] } });
    if (openContests.length === 0) return;
    const apiRes = await fetch(`https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`);
    const apiData = await apiRes.json();
    if (!apiData.data) return;
    for (const contest of openContests) {
      if (!contest.team1 || !contest.team2) continue;
      const iplMatch = IPL_MATCHES.find(m => m.team1 === contest.team1 && m.team2 === contest.team2);
      if (!iplMatch) continue;
      const matchDate = new Date(`${iplMatch.date}T${iplMatch.time}:00+05:30`);
      const endTime = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000);
      if (new Date() < endTime) continue;
      const apiMatch = apiData.data.find(m => m.matchEnded && m.teams && m.teams.some(t => t.toUpperCase().includes(contest.team1.toUpperCase())) && m.teams.some(t => t.toUpperCase().includes(contest.team2.toUpperCase())));
      if (!apiMatch || !apiMatch.matchWinner) continue;
      const winnerTeam = apiMatch.matchWinner.toUpperCase().includes(contest.team1.toUpperCase()) ? contest.team1 : contest.team2;
      const totalPot = contest.entryFee * contest.participants.length;
      await settleContest(contest, winnerTeam, totalPot);
      console.log(`Contest "${contest.name}" auto-settled.`);
    }
  } catch (err) { console.error("checkAndSettleContests error:", err.message); }
}

setInterval(() => {
  if (isMatchHours()) { console.log("Match hours active — checking bets & contests..."); checkAndSettleBets(); checkAndSettleContests(); }
  else { console.log("Outside match hours — skipping."); }
}, 15 * 60 * 1000);

// ─── Admin: Manual Settle ─────────────────────────────────────────────────────
app.post("/admin/settle-match", async (req, res) => {
  try {
    const { matchId, winner } = req.body;
    if (!matchId || !winner) return res.status(400).json({ message: "matchId and winner are required" });
    const pendingBets = await Bet.find({ matchId, status: "pending" });
    let betsSettled = 0;
    for (const bet of pendingBets) {
      const user = await User.findOne({ name: bet.username });
      if (!user) continue;
      const won = winner.toLowerCase().includes(bet.team.toLowerCase());
      if (won) { const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0; user.points += Math.floor(bet.amount * multiplier); }
      user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
      await user.save(); bet.status = won ? "won" : "lost"; await bet.save(); betsSettled++;
    }
    let contestsSettled = 0;
    if (matchId.startsWith("ipl-")) {
      const iplMatch = IPL_MATCHES.find(m => m.id === matchId);
      if (iplMatch) {
        const relatedContests = await Contest.find({ status: { $in: ["open", "locked"] }, team1: iplMatch.team1, team2: iplMatch.team2 });
        for (const contest of relatedContests) {
          const winnerTeam = winner.toLowerCase().includes(iplMatch.team1.toLowerCase()) ? iplMatch.team1 : iplMatch.team2;
          const totalPot = contest.entryFee * contest.participants.length;
          await settleContest(contest, winnerTeam, totalPot);
          contestsSettled++;
        }
      }
    }
    res.json({ message: `Done! Settled ${betsSettled} bet(s) and ${contestsSettled} contest(s) for ${matchId}.`, winner, betsSettled, contestsSettled });
  } catch (err) { console.error("admin/settle-match error:", err.message); res.status(500).json({ message: err.message }); }
});

// ─── Admin: Force re-settle Fantasy11 contest ─────────────────────────────────
app.post("/admin/resiltle-fantasy11-contest", async (req, res) => {
  try {
    const { contestId } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const Fantasy11Team = mongoose.models.Fantasy11Team;
    const matchIds = ["ipl-5", "ipl5", "5"];

    const f11Teams = await Fantasy11Team.find({
      username: { $in: contest.participants.map(p => p.username) },
      matchId: { $in: matchIds },
      fantasyPoints: { $ne: null },
    }).lean();

    if (f11Teams.length === 0)
      return res.status(404).json({ message: "Still no fantasy points found. Run fantasy11-settle/auto first." });

    const maxPts = Math.max(...f11Teams.map(t => t.fantasyPoints));
    const topTeams = f11Teams.filter(t => t.fantasyPoints === maxPts);
    const winners = contest.participants.filter(p => topTeams.some(t => t.username === p.username));
    const totalPot = contest.entryFee * contest.participants.length;
    const prize = Math.floor(totalPot / winners.length);
    const remainder = totalPot - prize * winners.length;

    for (let i = 0; i < winners.length; i++) {
      const u = await User.findOne({ name: winners[i].username });
      if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
    }

    contest.status = "settled";
    contest.winner = winners.map(w => w.username).join(", ");
    contest.winningTeam = `Fantasy11 (${maxPts} pts)`;
    await contest.save();

    res.json({ message: "✅ Re-settled!", winner: contest.winner, winningTeam: contest.winningTeam, prize, totalPot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin: Fix Incorrectly Settled Bets & Contests ──────────────────────────
app.post("/admin/fix-bet", async (req, res) => {
  try {
    const { matchId, winner } = req.body;
    if (!matchId || !winner) return res.status(400).json({ message: "matchId and winner are required" });

    const bets = await Bet.find({ matchId });
    let fixed = 0;

    // ── no_result: refund all lost bets (stake only) ──────────────────────────
    if (winner === "no_result") {
      for (const bet of bets) {
        if (bet.status === "pending") continue; // settle-all handles pending
        const user = await User.findOne({ name: bet.username });
        if (!user) continue;
        user.points += bet.amount;
        await user.save();
        fixed++;
        console.log(`Refunded ${bet.amount} pts to ${bet.username} for abandoned match ${matchId}`);
      }
      return res.json({ message: `Refunded ${fixed} bet(s) for abandoned match ${matchId}.`, fixed, contestsFixed: 0 });
    }

    // ── normal fix: correct wrong winner ─────────────────────────────────────
    for (const bet of bets) {
      const user = await User.findOne({ name: bet.username });
      if (!user) continue;
      const won = winner.toLowerCase().includes(bet.team.toLowerCase());
      const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0;
      const payout = Math.floor(bet.amount * multiplier);

      if (bet.status === "lost" && won) {
        user.points += payout;
        await user.save();
        bet.status = "won";
        await bet.save();
        fixed++;
      } else if (bet.status === "won" && !won) {
        const clawback = Math.min(user.points, payout);
        user.points -= clawback;
        const debt = payout - clawback;
        if (debt > 0) {
          user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - debt);
          console.warn(`Bet fix: ${bet.username} short by ${debt} pts (already spent wrong payout) on ${matchId}`);
        }
        await user.save();
        bet.status = "lost";
        await bet.save();
        fixed++;
      }
    }

    let contestsFixed = 0;
    if (matchId.startsWith("ipl-")) {
      const iplMatch = IPL_MATCHES.find(m => m.id === matchId);
      if (iplMatch) {
        const correctWinningTeam = winner.toLowerCase().includes(iplMatch.team1.toLowerCase()) ? iplMatch.team1 : iplMatch.team2;
        const settledContests = await Contest.find({ status: "settled", team1: iplMatch.team1, team2: iplMatch.team2 });
        for (const contest of settledContests) {
          if (contest.winningTeam === correctWinningTeam) continue;
          const totalPot = contest.entryFee * contest.participants.length;
          const wrongWinners   = contest.participants.filter(p => p.team === contest.winningTeam);
          const correctWinners = contest.participants.filter(p => p.team === correctWinningTeam);
          if (wrongWinners.length > 0) {
            const wrongPrize = Math.floor(totalPot / wrongWinners.length);
            for (const p of wrongWinners) {
              const u = await User.findOne({ name: p.username });
              if (!u) continue;
              const clawback = Math.min(u.points, wrongPrize);
              u.points -= clawback;
              const debt = wrongPrize - clawback;
              if (debt > 0) console.warn(`Contest fix: ${p.username} short by ${debt} pts in contest ${contest._id}`);
              await u.save();
            }
          }
          if (correctWinners.length === 0) {
            for (const p of contest.participants) { const u = await User.findOne({ name: p.username }); if (u) { u.points += contest.entryFee; await u.save(); } }
            contest.winner = "refund";
          } else {
            const prize = Math.floor(totalPot / correctWinners.length);
            const remainder = totalPot - prize * correctWinners.length;
            for (let i = 0; i < correctWinners.length; i++) {
              const u = await User.findOne({ name: correctWinners[i].username });
              if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
            }
            contest.winner = correctWinners.map(w => w.username).join(", ");
          }
          contest.winningTeam = correctWinningTeam;
          await contest.save();
          contestsFixed++;
          console.log(`Contest "${contest.name}" re-settled → winner: ${contest.winner}`);
        }
      }
    }

    res.json({ message: `Fixed ${fixed} bet(s) and ${contestsFixed} contest(s) for ${matchId}.`, winner, fixed, contestsFixed });
  } catch (err) {
    console.error("admin/fix-bet error:", err.message);
    res.status(500).json({ message: err.message });
  }
});
// ─── Admin: Fix Fantasy11 double ipl- prefix in matchId ──────────────────────
app.post("/admin/settle-all", async (req, res) => {
  try {
    const { matchId, winner } = req.body;
    if (!matchId || !winner) return res.status(400).json({ message: "matchId and winner are required" });
    const iplMatch = IPL_MATCHES.find(m => m.id === matchId);

    // 1. Settle Bets
    const pendingBets = await Bet.find({ matchId, status: "pending" });
    let betsSettled = 0;

    if (winner === "no_result") {
      // Refund all bets
      for (const bet of pendingBets) {
        const user = await User.findOne({ name: bet.username });
        if (!user) continue;
        user.points += bet.amount;
        user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
        await user.save();
        bet.status = "lost"; // mark as lost since there's no "refunded" enum; points are returned above
        await bet.save();
        betsSettled++;
      }
    } else {
      for (const bet of pendingBets) {
        const user = await User.findOne({ name: bet.username });
        if (!user) continue;
        const won = winner.toLowerCase().includes(bet.team.toLowerCase());
        if (won) { const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0; user.points += Math.floor(bet.amount * multiplier); }
        user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
        await user.save(); bet.status = won ? "won" : "lost"; await bet.save(); betsSettled++;
      }
    }

    // 2. Settle Contests
    let contestsSettled = 0;
    if (iplMatch) {
      const relatedContests = await Contest.find({ status: { $in: ["open", "locked"] }, team1: iplMatch.team1, team2: iplMatch.team2 });
      for (const contest of relatedContests) {
        const winnerTeam = winner === "no_result"
          ? "no_result"  // settleContest winners.length === 0 → refund path
          : winner.toLowerCase().includes(iplMatch.team1.toLowerCase()) ? iplMatch.team1 : iplMatch.team2;
        const totalPot = contest.entryFee * contest.participants.length;
        await settleContest(contest, winnerTeam, totalPot);
        contestsSettled++;
      }
    }

    // 3. Settle Challenges
    let challengesSettled = 0;
    const activeChallenges = await Challenge.find({ matchId, status: "active" });
    for (const challenge of activeChallenges) {
      const challengerUser = await User.findOne({ name: challenge.challenger });
      const opponentUser   = await User.findOne({ name: challenge.opponent });
      if (!challengerUser || !opponentUser) continue;

      if (winner === "no_result") {
        // Refund both
        challengerUser.points += challenge.wager;
        opponentUser.points += challenge.wager;
        await challengerUser.save();
        await opponentUser.save();
        challenge.winner = "no_result";
        challenge.status = "settled";
        await challenge.save();
      } else {
        const totalPot = challenge.wager * 2;
        let challengeWinner = null;
        if (winner.toLowerCase().includes(challenge.challengerTeam.toLowerCase())) { challengerUser.points += totalPot; challengeWinner = challenge.challenger; await challengerUser.save(); }
        else if (winner.toLowerCase().includes(challenge.opponentTeam.toLowerCase())) { opponentUser.points += totalPot; challengeWinner = challenge.opponent; await opponentUser.save(); }
        else { challengerUser.points += challenge.wager; opponentUser.points += challenge.wager; challengeWinner = "draw"; await challengerUser.save(); await opponentUser.save(); }
        challenge.winner = challengeWinner; challenge.status = "settled"; await challenge.save();
      }
      challengesSettled++;
    }
    res.json({ 
      message: `✅ All settled for ${matchId}! Bets: ${betsSettled}, Contests: ${contestsSettled}, Challenges: ${challengesSettled}`, 
      winner, betsSettled, contestsSettled, challengesSettled, 
      nextStep: `⚠️ Run fantasy11-settle/auto/${matchId} next with Cricbuzz ID!` 
    });
  } catch (err) { console.error("admin/settle-all error:", err.message); res.status(500).json({ message: err.message }); }
});
    app.post("/admin/credit-points", async (req, res) => {
  try {
    const { username, points, reason } = req.body;
    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.points += points;
    await user.save();
    res.json({ message: `✅ Credited ${points} pts to ${username}. Reason: ${reason}`, newPoints: user.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Challenge Routes ─────────────────────────────────────────────────────────
app.post("/challenge/create", async (req, res) => {
  try {
    const { challenger, opponent, sport, matchId, matchLabel, challengerTeam, wager, team1, team2, visibility, invitedPlayers, password } = req.body;
    const isPrivate = visibility === "private";
    if (!challenger || !sport || !matchLabel || !challengerTeam || !wager) return res.status(400).json({ message: "Missing required fields" });
    if (isPrivate) { if (!invitedPlayers || invitedPlayers.length === 0) return res.status(400).json({ message: "Private challenge needs at least one invited player" }); if (!password) return res.status(400).json({ message: "Private challenge needs a password" }); }
    else { if (!opponent) return res.status(400).json({ message: "Public challenge needs an opponent" }); if (challenger === opponent) return res.status(400).json({ message: "You can't challenge yourself!" }); const opponentUser = await User.findOne({ name: opponent }); if (!opponentUser) return res.status(404).json({ message: "Opponent not found" }); }
    const challengerUser = await User.findOne({ name: challenger });
    if (!challengerUser) return res.status(404).json({ message: "Challenger not found" });
    if (challengerUser.points < wager) return res.status(400).json({ message: "Not enough points to wager" });
    challengerUser.points -= wager; await challengerUser.save();
    const challenge = new Challenge({ challenger, opponent: isPrivate ? null : opponent, sport, matchId: matchId || "manual", matchLabel, challengerTeam, wager, team1: team1 || null, team2: team2 || null, status: "pending", visibility: visibility || "public", invitedPlayers: isPrivate ? invitedPlayers : [], password: isPrivate ? password : null });
    await challenge.save();
    res.json({ message: "Challenge sent!", challenge, challengerPoints: challengerUser.points });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/challenge/accept", async (req, res) => {
  try {
    const { challengeId, opponentTeam, username } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "pending") return res.status(400).json({ message: "Challenge is no longer pending" });
    if (!opponentTeam) return res.status(400).json({ message: "Please pick a team" });
    if (opponentTeam === challenge.challengerTeam) return res.status(400).json({ message: "Pick a different team!" });
    const acceptingUser = username || challenge.opponent;
    if (!acceptingUser) return res.status(400).json({ message: "No opponent specified" });
    if (challenge.visibility === "private" && !challenge.invitedPlayers?.includes(acceptingUser)) return res.status(403).json({ message: "You are not invited to this challenge" });
    const opponentUser = await User.findOne({ name: acceptingUser });
    if (!opponentUser) return res.status(404).json({ message: "Opponent not found" });
    if (opponentUser.points < challenge.wager) return res.status(400).json({ message: "Not enough points" });
    opponentUser.points -= challenge.wager; await opponentUser.save();
    challenge.opponent = acceptingUser; challenge.opponentTeam = opponentTeam; challenge.status = "active"; await challenge.save();
    res.json({ message: "Challenge accepted!", challenge, opponentPoints: opponentUser.points });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/challenge/decline", async (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "pending") return res.status(400).json({ message: "Can only decline pending challenges" });
    const challengerUser = await User.findOne({ name: challenge.challenger });
    if (challengerUser) { challengerUser.points += challenge.wager; await challengerUser.save(); }
    challenge.status = "cancelled"; await challenge.save();
    res.json({ message: "Challenge cancelled. Wager refunded.", challenge });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/challenge/settle", async (req, res) => {
  try {
    const { challengeId, winningTeam } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "active") return res.status(400).json({ message: "Challenge is not active" });
    const challengerUser = await User.findOne({ name: challenge.challenger });
    const opponentUser = await User.findOne({ name: challenge.opponent });
    if (!challengerUser || !opponentUser) return res.status(404).json({ message: "User not found" });
    const totalPot = challenge.wager * 2;
    let winner = null;
    if (winningTeam === challenge.challengerTeam) { challengerUser.points += totalPot; winner = challenge.challenger; await challengerUser.save(); }
    else if (winningTeam === challenge.opponentTeam) { opponentUser.points += totalPot; winner = challenge.opponent; await opponentUser.save(); }
    else { challengerUser.points += challenge.wager; opponentUser.points += challenge.wager; winner = "draw"; await challengerUser.save(); await opponentUser.save(); }
    challenge.winner = winner; challenge.status = "settled"; await challenge.save();
    res.json({ message: winner === "draw" ? "Draw! Both refunded." : `${winner} wins!`, winner, pot: totalPot, challenge, challengerPoints: challengerUser.points, opponentPoints: opponentUser.points });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.get("/challenges/:username", async (req, res) => {
  try {
    const challenges = await Challenge.find({ $or: [{ challenger: req.params.username }, { opponent: req.params.username }, { invitedPlayers: req.params.username }] }).sort({ createdAt: -1 }).limit(50);
    res.json({ challenges });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Contest Routes ───────────────────────────────────────────────────────────
app.post("/contest/create", async (req, res) => {
  try {
    const { createdBy, name, sport, matchId, matchLabel, team1, team2, entryFee, maxPlayers, myTeam, visibility, password } = req.body;
    if (!createdBy || !name || !sport || !matchLabel || !entryFee || !myTeam) return res.status(400).json({ message: "Missing required fields" });
    if (visibility === "private" && !password) return res.status(400).json({ message: "Private contest requires a password" });
    const max = parseInt(maxPlayers) || 10;
    if (max < 2 || max > 12) return res.status(400).json({ message: "Max players must be between 2 and 12" });
    const user = await User.findOne({ name: createdBy });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < entryFee) return res.status(400).json({ message: "Not enough points for entry fee" });
    user.points -= entryFee; await user.save();
    const contest = new Contest({
      name, createdBy, sport,
      // Change 1 — Fix 2: normalize matchId format
      matchId: matchId
        ? (matchId.startsWith("ipl-") ? matchId : `ipl-${matchId.replace(/^ipl/, "")}`)
        : "manual",
      matchLabel, team1: team1 || null, team2: team2 || null, entryFee, maxPlayers: max, participants: [{ username: createdBy, team: myTeam }], status: "open", visibility: visibility || "public", password: visibility === "private" ? password : null
    });
    await contest.save();
    res.json({ message: "Contest created!", contest, creatorPoints: user.points });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.get("/contests", async (req, res) => {
  try {
    const contests = await Contest.find({ status: { $in: ["open", "locked"] } }).sort({ createdAt: -1 }).limit(50).select("-password");
    res.json({ contests });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/contests/:username", async (req, res) => {
  try {
    const contests = await Contest.find({ $or: [{ createdBy: req.params.username }, { "participants.username": req.params.username }] }).sort({ createdAt: -1 }).limit(50).select("-password");
    res.json({ contests });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/contest/join", async (req, res) => {
  try {
    const { contestId, username, team, password } = req.body;
    if (!contestId || !username || !team) return res.status(400).json({ message: "Missing fields" });

    const contest = await Contest.findById(contestId).select("status visibility password entryFee maxPlayers");
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status !== "open") return res.status(400).json({ message: "Contest is not open" });

    if (contest.visibility === "private") {
      if (!password) return res.status(403).json({ message: "This contest requires a password" });
      if (password !== contest.password) return res.status(403).json({ message: "Wrong password — please try again" });
    }

    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < contest.entryFee) return res.status(400).json({ message: "Not enough points" });

    const updated = await Contest.findOneAndUpdate(
      {
        _id: contest._id,
        status: "open",
        $expr: { $lt: [{ $size: "$participants" }, "$maxPlayers"] },
        // Change 3 — Fix 5: exact string match (no regex) to prevent duplicate joins
        participants: {
          $not: {
            $elemMatch: { username: username },
          },
        },
      },
      { $push: { participants: { username, team } } },
      { new: true }
    );

    if (!updated) return res.status(400).json({ message: "Contest is full or you already joined!" });

    user.points -= contest.entryFee;
    await user.save();

    if (updated.participants.length >= updated.maxPlayers) {
      updated.status = "locked";
      await updated.save();
    }

    res.json({ message: "Joined contest!", contest: updated, userPoints: user.points });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/contest/settle", async (req, res) => {
  try {
    const { contestId, winningTeam, settledBy } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status === "settled") return res.status(400).json({ message: "Already settled" });
    if (contest.createdBy !== settledBy) return res.status(403).json({ message: "Only the creator can settle" });
    const totalPot = contest.entryFee * contest.participants.length;
    await settleContest(contest, winningTeam, totalPot);
    res.json({ message: `Contest settled!`, contest });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/contest/cancel", async (req, res) => {
  try {
    const { contestId, cancelledBy } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.createdBy !== cancelledBy) return res.status(403).json({ message: "Only creator can cancel" });
    if (contest.status === "settled") return res.status(400).json({ message: "Already settled" });
    for (const p of contest.participants) { const u = await User.findOne({ name: p.username }); if (u) { u.points += contest.entryFee; await u.save(); } }
    contest.status = "cancelled"; await contest.save();
    res.json({ message: "Contest cancelled. All entry fees refunded.", contest });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────
app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, points: 1, _id: 0 }).sort({ points: -1 }).limit(20);
    res.json({ users });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Mines Game ───────────────────────────────────────────────────────────────
app.post("/mines/start", async (req, res) => {
  try {
    const { username, bet } = req.body;
    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (bet <= 0 || bet > user.points)
      return res.status(400).json({ message: "Invalid bet amount" });
    user.points -= bet;
    await user.save();
    res.json({ message: "Bet deducted. Game started.", points: user.points });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/mines/cashout", async (req, res) => {
  try {
    const { username, winnings } = req.body;
    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.points += Math.floor(winnings);
    await user.save();
    res.json({ message: "Winnings added!", points: user.points });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  try { checkAndSettleBets(); } catch (err) { console.log("Error in checkAndSettleBets:", err); }
});