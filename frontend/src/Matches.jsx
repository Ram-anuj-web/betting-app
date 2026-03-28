import React, { useState, useEffect } from "react";

const API = "https://betting-backend-xq1q.onrender.com";

const TEAM_COLORS = {
  RCB:  { bg: "#D85A30", light: "#FAECE7" },
  MI:   { bg: "#185FA5", light: "#E6F1FB" },
  CSK:  { bg: "#BA7517", light: "#FAEEDA" },
  KKR:  { bg: "#534AB7", light: "#EEEDFE" },
  SRH:  { bg: "#D85A30", light: "#FAECE7" },
  RR:   { bg: "#534AB7", light: "#EEEDFE" },
  PBKS: { bg: "#A32D2D", light: "#FCEBEB" },
  GT:   { bg: "#0F6E56", light: "#E1F5EE" },
  LSG:  { bg: "#185FA5", light: "#E6F1FB" },
  DC:   { bg: "#185FA5", light: "#E6F1FB" },
};

const TEAM_LOGOS = {
  RCB:  "https://scores.iplt20.com/ipl/teamlogos/RCB.png",
  MI:   "https://scores.iplt20.com/ipl/teamlogos/MI.png",
  CSK:  "https://scores.iplt20.com/ipl/teamlogos/CSK.png",
  KKR:  "https://scores.iplt20.com/ipl/teamlogos/KKR.png",
  SRH:  "https://scores.iplt20.com/ipl/teamlogos/SRH.png",
  RR:   "https://scores.iplt20.com/ipl/teamlogos/RR.png",
  PBKS: "https://scores.iplt20.com/ipl/teamlogos/PBKS.png",
  GT:   "https://scores.iplt20.com/ipl/teamlogos/GT.png",
  LSG:  "https://scores.iplt20.com/ipl/teamlogos/LSG.png",
  DC:   "https://scores.iplt20.com/ipl/teamlogos/DC.png",
};

