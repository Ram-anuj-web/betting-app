import React, { useState } from "react";

const PL_MATCHES = [
  { id: "pl-35-1",  team1: "Leeds",          team2: "Burnley",         date: "2026-05-01", time: "20:00", venue: "Elland Road",                  matchweek: 35, competition: "Premier League" },
  { id: "pl-35-2",  team1: "Brentford",       team2: "West Ham",        date: "2026-05-02", time: "15:00", venue: "Gtech Community Stadium",       matchweek: 35, competition: "Premier League" },
  { id: "pl-35-3",  team1: "Newcastle",       team2: "Brighton",        date: "2026-05-02", time: "15:00", venue: "St. James' Park",               matchweek: 35, competition: "Premier League" },
  { id: "pl-35-4",  team1: "Wolves",          team2: "Sunderland",      date: "2026-05-02", time: "15:00", venue: "Molineux Stadium",              matchweek: 35, competition: "Premier League" },
  { id: "pl-35-5",  team1: "Arsenal",         team2: "Fulham",          date: "2026-05-02", time: "17:30", venue: "Emirates Stadium",              matchweek: 35, competition: "Premier League" },
  { id: "pl-35-6",  team1: "Bournemouth",     team2: "Crystal Palace",  date: "2026-05-03", time: "14:00", venue: "Vitality Stadium",              matchweek: 35, competition: "Premier League" },
  { id: "pl-35-7",  team1: "Man United",      team2: "Liverpool",       date: "2026-05-03", time: "16:30", venue: "Old Trafford",                  matchweek: 35, competition: "Premier League" },
  { id: "pl-35-8",  team1: "Aston Villa",     team2: "Tottenham",       date: "2026-05-03", time: "19:00", venue: "Villa Park",                   matchweek: 35, competition: "Premier League" },
  { id: "pl-35-9",  team1: "Chelsea",         team2: "Nott'm Forest",   date: "2026-05-04", time: "15:00", venue: "Stamford Bridge",               matchweek: 35, competition: "Premier League" },
  { id: "pl-35-10", team1: "Everton",         team2: "Man City",        date: "2026-05-04", time: "20:00", venue: "Goodison Park",                 matchweek: 35, competition: "Premier League" },
  { id: "pl-36-1",  team1: "Brighton",        team2: "Wolves",          date: "2026-05-09", time: "12:30", venue: "Amex Stadium",                  matchweek: 36, competition: "Premier League" },
  { id: "pl-36-2",  team1: "Burnley",         team2: "Aston Villa",     date: "2026-05-09", time: "15:00", venue: "Turf Moor",                     matchweek: 36, competition: "Premier League" },
  { id: "pl-36-3",  team1: "Crystal Palace",  team2: "Everton",         date: "2026-05-09", time: "15:00", venue: "Selhurst Park",                 matchweek: 36, competition: "Premier League" },
  { id: "pl-36-4",  team1: "Fulham",          team2: "Bournemouth",     date: "2026-05-09", time: "15:00", venue: "Craven Cottage",                matchweek: 36, competition: "Premier League" },
  { id: "pl-36-5",  team1: "Liverpool",       team2: "Chelsea",         date: "2026-05-09", time: "17:30", venue: "Anfield",                       matchweek: 36, competition: "Premier League" },
  { id: "pl-36-6",  team1: "Man City",        team2: "Brentford",       date: "2026-05-09", time: "17:30", venue: "Etihad Stadium",                matchweek: 36, competition: "Premier League" },
  { id: "pl-36-7",  team1: "Nott'm Forest",   team2: "Newcastle",       date: "2026-05-10", time: "14:00", venue: "City Ground",                   matchweek: 36, competition: "Premier League" },
  { id: "pl-36-8",  team1: "Sunderland",      team2: "Man United",      date: "2026-05-10", time: "14:00", venue: "Stadium of Light",              matchweek: 36, competition: "Premier League" },
  { id: "pl-36-9",  team1: "Tottenham",       team2: "Leeds",           date: "2026-05-10", time: "14:00", venue: "Tottenham Hotspur Stadium",     matchweek: 36, competition: "Premier League" },
  { id: "pl-36-10", team1: "West Ham",        team2: "Arsenal",         date: "2026-05-10", time: "16:30", venue: "London Stadium",                matchweek: 36, competition: "Premier League" },
  { id: "pl-37-1",  team1: "Bournemouth",     team2: "Man City",        date: "2026-05-17", time: "14:00", venue: "Vitality Stadium",              matchweek: 37, competition: "Premier League" },
  { id: "pl-37-2",  team1: "Arsenal",         team2: "Burnley",         date: "2026-05-17", time: "14:00", venue: "Emirates Stadium",              matchweek: 37, competition: "Premier League" },
  { id: "pl-37-3",  team1: "Aston Villa",     team2: "Liverpool",       date: "2026-05-17", time: "14:00", venue: "Villa Park",                   matchweek: 37, competition: "Premier League" },
  { id: "pl-37-4",  team1: "Brentford",       team2: "Crystal Palace",  date: "2026-05-17", time: "14:00", venue: "Gtech Community Stadium",       matchweek: 37, competition: "Premier League" },
  { id: "pl-37-5",  team1: "Chelsea",         team2: "Tottenham",       date: "2026-05-17", time: "14:00", venue: "Stamford Bridge",               matchweek: 37, competition: "Premier League" },
  { id: "pl-37-6",  team1: "Everton",         team2: "Sunderland",      date: "2026-05-17", time: "14:00", venue: "Goodison Park",                 matchweek: 37, competition: "Premier League" },
  { id: "pl-37-7",  team1: "Leeds",           team2: "Brighton",        date: "2026-05-17", time: "14:00", venue: "Elland Road",                  matchweek: 37, competition: "Premier League" },
  { id: "pl-37-8",  team1: "Man United",      team2: "Nott'm Forest",   date: "2026-05-17", time: "14:00", venue: "Old Trafford",                  matchweek: 37, competition: "Premier League" },
  { id: "pl-37-9",  team1: "Newcastle",       team2: "West Ham",        date: "2026-05-17", time: "14:00", venue: "St. James' Park",               matchweek: 37, competition: "Premier League" },
  { id: "pl-37-10", team1: "Wolves",          team2: "Fulham",          date: "2026-05-17", time: "14:00", venue: "Molineux Stadium",              matchweek: 37, competition: "Premier League" },
  { id: "pl-38-1",  team1: "Brighton",        team2: "Man United",      date: "2026-05-24", time: "16:00", venue: "Amex Stadium",                  matchweek: 38, competition: "Premier League" },
  { id: "pl-38-2",  team1: "Burnley",         team2: "Wolves",          date: "2026-05-24", time: "16:00", venue: "Turf Moor",                     matchweek: 38, competition: "Premier League" },
  { id: "pl-38-3",  team1: "Crystal Palace",  team2: "Arsenal",         date: "2026-05-24", time: "16:00", venue: "Selhurst Park",                 matchweek: 38, competition: "Premier League" },
  { id: "pl-38-4",  team1: "Fulham",          team2: "Newcastle",       date: "2026-05-24", time: "16:00", venue: "Craven Cottage",                matchweek: 38, competition: "Premier League" },
  { id: "pl-38-5",  team1: "Liverpool",       team2: "Brentford",       date: "2026-05-24", time: "16:00", venue: "Anfield",                       matchweek: 38, competition: "Premier League" },
  { id: "pl-38-6",  team1: "Man City",        team2: "Aston Villa",     date: "2026-05-24", time: "16:00", venue: "Etihad Stadium",                matchweek: 38, competition: "Premier League" },
  { id: "pl-38-7",  team1: "Nott'm Forest",   team2: "Bournemouth",     date: "2026-05-24", time: "16:00", venue: "City Ground",                   matchweek: 38, competition: "Premier League" },
  { id: "pl-38-8",  team1: "Sunderland",      team2: "Chelsea",         date: "2026-05-24", time: "16:00", venue: "Stadium of Light",              matchweek: 38, competition: "Premier League" },
  { id: "pl-38-9",  team1: "Tottenham",       team2: "Everton",         date: "2026-05-24", time: "16:00", venue: "Tottenham Hotspur Stadium",     matchweek: 38, competition: "Premier League" },
  { id: "pl-38-10", team1: "West Ham",        team2: "Leeds",           date: "2026-05-24", time: "16:00", venue: "London Stadium",                matchweek: 38, competition: "Premier League" },
];

