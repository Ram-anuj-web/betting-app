// ============================================================
//  fantasy11Routes.js  —  bulletproof version v5
//  Usage:  app.use('/fantasy11', require('./fantasy11Routes'))
// ============================================================
const express = require("express");
const router  = express.Router();
const { Fantasy11Team } = require("./models");

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