// ============================================================
//  fantasy11Routes.js  —  bulletproof version v6
//  FIX 3: Backend lock enforced using IST match start time
//  Usage:  app.use('/fantasy11', require('./fantasy11Routes'))
// ============================================================
const express = require("express");
const router  = express.Router();
const { Fantasy11Team } = require("./models");

// ── IPL match schedule (used to enforce lock at match start) ─────────────────
const IPL_MATCHES = [
  { id: 1,  team1: "RCB",  team2: "SRH",  date: "2026-03-28", time: "19:30" },
  { id: 2,  team1: "MI",   team2: "KKR",  date: "2026-03-29", time: "19:30" },
  { id: 3,  team1: "RR",   team2: "CSK",  date: "2026-03-30", time: "19:30" },
  { id: 4,  team1: "PBKS", team2: "GT",   date: "2026-03-31", time: "19:30" },
  { id: 5,  team1: "LSG",  team2: "DC",   date: "2026-04-01", time: "19:30" },
  { id: 6,  team1: "KKR",  team2: "SRH",  date: "2026-04-02", time: "19:30" },
  { id: 7,  team1: "CSK",  team2: "PBKS", date: "2026-04-03", time: "19:30" },
  { id: 8,  team1: "DC",   team2: "MI",   date: "2026-04-04", time: "15:30" },
  { id: 9,  team1: "GT",   team2: "RR",   date: "2026-04-04", time: "19:30" },
  { id: 10, team1: "SRH",  team2: "LSG",  date: "2026-04-05", time: "15:30" },
  { id: 11, team1: "RCB",  team2: "CSK",  date: "2026-04-05", time: "19:30" },
  { id: 12, team1: "KKR",  team2: "PBKS", date: "2026-04-06", time: "19:30" },
  { id: 13, team1: "RR",   team2: "MI",   date: "2026-04-07", time: "19:30" },
  { id: 14, team1: "DC",   team2: "GT",   date: "2026-04-08", time: "19:30" },
  { id: 15, team1: "KKR",  team2: "LSG",  date: "2026-04-09", time: "19:30" },
  { id: 16, team1: "RR",   team2: "RCB",  date: "2026-04-10", time: "19:30" },
  { id: 17, team1: "PBKS", team2: "SRH",  date: "2026-04-11", time: "15:30" },
  { id: 18, team1: "CSK",  team2: "DC",   date: "2026-04-11", time: "19:30" },
  { id: 19, team1: "LSG",  team2: "GT",   date: "2026-04-12", time: "15:30" },
  { id: 20, team1: "MI",   team2: "RCB",  date: "2026-04-12", time: "19:30" },
  { id: 21, team1: "SRH",  team2: "RR",   date: "2026-04-13", time: "19:30" },
  { id: 22, team1: "CSK",  team2: "KKR",  date: "2026-04-14", time: "19:30" },
  { id: 23, team1: "RCB",  team2: "LSG",  date: "2026-04-15", time: "19:30" },
  { id: 24, team1: "MI",   team2: "PBKS", date: "2026-04-16", time: "19:30" },
  { id: 25, team1: "GT",   team2: "KKR",  date: "2026-04-17", time: "19:30" },
  { id: 26, team1: "RCB",  team2: "DC",   date: "2026-04-18", time: "15:30" },
  { id: 27, team1: "SRH",  team2: "CSK",  date: "2026-04-18", time: "19:30" },
  { id: 28, team1: "KKR",  team2: "RR",   date: "2026-04-19", time: "15:30" },
  { id: 29, team1: "PBKS", team2: "LSG",  date: "2026-04-19", time: "19:30" },
  { id: 30, team1: "GT",   team2: "MI",   date: "2026-04-20", time: "19:30" },
  { id: 31, team1: "SRH",  team2: "DC",   date: "2026-04-21", time: "19:30" },
  { id: 32, team1: "LSG",  team2: "RR",   date: "2026-04-22", time: "19:30" },
  { id: 33, team1: "MI",   team2: "CSK",  date: "2026-04-23", time: "19:30" },
  { id: 34, team1: "RCB",  team2: "GT",   date: "2026-04-24", time: "19:30" },
  { id: 35, team1: "DC",   team2: "PBKS", date: "2026-04-25", time: "15:30" },
  { id: 36, team1: "RR",   team2: "SRH",  date: "2026-04-25", time: "19:30" },
  { id: 37, team1: "GT",   team2: "CSK",  date: "2026-04-26", time: "15:30" },
  { id: 38, team1: "LSG",  team2: "KKR",  date: "2026-04-26", time: "19:30" },
  { id: 39, team1: "DC",   team2: "RCB",  date: "2026-04-27", time: "19:30" },
  { id: 40, team1: "PBKS", team2: "RR",   date: "2026-04-28", time: "19:30" },
  { id: 41, team1: "MI",   team2: "SRH",  date: "2026-04-29", time: "19:30" },
  { id: 42, team1: "GT",   team2: "RCB",  date: "2026-04-30", time: "19:30" },
  { id: 43, team1: "RR",   team2: "DC",   date: "2026-05-01", time: "19:30" },
  { id: 44, team1: "CSK",  team2: "MI",   date: "2026-05-02", time: "19:30" },
  { id: 45, team1: "SRH",  team2: "KKR",  date: "2026-05-03", time: "15:30" },
  { id: 46, team1: "GT",   team2: "PBKS", date: "2026-05-03", time: "19:30" },
  { id: 47, team1: "MI",   team2: "LSG",  date: "2026-05-04", time: "19:30" },
  { id: 48, team1: "DC",   team2: "CSK",  date: "2026-05-05", time: "19:30" },
  { id: 49, team1: "SRH",  team2: "PBKS", date: "2026-05-06", time: "19:30" },
  { id: 50, team1: "LSG",  team2: "RCB",  date: "2026-05-07", time: "19:30" },
  { id: 51, team1: "DC",   team2: "KKR",  date: "2026-05-08", time: "19:30" },
  { id: 52, team1: "RR",   team2: "GT",   date: "2026-05-09", time: "19:30" },
  { id: 53, team1: "CSK",  team2: "LSG",  date: "2026-05-10", time: "15:30" },
  { id: 54, team1: "RCB",  team2: "MI",   date: "2026-05-10", time: "19:30" },
  { id: 55, team1: "PBKS", team2: "DC",   date: "2026-05-11", time: "19:30" },
  { id: 56, team1: "GT",   team2: "SRH",  date: "2026-05-12", time: "19:30" },
  { id: 57, team1: "RCB",  team2: "KKR",  date: "2026-05-13", time: "19:30" },
  { id: 58, team1: "PBKS", team2: "MI",   date: "2026-05-14", time: "19:30" },
  { id: 59, team1: "LSG",  team2: "CSK",  date: "2026-05-15", time: "19:30" },
  { id: 60, team1: "KKR",  team2: "GT",   date: "2026-05-16", time: "19:30" },
  { id: 61, team1: "PBKS", team2: "RCB",  date: "2026-05-17", time: "15:30" },
  { id: 62, team1: "DC",   team2: "RR",   date: "2026-05-17", time: "19:30" },
  { id: 63, team1: "CSK",  team2: "SRH",  date: "2026-05-18", time: "19:30" },
  { id: 64, team1: "RR",   team2: "LSG",  date: "2026-05-19", time: "19:30" },
  { id: 65, team1: "KKR",  team2: "MI",   date: "2026-05-20", time: "19:30" },
  { id: 66, team1: "CSK",  team2: "GT",   date: "2026-05-21", time: "19:30" },
  { id: 67, team1: "SRH",  team2: "RCB",  date: "2026-05-22", time: "19:30" },
  { id: 68, team1: "LSG",  team2: "PBKS", date: "2026-05-23", time: "19:30" },
  { id: 69, team1: "MI",   team2: "RR",   date: "2026-05-24", time: "15:30" },
  { id: 70, team1: "KKR",  team2: "DC",   date: "2026-05-24", time: "19:30" },
];