const CLUB_COLORS = {
  "Arsenal":        { primary: "#EF0107", secondary: "#063672" },
  "Aston Villa":    { primary: "#670E36", secondary: "#95BFE5" },
  "Bournemouth":    { primary: "#DA291C", secondary: "#000000" },
  "Brentford":      { primary: "#E30613", secondary: "#FBB800" },
  "Brighton":       { primary: "#0057B8", secondary: "#FFCD00" },
  "Burnley":        { primary: "#6C1D45", secondary: "#99D6EA" },
  "Chelsea":        { primary: "#034694", secondary: "#DBA111" },
  "Crystal Palace": { primary: "#1B458F", secondary: "#C4122E" },
  "Everton":        { primary: "#003399", secondary: "#FFFFFF" },
  "Fulham":         { primary: "#CC0000", secondary: "#000000" },
  "Leeds":          { primary: "#1D428A", secondary: "#FFCD00" },
  "Liverpool":      { primary: "#C8102E", secondary: "#00B2A9" },
  "Man City":       { primary: "#6CABDD", secondary: "#1C2C5B" },
  "Man United":     { primary: "#DA291C", secondary: "#FBE122" },
  "Newcastle":      { primary: "#241F20", secondary: "#FFFFFF" },
  "Nott'm Forest":  { primary: "#DD0000", secondary: "#FFFFFF" },
  "Sunderland":     { primary: "#EB172B", secondary: "#1B1E26" },
  "Tottenham":      { primary: "#132257", secondary: "#FFFFFF" },
  "West Ham":       { primary: "#7A263A", secondary: "#1BB1E7" },
  "Wolves":         { primary: "#FDB913", secondary: "#231F20" },
};

