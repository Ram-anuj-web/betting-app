// ============================================================
//  fantasy11Settle.js
//  Auto-calculates fantasy points from Cricbuzz RapidAPI
//  and settles all Fantasy11 teams for a given IPL match.
//
//  Mount in server.js:
//    const fantasy11SettleRoutes = require('./fantasy11Settle');
//    app.use('/fantasy11-settle', fantasy11SettleRoutes);
// ============================================================

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");

const RAPIDAPI_KEY  = "560fafa943msh399baabd0adcfd8p1cef77jsndc70656fbd00";
const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";

// ── Reuse existing models (already registered by server.js) ──────────────────
const Fantasy11Team = mongoose.model("Fantasy11Team");

// ── IPL match list (matches server.js exactly) ───────────────────────────────
const IPL_MATCHES = [
  { id: 1,  team1: "RCB",  team2: "SRH",  date: "2026-03-28" },
  { id: 2,  team1: "MI",   team2: "KKR",  date: "2026-03-29" },
  { id: 3,  team1: "RR",   team2: "CSK",  date: "2026-03-30" },
  { id: 4,  team1: "PBKS", team2: "GT",   date: "2026-03-31" },
  { id: 5,  team1: "LSG",  team2: "DC",   date: "2026-04-01" },
  { id: 6,  team1: "SRH",  team2: "LSG",  date: "2026-04-02" },
  { id: 7,  team1: "RCB",  team2: "CSK",  date: "2026-04-03" },
  { id: 8,  team1: "DC",   team2: "MI",   date: "2026-04-04" },
  { id: 9,  team1: "GT",   team2: "RR",   date: "2026-04-04" },
  { id: 10, team1: "KKR",  team2: "PBKS", date: "2026-04-05" },
  { id: 11, team1: "CSK",  team2: "MI",   date: "2026-04-05" },
  { id: 12, team1: "LSG",  team2: "RCB",  date: "2026-04-06" },
  { id: 13, team1: "SRH",  team2: "DC",   date: "2026-04-07" },
  { id: 14, team1: "RR",   team2: "KKR",  date: "2026-04-08" },
  { id: 15, team1: "PBKS", team2: "GT",   date: "2026-04-09" },
  { id: 16, team1: "MI",   team2: "LSG",  date: "2026-04-10" },
  { id: 17, team1: "RCB",  team2: "RR",   date: "2026-04-11" },
  { id: 18, team1: "CSK",  team2: "SRH",  date: "2026-04-12" },
  { id: 19, team1: "DC",   team2: "KKR",  date: "2026-04-12" },
  { id: 20, team1: "GT",   team2: "MI",   date: "2026-04-13" },
  { id: 21, team1: "SRH",  team2: "RR",   date: "2026-04-13" },
  { id: 22, team1: "CSK",  team2: "KKR",  date: "2026-04-14" },
  { id: 23, team1: "RCB",  team2: "LSG",  date: "2026-04-15" },
  { id: 24, team1: "MI",   team2: "PBKS", date: "2026-04-16" },
  { id: 25, team1: "GT",   team2: "KKR",  date: "2026-04-17" },
  { id: 26, team1: "RCB",  team2: "DC",   date: "2026-04-18" },
  { id: 27, team1: "SRH",  team2: "CSK",  date: "2026-04-18" },
  { id: 28, team1: "KKR",  team2: "RR",   date: "2026-04-19" },
  { id: 29, team1: "PBKS", team2: "LSG",  date: "2026-04-19" },
  { id: 30, team1: "GT",   team2: "MI",   date: "2026-04-20" },
  { id: 31, team1: "SRH",  team2: "DC",   date: "2026-04-21" },
  { id: 32, team1: "LSG",  team2: "RR",   date: "2026-04-22" },
  { id: 33, team1: "MI",   team2: "CSK",  date: "2026-04-23" },
  { id: 34, team1: "RCB",  team2: "GT",   date: "2026-04-24" },
  { id: 35, team1: "DC",   team2: "PBKS", date: "2026-04-25" },
  { id: 36, team1: "RR",   team2: "SRH",  date: "2026-04-25" },
  { id: 37, team1: "GT",   team2: "CSK",  date: "2026-04-26" },
  { id: 38, team1: "LSG",  team2: "KKR",  date: "2026-04-26" },
  { id: 39, team1: "DC",   team2: "RCB",  date: "2026-04-27" },
  { id: 40, team1: "PBKS", team2: "RR",   date: "2026-04-28" },
  { id: 41, team1: "MI",   team2: "SRH",  date: "2026-04-29" },
  { id: 42, team1: "GT",   team2: "RCB",  date: "2026-04-30" },
  { id: 43, team1: "RR",   team2: "DC",   date: "2026-05-01" },
  { id: 44, team1: "CSK",  team2: "MI",   date: "2026-05-02" },
  { id: 45, team1: "SRH",  team2: "KKR",  date: "2026-05-03" },
  { id: 46, team1: "GT",   team2: "PBKS", date: "2026-05-03" },
  { id: 47, team1: "MI",   team2: "LSG",  date: "2026-05-04" },
  { id: 48, team1: "DC",   team2: "CSK",  date: "2026-05-05" },
  { id: 49, team1: "SRH",  team2: "PBKS", date: "2026-05-06" },
  { id: 50, team1: "LSG",  team2: "RCB",  date: "2026-05-07" },
  { id: 51, team1: "DC",   team2: "KKR",  date: "2026-05-08" },
  { id: 52, team1: "RR",   team2: "GT",   date: "2026-05-09" },
  { id: 53, team1: "CSK",  team2: "LSG",  date: "2026-05-10" },
  { id: 54, team1: "RCB",  team2: "MI",   date: "2026-05-10" },
  { id: 55, team1: "PBKS", team2: "DC",   date: "2026-05-11" },
  { id: 56, team1: "GT",   team2: "SRH",  date: "2026-05-12" },
  { id: 57, team1: "RCB",  team2: "KKR",  date: "2026-05-13" },
  { id: 58, team1: "PBKS", team2: "MI",   date: "2026-05-14" },
  { id: 59, team1: "LSG",  team2: "CSK",  date: "2026-05-15" },
  { id: 60, team1: "KKR",  team2: "GT",   date: "2026-05-16" },
  { id: 61, team1: "PBKS", team2: "RCB",  date: "2026-05-17" },
  { id: 62, team1: "DC",   team2: "RR",   date: "2026-05-17" },
  { id: 63, team1: "CSK",  team2: "SRH",  date: "2026-05-18" },
  { id: 64, team1: "RR",   team2: "LSG",  date: "2026-05-19" },
  { id: 65, team1: "KKR",  team2: "MI",   date: "2026-05-20" },
  { id: 66, team1: "CSK",  team2: "GT",   date: "2026-05-21" },
  { id: 67, team1: "SRH",  team2: "RCB",  date: "2026-05-22" },
  { id: 68, team1: "LSG",  team2: "PBKS", date: "2026-05-23" },
  { id: 69, team1: "MI",   team2: "RR",   date: "2026-05-24" },
  { id: 70, team1: "KKR",  team2: "DC",   date: "2026-05-24" },
];

