// ============================================================
//  fantasy11Settle.js  — fixed iplMatch lookup
//  Mount in server.js:
//    const fantasy11SettleRoutes = require('./fantasy11Settle');
//    app.use('/fantasy11-settle', fantasy11SettleRoutes);
// ============================================================

const express  = require("express");
const router   = express.Router();

const RAPIDAPI_KEY  = "560fafa943msh399baabd0adcfd8p1cef77jsndc70656fbd00";
const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";

const { Fantasy11Team } = require("./models");
const IPL_MATCHES = [
  { id: 1,  team1: "RCB",  team2: "SRH",  date: "2026-03-28", time: "19:30", venue: "Bangalore" },
  { id: 2,  team1: "MI",   team2: "KKR",  date: "2026-03-29", time: "19:30", venue: "Mumbai" },
  { id: 3,  team1: "RR",   team2: "CSK",  date: "2026-03-30", time: "19:30", venue: "Guwahati" },
  { id: 4,  team1: "PBKS", team2: "GT",   date: "2026-03-31", time: "19:30", venue: "Mohali" },
  { id: 5,  team1: "LSG",  team2: "DC",   date: "2026-04-01", time: "19:30", venue: "Lucknow" },
  { id: 6,  team1: "KKR",  team2: "SRH",  date: "2026-04-02", time: "19:30", venue: "Kolkata" },
  { id: 7,  team1: "CSK",  team2: "PBKS", date: "2026-04-03", time: "19:30", venue: "Chennai" },
  { id: 8,  team1: "DC",   team2: "MI",   date: "2026-04-04", time: "15:30", venue: "Delhi" },
  { id: 9,  team1: "GT",   team2: "RR",   date: "2026-04-04", time: "19:30", venue: "Ahmedabad" },
  { id: 10, team1: "SRH",  team2: "LSG",  date: "2026-04-05", time: "15:30", venue: "Hyderabad" },
  { id: 11, team1: "RCB",  team2: "CSK",  date: "2026-04-05", time: "19:30", venue: "Bangalore" },
  { id: 12, team1: "KKR",  team2: "PBKS", date: "2026-04-06", time: "19:30", venue: "Kolkata" },
  { id: 13, team1: "RR",   team2: "MI",   date: "2026-04-07", time: "19:30", venue: "Jaipur" },
  { id: 14, team1: "DC",   team2: "GT",   date: "2026-04-08", time: "19:30", venue: "Delhi" },
  { id: 15, team1: "KKR",  team2: "LSG",  date: "2026-04-09", time: "19:30", venue: "Kolkata" },
  { id: 16, team1: "RR",   team2: "RCB",  date: "2026-04-10", time: "19:30", venue: "Jaipur" },
  { id: 17, team1: "PBKS", team2: "SRH",  date: "2026-04-11", time: "15:30", venue: "Mohali" },
  { id: 18, team1: "CSK",  team2: "DC",   date: "2026-04-11", time: "19:30", venue: "Chennai" },
  { id: 19, team1: "LSG",  team2: "GT",   date: "2026-04-12", time: "15:30", venue: "Lucknow" },
  { id: 20, team1: "MI",   team2: "RCB",  date: "2026-04-12", time: "19:30", venue: "Mumbai" },
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

// ── Cricbuzz ID registry ──────────────────────────────────────────────────────
const cricbuzzRegistry = {
  "ipl-1": 149618,
  "ipl-2": 149629,
  "ipl-3": 149640,
  "ipl-4": 149651,
  "ipl-5": 149662,
  "ipl-6": 149673,
  "ipl-7": 149684,
};

function getCricbuzzId(matchId) {
  const normalized = matchId.startsWith("ipl-") ? matchId : `ipl-${matchId.replace("ipl", "")}`;
  return cricbuzzRegistry[normalized] || null;
}

// ── helper: expand any matchId format to all variants ────────────────────────
function expandMatchIds(matchId) {
  const rawId = matchId.replace(/^(ipl-)+/, "");
  return [matchId, `ipl-${rawId}`, `ipl${rawId}`, rawId];
}

// ── Fantasy Points System ─────────────────────────────────────────────────────
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

  if (runs >= 100)     pts += 16;
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

// ── Parse scorecard ───────────────────────────────────────────────────────────
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

  const innings = scorecard.scorecard || scorecard.scoreCard || (Array.isArray(scorecard) ? scorecard : []);

  for (const inning of innings) {
    if (Array.isArray(inning.batsman)) {
      for (const b of inning.batsman) {
        const name = b.name || b.nickname;
        if (!name) continue;
        const pKey = ensurePlayer(name);
        playerStats[pKey].batting = {
          runs:  b.runs  || 0,
          balls: b.balls || 0,
          fours: b.fours || 0,
          sixes: b.sixes || 0,
          isOut: b.outdec !== "not out" && b.outdec !== "",
        };
      }
    }

    if (Array.isArray(inning.bowler)) {
      for (const b of inning.bowler) {
        const name = b.name || b.nickname;
        if (!name) continue;
        const pKey = ensurePlayer(name);
        playerStats[pKey].bowling = {
          overs:   b.overs   || 0,
          wickets: b.wickets || 0,
          runs:    b.runs    || 0,
          maidens: b.maidens || 0,
        };
      }
    }

    const batsmen = inning.batTeamDetails?.batsmenData || {};
    for (const key of Object.keys(batsmen)) {
      const b    = batsmen[key];
      const name = b.batName || b.name;
      if (!name) continue;
      const pKey = ensurePlayer(name);
      playerStats[pKey].batting = {
        runs:  b.runs  || 0,
        balls: b.balls || 0,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        isOut: b.outDesc !== "not out" && b.outDesc !== "",
      };
    }

    const bowlers = inning.bowlTeamDetails?.bowlersData || {};
    for (const key of Object.keys(bowlers)) {
      const b    = bowlers[key];
      const name = b.bowlName || b.name;
      if (!name) continue;
      const pKey = ensurePlayer(name);
      playerStats[pKey].bowling = {
        overs:   b.overs   || 0,
        wickets: b.wickets || 0,
        runs:    b.runs    || 0,
        maidens: b.maidens || 0,
      };
    }
  }

  return playerStats;
}

