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

function getOddsLabel(odds, team1, team2) {
  if (!odds) return { [team1]: null, [team2]: null };
  const o1 = odds[team1], o2 = odds[team2];
  if (!o1 || !o2) return { [team1]: null, [team2]: null };
  return {
    [team1]: o1 < o2 ? "favourite" : "underdog",
    [team2]: o2 < o1 ? "favourite" : "underdog",
  };
}

function OddsChip({ team, odds, role }) {
  if (!odds) return null;
  const isFav = role === "favourite";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 6 }}>
      <span style={{
        fontSize: 15, fontWeight: 700, fontFamily: "monospace",
        color: isFav ? "#0F6E56" : "#A32D2D",
        background: isFav ? "#E1F5EE" : "#FCEBEB",
        border: `1px solid ${isFav ? "#5DCAA5" : "#F09595"}`,
        borderRadius: 6, padding: "2px 10px", letterSpacing: "0.04em",
      }}>{odds}x</span>
      <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: isFav ? "#0F6E56" : "#A32D2D" }}>
        {isFav ? "⭐ Fav" : "💎 Dog"}
      </span>
    </div>
  );
}

export default function Matches({ onBetOnMatch, onFantasy11 }) {
  const [matches, setMatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [filter, setFilter]           = useState("all");
  const [oddsMap, setOddsMap]         = useState({});
  const [oddsLoading, setOddsLoading] = useState(false);

  useEffect(() => { fetchMatches(); }, []);

  async function fetchMatches() {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/ipl-matches`);
      if (!res.ok) throw new Error("Server returned " + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.matches || [];
      setMatches(list);
      fetchBulkOdds();
    } catch (err) {
      console.error("fetchMatches error:", err);
      setError("Can't connect to server.");
    }
    setLoading(false);
  }

  async function fetchBulkOdds() {
    setOddsLoading(true);
    try {
      const res  = await fetch(`${API}/odds-bulk`);
      if (!res.ok) return;
      const data = await res.json();
      setOddsMap(data.odds || {});
    } catch (err) { console.error("Odds fetch error:", err); }
    setOddsLoading(false);
  }

  function formatDate(dateStr, timeStr) {
    if (!dateStr) return "TBA";
    const d = new Date(`${dateStr}T${timeStr || "19:30"}:00+05:30`);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + " · " + (timeStr || "19:30") + " IST";
  }

  const filtered  = filter === "all" ? matches : matches.filter(m => m.status === filter);
  const liveCount = matches.filter(m => m.status === "live").length;

  const s = {
    wrap:        { padding: "24px 0", maxWidth: 700, margin: "0 auto" },
    header:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    title:       { fontSize: 22, fontWeight: 500, color: "var(--color-text-primary, #fff)" },
    sub:         { fontSize: 13, color: "#888780", marginBottom: 16 },
    filterRow:   { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
    filterBtn:   (active) => ({
      padding: "5px 14px", borderRadius: 99, border: "0.5px solid",
      borderColor: active ? "#7F77DD" : "#d3d1c7",
      background: active ? "#EEEDFE" : "transparent",
      color: active ? "#3C3489" : "#888780",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 500 : 400,
    }),
    card:        (status) => ({
      background: status === "live" ? "#E1F5EE" : "#fff",
      border: status === "live" ? "1px solid #1D9E75" : "0.5px solid #d3d1c7",
      borderRadius: 12, padding: "16px 20px", marginBottom: 10,
    }),
    topRow:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    badge:       (status) => {
      const map = {
        live:      { bg: "#E1F5EE", color: "#085041" },
        upcoming:  { bg: "#EEEDFE", color: "#3C3489" },
        completed: { bg: "#F1EFE8", color: "#5F5E5A" },
      };
      const st = map[status] || map.upcoming;
      return { fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: st.bg, color: st.color, textTransform: "uppercase", letterSpacing: "0.06em" };
    },
    matchNum:    { fontSize: 11, color: "#b4b2a9" },
    teamsRow:    { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 },
    teamBox:     (side) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: side === "left" ? "flex-start" : "flex-end" }),
    teamBadge:   (team) => ({
      display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 8,
      background: TEAM_COLORS[team]?.light || "#F1EFE8", color: TEAM_COLORS[team]?.bg || "#444441",
      fontWeight: 600, fontSize: 16,
    }),
    vs:          { fontSize: 11, color: "#b4b2a9", fontWeight: 500, padding: "0 8px", paddingTop: 10 },
    meta:        { fontSize: 12, color: "#888780", marginBottom: 8 },
    oddsRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "#F8F7F3", border: "0.5px solid #e8e6dc" },
    payout:      { fontSize: 11, color: "#888780", textAlign: "center" },
    betBtn:      { flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7F77DD", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 },
    f11Btn:      { flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#ffd166", color: "#000", cursor: "pointer", fontSize: 14, fontWeight: 600 },
    f11ViewBtn:  { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ffd16688", background: "#ffd16615", color: "#8a6a00", cursor: "pointer", fontSize: 14, fontWeight: 600, marginTop: 8 },
    liveLockBtn: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #F09595", background: "#FCEBEB", color: "#A32D2D", fontSize: 13, fontWeight: 500, cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    liveDotBtn:  { width: 8, height: 8, borderRadius: "50%", background: "#E24B4A", display: "inline-block", animation: "blink 1s infinite" },
    disabledBtn: { width: "100%", padding: "10px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "transparent", color: "#b4b2a9", fontSize: 13, cursor: "default" },
    liveDot:     { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", marginRight: 5 },
    empty:       { textAlign: "center", padding: 48, color: "#888780", fontSize: 14, background: "#F1EFE8", borderRadius: 12 },
    refreshBtn:  { padding: "6px 12px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "transparent", color: "#444441", cursor: "pointer", fontSize: 12 },
    btnRow:      { display: "flex", gap: 8 },
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
        {oddsLoading && <span style={{ marginLeft: 8, color: "#7F77DD" }}>· fetching odds...</span>}
      </div>

      <div style={s.filterRow}>
        {["all", "upcoming", "live", "completed"].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === "live" && liveCount > 0 && <span style={{ ...s.liveDot, animation: "blink 1s infinite" }} />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" && ` (${matches.length})`}
            {f !== "all" && ` (${matches.filter(m => m.status === f).length})`}
          </button>
        ))}
      </div>

      {loading && <div style={s.empty}>Loading matches...</div>}
      {error && !loading && (
        <div style={{ ...s.empty, background: "#FCEBEB", color: "#A32D2D" }}>
          {error}<br />
          <button onClick={fetchMatches} style={{ marginTop: 12, ...s.refreshBtn }}>Try Again</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && <div style={s.empty}>No {filter} matches found.</div>}

      {!loading && !error && filtered.map(match => {
        // ✅ FIX: use "ipl-{id}" format to match what /odds-bulk returns
        const matchKey  = `ipl-${match.id}`;
        const odds      = oddsMap[matchKey] || null;
        const roles     = getOddsLabel(odds, match.team1, match.team2);

        let team1Pct = 50, team2Pct = 50;
        if (odds && odds[match.team1] && odds[match.team2]) {
          const p1 = 1 / odds[match.team1], p2 = 1 / odds[match.team2];
          const total = p1 + p2;
          team1Pct = Math.round((p1 / total) * 100);
          team2Pct = 100 - team1Pct;
        }

        const matchInfo = {
          matchLabel: `${match.team1} vs ${match.team2}`,
          teams:      [match.team1, match.team2],
          sport:      "cricket",
          matchId:    match.id,
          odds:       odds || null,
          status:     match.status,
        };

        return (
          <div key={match.id} style={s.card(match.status)}>
            <div style={s.topRow}>
              <span style={s.badge(match.status)}>
                {match.status === "live" && <span style={{ ...s.liveDot, animation: "blink 1s infinite" }} />}
                {match.status}
              </span>
              <span style={s.matchNum}>Match {match.id}</span>
            </div>

            <div style={s.teamsRow}>
              <div style={s.teamBox("left")}>
                <span style={s.teamBadge(match.team1)}>
                  <img src={TEAM_LOGOS[match.team1]} alt={match.team1}
                    style={{ width: 36, height: 36, objectFit: "contain", marginRight: 8 }}
                    onError={e => { e.target.style.display = "none"; }} />
                  {match.team1}
                </span>
                {odds && <OddsChip team={match.team1} odds={odds[match.team1]} role={roles[match.team1]} />}
              </div>

              <span style={s.vs}>VS</span>

              <div style={s.teamBox("right")}>
                <span style={s.teamBadge(match.team2)}>
                  {match.team2}
                  <img src={TEAM_LOGOS[match.team2]} alt={match.team2}
                    style={{ width: 36, height: 36, objectFit: "contain", marginLeft: 8 }}
                    onError={e => { e.target.style.display = "none"; }} />
                </span>
                {odds && <OddsChip team={match.team2} odds={odds[match.team2]} role={roles[match.team2]} />}
              </div>
            </div>

            {odds && match.status === "upcoming" && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888780", marginBottom: 3 }}>
                  <span>{match.team1} {team1Pct}%</span>
                  <span style={{ color: "#b4b2a9" }}>Win Probability</span>
                  <span>{team2Pct}% {match.team2}</span>
                </div>
                <div style={{ display: "flex", height: 5, borderRadius: 99, overflow: "hidden", background: "#e8e6dc" }}>
                  <div style={{ width: `${team1Pct}%`, background: TEAM_COLORS[match.team1]?.bg || "#7F77DD", transition: "width 0.5s" }} />
                  <div style={{ width: `${team2Pct}%`, background: TEAM_COLORS[match.team2]?.bg || "#d3d1c7" }} />
                </div>
              </div>
            )}

            {odds && match.status === "upcoming" && (
              <div style={s.oddsRow}>
                <div style={s.payout}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#444441" }}>Bet 100 → Win</div>
                  <div style={{ fontSize: 13, color: "#0F6E56", fontWeight: 700 }}>{Math.floor(100 * odds[match.team1])} pts</div>
                  <div style={{ fontSize: 10, color: "#888780" }}>on {match.team1}</div>
                </div>
                <div style={{ width: 1, background: "#e8e6dc", alignSelf: "stretch" }} />
                <div style={{ fontSize: 11, color: "#888780", textAlign: "center", padding: "0 8px" }}>📊 Live odds<br />from bookmakers</div>
                <div style={{ width: 1, background: "#e8e6dc", alignSelf: "stretch" }} />
                <div style={s.payout}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#444441" }}>Bet 100 → Win</div>
                  <div style={{ fontSize: 13, color: "#0F6E56", fontWeight: 700 }}>{Math.floor(100 * odds[match.team2])} pts</div>
                  <div style={{ fontSize: 10, color: "#888780" }}>on {match.team2}</div>
                </div>
              </div>
            )}

            <div style={s.meta}>
              📅 {formatDate(match.date, match.time)} &nbsp;·&nbsp; 📍 {match.venue}
            </div>

            {/* ── UPCOMING: Bet + Fantasy 11 buttons side by side ── */}
            {match.status === "upcoming" && (
              <div style={s.btnRow}>
                <button style={s.betBtn} onClick={() => onBetOnMatch(matchInfo)}>
                  ⚡ Bet on this match
                </button>
                <button style={s.f11Btn} onClick={() => onFantasy11(matchInfo)}>
                  🏏 Fantasy 11
                </button>
              </div>
            )}

            {/* ── LIVE: Locked betting + View Fantasy 11 ── */}
            {match.status === "live" && (
              <>
                <div style={s.liveLockBtn}>
                  <span style={s.liveDotBtn} />
                  Match is Live — Betting Closed
                </div>
                <button style={s.f11ViewBtn} onClick={() => onFantasy11(matchInfo)}>
                  🏏 View My Fantasy 11 (Read-Only)
                </button>
              </>
            )}

            {/* ── COMPLETED: Disabled bet + View Fantasy 11 ── */}
            {match.status === "completed" && (
              <>
                <button style={s.disabledBtn} disabled>Match Completed</button>
                <button style={s.f11ViewBtn} onClick={() => onFantasy11(matchInfo)}>
                  🏏 View My Fantasy 11
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}