// ── In-memory cricbuzzId registry (updated via /register-match) ───────────────
// Pre-fill known IDs here as matches get played
const cricbuzzRegistry = {
  "ipl-1": null,  // RCB vs SRH - fill when known
  "ipl-2": 149638, // MI vs KKR
  "ipl-3": 149640, // RR vs CSK
  "ipl-4": null,  // PBKS vs GT - fill when known
  // Add more as the season progresses
};

function getCricbuzzId(matchId) {
  // Normalize matchId
  const normalized = matchId.startsWith("ipl-") ? matchId : `ipl-${matchId.replace("ipl", "")}`;
  return cricbuzzRegistry[normalized] || null;
}

// ── Fantasy Points System (standard IPL fantasy rules) ───────────────────────
function calcBattingPoints(bat) {
  let pts = 0;
  const runs   = parseInt(bat.runs  || 0);
  const balls  = parseInt(bat.balls || 0);
  const fours  = parseInt(bat.fours || 0);
  const sixes  = parseInt(bat.sixes || 0);
  const isDuck = runs === 0 && balls > 0;

  pts += runs;
  pts += fours;
  pts += sixes * 2;

  if (runs >= 100) pts += 16;
  else if (runs >= 50) pts += 8;

  if (isDuck) pts -= 2;

  if (balls >= 10) {
    const sr = (runs / balls) * 100;
    if      (sr >= 170) pts += 6;
    else if (sr >= 150) pts += 4;
    else if (sr >= 130) pts += 2;
    else if (sr < 50)   pts -= 6;
    else if (sr < 60)   pts -= 4;
    else if (sr < 70)   pts -= 2;
  }

  return pts;
}

