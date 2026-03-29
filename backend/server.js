const express = require("express");
console.log("Starting server...");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

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
  odds: { type: Number, default: 2.0 }, // ← NEW: store the odds at bet time
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

// ─── Place Bet (now accepts odds) ─────────────────────────────────────────────
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

    // Store odds (default 2.0 if not provided for backward compat)
    const betOdds = (odds && odds > 1) ? parseFloat(odds.toFixed(2)) : 2.0;
    const bet = new Bet({ username: name, matchId, matchLabel, team, amount, odds: betOdds });
    await bet.save();

    res.json({
      message: "Bet placed! Points locked until match ends.",
      points: user.points,
      lockedPoints: user.lockedPoints,
      bet,
    });
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
  { id: 1,  team1: "RCB",  team2: "SRH",  date: "2026-03-28", time: "19:30", venue: "Bangalore" },
  { id: 2,  team1: "MI",   team2: "KKR",  date: "2026-03-29", time: "19:30", venue: "Mumbai" },
  { id: 3,  team1: "RR",   team2: "CSK",  date: "2026-03-30", time: "19:30", venue: "Guwahati" },
  { id: 4,  team1: "PBKS", team2: "GT",   date: "2026-03-31", time: "19:30", venue: "Mohali" },
  { id: 5,  team1: "LSG",  team2: "DC",   date: "2026-04-01", time: "19:30", venue: "Lucknow" },
  { id: 6,  team1: "SRH",  team2: "LSG",  date: "2026-04-02", time: "19:30", venue: "Hyderabad" },
  { id: 7,  team1: "RCB",  team2: "CSK",  date: "2026-04-03", time: "19:30", venue: "Bangalore" },
  { id: 8,  team1: "DC",   team2: "MI",   date: "2026-04-04", time: "15:30", venue: "Delhi" },
  { id: 9,  team1: "GT",   team2: "RR",   date: "2026-04-04", time: "19:30", venue: "Ahmedabad" },
  { id: 10, team1: "KKR",  team2: "PBKS", date: "2026-04-05", time: "15:30", venue: "Kolkata" },
  { id: 11, team1: "CSK",  team2: "MI",   date: "2026-04-05", time: "19:30", venue: "Chennai" },
  { id: 12, team1: "LSG",  team2: "RCB",  date: "2026-04-06", time: "19:30", venue: "Lucknow" },
  { id: 13, team1: "SRH",  team2: "DC",   date: "2026-04-07", time: "19:30", venue: "Hyderabad" },
  { id: 14, team1: "RR",   team2: "KKR",  date: "2026-04-08", time: "19:30", venue: "Jaipur" },
  { id: 15, team1: "PBKS", team2: "GT",   date: "2026-04-09", time: "19:30", venue: "Mohali" },
  { id: 16, team1: "MI",   team2: "LSG",  date: "2026-04-10", time: "19:30", venue: "Mumbai" },
  { id: 17, team1: "RCB",  team2: "RR",   date: "2026-04-11", time: "19:30", venue: "Bangalore" },
  { id: 18, team1: "CSK",  team2: "SRH",  date: "2026-04-12", time: "15:30", venue: "Chennai" },
  { id: 19, team1: "DC",   team2: "KKR",  date: "2026-04-12", time: "19:30", venue: "Delhi" },
  { id: 20, team1: "GT",   team2: "MI",   date: "2026-04-13", time: "19:30", venue: "Ahmedabad" },
  { id: 21, team1: "SRH",  team2: "RR",   date: "2026-04-13", time: "19:30", venue: "Hyderabad" },
  { id: 22, team1: "CSK",  team2: "KKR",  date: "2026-04-14", time: "19:30", venue: "Chennai" },
  { id: 23, team1: "RCB",  team2: "LSG",  date: "2026-04-15", time: "19:30", venue: "Bangalore" },
  { id: 24, team1: "MI",   team2: "PBKS", date: "2026-04-16", time: "19:30", venue: "Mumbai" },
  { id: 25, team1: "GT",   team2: "KKR",  date: "2026-04-17", time: "19:30", venue: "Ahmedabad" },
  { id: 26, team1: "RCB",  team2: "DC",   date: "2026-04-18", time: "15:30", venue: "Bangalore" },
  { id: 27, team1: "SRH",  team2: "CSK",  date: "2026-04-18", time: "19:30", venue: "Hyderabad" },
  { id: 28, team1: "KKR",  team2: "RR",   date: "2026-04-19", time: "15:30", venue: "Kolkata" },
  { id: 29, team1: "PBKS", team2: "LSG",  date: "2026-04-19", time: "19:30", venue: "Mohali" },
  { id: 30, team1: "GT",   team2: "MI",   date: "2026-04-20", time: "19:30", venue: "Ahmedabad" },
  { id: 31, team1: "SRH",  team2: "DC",   date: "2026-04-21", time: "19:30", venue: "Hyderabad" },
  { id: 32, team1: "LSG",  team2: "RR",   date: "2026-04-22", time: "19:30", venue: "Lucknow" },
  { id: 33, team1: "MI",   team2: "CSK",  date: "2026-04-23", time: "19:30", venue: "Mumbai" },
  { id: 34, team1: "RCB",  team2: "GT",   date: "2026-04-24", time: "19:30", venue: "Bangalore" },
  { id: 35, team1: "DC",   team2: "PBKS", date: "2026-04-25", time: "15:30", venue: "Delhi" },
  { id: 36, team1: "RR",   team2: "SRH",  date: "2026-04-25", time: "19:30", venue: "Jaipur" },
  { id: 37, team1: "GT",   team2: "CSK",  date: "2026-04-26", time: "15:30", venue: "Ahmedabad" },
  { id: 38, team1: "LSG",  team2: "KKR",  date: "2026-04-26", time: "19:30", venue: "Lucknow" },
  { id: 39, team1: "DC",   team2: "RCB",  date: "2026-04-27", time: "19:30", venue: "Delhi" },
  { id: 40, team1: "PBKS", team2: "RR",   date: "2026-04-28", time: "19:30", venue: "Mohali" },
  { id: 41, team1: "MI",   team2: "SRH",  date: "2026-04-29", time: "19:30", venue: "Mumbai" },
  { id: 42, team1: "GT",   team2: "RCB",  date: "2026-04-30", time: "19:30", venue: "Ahmedabad" },
  { id: 43, team1: "RR",   team2: "DC",   date: "2026-05-01", time: "19:30", venue: "Jaipur" },
  { id: 44, team1: "CSK",  team2: "MI",   date: "2026-05-02", time: "19:30", venue: "Chennai" },
  { id: 45, team1: "SRH",  team2: "KKR",  date: "2026-05-03", time: "15:30", venue: "Hyderabad" },
  { id: 46, team1: "GT",   team2: "PBKS", date: "2026-05-03", time: "19:30", venue: "Ahmedabad" },
  { id: 47, team1: "MI",   team2: "LSG",  date: "2026-05-04", time: "19:30", venue: "Mumbai" },
  { id: 48, team1: "DC",   team2: "CSK",  date: "2026-05-05", time: "19:30", venue: "Delhi" },
  { id: 49, team1: "SRH",  team2: "PBKS", date: "2026-05-06", time: "19:30", venue: "Hyderabad" },
  { id: 50, team1: "LSG",  team2: "RCB",  date: "2026-05-07", time: "19:30", venue: "Lucknow" },
  { id: 51, team1: "DC",   team2: "KKR",  date: "2026-05-08", time: "19:30", venue: "Delhi" },
  { id: 52, team1: "RR",   team2: "GT",   date: "2026-05-09", time: "19:30", venue: "Jaipur" },
  { id: 53, team1: "CSK",  team2: "LSG",  date: "2026-05-10", time: "15:30", venue: "Chennai" },
  { id: 54, team1: "RCB",  team2: "MI",   date: "2026-05-10", time: "19:30", venue: "Bangalore" },
  { id: 55, team1: "PBKS", team2: "DC",   date: "2026-05-11", time: "19:30", venue: "Mohali" },
  { id: 56, team1: "GT",   team2: "SRH",  date: "2026-05-12", time: "19:30", venue: "Ahmedabad" },
  { id: 57, team1: "RCB",  team2: "KKR",  date: "2026-05-13", time: "19:30", venue: "Bangalore" },
  { id: 58, team1: "PBKS", team2: "MI",   date: "2026-05-14", time: "19:30", venue: "Dharamsala" },
  { id: 59, team1: "LSG",  team2: "CSK",  date: "2026-05-15", time: "19:30", venue: "Lucknow" },
  { id: 60, team1: "KKR",  team2: "GT",   date: "2026-05-16", time: "19:30", venue: "Kolkata" },
  { id: 61, team1: "PBKS", team2: "RCB",  date: "2026-05-17", time: "15:30", venue: "Dharamsala" },
  { id: 62, team1: "DC",   team2: "RR",   date: "2026-05-17", time: "19:30", venue: "Delhi" },
  { id: 63, team1: "CSK",  team2: "SRH",  date: "2026-05-18", time: "19:30", venue: "Chennai" },
  { id: 64, team1: "RR",   team2: "LSG",  date: "2026-05-19", time: "19:30", venue: "Jaipur" },
  { id: 65, team1: "KKR",  team2: "MI",   date: "2026-05-20", time: "19:30", venue: "Kolkata" },
  { id: 66, team1: "CSK",  team2: "GT",   date: "2026-05-21", time: "19:30", venue: "Chennai" },
  { id: 67, team1: "SRH",  team2: "RCB",  date: "2026-05-22", time: "19:30", venue: "Hyderabad" },
  { id: 68, team1: "LSG",  team2: "PBKS", date: "2026-05-23", time: "19:30", venue: "Lucknow" },
  { id: 69, team1: "MI",   team2: "RR",   date: "2026-05-24", time: "15:30", venue: "Mumbai" },
  { id: 70, team1: "KKR",  team2: "DC",   date: "2026-05-24", time: "19:30", venue: "Kolkata" },
];

