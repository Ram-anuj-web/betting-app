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
  const [leaderboard, setLeaderboard] = useState([]); // ← real leaderboard
  const [animatePoints, setAnimatePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prefilledMatch, setPrefilledMatch] = useState(null);

  useEffect(() => {
    if (username) fetchMyBets();
  }, [username]);

  const fetchMyBets = async () => {
    try {
      const res = await fetch(`${API}/bets/${username}`);
      const data = await res.json();
      if (res.ok) setMyBets(data);
    } catch (err) {
      console.error("Failed to fetch bets", err);
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
        fetchLeaderboard(); // ← fetch real leaderboard on login
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch (err) {
      setError("Can't connect to server. Make sure backend is running!");
    }
    setLoading(false);
  };

  const handleBetOnMatch = (matchInfo) => {
    const iplSport = {
      id: "cricket",
      name: "Cricket",
      emoji: "🏏",
      teams: matchInfo.teams,
    };
    setSelectedSport(iplSport);
    setSelectedTeam(null);
    setBetAmount("");
    setPrefilledMatch(matchInfo);
    setError("");
    setScreen("bet");
  };

  const placeBet = async () => {
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
      const res = await fetch(`${API}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          amount,
          matchId: String(prefilledMatch.matchId),
          matchLabel: prefilledMatch.matchLabel,
          team: selectedTeam,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setAnimatePoints(true);
        setTimeout(() => setAnimatePoints(false), 1000);
        setPoints(data.points);
        setLockedPoints(data.lockedPoints);
        setBetPlaced({ amount, team: selectedTeam, matchLabel: prefilledMatch.matchLabel });
        fetchMyBets();
        fetchLeaderboard(); // ← refresh leaderboard after bet
        setTimeout(() => {
          setBetPlaced(null);
          setSelectedTeam(null);
          setBetAmount("");
          setPrefilledMatch(null);
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
    setLeaderboard([]);
    setScreen("auth");
    setAuthMode("login");
    setPrefilledMatch(null);
  };

  const statusColor = (status) => {
    if (status === "won") return "#1D9E75";
    if (status === "lost") return "#E24B4A";
    return "#BA7517";
  };

  const statusEmoji = (status) => {
    if (status === "won") return "🏆";
    if (status === "lost") return "😢";
    return "⏳";
  };

  // Build leaderboard list — merge real users, highlight current user
  const leaderboardList = () => {
    const others = leaderboard.filter(p => p.name !== username);
    const me = { name: username + " (You)", points };
    return [...others, me].sort((a, b) => b.points - a.points);
  };

  const maxPoints = Math.max(...leaderboardList().map(p => p.points), 1000);

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Auth Screen */}
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

      {/* Main App */}
      {screen !== "auth" && (
        <>
          <nav className="nav">
            <div className="nav-logo">⚡ FANTASYBET</div>
            <div className="nav-links">
              <button className={screen === "home" ? "active" : ""} onClick={() => setScreen("home")}>Home</button>
              <button className={screen === "matches" ? "active" : ""} onClick={() => setScreen("matches")}>🏏 IPL</button>
              <button className={screen === "leaderboard" ? "active" : ""} onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }}>Leaderboard</button>
              <button className={screen === "history" ? "active" : ""} onClick={() => { fetchMyBets(); setScreen("history"); }}>
                History {myBets.filter(b => b.status === "pending").length > 0 && (
                  <span style={{ background: "#BA7517", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>
                    {myBets.filter(b => b.status === "pending").length}
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

          {/* Home Screen */}
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
                  <button className="btn-primary" onClick={() => { fetchMyBets(); setScreen("history"); }} style={{ background: "#1D9E75" }}>My Bets →</button>
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
                  <div className="stat-num">{myBets.length}</div>
                  <div className="stat-label">Total Bets</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{myBets.filter(b => b.status === "won").length}</div>
                  <div className="stat-label">Wins</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{myBets.filter(b => b.status === "pending").length}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* IPL Matches Screen */}
          {screen === "matches" && (
            <div className="screen">
              <Matches onBetOnMatch={handleBetOnMatch} />
            </div>
          )}

          {/* Bet Screen */}
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
                  <div style={{
                    background: "rgba(29,158,117,0.1)", border: "1px solid #1D9E75",
                    borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Selected Match</div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>🏏 {prefilledMatch.matchLabel}</div>
                    </div>
                    <button onClick={() => { setPrefilledMatch(null); setSelectedSport(null); setSelectedTeam(null); }}
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 20 }}>×</button>
                  </div>

                  <div className="section">
                    <div className="section-label">Pick Your Team</div>
                    <div className="team-grid">
                      {selectedSport?.teams.map(team => (
                        <button key={team} className={`team-card ${selectedTeam === team ? "selected" : ""}`}
                          onClick={() => setSelectedTeam(team)}>{team}</button>
                      ))}
                    </div>
                  </div>

                  {selectedTeam && (
                    <div className="section">
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

                  {betPlaced && (
                    <div className="bet-result win">
                      <div className="result-emoji">🔒</div>
                      <div className="result-text">BET LOCKED!</div>
                      <div style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>
                        {betPlaced.amount} pts on {betPlaced.team} · {betPlaced.matchLabel}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4, opacity: 0.6 }}>
                        Points update automatically when match ends ⏳
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Leaderboard Screen — real data from MongoDB */}
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
                        <div className="points-fill"
                          style={{ width: `${(player.points / maxPoints) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History / My Bets Screen */}
          {screen === "history" && (
            <div className="screen history-screen">
              <h2 className="screen-title">📜 My Bets</h2>
              <button className="btn-primary" style={{ marginBottom: 20, padding: "0.5rem 1.5rem" }}
                onClick={fetchMyBets}>🔄 Refresh</button>

              {myBets.length === 0 ? (
                <div className="empty-state">
                  No bets yet! Go to 🏏 IPL tab and place a bet 🎯
                </div>
              ) : (
                <div className="history-list">
                  {myBets.map((b, i) => (
                    <div key={i}
                      className={`history-row ${b.status === "won" ? "win" : b.status === "lost" ? "lose" : ""}`}
                      style={{ borderLeft: `3px solid ${statusColor(b.status)}` }}>
                      <div className="history-sport">{statusEmoji(b.status)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{b.matchLabel}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Picked: {b.team}</div>
                      </div>
                      <div style={{ color: statusColor(b.status), fontWeight: 600, fontSize: 14 }}>
                        {b.status === "won" ? `+${b.amount * 2}` : b.status === "lost" ? `-${b.amount}` : `🔒 ${b.amount}`} pts
                      </div>
                      <div className="history-badge"
                        style={{ background: `${statusColor(b.status)}22`, color: statusColor(b.status) }}>
                        {b.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multiplayer Screen */}
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