function calcBowlingPoints(bowl) {
  let pts = 0;
  const wickets = parseInt(bowl.wickets || 0);
  const overs   = parseFloat(bowl.overs || 0);
  const runs    = parseInt(bowl.runs    || 0);
  const maidens = parseInt(bowl.maidens || 0);

  pts += wickets * 25;
  if (wickets >= 5)      pts += 8;
  else if (wickets >= 4) pts += 4;
  else if (wickets >= 3) pts += 4;

  pts += maidens * 8;

  if (overs >= 2) {
    const eco = runs / overs;
    if      (eco < 5)  pts += 6;
    else if (eco < 6)  pts += 4;
    else if (eco < 7)  pts += 2;
    else if (eco > 12) pts -= 6;
    else if (eco > 11) pts -= 4;
    else if (eco > 10) pts -= 2;
  }

  return pts;
}

// ── Fetch scorecard from Cricbuzz ─────────────────────────────────────────────
async function fetchScorecard(cricbuzzMatchId) {
  const url = `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${cricbuzzMatchId}/hscard`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key":  RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });
  if (!res.ok) throw new Error(`Cricbuzz API error: ${res.status}`);
  return await res.json();
}

// ── Parse scorecard → player stats map ───────────────────────────────────────
function parseScorecard(scorecard) {
  const playerStats = {};

  function normName(n) {
    return (n || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function ensurePlayer(name) {
    const key = normName(name);
    if (!playerStats[key]) playerStats[key] = { originalName: name, batting: null, bowling: null };
    return key;
  }

  const innings = Array.isArray(scorecard) ? scorecard : (scorecard.scoreCard || []);

  for (const inning of innings) {
    const batsmen = inning.batTeamDetails?.batsmenData || {};
    for (const key of Object.keys(batsmen)) {
      const b = batsmen[key];
      const name = b.batName || b.name;
      if (!name) continue;
      const pKey = ensurePlayer(name);
      playerStats[pKey].batting = {
        runs:  b.runs,
        balls: b.balls,
        fours: b.fours,
        sixes: b.sixes,
        isOut: b.outDesc !== "not out" && b.outDesc !== "",
      };
    }

    const bowlers = inning.bowlTeamDetails?.bowlersData || {};
    for (const key of Object.keys(bowlers)) {
      const b = bowlers[key];
      const name = b.bowlName || b.name;
      if (!name) continue;
      const pKey = ensurePlayer(name);
      playerStats[pKey].bowling = {
        overs:   b.overs,
        wickets: b.wickets,
        runs:    b.runs,
        maidens: b.maidens,
      };
    }
  }

  return playerStats;
}

// ── Fuzzy name match ──────────────────────────────────────────────────────────
function findPlayerStats(playerName, statsMap) {
  const norm = (n) => n.trim().toLowerCase().replace(/\s+/g, " ");
  const target = norm(playerName);

  if (statsMap[target]) return statsMap[target];

  const lastName = target.split(" ").slice(-1)[0];
  for (const key of Object.keys(statsMap)) {
    if (key.endsWith(lastName)) return statsMap[key];
  }

  for (const key of Object.keys(statsMap)) {
    if (target.includes(key) || key.includes(target)) return statsMap[key];
  }

  return null;
}

// ── Calculate total fantasy points for one player ────────────────────────────
function calcPlayerPoints(playerName, statsMap, isCaptain, isViceCaptain) {
  const stats = findPlayerStats(playerName, statsMap);
  let pts = stats ? 4 : 0; // 4 base pts only if found in scorecard (played)

  if (stats?.batting) pts += calcBattingPoints(stats.batting);
  if (stats?.bowling) pts += calcBowlingPoints(stats.bowling);

  if (isCaptain)     pts = Math.round(pts * 2);
  if (isViceCaptain) pts = Math.round(pts * 1.5);

  return pts;
}

// ── Calculate total fantasy points for one team ───────────────────────────────
function calcTeamPoints(team, statsMap) {
  let total = 0;
  for (const playerName of team.players) {
    const isCap = playerName === team.captain;
    const isVC  = playerName === team.viceCaptain;
    total += calcPlayerPoints(playerName, statsMap, isCap, isVC);
  }
  return total;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /fantasy11-settle/auto/:matchId ──────────────────────────────────────
router.post("/auto/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const iplId   = parseInt(matchId.replace("ipl-", "").replace("ipl", ""));
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId);

    if (!iplMatch) return res.status(404).json({ message: `IPL match ${matchId} not found` });

    const cricbuzzId = req.body.cricbuzzId || getCricbuzzId(matchId);
    if (!cricbuzzId) {
      return res.status(400).json({
        message: `No Cricbuzz ID for ipl-${iplId}. Pass cricbuzzId in body or register it first via POST /fantasy11-settle/register-match`,
        hint: '{ "cricbuzzId": 149640 }',
      });
    }

    // Save cricbuzzId to registry so breakdown works without passing it
    const normalizedKey = `ipl-${iplId}`;
    cricbuzzRegistry[normalizedKey] = parseInt(cricbuzzId);

    const allTeams = await Fantasy11Team.find({
      matchId: { $in: [matchId, `ipl-${iplId}`, `ipl${iplId}`] }
    });
    if (allTeams.length === 0) {
      return res.status(404).json({ message: `No Fantasy11 teams found for matchId: ${matchId}` });
    }

    console.log(`Fetching Cricbuzz scorecard for match ${cricbuzzId}...`);
    const scorecard = await fetchScorecard(cricbuzzId);
    const statsMap  = parseScorecard(scorecard);
    console.log(`Parsed ${Object.keys(statsMap).length} players from scorecard`);

    const results = [];
    for (const team of allTeams) {
      const fantasyPoints = calcTeamPoints(team, statsMap);
      await Fantasy11Team.findOneAndUpdate(
        { username: team.username, matchId: team.matchId },
        { $set: { fantasyPoints, locked: true, cricbuzzId: parseInt(cricbuzzId) } }
      );
      results.push({ username: team.username, fantasyPoints, captain: team.captain, viceCaptain: team.viceCaptain });
      console.log(`${team.username}: ${fantasyPoints} pts`);
    }

    results.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
    const winner = results[0];

    res.json({
      message: `✅ Fantasy11 auto-settled for ${matchId}!`,
      matchId,
      cricbuzzId,
      totalTeams: results.length,
      winner: winner?.username,
      winnerPoints: winner?.fantasyPoints,
      results,
      playersFound: Object.keys(statsMap).length,
    });

  } catch (err) {
    console.error("fantasy11-settle/auto error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /fantasy11-settle/breakdown/:username/:matchId ────────────────────────
// Now works WITHOUT passing cricbuzzId in query — reads from DB or registry
router.get("/breakdown/:username/:matchId", async (req, res) => {
  try {
    const { username, matchId } = req.params;
    const iplId    = parseInt(matchId.replace("ipl-", "").replace("ipl", ""));
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId);

    if (!iplMatch) return res.status(404).json({ message: "IPL match not found" });

    const team = await Fantasy11Team.findOne({
      username,
      matchId: { $in: [matchId, `ipl-${iplId}`, `ipl${iplId}`] }
    }).lean();

    if (!team) return res.status(404).json({ message: "Team not found for this user and match" });

    // ── Resolve cricbuzzId: query param > team record in DB > registry ───────
    const cricbuzzId =
      req.query.cricbuzzId ||
      team.cricbuzzId ||
      getCricbuzzId(matchId);

    if (!cricbuzzId) {
      return res.status(400).json({
        message: "CricbuzzId not available for this match yet. Please settle the match first via POST /fantasy11-settle/auto/:matchId",
        hint: "Or pass ?cricbuzzId=XXXXX in the URL",
      });
    }

    const scorecard = await fetchScorecard(cricbuzzId);
    const statsMap  = parseScorecard(scorecard);

    const breakdown = team.players.map(playerName => {
      const isCap = playerName === team.captain;
      const isVC  = playerName === team.viceCaptain;
      const stats = findPlayerStats(playerName, statsMap);

      const basePts    = stats ? 4 : 0;
      const battingPts = stats?.batting ? calcBattingPoints(stats.batting) : 0;
      const bowlingPts = stats?.bowling ? calcBowlingPoints(stats.bowling) : 0;
      let totalPts = basePts + battingPts + bowlingPts;

      let multiplier = 1;
      if (isCap) { totalPts = Math.round(totalPts * 2); multiplier = 2; }
      if (isVC)  { totalPts = Math.round(totalPts * 1.5); multiplier = 1.5; }

      return {
        name:             playerName,
        isCaptain:        isCap,
        isViceCaptain:    isVC,
        multiplier,
        points:           totalPts,
        basePts,
        battingPts,
        bowlingPts,
        batting:          stats?.batting || null,
        bowling:          stats?.bowling || null,
        foundInScorecard: !!stats,
      };
    }).sort((a, b) => b.points - a.points);

    const totalPoints = breakdown.reduce((sum, p) => sum + p.points, 0);

    res.json({
      username,
      matchId,
      matchLabel:   team.matchLabel,
      captain:      team.captain,
      viceCaptain:  team.viceCaptain,
      totalPoints,
      breakdown,
    });

  } catch (err) {
    console.error("breakdown error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /fantasy11-settle/preview/:cricbuzzId ─────────────────────────────────
router.get("/preview/:cricbuzzId", async (req, res) => {
  try {
    const scorecard = await fetchScorecard(req.params.cricbuzzId);
    const statsMap  = parseScorecard(scorecard);

    const players = Object.entries(statsMap).map(([key, val]) => ({
      name:         val.originalName,
      battingPts:   val.batting ? calcBattingPoints(val.batting) : 0,
      bowlingPts:   val.bowling ? calcBowlingPoints(val.bowling) : 0,
      totalBasePts: 4 +
        (val.batting ? calcBattingPoints(val.batting) : 0) +
        (val.bowling ? calcBowlingPoints(val.bowling) : 0),
      batting: val.batting,
      bowling: val.bowling,
    })).sort((a, b) => b.totalBasePts - a.totalBasePts);

    res.json({ cricbuzzId: req.params.cricbuzzId, totalPlayers: players.length, players });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /fantasy11-settle/register-match ─────────────────────────────────────
// Register a cricbuzzId for a match so breakdown works automatically
router.post("/register-match", async (req, res) => {
  const { iplId, cricbuzzId } = req.body;
  if (!iplId || !cricbuzzId)
    return res.status(400).json({ message: "iplId and cricbuzzId required" });

  const match = IPL_MATCHES.find(m => m.id === parseInt(iplId));
  if (!match) return res.status(404).json({ message: "IPL match not found" });

  const key = `ipl-${iplId}`;
  cricbuzzRegistry[key] = parseInt(cricbuzzId);

  // Also update any existing Fantasy11Team records for this match so
  // breakdown keeps working even after server restarts (until next deploy)
  await Fantasy11Team.updateMany(
    { matchId: { $in: [key, `ipl${iplId}`] } },
    { $set: { cricbuzzId: parseInt(cricbuzzId) } }
  );

  res.json({
    message: `✅ Registered cricbuzzId ${cricbuzzId} for ipl-${iplId} (${match.team1} vs ${match.team2})`,
    match: { ...match, cricbuzzId: parseInt(cricbuzzId) },
  });
});

// ── GET /fantasy11-settle/registry ────────────────────────────────────────────
// See all registered cricbuzz IDs
router.get("/registry", (req, res) => {
  const registered = Object.entries(cricbuzzRegistry)
    .filter(([, v]) => v !== null)
    .map(([matchId, cricbuzzId]) => {
      const iplId = parseInt(matchId.replace("ipl-", ""));
      const match = IPL_MATCHES.find(m => m.id === iplId);
      return { matchId, cricbuzzId, teams: match ? `${match.team1} vs ${match.team2}` : "?" };
    });
  res.json({ registered, total: registered.length });
});

module.exports = router;