// ── Check if a match has started based on IST time ───────────────────────────
function hasMatchStarted(matchId) {
  const rawId = parseInt(matchId.replace(/^ipl-?/, ""));
  const match = IPL_MATCHES.find(m => m.id === rawId);
  if (!match) return false;
  const matchStart = new Date(`${match.date}T${match.time}:00+05:30`);
  return new Date() >= matchStart;
}

// ── helper: expand any matchId format to all variants ────────────────────────
function expandMatchIds(matchId) {
  const rawId = matchId.replace(/^ipl-?/, "");
  return [matchId, `ipl-${rawId}`, `ipl${rawId}`, rawId];
}

// ── POST /fantasy11/team  — save or update a team ────────────────────────────
router.post("/team", async (req, res) => {
  try {
    const { username, matchId, matchLabel, players, captain, viceCaptain } = req.body;

    if (!username || typeof username !== "string")
      return res.status(400).json({ message: "Username is required." });
    if (!matchId || typeof matchId !== "string")
      return res.status(400).json({ message: "Match ID is required." });
    if (!Array.isArray(players))
      return res.status(400).json({ message: "Players must be an array." });
    if (players.length !== 11)
      return res.status(400).json({ message: `Need exactly 11 players, got ${players.length}.` });
    if (!captain)
      return res.status(400).json({ message: "Captain is required." });
    if (!viceCaptain)
      return res.status(400).json({ message: "Vice-captain is required." });
    if (captain === viceCaptain)
      return res.status(400).json({ message: "Captain and vice-captain must be different." });
    if (!players.includes(captain))
      return res.status(400).json({ message: `Captain "${captain}" is not in your squad.` });
    if (!players.includes(viceCaptain))
      return res.status(400).json({ message: `Vice-captain "${viceCaptain}" is not in your squad.` });

    // ── FIX 3: Block saves if match has already started (backend enforcement) ──
    if (hasMatchStarted(matchId)) {
      return res.status(403).json({ message: "Team is locked — match has already started." });
    }

    const matchIds = expandMatchIds(matchId);
    const existing = await Fantasy11Team.findOne({ username, matchId: { $in: matchIds } }).lean();
    if (existing && existing.locked)
      return res.status(403).json({ message: "Team is locked — match has already started." });

    const now = new Date();
    await Fantasy11Team.collection.findOneAndUpdate(
      { username, matchId },
      {
        $set: {
          matchLabel:  matchLabel || "",
          players,
          captain,
          viceCaptain,
          updatedAt: now,
        },
        $setOnInsert: {
          username,
          matchId,
          locked:        false,
          fantasyPoints: null,
          createdAt:     now,
        },
      },
      { upsert: true }
    );

    const savedTeam = await Fantasy11Team.findOne({ username, matchId: { $in: matchIds } }).lean();
    return res.json({ success: true, team: savedTeam });

  } catch (err) {
    console.error("[fantasy11/team POST] Error:", err.message, "code:", err.code);
    return res.status(500).json({ message: `Server error: ${err.message}`, code: err.code || null });
  }
});

