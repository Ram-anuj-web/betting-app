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

// ── IPL match list (must match server.js) ────────────────────────────────────
const IPL_MATCHES = [
  { id: 1,  team1: "RR",   team2: "CSK",  cricbuzzId: 149640 },
  { id: 2,  team1: "MI",   team2: "KKR",  cricbuzzId: 149638 },
  { id: 3,  team1: "RCB",  team2: "SRH",  cricbuzzId: null   },
  { id: 4,  team1: "PBKS", team2: "GT",   cricbuzzId: null   },
  { id: 5,  team1: "LSG",  team2: "DC",   cricbuzzId: null   },
  { id: 6,  team1: "SRH",  team2: "LSG",  cricbuzzId: null   },
  { id: 7,  team1: "RCB",  team2: "CSK",  cricbuzzId: null   },
  { id: 8,  team1: "DC",   team2: "MI",   cricbuzzId: null   },
  { id: 9,  team1: "GT",   team2: "RR",   cricbuzzId: null   },
  { id: 10, team1: "KKR",  team2: "PBKS", cricbuzzId: null   },
  { id: 11, team1: "CSK",  team2: "MI",   cricbuzzId: null   },
  { id: 12, team1: "LSG",  team2: "RCB",  cricbuzzId: null   },
  { id: 13, team1: "SRH",  team2: "DC",   cricbuzzId: null   },
  { id: 14, team1: "RR",   team2: "KKR",  cricbuzzId: null   },
  { id: 15, team1: "PBKS", team2: "GT",   cricbuzzId: null   },
  { id: 16, team1: "MI",   team2: "LSG",  cricbuzzId: null   },
  { id: 17, team1: "RCB",  team2: "RR",   cricbuzzId: null   },
  { id: 18, team1: "CSK",  team2: "SRH",  cricbuzzId: null   },
  { id: 19, team1: "DC",   team2: "KKR",  cricbuzzId: null   },
  { id: 20, team1: "GT",   team2: "MI",   cricbuzzId: null   },
  { id: 21, team1: "SRH",  team2: "RR",   cricbuzzId: null   },
  { id: 22, team1: "CSK",  team2: "KKR",  cricbuzzId: null   },
  { id: 23, team1: "RCB",  team2: "LSG",  cricbuzzId: null   },
  { id: 24, team1: "MI",   team2: "PBKS", cricbuzzId: null   },
  { id: 25, team1: "GT",   team2: "KKR",  cricbuzzId: null   },
  { id: 26, team1: "RCB",  team2: "DC",   cricbuzzId: null   },
  { id: 27, team1: "SRH",  team2: "CSK",  cricbuzzId: null   },
  { id: 28, team1: "KKR",  team2: "RR",   cricbuzzId: null   },
  { id: 29, team1: "PBKS", team2: "LSG",  cricbuzzId: null   },
  { id: 30, team1: "GT",   team2: "MI",   cricbuzzId: null   },
  { id: 31, team1: "SRH",  team2: "DC",   cricbuzzId: null   },
  { id: 32, team1: "LSG",  team2: "RR",   cricbuzzId: null   },
  { id: 33, team1: "MI",   team2: "CSK",  cricbuzzId: null   },
  { id: 34, team1: "RCB",  team2: "GT",   cricbuzzId: null   },
  { id: 35, team1: "DC",   team2: "PBKS", cricbuzzId: null   },
  { id: 36, team1: "RR",   team2: "SRH",  cricbuzzId: null   },
  { id: 37, team1: "GT",   team2: "CSK",  cricbuzzId: null   },
  { id: 38, team1: "LSG",  team2: "KKR",  cricbuzzId: null   },
  { id: 39, team1: "DC",   team2: "RCB",  cricbuzzId: null   },
  { id: 40, team1: "PBKS", team2: "RR",   cricbuzzId: null   },
  { id: 41, team1: "MI",   team2: "SRH",  cricbuzzId: null   },
  { id: 42, team1: "GT",   team2: "RCB",  cricbuzzId: null   },
  { id: 43, team1: "RR",   team2: "DC",   cricbuzzId: null   },
  { id: 44, team1: "CSK",  team2: "MI",   cricbuzzId: null   },
  { id: 45, team1: "SRH",  team2: "KKR",  cricbuzzId: null   },
  { id: 46, team1: "GT",   team2: "PBKS", cricbuzzId: null   },
  { id: 47, team1: "MI",   team2: "LSG",  cricbuzzId: null   },
  { id: 48, team1: "DC",   team2: "CSK",  cricbuzzId: null   },
  { id: 49, team1: "SRH",  team2: "PBKS", cricbuzzId: null   },
  { id: 50, team1: "LSG",  team2: "RCB",  cricbuzzId: null   },
  { id: 51, team1: "DC",   team2: "KKR",  cricbuzzId: null   },
  { id: 52, team1: "RR",   team2: "GT",   cricbuzzId: null   },
  { id: 53, team1: "CSK",  team2: "LSG",  cricbuzzId: null   },
  { id: 54, team1: "RCB",  team2: "MI",   cricbuzzId: null   },
  { id: 55, team1: "PBKS", team2: "DC",   cricbuzzId: null   },
  { id: 56, team1: "GT",   team2: "SRH",  cricbuzzId: null   },
  { id: 57, team1: "RCB",  team2: "KKR",  cricbuzzId: null   },
  { id: 58, team1: "PBKS", team2: "MI",   cricbuzzId: null   },
  { id: 59, team1: "LSG",  team2: "CSK",  cricbuzzId: null   },
  { id: 60, team1: "KKR",  team2: "GT",   cricbuzzId: null   },
  { id: 61, team1: "PBKS", team2: "RCB",  cricbuzzId: null   },
  { id: 62, team1: "DC",   team2: "RR",   cricbuzzId: null   },
  { id: 63, team1: "CSK",  team2: "SRH",  cricbuzzId: null   },
  { id: 64, team1: "RR",   team2: "LSG",  cricbuzzId: null   },
  { id: 65, team1: "KKR",  team2: "MI",   cricbuzzId: null   },
  { id: 66, team1: "CSK",  team2: "GT",   cricbuzzId: null   },
  { id: 67, team1: "SRH",  team2: "RCB",  cricbuzzId: null   },
  { id: 68, team1: "LSG",  team2: "PBKS", cricbuzzId: null   },
  { id: 69, team1: "MI",   team2: "RR",   cricbuzzId: null   },
  { id: 70, team1: "KKR",  team2: "DC",   cricbuzzId: null   },
];