// ── Fuzzy name match ──────────────────────────────────────────────────────────
function findPlayerStats(playerName, statsMap) {
  const norm   = (n) => n.trim().toLowerCase().replace(/\s+/g, " ");
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

// ── Calculate points for one player ──────────────────────────────────────────
function calcPlayerPoints(playerName, statsMap, isCaptain, isViceCaptain) {
  const stats = findPlayerStats(playerName, statsMap);
  let pts = stats ? 4 : 0;

  if (stats?.batting) pts += calcBattingPoints(stats.batting);
  if (stats?.bowling) pts += calcBowlingPoints(stats.bowling);

  if (isCaptain)     pts = Math.round(pts * 2);
  if (isViceCaptain) pts = Math.round(pts * 1.5);

  return pts;
}

// ── Calculate points for one team ─────────────────────────────────────────────
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
    const matchId  = req.params.matchId;
    // ✅ FIX: strip all ipl- prefixes before parsing the number
    const iplId    = parseInt(matchId.replace(/^(ipl-)+/, ""));
    // ✅ FIX: match by number id OR string id like "ipl-6"
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId || m.id === `ipl-${iplId}`);

    if (!iplMatch) return res.status(404).json({ message: `IPL match ${matchId} not found. iplId parsed: ${iplId}` });

    const cricbuzzId = req.body.cricbuzzId || getCricbuzzId(matchId);
    if (!cricbuzzId) {
      return res.status(400).json({
        message: `No Cricbuzz ID for ipl-${iplId}. Pass cricbuzzId in body.`,
        hint: '{ "cricbuzzId": 149651 }',
      });
    }

    const normalizedKey = `ipl-${iplId}`;
    cricbuzzRegistry[normalizedKey] = parseInt(cricbuzzId);

    const matchIds = expandMatchIds(matchId);
    const allTeams = await Fantasy11Team.find({ matchId: { $in: matchIds } });

    if (allTeams.length === 0)
      return res.status(404).json({ message: `No Fantasy11 teams found for matchId: ${matchId} (tried: ${matchIds.join(", ")})` });

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
      matchId, cricbuzzId,
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
router.get("/breakdown/:username/:matchId", async (req, res) => {
  try {
    const { username, matchId } = req.params;
    const iplId    = parseInt(matchId.replace(/^(ipl-)+/, ""));
    const iplMatch = IPL_MATCHES.find(m => m.id === iplId || m.id === `ipl-${iplId}`);

    if (!iplMatch) return res.status(404).json({ message: "IPL match not found" });

    const matchIds = expandMatchIds(matchId);
    const team = await Fantasy11Team.findOne({ username, matchId: { $in: matchIds } }).lean();

    if (!team) return res.status(404).json({ message: "Team not found for this user and match" });

    const cricbuzzId = req.query.cricbuzzId || team.cricbuzzId || getCricbuzzId(matchId);

    if (!cricbuzzId) {
      return res.status(400).json({
        message: "No cricbuzzId available. Settle the match first via POST /fantasy11-settle/auto/:matchId",
        hint: "Or pass ?cricbuzzId=XXXXX in the URL",
      });
    }

    const scorecard = await fetchScorecard(cricbuzzId);
    const statsMap  = parseScorecard(scorecard);

    const breakdown = team.players.map(playerName => {
      const isCap  = playerName === team.captain;
      const isVC   = playerName === team.viceCaptain;
      const stats  = findPlayerStats(playerName, statsMap);

      const basePts    = stats ? 4 : 0;
      const battingPts = stats?.batting ? calcBattingPoints(stats.batting) : 0;
      const bowlingPts = stats?.bowling ? calcBowlingPoints(stats.bowling) : 0;
      let totalPts = basePts + battingPts + bowlingPts;

      let multiplier = 1;
      if (isCap) { totalPts = Math.round(totalPts * 2);   multiplier = 2;   }
      if (isVC)  { totalPts = Math.round(totalPts * 1.5); multiplier = 1.5; }

      return {
        name: playerName, isCaptain: isCap, isViceCaptain: isVC,
        multiplier, points: totalPts, basePts, battingPts, bowlingPts,
        batting: stats?.batting || null,
        bowling: stats?.bowling || null,
        foundInScorecard: !!stats,
      };
    }).sort((a, b) => b.points - a.points);

    const totalPoints = breakdown.reduce((sum, p) => sum + p.points, 0);

    res.json({
      username, matchId,
      matchLabel:  team.matchLabel,
      captain:     team.captain,
      viceCaptain: team.viceCaptain,
      totalPoints, breakdown,
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

    const players = Object.entries(statsMap).map(([, val]) => ({
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
router.post("/register-match", async (req, res) => {
  const { iplId, cricbuzzId } = req.body;
  if (!iplId || !cricbuzzId)
    return res.status(400).json({ message: "iplId and cricbuzzId required" });

  const match = IPL_MATCHES.find(m => m.id === parseInt(iplId));
  if (!match) return res.status(404).json({ message: "IPL match not found" });

  const key = `ipl-${iplId}`;
  cricbuzzRegistry[key] = parseInt(cricbuzzId);

  await Fantasy11Team.updateMany(
    { matchId: { $in: expandMatchIds(key) } },
    { $set: { cricbuzzId: parseInt(cricbuzzId) } }
  );

  res.json({
    message: `✅ Registered cricbuzzId ${cricbuzzId} for ipl-${iplId} (${match.team1} vs ${match.team2})`,
    match: { ...match, cricbuzzId: parseInt(cricbuzzId) },
  });
});

// ── GET /fantasy11-settle/registry ────────────────────────────────────────────
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