const FALLBACK_ODDS = {
  "Arsenal":     { home: 1.75, away: 2.10 },
  "Liverpool":   { home: 1.70, away: 2.20 },
  "Man City":    { home: 1.65, away: 2.30 },
  "Chelsea":     { home: 1.90, away: 2.00 },
  "Man United":  { home: 2.00, away: 1.90 },
  "Tottenham":   { home: 2.10, away: 1.85 },
  "Newcastle":   { home: 2.00, away: 1.95 },
  "Aston Villa": { home: 1.95, away: 1.95 },
  "Brighton":    { home: 2.10, away: 1.85 },
  "default":     { home: 1.90, away: 2.00 },
};

function getOdds(team1, team2) {
  const t1 = FALLBACK_ODDS[team1] || FALLBACK_ODDS["default"];
  const t2 = FALLBACK_ODDS[team2] || FALLBACK_ODDS["default"];
  return {
    [team1]: parseFloat(((t1.home + t2.away) / 2).toFixed(2)),
    [team2]: parseFloat(((t2.home + t1.away) / 2).toFixed(2)),
  };
}

// PL matches in May are BST = UTC+1
function getMatchStatus(match) {
  const now       = new Date();
  const matchTime = new Date(`${match.date}T${match.time}:00+01:00`);
  const endTime   = new Date(matchTime.getTime() + 2 * 60 * 60 * 1000);
  if (now >= matchTime && now <= endTime) return "live";
  if (now > endTime) return "completed";
  return "upcoming";
}

function TeamBadge({ name, size = 44 }) {
  const colors   = CLUB_COLORS[name] || { primary: "#334155", secondary: "#94a3b8" };
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 3);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 800, color: "#fff", flexShrink: 0,
      border: "2px solid rgba(255,255,255,0.12)",
      textShadow: "0 1px 2px rgba(0,0,0,0.5)", letterSpacing: "-0.5px",
    }}>
      {initials}
    </div>
  );
}