export default function Matches({ onBetOnMatch }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");

  useEffect(() => { fetchMatches(); }, []);

  async function fetchMatches() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/ipl-matches`);
      if (!res.ok) throw new Error("Server returned " + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.matches || [];
      setMatches(list);
    } catch (err) {
      console.error("fetchMatches error:", err);
      setError("Can't connect to server.");
    }
    setLoading(false);
  }

  function formatDate(dateStr, timeStr) {
    if (!dateStr) return "TBA";
    const d = new Date(`${dateStr}T${timeStr || "19:30"}:00+05:30`);
    return d.toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short"
    }) + " · " + (timeStr || "19:30") + " IST";
  }

  const filtered = filter === "all" ? matches : matches.filter(m => m.status === filter);
  const liveCount = matches.filter(m => m.status === "live").length;

  const s = {
    wrap: { padding: "24px 0", maxWidth: 700, margin: "0 auto" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    title: { fontSize: 22, fontWeight: 500, color: "var(--color-text-primary, #fff)" },
    sub: { fontSize: 13, color: "#888780", marginBottom: 16 },
    filterRow: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
    filterBtn: (active) => ({
      padding: "5px 14px", borderRadius: 99, border: "0.5px solid",
      borderColor: active ? "#7F77DD" : "#d3d1c7",
      background: active ? "#EEEDFE" : "transparent",
      color: active ? "#3C3489" : "#888780",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 500 : 400,
    }),
    card: (status) => ({
      background: status === "live" ? "#E1F5EE" : "#fff",
      border: status === "live" ? "1px solid #1D9E75" : "0.5px solid #d3d1c7",
      borderRadius: 12, padding: "16px 20px", marginBottom: 10,
    }),
    topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    badge: (status) => {
      const map = {
        live:      { bg: "#E1F5EE", color: "#085041" },
        upcoming:  { bg: "#EEEDFE", color: "#3C3489" },
        completed: { bg: "#F1EFE8", color: "#5F5E5A" },
      };
      const st = map[status] || map.upcoming;
      return {
        fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
        background: st.bg, color: st.color, textTransform: "uppercase", letterSpacing: "0.06em",
      };
    },
    matchNum: { fontSize: 11, color: "#b4b2a9" },
    teamsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 },
    teamBox: (side) => ({
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: side === "left" ? "flex-start" : "flex-end",
    }),
    teamBadge: (team) => ({
      display: "inline-flex", alignItems: "center",
      padding: "6px 14px", borderRadius: 8,
      background: TEAM_COLORS[team]?.light || "#F1EFE8",
      color: TEAM_COLORS[team]?.bg || "#444441",
      fontWeight: 600, fontSize: 16,
    }),
    vs: { fontSize: 11, color: "#b4b2a9", fontWeight: 500, padding: "0 8px" },
    meta: { fontSize: 12, color: "#888780", marginBottom: 12 },
    betBtn: {
      width: "100%", padding: "10px", borderRadius: 8, border: "none",
      background: "#7F77DD", color: "#fff", cursor: "pointer",
      fontSize: 14, fontWeight: 500,
    },
    disabledBtn: {
      width: "100%", padding: "10px", borderRadius: 8,
      border: "0.5px solid #d3d1c7", background: "transparent",
      color: "#b4b2a9", fontSize: 13, cursor: "default",
    },
    liveDot: {
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: "#1D9E75", marginRight: 5,
    },
    empty: {
      textAlign: "center", padding: 48, color: "#888780", fontSize: 14,
      background: "#F1EFE8", borderRadius: 12,
    },
    refreshBtn: {
      padding: "6px 12px", borderRadius: 8,
      border: "0.5px solid #d3d1c7", background: "transparent",
      color: "#444441", cursor: "pointer", fontSize: 12,
    },
  };

  return (
    <div style={s.wrap}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      <div style={s.header}>
        <div style={s.title}>🏏 IPL 2026 Matches</div>
        <button onClick={fetchMatches} style={s.refreshBtn} disabled={loading}>
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>
      <div style={s.sub}>
        {matches.length} matches · {liveCount > 0 ? `${liveCount} live now` : "IPL 2026 season"}
      </div>

      {/* Filter tabs */}
      <div style={s.filterRow}>
        {["all", "upcoming", "live", "completed"].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === "live" && liveCount > 0 && (
              <span style={{ ...s.liveDot, animation: "blink 1s infinite" }} />
            )}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" && ` (${matches.length})`}
            {f !== "all" && ` (${matches.filter(m => m.status === f).length})`}
          </button>
        ))}
      </div>

      {loading && <div style={s.empty}>Loading matches...</div>}
      {error && !loading && (
        <div style={{ ...s.empty, background: "#FCEBEB", color: "#A32D2D" }}>
          {error}
          <br />
          <button onClick={fetchMatches} style={{ marginTop: 12, ...s.refreshBtn }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={s.empty}>No {filter} matches found.</div>
      )}

      {!loading && !error && filtered.map(match => (
        <div key={match.id} style={s.card(match.status)}>
          <div style={s.topRow}>
            <span style={s.badge(match.status)}>
              {match.status === "live" && (
                <span style={{ ...s.liveDot, animation: "blink 1s infinite" }} />
              )}
              {match.status}
            </span>
            <span style={s.matchNum}>Match {match.id}</span>
          </div>

          <div style={s.teamsRow}>
            <div style={s.teamBox("left")}>
              <span style={s.teamBadge(match.team1)}>
                <img
                  src={TEAM_LOGOS[match.team1]}
                  alt={match.team1}
                  style={{ width: 36, height: 36, objectFit: "contain", marginRight: 8 }}
                  onError={e => { e.target.style.display = "none"; }}
                />
                {match.team1}
              </span>
            </div>
            <span style={s.vs}>VS</span>
            <div style={s.teamBox("right")}>
              <span style={s.teamBadge(match.team2)}>
                {match.team2}
                <img
                  src={TEAM_LOGOS[match.team2]}
                  alt={match.team2}
                  style={{ width: 36, height: 36, objectFit: "contain", marginLeft: 8 }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              </span>
            </div>
          </div>

          <div style={s.meta}>
            📅 {formatDate(match.date, match.time)} &nbsp;·&nbsp; 📍 {match.venue}
          </div>

          {match.status === "completed" ? (
            <button style={s.disabledBtn} disabled>Match Completed</button>
          ) : (
            <button
              style={s.betBtn}
              onClick={() => onBetOnMatch({
                matchLabel: `${match.team1} vs ${match.team2}`,
                teams: [match.team1, match.team2],
                sport: "cricket",
                matchId: `ipl-${match.id}`,
              })}
            >
              ⚡ Bet on this match
            </button>
          )}
        </div>
      ))}
    </div>
  );
}