// ── Fantasy Points System (standard IPL fantasy rules) ───────────────────────
function calcBattingPoints(bat) {
  let pts = 0;
  const runs   = parseInt(bat.runs  || 0);
  const balls  = parseInt(bat.balls || 0);
  const fours  = parseInt(bat.fours || 0);
  const sixes  = parseInt(bat.sixes || 0);
  const isDuck = runs === 0 && balls > 0;

  pts += runs;                        // 1pt per run
  pts += fours;                       // 1pt per boundary
  pts += sixes * 2;                   // 2pts per six

  if (runs >= 100) pts += 16;        // century bonus
  else if (runs >= 50) pts += 8;     // half-century bonus

  if (isDuck) pts -= 2;              // duck penalty

  // Strike rate bonus/penalty (min 10 balls faced)
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

  pts += wickets * 25;               // 25pts per wicket
  if (wickets >= 5) pts += 8;        // 5-wicket haul bonus
  else if (wickets >= 4) pts += 4;   // 4-wicket bonus
  else if (wickets >= 3) pts += 4;   // 3-wicket bonus

  pts += maidens * 8;                // 8pts per maiden

  // Economy rate bonus/penalty (min 2 overs)
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

// ── Parse scorecard → player stats map { playerName: { batting, bowling } } ──
function parseScorecard(scorecard) {
  const playerStats = {}; // { name: { batting: {...}, bowling: {...} } }

  function normName(n) {
    return (n || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function ensurePlayer(name) {
    const key = normName(name);
    if (!playerStats[key]) playerStats[key] = { originalName: name, batting: null, bowling: null };
    return key;
  }

  // scorecard is an array of innings
  const innings = Array.isArray(scorecard) ? scorecard : (scorecard.scoreCard || []);

  for (const inning of innings) {
    // Batting
    const batsmen = inning.batTeamDetails?.batsmenData || {};
    for (const key of Object.keys(batsmen)) {
      const b = batsmen[key];
      const name = b.batName || b.name;
      if (!name) continue;
      const pKey = ensurePlayer(name);
      playerStats[pKey].batting = {
        runs:   b.runs,
        balls:  b.balls,
        fours:  b.fours,
        sixes:  b.sixes,
        isOut:  b.outDesc !== "not out" && b.outDesc !== "",
      };
    }

    // Bowling
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

// ── Fuzzy name match: find a player in stats map ──────────────────────────────
function findPlayerStats(playerName, statsMap) {
  const norm = (n) => n.trim().toLowerCase().replace(/\s+/g, " ");
  const target = norm(playerName);

  // Exact match
  if (statsMap[target]) return statsMap[target];

  // Last-name match
  const lastName = target.split(" ").slice(-1)[0];
  for (const key of Object.keys(statsMap)) {
    if (key.endsWith(lastName)) return statsMap[key];
  }

  // Partial match (target includes key or key includes target)
  for (const key of Object.keys(statsMap)) {
    if (target.includes(key) || key.includes(target)) return statsMap[key];
  }

  return null;
}

// ── Calculate total fantasy points for one player ────────────────────────────
function calcPlayerPoints(playerName, statsMap, isCaptain, isViceCaptain) {
  const stats = findPlayerStats(playerName, statsMap);
  if (!stats) return 4; // base points for playing (assume played if in squad)

  let pts = 4; // base points for playing XI

  if (stats.batting) {
    pts += calcBattingPoints(stats.batting);
  }

  if (stats.bowling) {
    pts += calcBowlingPoints(stats.bowling);
  }

  // Captain/VC multiplier
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
    const pts   = calcPlayerPoints(playerName, statsMap, isCap, isVC);
    total += pts;
  }
  return total;
}

// ── POST /fantasy11-settle/auto/:matchId ──────────────────────────────────────
// Auto-fetches scorecard and calculates + saves fantasy points for all teams
router.post("/auto/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId; // e.g. "ipl-3" or "ipl3"
    const normalizedId = matchId.replace("ipl-", "").replace("ipl", "");
    const iplId = parseInt(normalizedId);
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId);

    if (!iplMatch) {
      return res.status(404).json({ message: `IPL match ${matchId} not found` });
    }

    // Allow override cricbuzzId via body
    const cricbuzzId = req.body.cricbuzzId || iplMatch.cricbuzzId;
    if (!cricbuzzId) {
      return res.status(400).json({
        message: `No Cricbuzz match ID for ipl-${iplId}. Pass cricbuzzId in request body.`,
        hint: "e.g. { cricbuzzId: 149640 }",
      });
    }

    // Fetch all Fantasy11 teams for this match
    const allTeams = await Fantasy11Team.find({ matchId: { $in: [matchId, `ipl-${iplId}`, `ipl${iplId}`] } });
    if (allTeams.length === 0) {
      return res.status(404).json({ message: `No Fantasy11 teams found for matchId: ${matchId}` });
    }

    // Fetch scorecard from Cricbuzz
    console.log(`Fetching Cricbuzz scorecard for match ${cricbuzzId}...`);
    const scorecard = await fetchScorecard(cricbuzzId);
    const statsMap  = parseScorecard(scorecard);

    console.log(`Parsed ${Object.keys(statsMap).length} players from scorecard`);

    // Calculate fantasy points for each team
    const results = [];
    for (const team of allTeams) {
      const fantasyPoints = calcTeamPoints(team, statsMap);

      await Fantasy11Team.findOneAndUpdate(
        { username: team.username, matchId: team.matchId },
        { $set: { fantasyPoints, locked: true } }
      );

      results.push({ username: team.username, fantasyPoints, captain: team.captain, viceCaptain: team.viceCaptain });
      console.log(`${team.username}: ${fantasyPoints} pts`);
    }

    // Sort by points descending
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

// ── GET /fantasy11-settle/preview/:matchId ────────────────────────────────────
// Preview scorecard data without saving — useful for debugging
router.get("/preview/:cricbuzzId", async (req, res) => {
  try {
    const scorecard = await fetchScorecard(req.params.cricbuzzId);
    const statsMap  = parseScorecard(scorecard);

    const players = Object.entries(statsMap).map(([key, val]) => ({
      name: val.originalName,
      battingPts: val.batting ? calcBattingPoints(val.batting) : 0,
      bowlingPts: val.bowling ? calcBowlingPoints(val.bowling) : 0,
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

// ── POST /fantasy11-settle/update-cricbuzz-id ─────────────────────────────────
// Helper to update cricbuzz ID for a future match (stored in memory only — 
// for persistent storage, add to your DB or env config)
router.post("/register-match", async (req, res) => {
  const { iplId, cricbuzzId } = req.body;
  if (!iplId || !cricbuzzId) return res.status(400).json({ message: "iplId and cricbuzzId required" });
  const match = IPL_MATCHES.find(m => m.id === parseInt(iplId));
  if (!match) return res.status(404).json({ message: "IPL match not found" });
  match.cricbuzzId = parseInt(cricbuzzId);
  res.json({ message: `Registered cricbuzzId ${cricbuzzId} for ipl-${iplId} (${match.team1} vs ${match.team2})`, match });
});

module.exports = router;