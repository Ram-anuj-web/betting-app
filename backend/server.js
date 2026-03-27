const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const CRICKET_API_KEY = "0db27b38-9a1c-4e30-86f3-dda28ca1e0c8";

mongoose.connect("mongodb://127.0.0.1:27017/betting")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

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
  status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const challengeSchema = new mongoose.Schema({
  challenger: String,
  opponent: String,
  sport: String,
  matchId: String,
  matchLabel: String,
  // ✅ FIX: store the two actual teams on the challenge so opponent sees correct options
  team1: { type: String, default: null },
  team2: { type: String, default: null },
  challengerTeam: String,
  opponentTeam: String,
  wager: Number,
  status: { type: String, enum: ["pending", "active", "settled", "cancelled"], default: "pending" },
  winner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// ─── Contest Schema (group, 2–12 players) ────────────────────────────────────
const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },           // Contest title
  createdBy: { type: String, required: true },
  sport: { type: String, required: true },
  matchId: { type: String, default: "manual" },
  matchLabel: { type: String, required: true },
  team1: { type: String, default: null },           // actual teams for the match
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
  winner: { type: String, default: null },          // username of winner, or "draw"
  winningTeam: { type: String, default: null },
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

// ─── Place Bet ────────────────────────────────────────────────────────────────
app.post("/bet", async (req, res) => {
  try {
    const { name, amount, matchId, matchLabel, team } = req.body;
    const user = await User.findOne({ name });

    if (!user || amount > user.points || amount <= 0)
      return res.status(400).json({ message: "Invalid bet" });

    const existingBet = await Bet.findOne({ username: name, matchId, status: "pending" });
    if (existingBet)
      return res.status(400).json({ message: "You already have a pending bet on this match!" });

    user.points -= amount;
    user.lockedPoints = (user.lockedPoints || 0) + amount;
    await user.save();

    const bet = new Bet({ username: name, matchId, matchLabel, team, amount });
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

// ─── Auto-settle bets ─────────────────────────────────────────────────────────
async function checkAndSettleBets() {
  try {
    const pendingBets = await Bet.find({ status: "pending" });
    if (pendingBets.length === 0) return;
    const matchIds = [...new Set(pendingBets.map(b => b.matchId))];
    for (const matchId of matchIds) {
      if (matchId.startsWith("ipl-")) continue;
      try {
        const res = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${matchId}`);
        const data = await res.json();
        if (!data.data || !data.data.matchEnded) continue;
        const winner = data.data.matchWinner;
        if (!winner) continue;
        const matchBets = pendingBets.filter(b => b.matchId === matchId);
        for (const bet of matchBets) {
          const user = await User.findOne({ name: bet.username });
          if (!user) continue;
          const won = winner.toLowerCase().includes(bet.team.toLowerCase());
          if (won) user.points += bet.amount * 2;
          user.lockedPoints = Math.max(0, (user.lockedPoints || 0) - bet.amount);
          await user.save();
          bet.status = won ? "won" : "lost";
          await bet.save();
        }
      } catch (err) {
        console.error(`Error settling match ${matchId}:`, err.message);
      }
    }
  } catch (err) {
    console.error("checkAndSettleBets error:", err.message);
  }
}
setInterval(checkAndSettleBets, 5 * 60 * 1000);

// ─── Challenge Routes ─────────────────────────────────────────────────────────
app.post("/challenge/create", async (req, res) => {
  try {
    const { challenger, opponent, sport, matchId, matchLabel, challengerTeam, wager, team1, team2 } = req.body;
    if (!challenger || !opponent || !sport || !matchLabel || !challengerTeam || !wager)
      return res.status(400).json({ message: "Missing required fields" });
    if (challenger === opponent)
      return res.status(400).json({ message: "You can't challenge yourself!" });
    const challengerUser = await User.findOne({ name: challenger });
    const opponentUser   = await User.findOne({ name: opponent });
    if (!challengerUser) return res.status(404).json({ message: "Challenger not found" });
    if (!opponentUser)   return res.status(404).json({ message: "Opponent not found" });
    if (challengerUser.points < wager)
      return res.status(400).json({ message: "Not enough points to wager" });
    challengerUser.points -= wager;
    await challengerUser.save();
    // ✅ FIX: save team1 & team2 so opponent sees the correct team options
    const challenge = new Challenge({
      challenger, opponent, sport,
      matchId: matchId || "manual",
      matchLabel, challengerTeam, wager,
      team1: team1 || null,
      team2: team2 || null,
      status: "pending",
    });
    await challenge.save();
    res.json({ message: "Challenge sent!", challenge, challengerPoints: challengerUser.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/challenge/accept", async (req, res) => {
  try {
    const { challengeId, opponentTeam } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge)                      return res.status(404).json({ message: "Challenge not found" });
    if (challenge.status !== "pending")  return res.status(400).json({ message: "Challenge is no longer pending" });
    if (!opponentTeam)                   return res.status(400).json({ message: "Please pick a team" });
    if (opponentTeam === challenge.challengerTeam) return res.status(400).json({ message: "Pick a different team!" });
    const opponentUser = await User.findOne({ name: challenge.opponent });
    if (!opponentUser)                   return res.status(404).json({ message: "Opponent not found" });
    if (opponentUser.points < challenge.wager) return res.status(400).json({ message: "Not enough points" });
    opponentUser.points -= challenge.wager;
    await opponentUser.save();
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
      $or: [{ challenger: req.params.username }, { opponent: req.params.username }],
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Contest Routes ───────────────────────────────────────────────────────────

// Create a contest
app.post("/contest/create", async (req, res) => {
  try {
    const { createdBy, name, sport, matchId, matchLabel, team1, team2, entryFee, maxPlayers, myTeam } = req.body;
    if (!createdBy || !name || !sport || !matchLabel || !entryFee || !myTeam)
      return res.status(400).json({ message: "Missing required fields" });

    const max = parseInt(maxPlayers) || 10;
    if (max < 2 || max > 12)
      return res.status(400).json({ message: "Max players must be between 2 and 12" });

    const user = await User.findOne({ name: createdBy });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < entryFee) return res.status(400).json({ message: "Not enough points for entry fee" });

    user.points -= entryFee;
    await user.save();

    const contest = new Contest({
      name, createdBy, sport,
      matchId: matchId || "manual",
      matchLabel,
      team1: team1 || null,
      team2: team2 || null,
      entryFee, maxPlayers: max,
      participants: [{ username: createdBy, team: myTeam }],
      status: "open",
    });
    await contest.save();
    res.json({ message: "Contest created!", contest, creatorPoints: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all open contests (browse)
app.get("/contests", async (req, res) => {
  try {
    const contests = await Contest.find({ status: "open" }).sort({ createdAt: -1 }).limit(50);
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get contests for a user (joined or created)
app.get("/contests/:username", async (req, res) => {
  try {
    const contests = await Contest.find({
      $or: [
        { createdBy: req.params.username },
        { "participants.username": req.params.username },
      ],
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Join a contest
app.post("/contest/join", async (req, res) => {
  try {
    const { contestId, username, team } = req.body;
    if (!contestId || !username || !team)
      return res.status(400).json({ message: "Missing fields" });

    const contest = await Contest.findById(contestId);
    if (!contest)                       return res.status(404).json({ message: "Contest not found" });
    if (contest.status !== "open")      return res.status(400).json({ message: "Contest is not open" });
    if (contest.participants.length >= contest.maxPlayers)
      return res.status(400).json({ message: "Contest is full!" });
    if (contest.participants.find(p => p.username === username))
      return res.status(400).json({ message: "You already joined this contest" });

    const user = await User.findOne({ name: username });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.points < contest.entryFee) return res.status(400).json({ message: "Not enough points" });

    user.points -= contest.entryFee;
    await user.save();

    contest.participants.push({ username, team });
    // Lock contest if full
    if (contest.participants.length >= contest.maxPlayers) contest.status = "locked";
    await contest.save();

    res.json({ message: "Joined contest!", contest, userPoints: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Settle a contest (creator picks winner team)
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
      // No one picked the right team — refund everyone
      for (const p of contest.participants) {
        const u = await User.findOne({ name: p.username });
        if (u) { u.points += contest.entryFee; await u.save(); }
      }
      contest.status = "settled";
      contest.winningTeam = winningTeam;
      contest.winner = "refund";
      await contest.save();
      return res.json({ message: "No winners — everyone refunded.", contest });
    }

    // Split pot equally among winners
    const prize = Math.floor(totalPot / winners.length);
    for (const p of winners) {
      const u = await User.findOne({ name: p.username });
      if (u) { u.points += prize; await u.save(); }
    }

    contest.status = "settled";
    contest.winningTeam = winningTeam;
    contest.winner = winners.map(w => w.username).join(", ");
    await contest.save();

    res.json({
      message: `${winners.length} winner(s)! Prize: ${prize} pts each.`,
      winners: winners.map(w => w.username),
      prize,
      totalPot,
      contest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel a contest (creator only, refund all)
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
    const users = await User.find({}, { name: 1, points: 1, _id: 0 })
      .sort({ points: -1 }).limit(20);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(5000, () => {
  console.log("Server running on port 5000");
  checkAndSettleBets();
});