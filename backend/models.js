const mongoose = require("mongoose");

const Fantasy11TeamSchema = new mongoose.Schema({
  username:      { type: String, required: true },
  matchId:       { type: String, required: true },
  matchLabel:    { type: String, default: "" },
  players:       [{ type: String }],
  captain:       { type: String, default: "" },
  viceCaptain:   { type: String, default: "" },
  fantasyPoints: { type: Number, default: null },
  locked:        { type: Boolean, default: false },
  cricbuzzId:    { type: Number, default: null },
  createdAt:     { type: Date, default: Date.now },
});

Fantasy11TeamSchema.index({ username: 1, matchId: 1 }, { unique: true });

module.exports = {
  Fantasy11Team: mongoose.models.Fantasy11Team ||
    mongoose.model("Fantasy11Team", Fantasy11TeamSchema),
};