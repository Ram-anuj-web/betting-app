// ============================================================
//  fantasy11Routes.js  —  fixed version
//  Usage:  app.use('/fantasy11', require('./fantasy11Routes'))
// ============================================================
const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");

// ── Schema ───────────────────────────────────────────────────────────────
const Fantasy11TeamSchema = new mongoose.Schema({
  username:      { type: String, required: true },
  matchId:       { type: String, required: true },
  matchLabel:    { type: String },
  players:       [String],
  captain:       String,
  viceCaptain:   String,
  locked:        { type: Boolean, default: false },
  fantasyPoints: { type: Number,  default: null },
  createdAt:     { type: Date,    default: Date.now },
  updatedAt:     { type: Date,    default: Date.now },
});

Fantasy11TeamSchema.index({ username: 1, matchId: 1 }, { unique: true });

const Fantasy11Team = mongoose.models.Fantasy11Team ||
  mongoose.model("Fantasy11Team", Fantasy11TeamSchema);

// ── POST /fantasy11/team  — save or update a team ──────────────────────
router.post("/team", async (req, res) => {
  try {
    const { username, matchId, matchLabel, players, captain, viceCaptain } = req.body;

    if (!username || !matchId || !players || players.length !== 11) {
      return res.status(400).json({ message: "Invalid team data — need exactly 11 players." });
    }
    if (!captain || !viceCaptain) {
      return res.status(400).json({ message: "Captain and vice-captain are required." });
    }
    if (!players.includes(captain) || !players.includes(viceCaptain)) {
      return res.status(400).json({ message: "Captain/VC must be in your team." });
    }
    if (captain === viceCaptain) {
      return res.status(400).json({ message: "Captain and vice-captain must be different players." });
    }

    // Check if already locked
    const existing = await Fantasy11Team.findOne({ username, matchId });
    if (existing?.locked) {
      return res.status(403).json({ message: "Team is locked — match has started." });
    }

    let team;
    if (existing) {
      // Update existing record
      existing.players     = players;
      existing.captain     = captain;
      existing.viceCaptain = viceCaptain;
      existing.matchLabel  = matchLabel;
      existing.updatedAt   = new Date();
      team = await existing.save();
    } else {
      // Create new record
      team = await Fantasy11Team.create({
        username, matchId, matchLabel, players, captain, viceCaptain,
      });
    }

    res.json({ success: true, team });
  } catch (err) {
    console.error("fantasy11/team POST error:", err);
    // Handle duplicate key race condition
    if (err.code === 11000) {
      try {
        const team = await Fantasy11Team.findOneAndUpdate(
          { username: req.body.username, matchId: req.body.matchId },
          {
            players: req.body.players,
            captain: req.body.captain,
            viceCaptain: req.body.viceCaptain,
            matchLabel: req.body.matchLabel,
            updatedAt: new Date(),
          },
          { new: true }
        );
        return res.json({ success: true, team });
      } catch (e) {
        return res.status(500).json({ message: "Failed to save team. Please try again." });
      }
    }
    res.status(500).json({ message: "Server error — please try again." });
  }
});

// ── GET /fantasy11/team/:username/:matchId  — fetch a saved team ───────
router.get("/team/:username/:matchId", async (req, res) => {
  try {
    const { username, matchId } = req.params;
    const team = await Fantasy11Team.findOne({ username, matchId });
    res.json({ team: team || null });
  } catch (err) {
    console.error("fantasy11/team GET error:", err);
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

// ── GET /fantasy11/both-teams/:matchId  — get both players' teams for a challenge/contest
//    Used to settle Fantasy11 challenges by comparing fantasy points
router.get("/both-teams/:matchId", async (req, res) => {
  try {
    const teams = await Fantasy11Team.find(
      { matchId: req.params.matchId },
      { username: 1, fantasyPoints: 1, captain: 1, viceCaptain: 1, players: 1, _id: 0 }
    );
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /fantasy11/lock/:matchId  — lock all teams for a match ─────────
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

// ── POST /fantasy11/settle/:matchId  — award fantasy points ─────────────
//    Body: { scores: [{ username, fantasyPoints }] }
router.post("/settle/:matchId", async (req, res) => {
  try {
    const { scores } = req.body;
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