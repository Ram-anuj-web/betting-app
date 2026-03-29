import Multiplayer from "./Multiplayer";
import Matches from "./Matches";
import React, { useState, useEffect } from "react";
import "./App.css";

const API = "https://betting-backend-xq1q.onrender.com";

const SPORTS = [
  { id: "cricket", name: "Cricket", emoji: "🏏", teams: ["India", "Australia", "England", "Pakistan"] },
  { id: "football", name: "Football", emoji: "⚽", teams: ["Real Madrid", "Barcelona", "Man City", "PSG"] },
  { id: "basketball", name: "Basketball", emoji: "🏀", teams: ["Lakers", "Warriors", "Bulls", "Celtics"] },
  { id: "tennis", name: "Tennis", emoji: "🎾", teams: ["Djokovic", "Alcaraz", "Sinner", "Medvedev"] },
];

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [points, setPoints] = useState(1000);
  const [lockedPoints, setLockedPoints] = useState(0);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [betPlaced, setBetPlaced] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prefilledMatch, setPrefilledMatch] = useState(null);

  // track live match status for the prefilled match
  const [matchStatus, setMatchStatus] = useState(null); // "upcoming" | "live" | "completed"

  // ─── Back button support ───────────────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ screen }, "", "");
  }, [screen]);

  useEffect(() => {
    const handleBack = (e) => {
      if (e.state?.screen) setScreen(e.state.screen);
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    if (username) {
      fetchMyBets();
      fetchAllHistory();
    }
  }, [username]);

  // whenever a match is prefilled, fetch its live status from the backend
  useEffect(() => {
    if (!prefilledMatch) { setMatchStatus(null); return; }

    async function checkMatchStatus() {
      try {
        const res = await fetch(`${API}/ipl-matches`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.matches || [];
        const idNum = parseInt(prefilledMatch.matchId.replace("ipl-", ""));
        const found = list.find(m => m.id === idNum);
        if (found) setMatchStatus(found.status);
      } catch (err) {
        console.error("Failed to check match status", err);
      }
    }

    checkMatchStatus();
    const interval = setInterval(checkMatchStatus, 60000);
    return () => clearInterval(interval);
  }, [prefilledMatch]);

  // ─── Solo bets (for pending count badge only) ──────────────────────────────
  const fetchMyBets = async () => {
    try {
      const res = await fetch(`${API}/bets/${username}`);
      const data = await res.json();
      if (res.ok) setMyBets(data);
    } catch (err) {
      console.error("Failed to fetch bets", err);
    }
  };

  // ─── Unified history: bets + contests + challenges ─────────────────────────
  const fetchAllHistory = async () => {
    try {
      const [betsRes, contestsRes, challengesRes] = await Promise.all([
        fetch(`${API}/bets/${username}`),
        fetch(`${API}/contests/${username}`),
        fetch(`${API}/challenges/${username}`),
      ]);

      const betsData       = betsRes.ok       ? await betsRes.json()       : [];
      const contestsData   = contestsRes.ok   ? await contestsRes.json()   : { contests: [] };
      const challengesData = challengesRes.ok ? await challengesRes.json() : { challenges: [] };

      const bets       = Array.isArray(betsData) ? betsData : [];
      const contests   = contestsData.contests   || [];
      const challenges = challengesData.challenges || [];

      const normalizedBets = bets.map(b => ({
        _id: b._id,
        type: "bet",
        typeLabel: "Solo Bet",
        typeEmoji: "🎯",
        matchLabel: b.matchLabel,
        team: b.team,
        amount: b.amount,
        odds: b.odds || 2.0,
        status: b.status,
        createdAt: b.createdAt,
        detail: null,
      }));

      const normalizedContests = contests.map(c => {
        const myEntry = c.participants?.find(p => p.username === username);
        const totalPot = c.entryFee * (c.participants?.length || 1);
        const winners = c.winner ? c.winner.split(", ") : [];
        let status = "pending";
        if (c.status === "settled") {
          status = winners.includes(username) ? "won" : "lost";
        } else if (c.status === "cancelled") {
          status = "cancelled";
        }
        const winnerCount = winners.length || 1;
        const prize = c.status === "settled" && winners.includes(username)
          ? Math.floor(totalPot / winnerCount)
          : 0;
        return {
          _id: c._id,
          type: "contest",
          typeLabel: "Contest",
          typeEmoji: "🏆",
          matchLabel: c.matchLabel,
          team: myEntry?.team || "—",
          amount: c.entryFee,
          prize,
          totalPot,
          status,
          contestStatus: c.status,
          winningTeam: c.winningTeam,
          contestName: c.name,
          createdAt: c.createdAt,
          detail: `${c.participants?.length || 1}/${c.maxPlayers} players`,
        };
      });

      const normalizedChallenges = challenges
        .filter(c => c.status !== "cancelled")
        .map(c => {
          const isChallenger = c.challenger === username;
          const myTeam = isChallenger ? c.challengerTeam : c.opponentTeam;
          let status = "pending";
          if (c.status === "settled") {
            if (c.winner === "draw") status = "draw";
            else status = c.winner === username ? "won" : "lost";
          } else if (c.status === "active") {
            status = "active";
          }
          return {
            _id: c._id,
            type: "challenge",
            typeLabel: "Challenge",
            typeEmoji: "⚔️",
            matchLabel: c.matchLabel,
            team: myTeam || "—",
            amount: c.wager,
            prize: c.status === "settled" && c.winner === username ? c.wager * 2 : 0,
            status,
            opponent: isChallenger ? c.opponent : c.challenger,
            createdAt: c.createdAt,
            detail: isChallenger ? `You challenged ${c.opponent || "invited players"}` : `Challenged by ${c.challenger}`,
          };
        });

      const merged = [
        ...normalizedBets,
        ...normalizedContests,
        ...normalizedChallenges,
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllHistory(merged);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API}/leaderboard`);
      const data = await res.json();
      if (res.ok) setLeaderboard(data.users);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  const handleAuth = async () => {
    if (!inputName.trim() || !inputPassword.trim()) {
      setError("Please enter both username and password!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputName.trim(), password: inputPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsername(data.name);
        setPoints(data.points);
        setLockedPoints(data.lockedPoints || 0);
        setScreen("home");
        fetchLeaderboard();
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch (err) {
      setError("Can't connect to server. Make sure backend is running!");
    }
    setLoading(false);
  };

  const handleBetOnMatch = (matchInfo) => {
    const iplSport = { id: "cricket", name: "Cricket", emoji: "🏏", teams: matchInfo.teams };
    setSelectedSport(iplSport);
    setSelectedTeam(null);
    setBetAmount("");
    setPrefilledMatch(matchInfo); // matchInfo now includes odds from Matches.jsx
    setMatchStatus(null);
    setError("");
    setScreen("bet");
  };

  // ─── Place Bet — sends odds to backend for correct payout ─────────────────
  const placeBet = async () => {
    if (matchStatus === "live") {
      setError("Betting is closed — this match has already started!");
      return;
    }
    if (matchStatus === "completed") {
      setError("Betting is closed — this match has already ended!");
      return;
    }

    const amount = parseInt(betAmount);
    if (!amount || amount <= 0 || amount > points) return;
    if (!selectedTeam) { setError("Please pick a team!"); return; }
    if (!prefilledMatch) {
      setError("Please go to 🏏 IPL tab and click Bet Now on a match first!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Use live odds for this team, fallback to 2.0
      const teamOdds = prefilledMatch.odds?.[selectedTeam] || 2.0;

      const res = await fetch(`${API}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          amount,
          matchId: String(prefilledMatch.matchId),
          matchLabel: prefilledMatch.matchLabel,
          team: selectedTeam,
          odds: teamOdds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnimatePoints(true);
        setTimeout(() => setAnimatePoints(false), 1000);
        setPoints(data.points);
        setLockedPoints(data.lockedPoints);
        setBetPlaced({
          amount,
          team: selectedTeam,
          matchLabel: prefilledMatch.matchLabel,
          odds: teamOdds,
          potentialWin: Math.floor(amount * teamOdds),
        });
        fetchMyBets();
        fetchAllHistory();
        fetchLeaderboard();
        setTimeout(() => {
          setBetPlaced(null);
          setSelectedTeam(null);
          setBetAmount("");
          setPrefilledMatch(null);
          setMatchStatus(null);
        }, 3000);
      } else {
        setError(data.message || "Bet failed!");
      }
    } catch (err) {
      setError("Can't connect to server!");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUsername("");
    setInputName("");
    setInputPassword("");
    setPoints(1000);
    setLockedPoints(0);
    setMyBets([]);
    setAllHistory([]);
    setLeaderboard([]);
    setScreen("auth");
    setAuthMode("login");
    setPrefilledMatch(null);
    setMatchStatus(null);
  };

  // ─── Status helpers ────────────────────────────────────────────────────────
  const statusColor = (status) => {
    if (status === "won")       return "#1D9E75";
    if (status === "lost")      return "#E24B4A";
    if (status === "draw")      return "#888780";
    if (status === "active")    return "#7F77DD";
    if (status === "cancelled") return "#888780";
    return "#BA7517";
  };

  const statusEmoji = (status) => {
    if (status === "won")       return "🏆";
    if (status === "lost")      return "😢";
    if (status === "draw")      return "🤝";
    if (status === "active")    return "⚡";
    if (status === "cancelled") return "❌";
    return "⏳";
  };

  const statusLabel = (status) => {
    if (status === "won")       return "WON";
    if (status === "lost")      return "LOST";
    if (status === "draw")      return "DRAW";
    if (status === "active")    return "ACTIVE";
    if (status === "cancelled") return "CANCELLED";
    return "PENDING";
  };

  const pointsDisplay = (item) => {
    if (item.status === "won") {
      if (item.type === "bet") {
        const payout = Math.floor(item.amount * (item.odds || 2.0));
        return `+${payout - item.amount} pts profit`;
      }
      if (item.type === "contest")   return `+${item.prize - item.amount} pts profit`;
      if (item.type === "challenge") return `+${item.amount} pts profit`;
    }
    if (item.status === "lost")      return `-${item.amount} pts`;
    if (item.status === "draw")      return `refunded`;
    if (item.status === "cancelled") return `refunded`;
    if (item.status === "active")    return `🔒 ${item.amount} pts`;
    return `🔒 ${item.amount} pts`;
  };

  const leaderboardList = () => {
    const others = leaderboard.filter(p => p.name !== username);
    const me = { name: username + " (You)", points };
    return [...others, me].sort((a, b) => b.points - a.points);
  };

  const maxPoints = Math.max(...leaderboardList().map(p => p.points), 1000);
  const pendingCount = myBets.filter(b => b.status === "pending").length;

  // derived flag used in the bet screen
  const isBettingLocked = matchStatus === "live" || matchStatus === "completed";

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── Auth Screen ── */}
      {screen === "auth" && (
        <div className="login-screen">
          <div className="login-box">
            <div className="login-logo">⚡ FANTASYBET</div>
            <h1 className="login-title">
              {authMode === "login" ? "Welcome Back" : "Join the Arena"}
            </h1>
            <p className="login-sub">
              {authMode === "login" ? "Login to continue your journey" : "Register to get 1000 free points"}
            </p>
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

      {/* ── Main App ── */}
      {screen !== "auth" && (
        <>
          <nav className="nav">
            <div className="nav-logo" onClick={() => setScreen("home")} style={{ cursor: "pointer" }}>
              ⚡ FANTASYBET
            </div>
            <div className="nav-links">
              <button className={screen === "home" ? "active" : ""} onClick={() => setScreen("home")}>Home</button>
              <button className={screen === "matches" ? "active" : ""} onClick={() => setScreen("matches")}>🏏 IPL</button>
              <button className={screen === "leaderboard" ? "active" : ""} onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }}>Leaderboard</button>
              <button className={screen === "history" ? "active" : ""} onClick={() => { fetchAllHistory(); setScreen("history"); }}>
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

          {/* ── Home Screen ── */}
          {screen === "home" && (
            <div className="screen home-screen">
              <div className="hero">
                <div className="hero-badge">🏆 FANTASY SPORTS BETTING</div>
                <h1 className="hero-title">
                  Welcome,<br />
                  <span className="accent">{username}!</span>
                </h1>
                <p className="hero-sub">
                  You have <strong>{points.toLocaleString()} points</strong> available
                  {lockedPoints > 0 && <span> · <span style={{ color: "#BA7517" }}>🔒 {lockedPoints} locked</span></span>}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setScreen("matches")}>🏏 Bet on IPL →</button>
                  <button className="btn-primary" onClick={() => { fetchAllHistory(); setScreen("history"); }} style={{ background: "#1D9E75" }}>My Bets →</button>
                </div>
              </div>

              <div className="sports-grid">
                {SPORTS.map(sport => (
                  <div key={sport.id} className="sport-card" onClick={() => setScreen("matches")}>
                    <span className="sport-emoji">{sport.emoji}</span>
                    <span className="sport-name">{sport.name}</span>
                    <span className="sport-arrow">→</span>
                  </div>
                ))}
              </div>

              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num">{allHistory.length}</div>
                  <div className="stat-label">Total Bets</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{allHistory.filter(b => b.status === "won").length}</div>
                  <div className="stat-label">Wins</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{allHistory.filter(b => b.status === "pending" || b.status === "active").length}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* ── IPL Matches Screen ── */}
          {screen === "matches" && (
            <div className="screen">
              <Matches onBetOnMatch={handleBetOnMatch} />
            </div>
          )}

          {/* ── Bet Screen ── */}
          {screen === "bet" && (
            <div className="screen bet-screen">
              <h2 className="screen-title">Place Your Bet</h2>
              {!prefilledMatch ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
                  <p style={{ color: "var(--muted)", marginBottom: 20 }}>
                    Pick an IPL match first, then come back to bet!
                  </p>
                  <button className="btn-primary" onClick={() => setScreen("matches")}>
                    Browse IPL Matches →
                  </button>
                </div>
              ) : (
                <>
                  {/* Selected match banner */}
                  <div style={{
                    background: "rgba(29,158,117,0.1)", border: "1px solid #1D9E75",
                    borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Selected Match</div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        🏏 {prefilledMatch.matchLabel}
                        {matchStatus === "live" && (
                          <span style={{
                            marginLeft: 10, fontSize: 10, fontWeight: 700,
                            padding: "2px 8px", borderRadius: 99,
                            background: "#FCEBEB", color: "#A32D2D",
                            border: "0.5px solid #F09595",
                            animation: "blink 1s infinite",
                          }}>
                            ● LIVE
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => { setPrefilledMatch(null); setSelectedSport(null); setSelectedTeam(null); setMatchStatus(null); }}
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 20 }}>×</button>
                  </div>

                  {/* Lock banner when match is live or completed */}
                  {isBettingLocked && (
                    <div style={{
                      background: "#FCEBEB", border: "0.5px solid #F09595",
                      borderRadius: 12, padding: "16px 20px", marginBottom: 20,
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "#F7C1C1", display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0, fontSize: 18,
                      }}>🔒</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#A32D2D", marginBottom: 4, fontSize: 14 }}>
                          Bets are locked for this match
                        </div>
                        <div style={{ fontSize: 13, color: "#993C1D", lineHeight: 1.5 }}>
                          {matchStatus === "live"
                            ? "This match has already started. Betting is only allowed before the match begins."
                            : "This match has already ended."
                          } Go back and pick an upcoming match to place your bet.
                        </div>
                        <button
                          className="btn-primary"
                          style={{ marginTop: 12, padding: "8px 16px", fontSize: 13 }}
                          onClick={() => setScreen("matches")}
                        >
                          Browse Upcoming Matches →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Team picker + bet form — only shown if match is not locked */}
                  {!isBettingLocked && (
                    <>
                      <div className="section">
                        <div className="section-label">Pick Your Team</div>
                        <div className="team-grid">
                          {selectedSport?.teams.map(team => {
                            const teamOdds = prefilledMatch?.odds?.[team];
                            const isSelected = selectedTeam === team;
                            const isFav = teamOdds && prefilledMatch?.odds
                              ? teamOdds === Math.min(...Object.values(prefilledMatch.odds))
                              : false;
                            return (
                              <button
                                key={team}
                                className={`team-card ${isSelected ? "selected" : ""}`}
                                onClick={() => setSelectedTeam(team)}
                              >
                                <span>{team}</span>
                                {/* Live odds badge on each team button */}
                                {teamOdds && (
                                  <span style={{
                                    display: "block",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    marginTop: 5,
                                    color: isFav ? "#0F6E56" : "#A32D2D",
                                    background: isFav ? "#E1F5EE" : "#FCEBEB",
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    border: `1px solid ${isFav ? "#5DCAA5" : "#F09595"}`,
                                  }}>
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
                          {/* Payout preview — shows live odds calculation */}
                          {prefilledMatch?.odds?.[selectedTeam] && betAmount && parseInt(betAmount) > 0 && (
                            <div style={{
                              background: "#E1F5EE", border: "1px solid #5DCAA5",
                              borderRadius: 10, padding: "14px 18px", marginBottom: 16,
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                              <div>
                                <div style={{ fontSize: 11, color: "#085041", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                                  Potential Win
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 700, color: "#0F6E56", lineHeight: 1 }}>
                                  {Math.floor(parseInt(betAmount) * prefilledMatch.odds[selectedTeam])} pts
                                </div>
                                <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 4 }}>
                                  {parseInt(betAmount)} pts × {prefilledMatch.odds[selectedTeam]}x odds
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, color: "#888780", marginBottom: 2 }}>Profit if win</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#0F6E56" }}>
                                  +{Math.floor(parseInt(betAmount) * prefilledMatch.odds[selectedTeam]) - parseInt(betAmount)} pts
                                </div>
                                <div style={{ fontSize: 10, color: "#888780", marginTop: 4 }}>
                                  📊 Live odds
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="section-label">Bet Amount (Available: {points} pts)</div>
                          <div className="amount-row">
                            {[50, 100, 250, 500].map(amt => (
                              <button key={amt} className="amount-chip"
                                onClick={() => setBetAmount(String(Math.min(amt, points)))}>{amt}</button>
                            ))}
                            <button className="amount-chip all-in" onClick={() => setBetAmount(String(points))}>ALL IN 🔥</button>
                          </div>
                          <div className="input-row">
                            <input type="number" className="bet-input" placeholder="Enter amount..."
                              value={betAmount} onChange={e => setBetAmount(e.target.value)} max={points} />
                            <button className="btn-primary bet-btn" onClick={placeBet}
                              disabled={loading || !betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > points}>
                              {loading ? "Placing..." : "Lock Bet 🔒"}
                            </button>
                          </div>
                          {error && <div className="error-msg">{error}</div>}
                        </div>
                      )}
                    </>
                  )}

                  {/* Error shown even in locked state */}
                  {isBettingLocked && error && <div className="error-msg">{error}</div>}

                  {/* Bet placed confirmation */}
                  {betPlaced && (
                    <div className="bet-result win">
                      <div className="result-emoji">🔒</div>
                      <div className="result-text">BET LOCKED!</div>
                      <div style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>
                        {betPlaced.amount} pts on {betPlaced.team} · {betPlaced.matchLabel}
                      </div>
                      {betPlaced.potentialWin && (
                        <div style={{ fontSize: 16, marginTop: 8, fontWeight: 700, color: "#1D9E75" }}>
                          🏆 Potential win: {betPlaced.potentialWin} pts ({betPlaced.odds}x odds)
                        </div>
                      )}
                      <div style={{ fontSize: 13, marginTop: 6, opacity: 0.6 }}>
                        Points update automatically when match ends ⏳
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Leaderboard Screen ── */}
          {screen === "leaderboard" && (
            <div className="screen leaderboard-screen">
              <h2 className="screen-title">🏆 Leaderboard</h2>
              <button className="btn-primary" style={{ marginBottom: 20, padding: "0.5rem 1.5rem" }}
                onClick={fetchLeaderboard}>🔄 Refresh</button>
              {leaderboard.length === 0 ? (
                <div className="empty-state">Loading players...</div>
              ) : (
                <div className="leaderboard">
                  {leaderboardList().map((player, i) => (
                    <div key={player.name} className={`leaderboard-row ${player.name.includes("(You)") ? "you" : ""}`}>
                      <div className="rank">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-points">{player.points.toLocaleString()} pts</div>
                      <div className="points-bar">
                        <div className="points-fill" style={{ width: `${(player.points / maxPoints) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── History / My Bets Screen ── */}
          {screen === "history" && (
            <div className="screen history-screen">
              <h2 className="screen-title">📜 My Bets</h2>
              <button className="btn-primary" style={{ marginBottom: 20, padding: "0.5rem 1.5rem" }}
                onClick={fetchAllHistory}>🔄 Refresh</button>

              {allHistory.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  {[
                    { label: "All", filter: null, color: "#7F77DD" },
                    { label: "🎯 Solo", filter: "bet", color: "#BA7517" },
                    { label: "🏆 Contests", filter: "contest", color: "#1D9E75" },
                    { label: "⚔️ Challenges", filter: "challenge", color: "#E24B4A" },
                  ].map(tab => (
                    <span key={tab.label} style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 99,
                      background: `${tab.color}22`, color: tab.color,
                      border: `1px solid ${tab.color}44`, fontWeight: 600,
                    }}>
                      {tab.label} ({tab.filter ? allHistory.filter(h => h.type === tab.filter).length : allHistory.length})
                    </span>
                  ))}
                </div>
              )}

              {allHistory.length === 0 ? (
                <div className="empty-state">
                  No bets yet! Go to 🏏 IPL tab, ⚔️ Multiplayer, or join a contest 🎯
                </div>
              ) : (
                <div className="history-list">
                  {allHistory.map((item) => (
                    <div key={`${item.type}-${item._id}`}
                      className={`history-row ${item.status === "won" ? "win" : item.status === "lost" ? "lose" : ""}`}
                      style={{ borderLeft: `3px solid ${statusColor(item.status)}` }}>

                      <div className="history-sport">{statusEmoji(item.status)}</div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{item.matchLabel}</span>
                          <span style={{
                            fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 600,
                            background: item.type === "bet" ? "#BA751722" : item.type === "contest" ? "#1D9E7522" : "#7F77DD22",
                            color: item.type === "bet" ? "#BA7517" : item.type === "contest" ? "#1D9E75" : "#7F77DD",
                          }}>
                            {item.typeEmoji} {item.typeLabel}
                          </span>
                          {/* Show odds badge for solo bets */}
                          {item.type === "bet" && item.odds && item.odds !== 2.0 && (
                            <span style={{
                              fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 600,
                              background: "#E1F5EE", color: "#085041", border: "0.5px solid #5DCAA5",
                            }}>
                              {item.odds}x odds
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                          Picked: <strong>{item.team}</strong>
                          {item.type === "contest" && item.contestName && (
                            <span style={{ marginLeft: 6, opacity: 0.6 }}>· {item.contestName}</span>
                          )}
                          {item.type === "challenge" && item.opponent && (
                            <span style={{ marginLeft: 6, opacity: 0.6 }}>· vs {item.opponent}</span>
                          )}
                        </div>
                        {item.detail && (
                          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{item.detail}</div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          color: statusColor(item.status), fontWeight: 600, fontSize: 14, marginBottom: 4,
                        }}>
                          {pointsDisplay(item)}
                        </div>
                        <div className="history-badge"
                          style={{ background: `${statusColor(item.status)}22`, color: statusColor(item.status) }}>
                          {statusLabel(item.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Multiplayer Screen ── */}
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