// ── GET /fantasy11/team/:username/:matchId ────────────────────────────────────
router.get("/team/:username/:matchId", async (req, res) => {
  try {
    const { username, matchId } = req.params;
    const matchIds = expandMatchIds(matchId);
    const team = await Fantasy11Team.findOne({ username, matchId: { $in: matchIds } }).lean();
    return res.json({ team: team || null });
  } catch (err) {
    console.error("[fantasy11/team GET] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ── GET /fantasy11/my-teams/:username ────────────────────────────────────────
router.get("/my-teams/:username", async (req, res) => {
  try {
    const teams = await Fantasy11Team
      .find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ teams });
  } catch (err) {
    console.error("[fantasy11/my-teams GET] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ── GET /fantasy11/leaderboard/:matchId ──────────────────────────────────────
router.get("/leaderboard/:matchId", async (req, res) => {
  try {
    const matchIds = expandMatchIds(req.params.matchId);
    const teams = await Fantasy11Team.find(
      { matchId: { $in: matchIds }, fantasyPoints: { $ne: null } },
      { username: 1, fantasyPoints: 1, captain: 1, _id: 0 }
    ).sort({ fantasyPoints: -1 }).limit(50).lean();
    return res.json({ leaderboard: teams });
  } catch (err) {
    console.error("[fantasy11/leaderboard GET] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ── GET /fantasy11/both-teams/:matchId ───────────────────────────────────────
router.get("/both-teams/:matchId", async (req, res) => {
  try {
    const matchIds = expandMatchIds(req.params.matchId);
    const teams = await Fantasy11Team.find(
      { matchId: { $in: matchIds } },
      { username: 1, fantasyPoints: 1, captain: 1, viceCaptain: 1, players: 1, _id: 0 }
    ).lean();
    return res.json({ teams });
  } catch (err) {
    console.error("[fantasy11/both-teams GET] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ── POST /fantasy11/lock/:matchId ─────────────────────────────────────────────
router.post("/lock/:matchId", async (req, res) => {
  try {
    const matchIds = expandMatchIds(req.params.matchId);
    const result = await Fantasy11Team.updateMany(
      { matchId: { $in: matchIds } },
      { $set: { locked: true } }
    );
    return res.json({ success: true, lockedCount: result.modifiedCount });
  } catch (err) {
    console.error("[fantasy11/lock POST] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ── POST /fantasy11/settle/:matchId ──────────────────────────────────────────
router.post("/settle/:matchId", async (req, res) => {
  try {
    const { scores } = req.body;
    if (!Array.isArray(scores))
      return res.status(400).json({ message: "scores array is required." });
    const matchIds = expandMatchIds(req.params.matchId);
    const ops = scores.map(({ username, fantasyPoints }) => ({
      updateOne: {
        filter: { username, matchId: { $in: matchIds } },
        update:  { $set: { fantasyPoints } },
      },
    }));
    if (ops.length > 0) await Fantasy11Team.bulkWrite(ops);
    return res.json({ success: true, updated: ops.length });
  } catch (err) {
    console.error("[fantasy11/settle POST] Error:", err.message);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

module.exports = router;