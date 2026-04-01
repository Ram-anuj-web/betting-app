import Multiplayer from "./Multiplayer";
import Matches from "./Matches";
import Fantasy11 from "./Fantasy11";
import React, { useState, useEffect } from "react";
import "./App.css";

const API = "https://betting-backend-xq1q.onrender.com";

const SPORTS = [
  { id: "cricket",    name: "Cricket",    emoji: "🏏", teams: ["India", "Australia", "England", "Pakistan"] },
  { id: "football",  name: "Football",   emoji: "⚽", teams: ["Real Madrid", "Barcelona", "Man City", "PSG"] },
  { id: "basketball",name: "Basketball", emoji: "🏀", teams: ["Lakers", "Warriors", "Bulls", "Celtics"] },
  { id: "tennis",    name: "Tennis",     emoji: "🎾", teams: ["Djokovic", "Alcaraz", "Sinner", "Medvedev"] },
];

// ── Fantasy 11 Breakdown Modal ─────────────────────────────────────────────────
function Fantasy11BreakdownModal({ item, username, onClose }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function fetchBreakdown() {
      try {
        const res  = await fetch(`${API}/fantasy11-settle/breakdown/${username}/${item.matchId}`);
        const data = await res.json();
        if (res.ok) setBreakdown(data);
        else setError(data.message || "Could not load breakdown.");
      } catch {
        setError("Server error. Make sure this match has been settled.");
      }
      setLoading(false);
    }
    fetchBreakdown();
  }, [item.matchId, username]);

  const roleColor = { WK: "#7B68EE", BAT: "#00C896", AR: "#F0A500", BOWL: "#FF6B6B" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #30363d", borderRadius: 16,
        width: "100%", maxWidth: 520, maxHeight: "85vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #30363d",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd166" }}>🏏 Fantasy 11 Breakdown</div>
            <div style={{ fontSize: 12, color: "#7d8590", marginTop: 3 }}>{item.matchLabel}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #30363d", color: "#7d8590",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 16,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", color: "#7d8590", padding: 40 }}>
              Loading breakdown...
            </div>
          )}

          {error && !loading && (
            <div style={{
              background: "#300", border: "1px solid #a32d2d", borderRadius: 8,
              padding: "12px 16px", color: "#ff6b6b", fontSize: 13,
            }}>
              ⚠️ {error}
              <div style={{ marginTop: 8, fontSize: 12, color: "#7d8590" }}>
                This match may not have been settled yet. Check back after the match ends.
              </div>
            </div>
          )}

          {breakdown && !loading && (
            <>
              {/* Total Points */}
              <div style={{
                background: "linear-gradient(135deg,#ffd16615,#ffd16605)",
                border: "1px solid #ffd16644", borderRadius: 12,
                padding: "14px 18px", marginBottom: 16,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "#7d8590" }}>Total Fantasy Points</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#ffd166", lineHeight: 1 }}>
                    {breakdown.totalPoints}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#7d8590" }}>Captain</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>{breakdown.captain}</div>
                  <div style={{ fontSize: 12, color: "#7d8590", marginTop: 4 }}>Vice-Captain</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>{breakdown.viceCaptain}</div>
                </div>
              </div>

              {/* Player List */}
              <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Player Breakdown
              </div>
              {breakdown.breakdown.map((p, i) => (
                <div key={p.name} style={{
                  background: p.isCaptain ? "#ffd16610" : p.isViceCaptain ? "#7B68EE10" : "#161b22",
                  border: `1px solid ${p.isCaptain ? "#ffd16644" : p.isViceCaptain ? "#7B68EE44" : "#30363d"}`,
                  borderRadius: 10, padding: "10px 14px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: i === 0 ? "#ffd166" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#30363d",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: i < 3 ? "#000" : "#7d8590", flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#e6edf3" }}>{p.name}</span>
                        {p.isCaptain && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99, background: "#ffd166", color: "#000" }}>C · 2×</span>
                        )}
                        {p.isViceCaptain && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99, background: "#7B68EE", color: "#fff" }}>VC · 1.5×</span>
                        )}
                        {!p.foundInScorecard && (
                          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "#30363d", color: "#7d8590" }}>DNP</span>
                        )}
                      </div>
                      {p.foundInScorecard && (
                        <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                          {p.batting && (
                            <span style={{ fontSize: 10, color: "#00C896" }}>
                              🏏 {p.batting.runs}r ({p.batting.balls}b)
                              {p.batting.fours > 0 && ` · ${p.batting.fours}×4`}
                              {p.batting.sixes > 0 && ` · ${p.batting.sixes}×6`}
                              <span style={{ color: "#7d8590" }}> +{p.battingPts}pts</span>
                            </span>
                          )}
                          {p.bowling && (
                            <span style={{ fontSize: 10, color: "#FF6B6B" }}>
                              🎳 {p.bowling.wickets}w ({p.bowling.overs}ov)
                              <span style={{ color: "#7d8590" }}> +{p.bowlingPts}pts</span>
                            </span>
                          )}
                          {p.basePts > 0 && (
                            <span style={{ fontSize: 10, color: "#7d8590" }}>+{p.basePts} base</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontSize: 18, fontWeight: 800,
                        color: p.isCaptain ? "#ffd166" : p.isViceCaptain ? "#7B68EE" : "#e6edf3",
                      }}>
                        {p.points}
                      </div>
                      <div style={{ fontSize: 9, color: "#7d8590" }}>pts</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!breakdown && !loading && !error && item.players?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 10 }}>Your Squad (breakdown not yet available)</div>
              {item.players.map(name => (
                <div key={name} style={{
                  background: "#161b22", border: "1px solid #30363d",
                  borderRadius: 8, padding: "8px 12px", marginBottom: 6,
                  display: "flex", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 13, color: "#e6edf3" }}>{name}</span>
                  {name === item.captain && <span style={{ fontSize: 10, fontWeight: 700, color: "#ffd166" }}>C</span>}
                  {name === item.viceCaptain && <span style={{ fontSize: 10, fontWeight: 700, color: "#7B68EE" }}>VC</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal for Bets / Contests / Challenges ─────────────────────────────
function DetailModal({ item, onClose }) {
  const statusColor = (s) => ({
    won: "#1D9E75", lost: "#E24B4A", draw: "#888780",
    active: "#7F77DD", cancelled: "#888780", settled: "#3C3489",
  }[s] || "#BA7517");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #e8e6dc",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#FAFAF7",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#444441" }}>
              {item.typeEmoji} {item.typeLabel} Details
            </div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{item.matchLabel}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #d3d1c7", color: "#888780",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 16,
          }}>×</button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 14,
            background: `${statusColor(item.status)}11`,
            border: `1px solid ${statusColor(item.status)}44`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: statusColor(item.status) }}>
              {item.status === "won" ? "🏆 Won!" : item.status === "lost" ? "😢 Lost" : item.status === "draw" ? "🤝 Draw" : item.status === "active" ? "⚡ Active" : item.status === "settled" ? "✅ Settled" : "⏳ Pending"}
            </span>
            <span style={{ fontSize: 12, color: "#888780" }}>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>

          {[
            item.type === "bet"       && { label: "Team Picked",  value: item.team },
            item.type === "bet"       && { label: "Odds",         value: `${item.odds}x` },
            item.type === "contest"   && { label: "Contest Name", value: item.contestName },
            item.type === "contest"   && { label: "Team Picked",  value: item.team },
            item.type === "challenge" && { label: "Opponent",     value: item.opponent || "—" },
            item.type === "challenge" && { label: "Team Picked",  value: item.team },
            { label: "Amount",  value: `${item.amount} pts` },
            item.status === "won" && item.type === "bet"       && { label: "Winnings", value: `${Math.floor(item.amount * (item.odds || 2))} pts`, highlight: true },
            item.status === "won" && item.type === "contest"   && { label: "Prize",    value: `${item.prize} pts`, highlight: true },
            item.status === "won" && item.type === "challenge" && { label: "Prize",    value: `${item.amount * 2} pts`, highlight: true },
            item.detail && { label: "Info", value: item.detail },
          ].filter(Boolean).map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: "1px solid #f1efe8",
            }}>
              <span style={{ fontSize: 13, color: "#888780" }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? "#1D9E75" : "#444441" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen]               = useState("auth");
  const [authMode, setAuthMode]           = useState("login");
  const [username, setUsername]           = useState("");
  const [inputName, setInputName]         = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [points, setPoints]               = useState(1000);
  const [lockedPoints, setLockedPoints]   = useState(0);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedTeam, setSelectedTeam]   = useState(null);
  const [betAmount, setBetAmount]         = useState("");
  const [betPlaced, setBetPlaced]         = useState(null);
  const [myBets, setMyBets]               = useState([]);
  const [allHistory, setAllHistory]       = useState([]);
  const [leaderboard, setLeaderboard]     = useState([]);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [prefilledMatch, setPrefilledMatch] = useState(null);
  const [matchStatus, setMatchStatus]     = useState(null);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => { window.history.pushState({ screen }, "", ""); }, [screen]);
  useEffect(() => {
    const handleBack = (e) => { if (e.state?.screen) setScreen(e.state.screen); };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    if (username) { fetchMyBets(); fetchAllHistory(); }
  }, [username]);

  useEffect(() => {
    if (!prefilledMatch) { setMatchStatus(null); return; }
    async function checkMatchStatus() {
      try {
        const res  = await fetch(`${API}/ipl-matches`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.matches || [];
        const idNum = parseInt(prefilledMatch.matchId.replace("ipl-", ""));
        const found = list.find(m => m.id === idNum);
        if (found) setMatchStatus(found.status);
      } catch (err) { console.error("Failed to check match status", err); }
    }
    checkMatchStatus();
    const interval = setInterval(checkMatchStatus, 60000);
    return () => clearInterval(interval);
  }, [prefilledMatch]);

  const fetchMyBets = async () => {
    try {
      const res  = await fetch(`${API}/bets/${username}`);
      const data = await res.json();
      if (res.ok) setMyBets(data);
    } catch (err) { console.error("Failed to fetch bets", err); }
  };

  const fetchAllHistory = async () => {
    try {
      const [betsRes, contestsRes, challengesRes, fantasy11Res] = await Promise.all([
        fetch(`${API}/bets/${username}`),
        fetch(`${API}/contests/${username}`),
        fetch(`${API}/challenges/${username}`),
        fetch(`${API}/fantasy11/my-teams/${username}`),
      ]);

      const betsData       = betsRes.ok       ? await betsRes.json()       : [];
      const contestsData   = contestsRes.ok   ? await contestsRes.json()   : { contests: [] };
      const challengesData = challengesRes.ok ? await challengesRes.json() : { challenges: [] };
      const fantasy11Data  = fantasy11Res.ok  ? await fantasy11Res.json()  : { teams: [] };

      const bets       = Array.isArray(betsData) ? betsData : [];
      const contests   = contestsData.contests   || [];
      const challenges = challengesData.challenges || [];
      const f11Teams   = fantasy11Data.teams || [];

      const normalizedBets = bets.map(b => ({
        _id: b._id, type: "bet", typeLabel: "Solo Bet", typeEmoji: "🎯",
        matchLabel: b.matchLabel, team: b.team, amount: b.amount,
        odds: b.odds || 2.0, status: b.status, createdAt: b.createdAt, detail: null,
      }));

      const normalizedContests = contests.map(c => {
        const myEntry    = c.participants?.find(p => p.username === username);
        const totalPot   = c.entryFee * (c.participants?.length || 1);
        const winners    = c.winner ? c.winner.split(", ") : [];
        let status = "pending";
        if (c.status === "settled")   status = winners.includes(username) ? "won" : "lost";
        if (c.status === "cancelled") status = "cancelled";
        const winnerCount = winners.length || 1;
        const prize = c.status === "settled" && winners.includes(username) ? Math.floor(totalPot / winnerCount) : 0;
        return {
          _id: c._id, type: "contest", typeLabel: "Contest", typeEmoji: "🏆",
          matchLabel: c.matchLabel, team: myEntry?.team || "—",
          amount: c.entryFee, prize, totalPot, status,
          contestStatus: c.status, winningTeam: c.winningTeam,
          contestName: c.name, createdAt: c.createdAt,
          matchId: c.matchId || null,
          detail: `${c.participants?.length || 1}/${c.maxPlayers} players`,
        };
      });

      const normalizedChallenges = challenges
        .filter(c => c.status !== "cancelled")
        .map(c => {
          const isChallenger = c.challenger === username;
          const myTeam = isChallenger ? c.challengerTeam : c.opponentTeam;
          let status = "pending";
          if (c.status === "settled") { if (c.winner === "draw") status = "draw"; else status = c.winner === username ? "won" : "lost"; }
          if (c.status === "active") status = "active";
          return {
            _id: c._id, type: "challenge", typeLabel: "Challenge", typeEmoji: "⚔️",
            matchLabel: c.matchLabel, team: myTeam || "—", amount: c.wager,
            prize: c.status === "settled" && c.winner === username ? c.wager * 2 : 0,
            status, opponent: isChallenger ? c.opponent : c.challenger,
            createdAt: c.createdAt,
            detail: isChallenger ? `You challenged ${c.opponent || "invited players"}` : `Challenged by ${c.challenger}`,
          };
        });

      const normalizedFantasy11 = f11Teams.map(t => {
        const hasResult = t.fantasyPoints !== null && t.fantasyPoints !== undefined;
        return {
          _id: t._id, type: "fantasy11", typeLabel: "Fantasy 11", typeEmoji: "🏏",
          matchLabel: t.matchLabel || t.matchId,
          team: `C: ${t.captain || "—"} · VC: ${t.viceCaptain || "—"}`,
          amount: 0,
          fantasyPoints: t.fantasyPoints,
          status: hasResult ? "settled" : t.locked ? "active" : "pending",
          createdAt: t.createdAt,
          detail: hasResult
            ? `${t.fantasyPoints} fantasy pts scored`
            : t.locked ? "Match in progress" : "Squad saved — awaiting match",
          players: t.players || [],
          captain: t.captain,
          viceCaptain: t.viceCaptain,
          matchId: t.matchId,
        };
      });

      const merged = [
        ...normalizedBets,
        ...normalizedContests,
        ...normalizedChallenges,
        ...normalizedFantasy11,
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllHistory(merged);
    } catch (err) { console.error("Failed to fetch history", err); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res  = await fetch(`${API}/leaderboard`);
      const data = await res.json();
      if (res.ok) setLeaderboard(data.users);
    } catch (err) { console.error("Failed to fetch leaderboard", err); }
  };

  const handleAuth = async () => {
    if (!inputName.trim() || !inputPassword.trim()) { setError("Please enter both username and password!"); return; }
    setLoading(true); setError("");
    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputName.trim(), password: inputPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsername(data.name); setPoints(data.points); setLockedPoints(data.lockedPoints || 0);
        setScreen("home"); fetchLeaderboard();
      } else { setError(data.message || "Something went wrong!"); }
    } catch (err) { setError("Can't connect to server. Make sure backend is running!"); }
    setLoading(false);
  };

  const handleBetOnMatch = (matchInfo) => {
    const iplSport = { id: "cricket", name: "Cricket", emoji: "🏏", teams: matchInfo.teams };
    setSelectedSport(iplSport); setSelectedTeam(null); setBetAmount("");
    setPrefilledMatch(matchInfo); setMatchStatus(null); setError("");
    setScreen("bet");
  };

  const handleFantasy11 = (matchInfo) => {
    setPrefilledMatch(matchInfo);
    setMatchStatus(null);
    setScreen("fantasy11");
  };

  const placeBet = async () => {
    if (matchStatus === "live")      { setError("Betting is closed — this match has already started!"); return; }
    if (matchStatus === "completed") { setError("Betting is closed — this match has already ended!");   return; }
    const amount = parseInt(betAmount);
    if (!amount || amount <= 0 || amount > points) return;
    if (!selectedTeam)   { setError("Please pick a team!"); return; }
    if (!prefilledMatch) { setError("Please go to 🏏 IPL tab and click Bet Now on a match first!"); return; }
    setLoading(true); setError("");
    try {
      const teamOdds = prefilledMatch.odds?.[selectedTeam] || 2.0;
      const res  = await fetch(`${API}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username, amount,
          matchId: String(prefilledMatch.matchId),
          matchLabel: prefilledMatch.matchLabel,
          team: selectedTeam, odds: teamOdds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnimatePoints(true); setTimeout(() => setAnimatePoints(false), 1000);
        setPoints(data.points); setLockedPoints(data.lockedPoints);
        setBetPlaced({ amount, team: selectedTeam, matchLabel: prefilledMatch.matchLabel, odds: teamOdds, potentialWin: Math.floor(amount * teamOdds) });
        fetchMyBets(); fetchAllHistory(); fetchLeaderboard();
        setTimeout(() => { setBetPlaced(null); setSelectedTeam(null); setBetAmount(""); setPrefilledMatch(null); setMatchStatus(null); }, 3000);
      } else { setError(data.message || "Bet failed!"); }
    } catch (err) { setError("Can't connect to server!"); }
    setLoading(false);
  };

  const handleLogout = () => {
    setUsername(""); setInputName(""); setInputPassword(""); setPoints(1000); setLockedPoints(0);
    setMyBets([]); setAllHistory([]); setLeaderboard([]);
    setScreen("auth"); setAuthMode("login"); setPrefilledMatch(null); setMatchStatus(null);
  };

  const statusColor = (s) => ({
    won: "#1D9E75", lost: "#E24B4A", draw: "#888780",
    active: "#7F77DD", cancelled: "#888780", settled: "#3C3489",
  }[s] || "#BA7517");

  const statusEmoji = (s) => ({
    won: "🏆", lost: "😢", draw: "🤝", active: "⚡",
    cancelled: "❌", settled: "✅",
  }[s] || "⏳");

  const statusLabel = (s) => ({
    won: "WON", lost: "LOST", draw: "DRAW", active: "ACTIVE",
    cancelled: "CANCELLED", settled: "SETTLED",
  }[s] || "PENDING");

  const pointsDisplay = (item) => {
    if (item.type === "fantasy11") {
      if (item.fantasyPoints !== null && item.fantasyPoints !== undefined)
        return `${item.fantasyPoints} pts scored`;
      return item.locked ? "⚡ In progress" : "⏳ Pending";
    }
    if (item.status === "won") {
      if (item.type === "bet")       return `+${Math.floor(item.amount * (item.odds || 2.0)) - item.amount} pts profit`;
      if (item.type === "contest")   return `+${item.prize - item.amount} pts profit`;
      if (item.type === "challenge") return `+${item.amount} pts profit`;
    }
    if (item.status === "lost")      return `-${item.amount} pts`;
    if (item.status === "draw")      return "refunded";
    if (item.status === "cancelled") return "refunded";
    return `🔒 ${item.amount} pts`;
  };

  const leaderboardList = () => {
    const others = leaderboard.filter(p => p.name !== username);
    const me = { name: username + " (You)", points };
    return [...others, me].sort((a, b) => b.points - a.points);
  };

  const maxPoints    = Math.max(...leaderboardList().map(p => p.points), 1000);
  const pendingCount = myBets.filter(b => b.status === "pending").length;
  const isBettingLocked = matchStatus === "live" || matchStatus === "completed";

  const historyTabs = [
    { key: "all",       label: "All",        emoji: "",   color: "#7F77DD" },
    { key: "bet",       label: "Solo Bets",  emoji: "🎯", color: "#BA7517" },
    { key: "contest",   label: "Contests",   emoji: "🏆", color: "#1D9E75" },
    { key: "challenge", label: "Challenges", emoji: "⚔️", color: "#E24B4A" },
    { key: "fantasy11", label: "Fantasy 11", emoji: "🏏", color: "#ffd166" },
  ];

  const filteredHistory = historyFilter === "all"
    ? allHistory
    : allHistory.filter(h => h.type === historyFilter);

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── Modals ── */}
      {selectedHistoryItem && (selectedHistoryItem.type === "fantasy11" || selectedHistoryItem.team === "fantasy11") && (
        <Fantasy11BreakdownModal
          item={{
            ...selectedHistoryItem,
            matchId: selectedHistoryItem.matchId
              ? ("" + selectedHistoryItem.matchId).replace(/^ipl-?(\d+)/, "ipl-$1")
              : null,
          }}
          username={username}
          onClose={() => setSelectedHistoryItem(null)}
        />
      )}
      {selectedHistoryItem && selectedHistoryItem.type !== "fantasy11" && selectedHistoryItem.team !== "fantasy11" && (
        <DetailModal
          item={selectedHistoryItem}
          onClose={() => setSelectedHistoryItem(null)}
        />
      )}

      {/* ── AUTH ── */}
      {screen === "auth" && (
        <div className="login-screen">
          <div className="login-box">
            <div className="login-logo">⚡ FANTASYBET</div>
            <h1 className="login-title">{authMode === "login" ? "Welcome Back" : "Join the Arena"}</h1>
            <p className="login-sub">{authMode === "login" ? "Login to continue your journey" : "Register to get 1000 free points"}</p>
            <div className="auth-tabs">
              <button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setError(""); }}>Login</button>
              <button className={authMode === "register" ? "active" : ""} onClick={() => { setAuthMode("register"); setError(""); }}>Register</button>
            </div>
            <input className="login-input" placeholder="Username" value={inputName}
              onChange={e => setInputName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            <input className="login-input" type="password" placeholder="Password" value={inputPassword}
              onChange={e => setInputPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" onClick={handleAuth} disabled={loading}>
              {loading ? "Loading..." : authMode === "login" ? "Login →" : "Create Account →"}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN APP ── */}
      {screen !== "auth" && (
        <>
          <nav className="nav">
            <div className="nav-logo" onClick={() => setScreen("home")} style={{ cursor: "pointer" }}>⚡ FANTASYBET</div>
            <div className="nav-links">
              <button className={screen === "home"        ? "active" : ""} onClick={() => setScreen("home")}>Home</button>
              <button className={screen === "matches"     ? "active" : ""} onClick={() => setScreen("matches")}>🏏 IPL</button>
              <button className={screen === "fantasy11"   ? "active" : ""} onClick={() => setScreen("fantasy11")}>🏆 Fantasy 11</button>
              <button className={screen === "leaderboard" ? "active" : ""} onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }}>Leaderboard</button>
              <button className={screen === "history"     ? "active" : ""} onClick={() => { fetchAllHistory(); setScreen("history"); }}>
                History {pendingCount > 0 && (
                  <span style={{ background: "#BA7517", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <button className={screen === "multiplayer" ? "active" : ""} onClick={() => setScreen("multiplayer")}>⚔️ Multiplayer</button>
            </div>
            <div className="nav-right">
              <div className={`nav-points ${animatePoints ? "pulse" : ""}`}>
                <span>💰</span>
                <span className="points-value">{points.toLocaleString()}</span>
                <span className="points-label">pts</span>
              </div>
              {lockedPoints > 0 && (
                <div className="nav-points" style={{ borderColor: "#BA7517", opacity: 0.8 }}>
                  <span>🔒</span>
                  <span className="points-value" style={{ color: "#BA7517" }}>{lockedPoints.toLocaleString()}</span>
                  <span className="points-label">locked</span>
                </div>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </nav>

          {/* ── HOME ── */}
          {screen === "home" && (
            <div className="screen home-screen">
              <div className="hero">
                <div className="hero-badge">🏆 FANTASY SPORTS BETTING</div>
                <h1 className="hero-title">Welcome,<br /><span className="accent">{username}!</span></h1>
                <p className="hero-sub">
                  You have <strong>{points.toLocaleString()} points</strong> available
                  {lockedPoints > 0 && <span> · <span style={{ color: "#BA7517" }}>🔒 {lockedPoints} locked</span></span>}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setScreen("matches")}>🏏 Bet on IPL →</button>
                  <button className="btn-primary" onClick={() => setScreen("fantasy11")} style={{ background: "#BA7517" }}>🏆 Fantasy 11 →</button>
                  <button className="btn-primary" onClick={() => { fetchAllHistory(); setScreen("history"); }} style={{ background: "#1D9E75" }}>My Bets →</button>
                </div>
              </div>
              <div className="sports-grid">
                {SPORTS.map(sport => (
                  <div key={sport.id} className="sport-card"
                    onClick={() => { if (sport.id === "cricket") setScreen("matches"); else alert(`🚧 ${sport.name} — Coming Soon!`); }}
                    style={sport.id !== "cricket" ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                  >
                    <span className="sport-emoji">{sport.emoji}</span>
                    <span className="sport-name">{sport.name}</span>
                    {sport.id === "cricket"
                      ? <span className="sport-arrow">→</span>
                      : <span style={{ fontSize: 11, color: "#BA7517", fontWeight: 600, marginTop: 4 }}>🚧 Coming Soon</span>
                    }
                  </div>
                ))}
              </div>
              <div className="stats-row">
                <div className="stat-box"><div className="stat-num">{allHistory.length}</div><div className="stat-label">Total Bets</div></div>
                <div className="stat-box"><div className="stat-num">{allHistory.filter(b => b.status === "won").length}</div><div className="stat-label">Wins</div></div>
                <div className="stat-box"><div className="stat-num">{allHistory.filter(b => b.status === "pending" || b.status === "active").length}</div><div className="stat-label">Pending</div></div>
                <div className="stat-box"><div className="stat-num">{allHistory.filter(b => b.type === "fantasy11").length}</div><div className="stat-label">Fantasy 11</div></div>
              </div>
            </div>
          )}

          {/* ── IPL MATCHES ── */}
          {screen === "matches" && (
            <div className="screen">
              <Matches onBetOnMatch={handleBetOnMatch} onFantasy11={handleFantasy11} />
            </div>
          )}

          {/* ── BET SCREEN ── */}
          {screen === "bet" && (
            <div className="screen bet-screen">
              <h2 className="screen-title">Place Your Bet</h2>
              {!prefilledMatch ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
                  <p style={{ color: "var(--muted)", marginBottom: 20 }}>Pick an IPL match first, then come back to bet!</p>
                  <button className="btn-primary" onClick={() => setScreen("matches")}>Browse IPL Matches →</button>
                </div>
              ) : (
                <>
                  <div style={{ background: "rgba(29,158,117,0.1)", border: "1px solid #1D9E75", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Selected Match</div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        🏏 {prefilledMatch.matchLabel}
                        {matchStatus === "live" && (
                          <span style={{ marginLeft: 10, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F09595" }}>● LIVE</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => { setPrefilledMatch(null); setSelectedSport(null); setSelectedTeam(null); setMatchStatus(null); }}
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 20 }}>×</button>
                  </div>

                  {isBettingLocked && (
                    <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F7C1C1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>🔒</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#A32D2D", marginBottom: 4, fontSize: 14 }}>Bets are locked for this match</div>
                        <div style={{ fontSize: 13, color: "#993C1D", lineHeight: 1.5 }}>
                          {matchStatus === "live" ? "This match has already started." : "This match has already ended."} Go back and pick an upcoming match.
                        </div>
                        <button className="btn-primary" style={{ marginTop: 12, padding: "8px 16px", fontSize: 13 }} onClick={() => setScreen("matches")}>Browse Upcoming Matches →</button>
                      </div>
                    </div>
                  )}

                  {!isBettingLocked && (
                    <>
                      <div className="section">
                        <div className="section-label">Pick Your Team</div>
                        <div className="team-grid">
                          {selectedSport?.teams.map(team => {
                            const teamOdds = prefilledMatch?.odds?.[team];
                            const isSelected = selectedTeam === team;
                            const isFav = teamOdds && prefilledMatch?.odds ? teamOdds === Math.min(...Object.values(prefilledMatch.odds)) : false;
                            return (
                              <button key={team} className={`team-card ${isSelected ? "selected" : ""}`} onClick={() => setSelectedTeam(team)}>
                                <span>{team}</span>
                                {teamOdds && (
                                  <span style={{ display: "block", fontSize: 12, fontWeight: 700, marginTop: 5, color: isFav ? "#0F6E56" : "#A32D2D", background: isFav ? "#E1F5EE" : "#FCEBEB", borderRadius: 6, padding: "2px 8px", border: `1px solid ${isFav ? "#5DCAA5" : "#F09595"}` }}>
                                    {teamOdds}x {isFav ? "⭐ Fav" : "💎 Dog"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {selectedTeam && (
                        <div className="section">
                          {prefilledMatch?.odds?.[selectedTeam] && betAmount && parseInt(betAmount) > 0 && (
                            <div style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 10, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 11, color: "#085041", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Potential Win</div>
                                <div style={{ fontSize: 26, fontWeight: 700, color: "#0F6E56", lineHeight: 1 }}>{Math.floor(parseInt(betAmount) * prefilledMatch.odds[selectedTeam])} pts</div>
                                <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 4 }}>{parseInt(betAmount)} pts × {prefilledMatch.odds[selectedTeam]}x odds</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, color: "#888780", marginBottom: 2 }}>Profit if win</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#0F6E56" }}>+{Math.floor(parseInt(betAmount) * prefilledMatch.odds[selectedTeam]) - parseInt(betAmount)} pts</div>
                                <div style={{ fontSize: 10, color: "#888780", marginTop: 4 }}>📊 Live odds</div>
                              </div>
                            </div>
                          )}
                          <div className="section-label">Bet Amount (Available: {points} pts)</div>
                          <div className="amount-row">
                            {[50, 100, 250, 500].map(amt => (
                              <button key={amt} className="amount-chip" onClick={() => setBetAmount(String(Math.min(amt, points)))}>{amt}</button>
                            ))}
                            <button className="amount-chip all-in" onClick={() => setBetAmount(String(points))}>ALL IN 🔥</button>
                          </div>
                          <div className="input-row">
                            <input type="number" className="bet-input" placeholder="Enter amount..." value={betAmount} onChange={e => setBetAmount(e.target.value)} max={points} />
                            <button className="btn-primary bet-btn" onClick={placeBet} disabled={loading || !betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > points}>
                              {loading ? "Placing..." : "Lock Bet 🔒"}
                            </button>
                          </div>
                          {error && <div className="error-msg">{error}</div>}
                        </div>
                      )}
                    </>
                  )}

                  {isBettingLocked && error && <div className="error-msg">{error}</div>}
                  {betPlaced && (
                    <div className="bet-result win">
                      <div className="result-emoji">🔒</div>
                      <div className="result-text">BET LOCKED!</div>
                      <div style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>{betPlaced.amount} pts on {betPlaced.team} · {betPlaced.matchLabel}</div>
                      {betPlaced.potentialWin && <div style={{ fontSize: 16, marginTop: 8, fontWeight: 700, color: "#1D9E75" }}>🏆 Potential win: {betPlaced.potentialWin} pts ({betPlaced.odds}x odds)</div>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── FANTASY 11 SCREEN ── */}
          {screen === "fantasy11" && (
            <div className="screen">
              <Fantasy11
                username={username}
                points={points}
                setPoints={setPoints}
                matchInfo={prefilledMatch}
                matchStatus={matchStatus}
              />
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {screen === "leaderboard" && (
            <div className="screen leaderboard-screen">
              <h2 className="screen-title">🏆 Leaderboard</h2>
              <button className="btn-primary" style={{ marginBottom: 20, padding: "0.5rem 1.5rem" }} onClick={fetchLeaderboard}>🔄 Refresh</button>
              {leaderboard.length === 0 ? (
                <div className="empty-state">Loading players...</div>
              ) : (
                <div className="leaderboard">
                  {leaderboardList().map((player, i) => (
                    <div key={player.name} className={`leaderboard-row ${player.name.includes("(You)") ? "you" : ""}`}>
                      <div className="rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-points">{player.points.toLocaleString()} pts</div>
                      <div className="points-bar"><div className="points-fill" style={{ width: `${(player.points / maxPoints) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY ── */}
          {screen === "history" && (
            <div className="screen history-screen">
              <h2 className="screen-title">📜 My History</h2>
              <button className="btn-primary" style={{ marginBottom: 16, padding: "0.5rem 1.5rem" }} onClick={fetchAllHistory}>🔄 Refresh</button>

              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {historyTabs.map(tab => (
                  <button key={tab.key} onClick={() => setHistoryFilter(tab.key)} style={{
                    fontSize: 12, padding: "5px 14px", borderRadius: 99, cursor: "pointer",
                    border: `1px solid ${historyFilter === tab.key ? tab.color : tab.color + "44"}`,
                    background: historyFilter === tab.key ? tab.color + "22" : "transparent",
                    color: historyFilter === tab.key ? tab.color : tab.color + "99",
                    fontWeight: historyFilter === tab.key ? 700 : 400,
                    transition: "all 0.15s",
                  }}>
                    {tab.emoji} {tab.label} ({tab.key === "all" ? allHistory.length : allHistory.filter(h => h.type === tab.key).length})
                  </button>
                ))}
              </div>

              {filteredHistory.length === 0 ? (
                <div className="empty-state">
                  {historyFilter === "fantasy11"
                    ? "No Fantasy 11 squads yet! Go to 🏏 IPL tab and click Fantasy 11 on a match."
                    : "No entries yet! Go to 🏏 IPL tab, ⚔️ Multiplayer, or join a contest 🎯"
                  }
                </div>
              ) : (
                <div className="history-list">
                  {filteredHistory.map((item) => (
                    <div
                      key={`${item.type}-${item._id}`}
                      className={`history-row ${item.status === "won" ? "win" : item.status === "lost" ? "lose" : ""}`}
                      onClick={() => setSelectedHistoryItem(item)}
                      style={{ borderLeft: `3px solid ${statusColor(item.status)}`, cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <div className="history-sport">{statusEmoji(item.status)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{item.matchLabel}</span>
                          <span style={{
                            fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 600,
                            background: item.type === "bet" ? "#BA751722" : item.type === "contest" ? "#1D9E7522" : item.type === "fantasy11" ? "#ffd16622" : "#7F77DD22",
                            color: item.type === "bet" ? "#BA7517" : item.type === "contest" ? "#1D9E75" : item.type === "fantasy11" ? "#8a6a00" : "#7F77DD",
                          }}>
                            {item.typeEmoji} {item.typeLabel}
                          </span>
                          {item.type === "bet" && item.odds && item.odds !== 2.0 && (
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 600, background: "#E1F5EE", color: "#085041", border: "0.5px solid #5DCAA5" }}>{item.odds}x odds</span>
                          )}
                          <span style={{ fontSize: 9, color: "#7d8590", marginLeft: "auto" }}>tap for details →</span>
                        </div>

                        {item.type === "fantasy11" ? (
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            <span style={{ opacity: 0.7 }}>{item.team}</span>
                            {item.players?.length > 0 && (
                              <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 11 }}>· {item.players.length} players selected</span>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                            Picked: <strong>{item.team}</strong>
                            {item.type === "contest" && item.contestName && <span style={{ marginLeft: 6, opacity: 0.6 }}>· {item.contestName}</span>}
                            {item.type === "challenge" && item.opponent && <span style={{ marginLeft: 6, opacity: 0.6 }}>· vs {item.opponent}</span>}
                          </div>
                        )}

                        {item.detail && (
                          <div style={{
                            fontSize: 11, marginTop: 3,
                            color: item.type === "fantasy11" && item.fantasyPoints !== null ? "#ffd166" : "rgba(255,255,255,0.4)",
                            fontWeight: item.type === "fantasy11" && item.fantasyPoints !== null ? 700 : 400,
                          }}>
                            {item.type === "fantasy11" && item.fantasyPoints !== null ? "🏏 " : ""}{item.detail}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          color: item.type === "fantasy11" ? (item.fantasyPoints !== null ? "#ffd166" : "#888780") : statusColor(item.status),
                          fontWeight: 600, fontSize: 14, marginBottom: 4,
                        }}>
                          {pointsDisplay(item)}
                        </div>
                        <div className="history-badge" style={{ background: `${statusColor(item.status)}22`, color: statusColor(item.status) }}>
                          {statusLabel(item.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MULTIPLAYER ── */}
          {screen === "multiplayer" && (
            <div className="screen">
              <Multiplayer username={username} points={points} setPoints={setPoints} />
            </div>
          )}
        </>
      )}
    </div>
  );
}