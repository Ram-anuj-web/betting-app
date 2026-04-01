import React, { useState } from "react";

const API = "https://betting-backend-xq1q.onrender.com";
const TOTAL = 25;

function calcMult(gems, mines) {
  if (gems === 0) return 1.0;
  let m = 1.0;
  for (let i = 0; i < gems; i++) m *= (TOTAL - i) / (TOTAL - mines - i);
  return Math.max(1.0, m * 0.96);
}

export default function Mines({ username, points, setPoints }) {
  const [bet, setBet]             = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [board, setBoard]         = useState([]);
  const [revealed, setRevealed]   = useState(Array(TOTAL).fill(false));
  const [gemsFound, setGemsFound] = useState(0);
  const [running, setRunning]     = useState(false);
  const [msg, setMsg]             = useState("");
  const [msgType, setMsgType]     = useState("");
  const [loading, setLoading]     = useState(false);

  const updateStats = (gems) => {
    const m = calcMult(gems, mineCount);
    return { mult: m.toFixed(2), profit: Math.round(bet * m - bet) };
  };

  const { mult, profit } = updateStats(gemsFound);

  const startGame = async () => {
    if (bet > points || bet <= 0) { setMsg("Invalid bet amount!"); setMsgType("lose"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/mines/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bet }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message); setMsgType("lose"); setLoading(false); return; }
      setPoints(data.points);

      const newBoard = Array(TOTAL).fill("gem");
      const mines = [];
      while (mines.length < mineCount) {
        const r = Math.floor(Math.random() * TOTAL);
        if (!mines.includes(r)) mines.push(r);
      }
      mines.forEach(i => (newBoard[i] = "mine"));

      setBoard(newBoard);
      setRevealed(Array(TOTAL).fill(false));
      setGemsFound(0);
      setRunning(true);
      setMsg("Find gems — avoid mines!");
      setMsgType("");
    } catch { setMsg("Server error!"); setMsgType("lose"); }
    setLoading(false);
  };

  const revealCell = async (i) => {
    if (!running || revealed[i]) return;
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);

    if (board[i] === "mine") {
      setRunning(false);
      setMsg(`💥 Boom! Lost ${bet} pts.`);
      setMsgType("lose");
      // reveal all
      setRevealed(Array(TOTAL).fill(true));
    } else {
      const newGems = gemsFound + 1;
      setGemsFound(newGems);
      const safeLeft = TOTAL - mineCount - newGems;
      if (safeLeft === 0) { await cashout(newGems); return; }
      setMsg(`${newGems} gem${newGems > 1 ? "s" : ""} found! Cash out or keep going.`);
    }
  };

  const cashout = async (gems = gemsFound) => {
    if (!running || gems === 0) return;
    setRunning(false);
    const m    = calcMult(gems, mineCount);
    const won  = Math.round(bet * m);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/mines/cashout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, winnings: won }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.points);
        setMsg(`✅ Cashed out! +${won} pts (${m.toFixed(2)}x)`);
        setMsgType("win");
        setRevealed(Array(TOTAL).fill(true));
      }
    } catch { setMsg("Cashout error!"); setMsgType("lose"); }
    setLoading(false);
  };

  const cellStyle = (i) => {
    const isRevealed = revealed[i];
    const type = board[i];
    const base = {
      aspectRatio: "1", borderRadius: 10, border: "1px solid",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, cursor: running && !isRevealed ? "pointer" : "default",
      transition: "all 0.12s", userSelect: "none",
    };
    if (!isRevealed) return { ...base, background: "#161b22", borderColor: "#30363d" };
    if (type === "gem") return { ...base, background: "#0d2818", borderColor: "#1D9E75" };
    return { ...base, background: "#2a0a0a", borderColor: "#E24B4A" };
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 0" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#e6edf3" }}>💣 Mines</h2>
      <p style={{ fontSize: 13, color: "#7d8590", marginBottom: 20 }}>Reveal gems to increase your multiplier. Hit a mine and lose your bet.</p>

      {/* Balance */}
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#7d8590" }}>Your balance</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#ffd166" }}>{points.toLocaleString()} pts</span>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "10px 14px" }}>
          <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Bet amount</label>
          <input type="range" min="10" max={Math.min(500, points)} step="10" value={bet}
            onChange={e => setBet(+e.target.value)} disabled={running}
            style={{ width: "100%", marginBottom: 4 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{bet} pts</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {[50, 100, 250, 500].map(v => (
              <button key={v} onClick={() => setBet(Math.min(v, points))} disabled={running}
                style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid #30363d", background: bet === v ? "#30363d" : "transparent", color: "#7d8590", cursor: "pointer" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "10px 14px" }}>
          <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Mines count</label>
          <select value={mineCount} onChange={e => setMineCount(+e.target.value)} disabled={running}
            style={{ width: "100%", background: "#0d1117", color: "#e6edf3", border: "1px solid #30363d", borderRadius: 6, padding: "6px 8px", fontSize: 13 }}>
            <option value={3}>3 — safe</option>
            <option value={5}>5 — balanced</option>
            <option value={8}>8 — risky</option>
            <option value={12}>12 — insane</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Multiplier", value: `${mult}x`, color: "#ffd166" },
          { label: "Cash out at", value: `+${profit} pts`, color: "#1D9E75" },
          { label: "Gems found", value: gemsFound, color: "#e6edf3" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div style={{ textAlign: "center", fontSize: 13, marginBottom: 10, fontWeight: msgType ? 600 : 400, color: msgType === "win" ? "#1D9E75" : msgType === "lose" ? "#E24B4A" : "#7d8590" }}>
          {msg}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 14 }}>
        {Array(TOTAL).fill(null).map((_, i) => (
          <div key={i} style={cellStyle(i)} onClick={() => revealCell(i)}
            onMouseEnter={e => { if (running && !revealed[i]) e.currentTarget.style.borderColor = "#7d8590"; }}
            onMouseLeave={e => { if (running && !revealed[i]) e.currentTarget.style.borderColor = "#30363d"; }}>
            {revealed[i] ? (board[i] === "gem" ? "💎" : "💣") : ""}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={startGame} disabled={running || loading}
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: running ? "#30363d" : "#1D9E75", color: "#fff", fontWeight: 700, fontSize: 14, cursor: running ? "default" : "pointer" }}>
          {loading ? "..." : "Start Game"}
        </button>
        <button onClick={() => cashout()} disabled={!running || gemsFound === 0 || loading}
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: running && gemsFound > 0 ? "#EF9F27" : "#30363d", color: "#fff", fontWeight: 700, fontSize: 14, cursor: running && gemsFound > 0 ? "pointer" : "default" }}>
          {loading ? "..." : `Cash Out (+${profit} pts)`}
        </button>
      </div>
    </div>
  );
}