// ─── IPL team name → The Odds API team name mapping ───────────────────────────
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

// ─── Odds cache (refresh every 30 min to save API quota) ─────────────────────
let oddsCache = { data: null, fetchedAt: 0 };

async function fetchIPLOdds() {
  const now = Date.now();
  // Return cache if fresh (30 min)
  if (oddsCache.data && now - oddsCache.fetchedAt < 30 * 60 * 1000) {
    return oddsCache.data;
  }
  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/cricket_ipl/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`
    );
    if (!res.ok) {
      console.error("Odds API error:", res.status);
      return oddsCache.data || [];
    }
    const data = await res.json();
    oddsCache = { data: data || [], fetchedAt: now };
    console.log(`Odds fetched: ${data.length} matches`);
    return data;
  } catch (err) {
    console.error("Odds fetch failed:", err.message);
    return oddsCache.data || [];
  }
}

// ─── Match odds for a specific IPL match ──────────────────────────────────────
function findOddsForMatch(oddsData, team1, team2) {
  if (!oddsData || oddsData.length === 0) return null;

  const aliases1 = TEAM_NAME_MAP[team1] || [team1];
  const aliases2 = TEAM_NAME_MAP[team2] || [team2];

  const match = oddsData.find(m => {
    if (!m.home_team || !m.away_team) return false;
    const home = m.home_team.toLowerCase();
    const away = m.away_team.toLowerCase();
    const hasTeam1 = aliases1.some(a => home.includes(a.toLowerCase()) || away.includes(a.toLowerCase()));
    const hasTeam2 = aliases2.some(a => home.includes(a.toLowerCase()) || away.includes(a.toLowerCase()));
    return hasTeam1 && hasTeam2;
  });

  if (!match) return null;

  // Average odds across bookmakers for stability
  const team1Odds = [];
  const team2Odds = [];

  for (const bookmaker of (match.bookmakers || [])) {
    for (const market of (bookmaker.markets || [])) {
      if (market.key !== "h2h") continue;
      for (const outcome of (market.outcomes || [])) {
        const name = outcome.name.toLowerCase();
        const isTeam1 = aliases1.some(a => name.includes(a.toLowerCase()));
        const isTeam2 = aliases2.some(a => name.includes(a.toLowerCase()));
        if (isTeam1) team1Odds.push(outcome.price);
        if (isTeam2) team2Odds.push(outcome.price);
      }
    }
  }

  if (team1Odds.length === 0 || team2Odds.length === 0) return null;

  const avg = arr => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));

  return {
    [team1]: avg(team1Odds),
    [team2]: avg(team2Odds),
  };
}

// ─── GET /odds/:matchId ───────────────────────────────────────────────────────
app.get("/odds/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const iplId = parseInt(matchId.replace("ipl-", ""));
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId);

    if (!iplMatch) return res.status(404).json({ message: "Match not found" });

    const oddsData = await fetchIPLOdds();
    const odds = findOddsForMatch(oddsData, iplMatch.team1, iplMatch.team2);

    if (!odds) {
      // Fallback: balanced odds when API has no data yet
      return res.json({
        matchId,
        team1: iplMatch.team1,
        team2: iplMatch.team2,
        odds: { [iplMatch.team1]: 1.9, [iplMatch.team2]: 1.9 },
        source: "fallback",
      });
    }

    res.json({
      matchId,
      team1: iplMatch.team1,
      team2: iplMatch.team2,
      odds,
      source: "live",
    });
  } catch (err) {
    console.error("odds error:", err.message);
    res.status(500).json({ message: "Failed to fetch odds" });
  }
});

// ─── GET /odds-bulk — fetch odds for all upcoming matches at once ─────────────
app.get("/odds-bulk", async (req, res) => {
  try {
    const oddsData = await fetchIPLOdds();
    const today = new Date().toISOString().slice(0, 10);
    const upcomingMatches = IPL_MATCHES.filter(m => m.date >= today).slice(0, 10); // next 10

    const result = {};
    for (const match of upcomingMatches) {
      const odds = findOddsForMatch(oddsData, match.team1, match.team2);
      result[`ipl-${match.id}`] = odds || {
        [match.team1]: 1.9,
        [match.team2]: 1.9,
      };
    }

    res.json({ odds: result, source: oddsData.length > 0 ? "live" : "fallback" });
  } catch (err) {
    console.error("odds-bulk error:", err.message);
    res.status(500).json({ message: "Failed to fetch bulk odds" });
  }
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

// ─── Live Scores ──────────────────────────────────────────────────────────────
app.get("/live-scores", async (req, res) => {
  try {
    const matchesWithStatus = getMatchesWithStatus();
    const today = new Date().toISOString().slice(0, 10);
    const todayMatches = matchesWithStatus.filter(m => m.date === today);

    if (todayMatches.length === 0) {
      return res.json({ matches: [], message: "No IPL matches today." });
    }

    const apiRes = await fetch(
      `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`
    );
    const apiData = await apiRes.json();

    if (!apiData.data) {
      return res.json({
        matches: todayMatches,
        message: "Live data unavailable — showing schedule only.",
        apiStatus: apiData.status || "unknown",
      });
    }

    const enriched = todayMatches.map(match => {
      const apiMatch = apiData.data.find(m =>
        m.teams &&
        m.teams.some(t => t.toUpperCase().includes(match.team1.toUpperCase())) &&
        m.teams.some(t => t.toUpperCase().includes(match.team2.toUpperCase()))
      );
      if (!apiMatch) return { ...match, liveData: null };
      return {
        ...match,
        liveData: {
          matchStarted: apiMatch.matchStarted || false,
          matchEnded:   apiMatch.matchEnded   || false,
          matchWinner:  apiMatch.matchWinner  || null,
          status:       apiMatch.status       || null,
          score:        apiMatch.score        || [],
          teams:        apiMatch.teams        || [],
          dateTimeGMT:  apiMatch.dateTimeGMT  || null,
        },
      };
    });

    res.json({ matches: enriched });
  } catch (err) {
    console.error("live-scores error:", err.message);
    res.status(500).json({ message: "Failed to fetch live scores", error: err.message });
  }
});

// ─── Auto-settle bets (uses stored odds for payout) ──────────────────────────
async function checkAndSettleBets() {
  try {
    const pendingBets = await Bet.find({ status: "pending" });
    if (pendingBets.length === 0) return;

    const matchIds = [...new Set(pendingBets.map(b => b.matchId))];

    for (const matchId of matchIds) {
      if (matchId.startsWith("ipl-")) {
        const iplId = parseInt(matchId.replace("ipl-", ""));
        const iplMatch = IPL_MATCHES.find(m => m.id === iplId);
        if (!iplMatch) continue;

        const matchDate = new Date(`${iplMatch.date}T${iplMatch.time}:00+05:30`);
        const endTime = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000);
        if (new Date() < endTime) continue;

        try {
          const res = await fetch(
            `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`
          );
          const data = await res.json();
          if (!data.data) continue;

          const apiMatch = data.data.find(m =>
            m.matchEnded &&
            m.teams &&
            m.teams.some(t => t.toUpperCase().includes(iplMatch.team1.toUpperCase())) &&
            m.teams.some(t => t.toUpperCase().includes(iplMatch.team2.toUpperCase()))
          );

          if (!apiMatch || !apiMatch.matchWinner) {
            console.log(`No API result yet for ${matchId}, will retry next interval`);
            continue;
          }

          const winner = apiMatch.matchWinner;
          const matchBets = pendingBets.filter(b => b.matchId === matchId);

          for (const bet of matchBets) {
            const user = await User.findOne({ name: bet.username });
            if (!user) continue;
            const won = winner.toLowerCase().includes(bet.team.toLowerCase());
            if (won) {
              // Use stored odds for payout, fallback to 2x
              const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0;
              const payout = Math.floor(bet.amount * multiplier);
              user.points += payout;
            }
            user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
            await user.save();
            bet.status = won ? "won" : "lost";
            await bet.save();
            console.log(`Settled bet for ${bet.username} on ${matchId}: ${bet.status}`);
          }
        } catch (err) {
          console.error(`Error settling IPL match ${matchId}:`, err.message);
        }

      } else {
        try {
          const res = await fetch(
            `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`
          );
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
            if (won) {
              const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0;
              user.points += Math.floor(bet.amount * multiplier);
            }
            user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
            await user.save();
            bet.status = won ? "won" : "lost";
            await bet.save();
          }
        } catch (err) {
          console.error(`Error settling match ${matchId}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("checkAndSettleBets error:", err.message);
  }
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

    const apiRes = await fetch(
      `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0`
    );
    const apiData = await apiRes.json();
    if (!apiData.data) return;

    for (const contest of openContests) {
      if (!contest.team1 || !contest.team2) continue;

      const iplMatch = IPL_MATCHES.find(
        m => m.team1 === contest.team1 && m.team2 === contest.team2
      );
      if (!iplMatch) continue;

      const matchDate = new Date(`${iplMatch.date}T${iplMatch.time}:00+05:30`);
      const endTime   = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000);
      if (new Date() < endTime) continue;

      const apiMatch = apiData.data.find(m =>
        m.matchEnded &&
        m.teams &&
        m.teams.some(t => t.toUpperCase().includes(contest.team1.toUpperCase())) &&
        m.teams.some(t => t.toUpperCase().includes(contest.team2.toUpperCase()))
      );
      if (!apiMatch || !apiMatch.matchWinner) continue;

      const winningTeam = apiMatch.matchWinner.toUpperCase().includes(contest.team1.toUpperCase())
        ? contest.team1
        : contest.team2;

      const winners   = contest.participants.filter(p => p.team === winningTeam);
      const totalPot  = contest.entryFee * contest.participants.length;

      if (winners.length === 0) {
        for (const p of contest.participants) {
          const u = await User.findOne({ name: p.username });
          if (u) { u.points += contest.entryFee; await u.save(); }
        }
        contest.status = "settled";
        contest.winningTeam = winningTeam;
        contest.winner = "refund";
      } else {
        const prize     = Math.floor(totalPot / winners.length);
        const remainder = totalPot - prize * winners.length;
        for (let i = 0; i < winners.length; i++) {
          const u = await User.findOne({ name: winners[i].username });
          if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
        }
        contest.status      = "settled";
        contest.winningTeam = winningTeam;
        contest.winner      = winners.map(w => w.username).join(", ");
      }

      await contest.save();
      console.log(`Contest "${contest.name}" auto-settled. Winner team: ${winningTeam}`);
    }
  } catch (err) {
    console.error("checkAndSettleContests error:", err.message);
  }
}