function MatchCard({ match, onBetOnMatch }) {
  const status  = getMatchStatus(match);
  const odds    = getOdds(match.team1, match.team2);
  const t1Color = CLUB_COLORS[match.team1]?.primary || "#334155";
  const t2Color = CLUB_COLORS[match.team2]?.primary || "#334155";

  const matchTime = new Date(`${match.date}T${match.time}:00+01:00`);
  const dateStr   = matchTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr   = matchTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleBet = () => onBetOnMatch({
    matchId:    match.id,
    matchLabel: `${match.team1} vs ${match.team2}`,   // short — avoids overflow in bet screen
    teams:      [match.team1, match.team2],
    odds:       odds,
    status:     "upcoming",
    sport:      "football",
  });

  return (
    <div style={{
      background: "linear-gradient(145deg, #0f1923 0%, #111827 100%)",
      border: `1px solid ${status === "live" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 16, overflow: "hidden", marginBottom: 12,
      boxShadow: status === "live" ? "0 0 20px rgba(239,68,68,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = status === "live" ? "0 0 20px rgba(239,68,68,0.15)" : "0 2px 8px rgba(0,0,0,0.3)"; }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${t1Color}, ${t2Color})` }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
            ⚽ {match.competition} · MW{match.matchweek}
          </span>
          {status === "live" && (
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 700, color: "#ef4444",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 99, padding: "2px 8px",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "plPulse 1.5s infinite" }} />
              LIVE
            </span>
          )}
          {status === "completed" && (
            <span style={{ fontSize: 10, color: "#64748b", background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: 99, padding: "2px 8px" }}>FT</span>
          )}
          {status === "upcoming" && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{dateStr} · {timeStr}</span>
          )}
        </div>

        {/* Teams */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
            <TeamBadge name={match.team1} size={44} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", textAlign: "center", lineHeight: 1.2 }}>{match.team1}</span>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 800, color: "#fbbf24" }}>
              {odds[match.team1]}x
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#475569" }}>VS</div>
            <span style={{ fontSize: 10, color: "#334155" }}>🏟️</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
            <TeamBadge name={match.team2} size={44} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", textAlign: "center", lineHeight: 1.2 }}>{match.team2}</span>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 800, color: "#fbbf24" }}>
              {odds[match.team2]}x
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#334155" }}>📍 {match.venue}</div>

        {/* Action */}
        {status === "upcoming" && (
          <button onClick={handleBet} style={{
            width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >⚽ Bet Now</button>
        )}
        {status === "live" && (
          <div style={{ marginTop: 12, padding: "8px 0", textAlign: "center", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
            🔒 Betting Closed — Match in Progress
          </div>
        )}
        {status === "completed" && (
          <div style={{ marginTop: 12, padding: "8px 0", textAlign: "center", background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: 10, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            ✅ Match Completed
          </div>
        )}
      </div>
    </div>
  );
}

export default function FootballMatches({ onBetOnMatch, username }) {
  const [selectedMW, setSelectedMW] = useState(35);
  const [filter, setFilter]         = useState("all");

  const matchweeks    = [...new Set(PL_MATCHES.map(m => m.matchweek))];
  const upcomingCount = PL_MATCHES.filter(m => getMatchStatus(m) === "upcoming").length;

  const filtered = PL_MATCHES.filter(m => {
    if (m.matchweek !== selectedMW) return false;
    const s = getMatchStatus(m);
    if (filter === "upcoming")  return s === "upcoming";
    if (filter === "completed") return s === "completed";
    return true;
  });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 100px" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f1923 0%, #1e3a5f 50%, #0f1923 100%)",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 20, padding: "24px 22px", marginBottom: 24,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,.5) 30px,rgba(255,255,255,.5) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,.5) 30px,rgba(255,255,255,.5) 31px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>⚽</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Premier League</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>2025/26 Season · Final Matchweeks</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { value: upcomingCount, label: "Upcoming",        color: "#3b82f6" },
            { value: "4",           label: "Matchweeks Left", color: "#fbbf24" },
            { value: "May 24",      label: "Season Finale",   color: "#22c55e" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: `${stat.color}18`, border: `1px solid ${stat.color}33`, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Matchweek selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {matchweeks.map(mw => (
          <button key={mw} onClick={() => setSelectedMW(mw)} style={{
            flexShrink: 0, padding: "7px 16px", borderRadius: 10,
            border: `1px solid ${selectedMW === mw ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
            background: selectedMW === mw ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
            color: selectedMW === mw ? "#3b82f6" : "#64748b",
            fontWeight: selectedMW === mw ? 700 : 400,
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
          }}>MW{mw}{mw === 38 ? " 🏆" : ""}</button>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["all", "All Matches"], ["upcoming", "Upcoming"], ["completed", "Completed"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex: 1, padding: "7px 0", borderRadius: 8,
            border: `1px solid ${filter === key ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
            background: filter === key ? "rgba(59,130,246,0.12)" : "transparent",
            color: filter === key ? "#3b82f6" : "#64748b",
            fontWeight: filter === key ? 700 : 400,
            fontSize: 12, cursor: "pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* Match cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>No matches found</div>
        </div>
      ) : (
        filtered.map(match => <MatchCard key={match.id} match={match} onBetOnMatch={onBetOnMatch} />)
      )}

      {/* Settle tip */}
      <div style={{ marginTop: 16, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
        💡 <strong style={{ color: "#3b82f6" }}>Admin:</strong> settle with{" "}
        <code style={{ background: "#111", padding: "1px 5px", borderRadius: 4, color: "#60a5fa", fontSize: 11 }}>{"winner: \"TeamName\""}</code>{" "}
        or <code style={{ background: "#111", padding: "1px 5px", borderRadius: 4, color: "#60a5fa", fontSize: 11 }}>{"winner: \"no_result\""}</code> for draws.
      </div>

      <style>{`@keyframes plPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </div>
  );
}