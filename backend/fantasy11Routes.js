// ============================================================
//  fantasy11Routes.js  —  add to your Express backend
//  Usage:  app.use('/fantasy11', require('./fantasy11Routes'))
// ============================================================
const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");

// ── Schema ───────────────────────────────────────────────────────────────
const Fantasy11TeamSchema = new mongoose.Schema({
  username:     { type: String, required: true },
  matchId:      { type: String, required: true },
  matchLabel:   { type: String },
  players:      [String],          // array of player names (11 names)
  captain:      String,
  viceCaptain:  String,
  locked:       { type: Boolean, default: false },
  fantasyPoints:{ type: Number,  default: null },
  createdAt:    { type: Date,    default: Date.now },
  updatedAt:    { type: Date,    default: Date.now },
});

Fantasy11TeamSchema.index({ username: 1, matchId: 1 }, { unique: true });

const Fantasy11Team = mongoose.models.Fantasy11Team ||
  mongoose.model("Fantasy11Team", Fantasy11TeamSchema);

// ── POST /fantasy11/team  — save or update a team ──────────────────────
router.post("/team", async (req, res) => {
  try {
    const { username, matchId, matchLabel, players, captain, viceCaptain } = req.body;

    if (!username || !matchId || !players || players.length !== 11) {
      return res.status(400).json({ message: "Invalid team data." });
    }
    if (!captain || !viceCaptain) {
      return res.status(400).json({ message: "Captain and vice-captain are required." });
    }
    if (!players.includes(captain) || !players.includes(viceCaptain)) {
      return res.status(400).json({ message: "Captain/VC must be in your team." });
    }

    // Prevent edit if already locked
    const existing = await Fantasy11Team.findOne({ username, matchId });
    if (existing?.locked) {
      return res.status(403).json({ message: "Team is locked — match has started." });
    }

    const team = await Fantasy11Team.findOneAndUpdate(
      { username, matchId },
      { username, matchId, matchLabel, players, captain, viceCaptain, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /fantasy11/team/:username/:matchId  — fetch a saved team ───────
router.get("/team/:username/:matchId", async (req, res) => {
  try {
    const { username, matchId } = req.params;
    const team = await Fantasy11Team.findOne({ username, matchId });
    res.json({ team: team || null });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /fantasy11/leaderboard/:matchId  — ranked teams for a match ────
router.get("/leaderboard/:matchId", async (req, res) => {
  try {
    const teams = await Fantasy11Team.find(
      { matchId: req.params.matchId, fantasyPoints: { $ne: null } },
      { username: 1, fantasyPoints: 1, captain: 1, _id: 0 }
    ).sort({ fantasyPoints: -1 }).limit(50);
    res.json({ leaderboard: teams });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /fantasy11/lock/:matchId  — admin: lock all teams for a match ─
//    Call this when a match goes LIVE (from your match scheduler or admin)
router.post("/lock/:matchId", async (req, res) => {
  try {
    const result = await Fantasy11Team.updateMany(
      { matchId: req.params.matchId },
      { locked: true }
    );
    res.json({ success: true, lockedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /fantasy11/settle/:matchId  — admin: award fantasy points ──────
//    Body: { scores: [{ username, fantasyPoints }] }
//    Calculate scores externally (your scorecard logic) and call this
router.post("/settle/:matchId", async (req, res) => {
  try {
    const { scores } = req.body; // [{ username, fantasyPoints }]
    if (!Array.isArray(scores)) {
      return res.status(400).json({ message: "scores array required." });
    }
    const ops = scores.map(({ username, fantasyPoints }) => ({
      updateOne: {
        filter: { username, matchId: req.params.matchId },
        update: { fantasyPoints },
      },
    }));
    await Fantasy11Team.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

// ============================================================
//  HOW TO INTEGRATE IN YOUR app.js / server.js:
//
//  const fantasy11Routes = require('./fantasy11Routes');
//  app.use('/fantasy11', fantasy11Routes);
//
//  That's it! The following endpoints are now live:
//   POST   /fantasy11/team                  → save/update team
//   GET    /fantasy11/team/:user/:matchId   → get saved team
//   GET    /fantasy11/leaderboard/:matchId  → ranked leaderboard
//   POST   /fantasy11/lock/:matchId         → lock all teams (on match start)
//   POST   /fantasy11/settle/:matchId       → award fantasy points
// ============================================================