setInterval(() => {
  if (isMatchHours()) {
    console.log("Match hours active — checking bets & contests...");
    checkAndSettleBets();
    checkAndSettleContests();
  } else {
    console.log("Outside match hours — skipping.");
  }
}, 15 * 60 * 1000);

// ─── Admin: Manual Settle ─────────────────────────────────────────────────────
app.post("/admin/settle-match", async (req, res) => {
  try {
    const { matchId, winner } = req.body;
    if (!matchId || !winner)
      return res.status(400).json({ message: "matchId and winner are required" });

    const pendingBets = await Bet.find({ matchId, status: "pending" });
    let betsSettled = 0;
    for (const bet of pendingBets) {
      const user = await User.findOne({ name: bet.username });
      if (!user) continue;
      const won = winner.toLowerCase().includes(bet.team.toLowerCase());
      if (won) {
        const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0;
        user.points += Math.floor(bet.amount * multiplier);
      }
      user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
      await user.save();
      bet.status = won ? "won" : "lost";
      await bet.save();
      betsSettled++;
    }

    let contestsSettled = 0;
    if (matchId.startsWith("ipl-")) {
      const iplId = parseInt(matchId.replace("ipl-", ""));
      const iplMatch = IPL_MATCHES.find(m => m.id === iplId);
      if (iplMatch) {
        const relatedContests = await Contest.find({
          status: { $in: ["open", "locked"] },
          team1: iplMatch.team1,
          team2: iplMatch.team2,
        });
        for (const contest of relatedContests) {
          const winningTeam = winner.toLowerCase().includes(iplMatch.team1.toLowerCase())
            ? iplMatch.team1 : iplMatch.team2;
          const winners  = contest.participants.filter(p => p.team === winningTeam);
          const totalPot = contest.entryFee * contest.participants.length;
          if (winners.length === 0) {
            for (const p of contest.participants) {
              const u = await User.findOne({ name: p.username });
              if (u) { u.points += contest.entryFee; await u.save(); }
            }
            contest.winner = "refund";
          } else {
            const prize     = Math.floor(totalPot / winners.length);
            const remainder = totalPot - prize * winners.length;
            for (let i = 0; i < winners.length; i++) {
              const u = await User.findOne({ name: winners[i].username });
              if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
            }
            contest.winner = winners.map(w => w.username).join(", ");
          }
          contest.status = "settled";
          contest.winningTeam = winner.toLowerCase().includes(iplMatch.team1.toLowerCase())
            ? iplMatch.team1 : iplMatch.team2;
          await contest.save();
          contestsSettled++;
        }
      }
    }

    res.json({ message: `Done! Settled ${betsSettled} bet(s) and ${contestsSettled} contest(s) for ${matchId}.`, winner, betsSettled, contestsSettled });
  } catch (err) {
    console.error("admin/settle-match error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin: Fix wrongly settled bets ─────────────────────────────────────────
app.post("/admin/fix-bet", async (req, res) => {
  try {
    const { matchId, winner } = req.body;
    if (!matchId || !winner)
      return res.status(400).json({ message: "matchId and winner are required" });

    const bets = await Bet.find({ matchId });
    let fixed = 0;

    for (const bet of bets) {
      const user = await User.findOne({ name: bet.username });
      if (!user) continue;
      const won = winner.toLowerCase().includes(bet.team.toLowerCase());
      const multiplier = bet.odds && bet.odds > 1 ? bet.odds : 2.0;

      if (bet.status === "lost" && won) {
        user.points += Math.floor(bet.amount * multiplier);
        user.lockedPoints = Math.max(0, user.lockedPoints - bet.amount);
        await user.save();
        bet.status = "won";
        await bet.save();
        fixed++;
      } else if (bet.status === "won" && !won) {
        user.points = Math.max(0, user.points - Math.floor(bet.amount * multiplier));
        await user.save();
        bet.status = "lost";
        await bet.save();
        fixed++;
      }
    }

    let contestsFixed = 0;
    if (matchId.startsWith("ipl-")) {
      const iplId = parseInt(matchId.replace("ipl-", ""));
      const iplMatch = IPL_MATCHES.find(m => m.id === iplId);
      if (iplMatch) {
        const settledContests = await Contest.find({ status: "settled", team1: iplMatch.team1, team2: iplMatch.team2 });
        for (const contest of settledContests) {
          const correctWinningTeam = winner.toLowerCase().includes(iplMatch.team1.toLowerCase()) ? iplMatch.team1 : iplMatch.team2;
          if (contest.winningTeam === correctWinningTeam) continue;
          const wrongWinners   = contest.participants.filter(p => p.team === contest.winningTeam);
          const correctWinners = contest.participants.filter(p => p.team === correctWinningTeam);
          const totalPot = contest.entryFee * contest.participants.length;
          for (const p of wrongWinners) {
            const u = await User.findOne({ name: p.username });
            if (u) { u.points = Math.max(0, u.points - Math.floor(totalPot / wrongWinners.length)); await u.save(); }
          }
          if (correctWinners.length === 0) {
            for (const p of contest.participants) {
              const u = await User.findOne({ name: p.username });
              if (u) { u.points += contest.entryFee; await u.save(); }
            }
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
        }
      }
    }

    res.json({ message: `Fixed ${fixed} bet(s) and ${contestsFixed} contest(s) for ${matchId}.`, winner, fixed, contestsFixed });
  } catch (err) {
    console.error("admin/fix-bet error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Challenge Routes ─────────────────────────────────────────────────────────
app.post("/challenge/create", async (req, res) => {
  try {
    const { challenger, opponent, sport, matchId, matchLabel, challengerTeam, wager, team1, team2, visibility, invitedPlayers, password } = req.body;
    const isPrivate = visibility === "private";
    if (!challenger || !sport || !matchLabel || !challengerTeam || !wager)
      return res.status(400).json({ message: "Missing required fields" });
    if (isPrivate) {
      if (!invitedPlayers || invitedPlayers.length === 0) return res.status(400).json({ message: "Private challenge needs at least one invited player" });
      if (!password) return res.status(400).json({ message: "Private challenge needs a password" });
    } else {
      if (!opponent) return res.status(400).json({ message: "Public challenge needs an opponent" });
      if (challenger === opponent) return res.status(400).json({ message: "You can't challenge yourself!" });
      const opponentUser = await User.findOne({ name: opponent });
      if (!opponentUser) return res.status(404).json({ message: "Opponent not found" });
    }
    const challengerUser = await User.findOne({ name: challenger });
    if (!challengerUser) return res.status(404).json({ message: "Challenger not found" });
    if (challengerUser.points < wager) return res.status(400).json({ message: "Not enough points to wager" });
    challengerUser.points -= wager;
    await challengerUser.save();
    const challenge = new Challenge({ challenger, opponent: isPrivate ? null : opponent, sport, matchId: matchId || "manual", matchLabel, challengerTeam, wager, team1: team1 || null, team2: team2 || null, status: "pending", visibility: visibility || "public", invitedPlayers: isPrivate ? invitedPlayers : [], password: isPrivate ? password : null });
    await challenge.save();
    res.json({ message: "Challenge sent!", challenge, challengerPoints: challengerUser.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
    if (challenge.visibility === "private" && !challenge.invitedPlayers?.includes(acceptingUser))
      return res.status(403).json({ message: "You are not invited to this challenge" });
    const opponentUser = await User.findOne({ name: acceptingUser });
    if (!opponentUser) return res.status(404).json({ message: "Opponent not found" });
    if (opponentUser.points < challenge.wager) return res.status(400).json({ message: "Not enough points" });
    opponentUser.points -= challenge.wager;
    await opponentUser.save();
    challenge.opponent = acceptingUser;
    challenge.opponentTeam = opponentTeam;
    challenge.status = "active";
    await challenge.save();
    res.json({ message: "Challenge accepted!", challenge, opponentPoints: opponentUser.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/challenge/decline", async (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "pending") return res.status(400).json({ message: "Can only decline pending challenges" });
    const challengerUser = await User.findOne({ name: challenge.challenger });
    if (challengerUser) { challengerUser.points += challenge.wager; await challengerUser.save(); }
    challenge.status = "cancelled";
    await challenge.save();
    res.json({ message: "Challenge cancelled. Wager refunded.", challenge });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/challenge/settle", async (req, res) => {
  try {
    const { challengeId, winningTeam } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "active") return res.status(400).json({ message: "Challenge is not active" });
    const challengerUser = await User.findOne({ name: challenge.challenger });
    const opponentUser   = await User.findOne({ name: challenge.opponent });
    if (!challengerUser || !opponentUser) return res.status(404).json({ message: "User not found" });
    const totalPot = challenge.wager * 2;
    let winner = null;
    if (winningTeam === challenge.challengerTeam) {
      challengerUser.points += totalPot; winner = challenge.challenger; await challengerUser.save();
    } else if (winningTeam === challenge.opponentTeam) {
      opponentUser.points += totalPot; winner = challenge.opponent; await opponentUser.save();
    } else {
      challengerUser.points += challenge.wager; opponentUser.points += challenge.wager;
      winner = "draw"; await challengerUser.save(); await opponentUser.save();
    }
    challenge.winner = winner; challenge.status = "settled"; await challenge.save();
    res.json({ message: winner === "draw" ? "Draw! Both refunded." : `${winner} wins!`, winner, pot: totalPot, challenge, challengerPoints: challengerUser.points, opponentPoints: opponentUser.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/challenges/:username", async (req, res) => {
  try {
    const challenges = await Challenge.find({
      $or: [{ challenger: req.params.username }, { opponent: req.params.username }, { invitedPlayers: req.params.username }],
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Contest Routes ───────────────────────────────────────────────────────────
app.post("/contest/create", async (req, res) => {
  try {
    const { createdBy, name, sport, matchId, matchLabel, team1, team2, entryFee, maxPlayers, myTeam, visibility, password } = req.body;
    if (!createdBy || !name || !sport || !matchLabel || !entryFee || !myTeam)
      return res.status(400).json({ message: "Missing required fields" });
    if (visibility === "private" && !password)
      return res.status(400).json({ message: "Private contest requires a password" });
    const max = parseInt(maxPlayers) || 10;
    if (max < 2 || max > 12) return res.status(400).json({ message: "Max players must be between 2 and 12" });
    const user = await User.findOne({ name: createdBy });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < entryFee) return res.status(400).json({ message: "Not enough points for entry fee" });
    user.points -= entryFee;
    await user.save();
    const contest = new Contest({ name, createdBy, sport, matchId: matchId || "manual", matchLabel, team1: team1 || null, team2: team2 || null, entryFee, maxPlayers: max, participants: [{ username: createdBy, team: myTeam }], status: "open", visibility: visibility || "public", password: visibility === "private" ? password : null });
    await contest.save();
    res.json({ message: "Contest created!", contest, creatorPoints: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/contests", async (req, res) => {
  try {
    const contests = await Contest.find({ status: { $in: ["open", "locked"] } }).sort({ createdAt: -1 }).limit(50).select("-password");
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/contests/:username", async (req, res) => {
  try {
    const contests = await Contest.find({ $or: [{ createdBy: req.params.username }, { "participants.username": req.params.username }] }).sort({ createdAt: -1 }).limit(50).select("-password");
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/contest/join", async (req, res) => {
  try {
    const { contestId, username, team, password } = req.body;
    if (!contestId || !username || !team) return res.status(400).json({ message: "Missing fields" });
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status !== "open") return res.status(400).json({ message: "Contest is not open" });
    if (contest.participants.length >= contest.maxPlayers) return res.status(400).json({ message: "Contest is full!" });
    if (contest.participants.find(p => p.username === username)) return res.status(400).json({ message: "You already joined this contest" });
    if (contest.visibility === "private") {
      if (!password) return res.status(403).json({ message: "This contest requires a password" });
      if (password !== contest.password) return res.status(403).json({ message: "Wrong password — please try again" });
    }
    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < contest.entryFee) return res.status(400).json({ message: "Not enough points" });
    user.points -= contest.entryFee;
    await user.save();
    contest.participants.push({ username, team });
    if (contest.participants.length >= contest.maxPlayers) contest.status = "locked";
    await contest.save();
    res.json({ message: "Joined contest!", contest, userPoints: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/contest/settle", async (req, res) => {
  try {
    const { contestId, winningTeam, settledBy } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status === "settled") return res.status(400).json({ message: "Already settled" });
    if (contest.createdBy !== settledBy) return res.status(403).json({ message: "Only the creator can settle" });
    const winners = contest.participants.filter(p => p.team === winningTeam);
    const totalPot = contest.entryFee * contest.participants.length;
    if (winners.length === 0) {
      for (const p of contest.participants) {
        const u = await User.findOne({ name: p.username });
        if (u) { u.points += contest.entryFee; await u.save(); }
      }
      contest.status = "settled"; contest.winningTeam = winningTeam; contest.winner = "refund";
      await contest.save();
      return res.json({ message: "No winners — everyone refunded.", contest });
    }
    const prize = Math.floor(totalPot / winners.length);
    const remainder = totalPot - prize * winners.length;
    for (let i = 0; i < winners.length; i++) {
      const u = await User.findOne({ name: winners[i].username });
      if (u) { u.points += prize + (i === 0 ? remainder : 0); await u.save(); }
    }
    contest.status = "settled"; contest.winningTeam = winningTeam; contest.winner = winners.map(w => w.username).join(", ");
    await contest.save();
    res.json({ message: `${winners.length} winner(s)! Prize: ${prize} pts each.`, winners: winners.map(w => w.username), prize, totalPot, contest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/contest/cancel", async (req, res) => {
  try {
    const { contestId, cancelledBy } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.createdBy !== cancelledBy) return res.status(403).json({ message: "Only creator can cancel" });
    if (contest.status === "settled") return res.status(400).json({ message: "Already settled" });
    for (const p of contest.participants) {
      const u = await User.findOne({ name: p.username });
      if (u) { u.points += contest.entryFee; await u.save(); }
    }
    contest.status = "cancelled";
    await contest.save();
    res.json({ message: "Contest cancelled. All entry fees refunded.", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────
app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, points: 1, _id: 0 }).sort({ points: -1 }).limit(20);
    res.json({ users });
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