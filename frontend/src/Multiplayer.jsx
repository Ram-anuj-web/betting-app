import React, { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:5000";

const SPORTS = [
  { id: "cricket",    name: "Cricket",    emoji: "🏏", teams: ["India", "Australia", "England", "Pakistan"] },
  { id: "football",  name: "Football",   emoji: "⚽", teams: ["Real Madrid", "Barcelona", "Man City", "PSG"] },
  { id: "basketball",name: "Basketball", emoji: "🏀", teams: ["Lakers", "Warriors", "Bulls", "Celtics"] },
  { id: "tennis",    name: "Tennis",     emoji: "🎾", teams: ["Djokovic", "Alcaraz", "Sinner", "Medvedev"] },
];

const IPL_MATCHES = [
  { id: "ipl1",  team1: "RCB", team2: "SRH",  date: "2026-03-28", venue: "Bangalore" },
  { id: "ipl2",  team1: "MI",  team2: "KKR",  date: "2026-03-29", venue: "Mumbai" },
  { id: "ipl3",  team1: "RR",  team2: "CSK",  date: "2026-03-30", venue: "Guwahati" },
  { id: "ipl4",  team1: "PBKS",team2: "GT",   date: "2026-03-31", venue: "Mohali" },
  { id: "ipl5",  team1: "LSG", team2: "DC",   date: "2026-04-01", venue: "Lucknow" },
  { id: "ipl6",  team1: "SRH", team2: "LSG",  date: "2026-04-02", venue: "Hyderabad" },
  { id: "ipl7",  team1: "RCB", team2: "CSK",  date: "2026-04-03", venue: "Bangalore" },
  { id: "ipl8",  team1: "DC",  team2: "MI",   date: "2026-04-04", venue: "Delhi" },
  { id: "ipl9",  team1: "GT",  team2: "RR",   date: "2026-04-04", venue: "Ahmedabad" },
  { id: "ipl10", team1: "KKR", team2: "PBKS", date: "2026-04-05", venue: "Kolkata" },
  { id: "ipl11", team1: "CSK", team2: "MI",   date: "2026-04-05", venue: "Chennai" },
  { id: "ipl12", team1: "LSG", team2: "RCB",  date: "2026-04-06", venue: "Lucknow" },
  { id: "ipl13", team1: "SRH", team2: "DC",   date: "2026-04-07", venue: "Hyderabad" },
  { id: "ipl14", team1: "RR",  team2: "KKR",  date: "2026-04-08", venue: "Jaipur" },
  { id: "ipl15", team1: "PBKS",team2: "GT",   date: "2026-04-09", venue: "Mohali" },
  { id: "ipl16", team1: "MI",  team2: "LSG",  date: "2026-04-10", venue: "Mumbai" },
  { id: "ipl17", team1: "RCB", team2: "RR",   date: "2026-04-11", venue: "Bangalore" },
  { id: "ipl18", team1: "CSK", team2: "SRH",  date: "2026-04-12", venue: "Chennai" },
  { id: "ipl19", team1: "DC",  team2: "KKR",  date: "2026-04-12", venue: "Delhi" },
  { id: "ipl20", team1: "GT",  team2: "MI",   date: "2026-04-13", venue: "Ahmedabad" },
  { id: "ipl21", team1: "SRH", team2: "RR",   date: "2026-04-13", venue: "Hyderabad" },
  { id: "ipl22", team1: "CSK", team2: "KKR",  date: "2026-04-14", venue: "Chennai" },
  { id: "ipl23", team1: "RCB", team2: "LSG",  date: "2026-04-15", venue: "Bangalore" },
  { id: "ipl24", team1: "MI",  team2: "PBKS", date: "2026-04-16", venue: "Mumbai" },
  { id: "ipl25", team1: "GT",  team2: "KKR",  date: "2026-04-17", venue: "Ahmedabad" },
  { id: "ipl26", team1: "RCB", team2: "DC",   date: "2026-04-18", venue: "Bangalore" },
  { id: "ipl27", team1: "SRH", team2: "CSK",  date: "2026-04-18", venue: "Hyderabad" },
  { id: "ipl28", team1: "KKR", team2: "RR",   date: "2026-04-19", venue: "Kolkata" },
  { id: "ipl29", team1: "PBKS",team2: "LSG",  date: "2026-04-19", venue: "Mohali" },
  { id: "ipl30", team1: "GT",  team2: "MI",   date: "2026-04-20", venue: "Ahmedabad" },
  { id: "ipl31", team1: "SRH", team2: "DC",   date: "2026-04-21", venue: "Hyderabad" },
  { id: "ipl32", team1: "LSG", team2: "RR",   date: "2026-04-22", venue: "Lucknow" },
  { id: "ipl33", team1: "MI",  team2: "CSK",  date: "2026-04-23", venue: "Mumbai" },
  { id: "ipl34", team1: "RCB", team2: "GT",   date: "2026-04-24", venue: "Bangalore" },
  { id: "ipl35", team1: "DC",  team2: "PBKS", date: "2026-04-25", venue: "Delhi" },
  { id: "ipl36", team1: "RR",  team2: "SRH",  date: "2026-04-25", venue: "Jaipur" },
  { id: "ipl37", team1: "GT",  team2: "CSK",  date: "2026-04-26", venue: "Ahmedabad" },
  { id: "ipl38", team1: "LSG", team2: "KKR",  date: "2026-04-26", venue: "Lucknow" },
  { id: "ipl39", team1: "DC",  team2: "RCB",  date: "2026-04-27", venue: "Delhi" },
  { id: "ipl40", team1: "PBKS",team2: "RR",   date: "2026-04-28", venue: "Mohali" },
  { id: "ipl41", team1: "MI",  team2: "SRH",  date: "2026-04-29", venue: "Mumbai" },
  { id: "ipl42", team1: "GT",  team2: "RCB",  date: "2026-04-30", venue: "Ahmedabad" },
  { id: "ipl43", team1: "RR",  team2: "DC",   date: "2026-05-01", venue: "Jaipur" },
  { id: "ipl44", team1: "CSK", team2: "MI",   date: "2026-05-02", venue: "Chennai" },
  { id: "ipl45", team1: "SRH", team2: "KKR",  date: "2026-05-03", venue: "Hyderabad" },
  { id: "ipl46", team1: "GT",  team2: "PBKS", date: "2026-05-03", venue: "Ahmedabad" },
  { id: "ipl47", team1: "MI",  team2: "LSG",  date: "2026-05-04", venue: "Mumbai" },
  { id: "ipl48", team1: "DC",  team2: "CSK",  date: "2026-05-05", venue: "Delhi" },
  { id: "ipl49", team1: "SRH", team2: "PBKS", date: "2026-05-06", venue: "Hyderabad" },
  { id: "ipl50", team1: "LSG", team2: "RCB",  date: "2026-05-07", venue: "Lucknow" },
  { id: "ipl51", team1: "DC",  team2: "KKR",  date: "2026-05-08", venue: "Delhi" },
  { id: "ipl52", team1: "RR",  team2: "GT",   date: "2026-05-09", venue: "Jaipur" },
  { id: "ipl53", team1: "CSK", team2: "LSG",  date: "2026-05-10", venue: "Chennai" },
  { id: "ipl54", team1: "RCB", team2: "MI",   date: "2026-05-10", venue: "Bangalore" },
  { id: "ipl55", team1: "PBKS",team2: "DC",   date: "2026-05-11", venue: "Mohali" },
  { id: "ipl56", team1: "GT",  team2: "SRH",  date: "2026-05-12", venue: "Ahmedabad" },
  { id: "ipl57", team1: "RCB", team2: "KKR",  date: "2026-05-13", venue: "Bangalore" },
  { id: "ipl58", team1: "PBKS",team2: "MI",   date: "2026-05-14", venue: "Dharamsala" },
  { id: "ipl59", team1: "LSG", team2: "CSK",  date: "2026-05-15", venue: "Lucknow" },
  { id: "ipl60", team1: "KKR", team2: "GT",   date: "2026-05-16", venue: "Kolkata" },
  { id: "ipl61", team1: "PBKS",team2: "RCB",  date: "2026-05-17", venue: "Dharamsala" },
  { id: "ipl62", team1: "DC",  team2: "RR",   date: "2026-05-17", venue: "Delhi" },
  { id: "ipl63", team1: "CSK", team2: "SRH",  date: "2026-05-18", venue: "Chennai" },
  { id: "ipl64", team1: "RR",  team2: "LSG",  date: "2026-05-19", venue: "Jaipur" },
  { id: "ipl65", team1: "KKR", team2: "MI",   date: "2026-05-20", venue: "Kolkata" },
  { id: "ipl66", team1: "CSK", team2: "GT",   date: "2026-05-21", venue: "Chennai" },
  { id: "ipl67", team1: "SRH", team2: "RCB",  date: "2026-05-22", venue: "Hyderabad" },
  { id: "ipl68", team1: "LSG", team2: "PBKS", date: "2026-05-23", venue: "Lucknow" },
  { id: "ipl69", team1: "MI",  team2: "RR",   date: "2026-05-24", venue: "Mumbai" },
  { id: "ipl70", team1: "KKR", team2: "DC",   date: "2026-05-24", venue: "Kolkata" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:   { label: "Pending",   color: "#BA7517", bg: "#FAEEDA" },
    active:    { label: "Active",    color: "#085041", bg: "#E1F5EE" },
    settled:   { label: "Settled",   color: "#3C3489", bg: "#EEEDFE" },
    cancelled: { label: "Cancelled", color: "#5F5E5A", bg: "#F1EFE8" },
    open:      { label: "Open",      color: "#085041", bg: "#E1F5EE" },
    locked:    { label: "Locked",    color: "#BA7517", bg: "#FAEEDA" },
  };
  const s = map[status] || map.cancelled;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function getChallengeTeams(challenge) {
  if (challenge.team1 && challenge.team2) return [challenge.team1, challenge.team2];
  if (challenge.sport === "cricket" && challenge.matchLabel) {
    const label = challenge.matchLabel.toUpperCase();
    const found = IPL_MATCHES.find(
      m => label.includes(m.team1.toUpperCase()) && label.includes(m.team2.toUpperCase())
    );
    if (found) return [found.team1, found.team2];
  }
  const sport = SPORTS.find(s => s.id === challenge.sport);
  return sport?.teams || [];
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  container: { padding: "24px 0", maxWidth: 700, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 500 },
  tabs: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
  tab: (active) => ({
    padding: "6px 16px", borderRadius: 8, border: "0.5px solid",
    borderColor: active ? "#7F77DD" : "#d3d1c7",
    background: active ? "#EEEDFE" : "transparent",
    color: active ? "#3C3489" : "#888780",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 500 : 400,
  }),
  card: { background: "#fff", border: "0.5px solid #d3d1c7", borderRadius: 12, padding: "16px 20px", marginBottom: 10 },
  cardDark: { background: "#F1EFE8", border: "0.5px solid #d3d1c7", borderRadius: 12, padding: "16px 20px", marginBottom: 10 },
  label: { fontSize: 11, color: "#888780", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #d3d1c7", fontSize: 14, marginBottom: 12, boxSizing: "border-box" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  pill: (active) => ({
    padding: "6px 14px", borderRadius: 99, border: "0.5px solid",
    borderColor: active ? "#7F77DD" : "#d3d1c7",
    background: active ? "#EEEDFE" : "transparent",
    color: active ? "#3C3489" : "#444441",
    cursor: "pointer", fontSize: 13,
  }),
  iplCard: (active) => ({
    padding: "10px 14px", borderRadius: 10, border: "1px solid",
    borderColor: active ? "#7F77DD" : "#d3d1c7",
    background: active ? "#EEEDFE" : "#fff",
    cursor: "pointer", marginBottom: 8, transition: "all 0.15s",
  }),
  btn: (color) => ({
    padding: "9px 20px", borderRadius: 8, border: "none",
    background: color || "#7F77DD", color: "#fff",
    cursor: "pointer", fontSize: 14, fontWeight: 500,
  }),
  btnGhost: {
    padding: "8px 16px", borderRadius: 8, border: "0.5px solid #d3d1c7",
    background: "transparent", color: "#444441", cursor: "pointer", fontSize: 13,
  },
  row: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  flash: (type) => ({
    padding: "10px 16px", borderRadius: 8, marginBottom: 14, fontSize: 13,
    background: type === "error" ? "#FCEBEB" : "#E1F5EE",
    color: type === "error" ? "#A32D2D" : "#085041",
    border: `0.5px solid ${type === "error" ? "#F09595" : "#5DCAA5"}`,
  }),
  vsBox: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    background: "#F1EFE8", borderRadius: 8, marginBottom: 12,
  },
  teamChip: (mine) => ({
    flex: 1, textAlign: "center", padding: "8px 12px", borderRadius: 8,
    background: mine ? "#EEEDFE" : "#FAECE7",
    color: mine ? "#3C3489" : "#712B13", fontWeight: 500, fontSize: 14,
  }),
  progressBar: (pct) => ({
    height: 6, borderRadius: 99, background: "#E8E6DC", marginTop: 8, overflow: "hidden",
  }),
  progressFill: (pct) => ({
    height: "100%", borderRadius: 99, width: `${pct}%`,
    background: pct >= 100 ? "#E24B4A" : "#1D9E75", transition: "width 0.3s",
  }),

  // ── NEW: VS matchup display for incoming challenges ──
  vsMatchup: {
    display: "flex", alignItems: "stretch", gap: 0,
    borderRadius: 10, overflow: "hidden", marginBottom: 14,
    border: "1px solid #e8e6dc",
  },
  vsTeamBox: (highlight) => ({
    flex: 1, padding: "14px 16px", textAlign: "center",
    background: highlight ? "#EEEDFE" : "#F8F7F3",
  }),
  vsTeamName: (highlight) => ({
    fontWeight: 700, fontSize: 18,
    color: highlight ? "#3C3489" : "#444441",
  }),
  vsTeamSub: {
    fontSize: 11, color: "#888780", marginTop: 3,
  },
  vsDivider: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 10px", background: "#F1EFE8",
    fontSize: 11, fontWeight: 700, color: "#888780", letterSpacing: "0.05em",
  },
  selectablePill: (selected, disabled) => ({
    padding: "8px 18px", borderRadius: 99, border: "1.5px solid",
    borderColor: selected ? "#7F77DD" : disabled ? "#e8e6dc" : "#d3d1c7",
    background: selected ? "#EEEDFE" : disabled ? "#f8f7f3" : "transparent",
    color: selected ? "#3C3489" : disabled ? "#c0bdb5" : "#444441",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13, fontWeight: selected ? 600 : 400,
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.15s",
  }),
};

// ─── IPLMatchPicker ───────────────────────────────────────────────────────────
function IPLMatchPicker({ selectedMatch, onSelect }) {
  const scrollRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!scrollRef.current) return;
    const firstUpcomingIndex = IPL_MATCHES.findIndex(m => m.date >= today);
    if (firstUpcomingIndex > 0) {
      scrollRef.current.scrollTop = firstUpcomingIndex * 62;
    } else {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div ref={scrollRef} style={{ maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
      {IPL_MATCHES.map(match => {
        const isPast = match.date < today;
        return (
          <div
            key={match.id}
            style={{ ...S.iplCard(selectedMatch?.id === match.id), opacity: isPast ? 0.45 : 1 }}
            onClick={() => onSelect(match)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {match.team1} <span style={{ color: "#888780", fontWeight: 400 }}>vs</span> {match.team2}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isPast && (
                  <span style={{ fontSize: 10, color: "#888780", background: "#F1EFE8", padding: "1px 6px", borderRadius: 99 }}>
                    past
                  </span>
                )}
                <div style={{ fontSize: 12, color: "#888780" }}>{match.date}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 3 }}>📍 {match.venue}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Multiplayer({ username, points, setPoints }) {
  const [view, setView] = useState("list");

  // ── Challenge state ──
  const [challenges, setChallenges]   = useState([]);
  const [opponentName, setOpponentName] = useState("");
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedIPLMatch, setSelectedIPLMatch] = useState(null);
  const [myTeam, setMyTeam]           = useState(null);
  const [matchLabel, setMatchLabel]   = useState("");
  const [wager, setWager]             = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptTeam, setAcceptTeam]   = useState(null);
  const [settlingId, setSettlingId]   = useState(null);
  const [winningTeam, setWinningTeam] = useState("");

  // ── Contest state ──
  const [contests, setContests]               = useState([]);
  const [openContests, setOpenContests]       = useState([]);
  const [contestName, setContestName]         = useState("");
  const [cSport, setCsport]                   = useState(null);
  const [cIPLMatch, setCIplMatch]             = useState(null);
  const [cMyTeam, setCMyTeam]                 = useState(null);
  const [cMatchLabel, setCMatchLabel]         = useState("");
  const [cEntryFee, setCEntryFee]             = useState("");
  const [cMaxPlayers, setCMaxPlayers]         = useState("10");
  const [joiningContest, setJoiningContest]   = useState(null);
  const [joinTeam, setJoinTeam]               = useState(null);
  const [settlingContest, setSettlingContest] = useState(null);
  const [contestWinTeam, setContestWinTeam]   = useState("");

  // ── Shared ──
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [serverOnline, setServerOnline] = useState(true);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch(`${API}/challenges/${username}`);
      const data = await res.json();
      if (res.ok) { setChallenges(data.challenges); setServerOnline(true); }
    } catch { setServerOnline(false); }
  }, [username]);

  const fetchMyContests = useCallback(async () => {
    try {
      const res = await fetch(`${API}/contests/${username}`);
      const data = await res.json();
      if (res.ok) setContests(data.contests);
    } catch {}
  }, [username]);

  const fetchOpenContests = useCallback(async () => {
    try {
      const res = await fetch(`${API}/contests`);
      const data = await res.json();
      if (res.ok) setOpenContests(data.contests);
    } catch {}
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchMyContests();
    fetchOpenContests();
    const iv = setInterval(() => {
      fetchChallenges();
      fetchMyContests();
      fetchOpenContests();
    }, 10000);
    return () => clearInterval(iv);
  }, [fetchChallenges, fetchMyContests, fetchOpenContests]);

  const pendingIncoming = challenges.filter(c => c.status === "pending" && c.opponent === username);
  const myChallenges    = challenges.filter(c => c.status !== "cancelled");

  function flash(type, msg) {
    if (type === "error") { setError(msg); setTimeout(() => setError(""), 3500); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 3500); }
  }

  function handleIPLMatchSelect(match, setMatch, setLabel, setTeam) {
    setMatch(match);
    setLabel(`${match.team1} vs ${match.team2} — IPL 2026`);
    setTeam(null);
  }

  function getTeamsFor(sport, iplMatch) {
    if (sport?.id === "cricket" && iplMatch) return [iplMatch.team1, iplMatch.team2];
    return sport?.teams || [];
  }

  // ─── Challenge handlers ───────────────────────────────────────────────────
  async function handleCreate() {
    if (!opponentName.trim()) return flash("error", "Enter an opponent username");
    if (!selectedSport)       return flash("error", "Pick a sport");
    if (selectedSport.id === "cricket" && !selectedIPLMatch)
      return flash("error", "Please pick an IPL match from the list above");
    if (!myTeam)              return flash("error", "Pick your team");
    if (!matchLabel.trim())   return flash("error", "Enter a match label");
    const w = parseInt(wager);
    if (!w || w <= 0)         return flash("error", "Enter a valid wager");
    if (w > points)           return flash("error", "Not enough points");

    setLoading(true);
    try {
      const res = await fetch(`${API}/challenge/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenger: username,
          opponent: opponentName.trim(),
          sport: selectedSport.id,
          matchLabel,
          challengerTeam: myTeam,
          wager: w,
          team1: selectedIPLMatch?.team1 || null,
          team2: selectedIPLMatch?.team2 || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.challengerPoints);
        flash("success", `Challenge sent to ${opponentName}! ${w} pts escrowed.`);
        setView("list");
        setOpponentName(""); setSelectedSport(null); setMyTeam(null);
        setMatchLabel(""); setWager(""); setSelectedIPLMatch(null);
        fetchChallenges();
      } else {
        flash("error", data.message || "Failed to create challenge");
      }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleAccept(challengeId) {
    if (!acceptTeam) return flash("error", "Pick your team first");
    setLoading(true);
    try {
      const res = await fetch(`${API}/challenge/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, opponentTeam: acceptTeam }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.opponentPoints);
        flash("success", "Challenge accepted! Match is live 🔥");
        setAcceptingId(null); setAcceptTeam(null);
        fetchChallenges();
      } else { flash("error", data.message || "Failed to accept"); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleDecline(challengeId) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/challenge/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, username }),
      });
      const data = await res.json();
      if (res.ok) { flash("success", "Challenge declined."); fetchChallenges(); }
      else flash("error", data.message);
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleSettle(challengeId) {
    if (!winningTeam) return flash("error", "Enter the winning team name");
    setLoading(true);
    try {
      const res = await fetch(`${API}/challenge/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, winningTeam }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.challenge.challenger === username) setPoints(data.challengerPoints);
        if (data.challenge.opponent === username)   setPoints(data.opponentPoints);
        flash("success", data.message);
        setSettlingId(null); setWinningTeam("");
        fetchChallenges();
      } else { flash("error", data.message); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  // ─── Contest handlers ─────────────────────────────────────────────────────
  async function handleCreateContest() {
    if (!contestName.trim()) return flash("error", "Enter a contest name");
    if (!cSport)             return flash("error", "Pick a sport");
    if (cSport.id === "cricket" && !cIPLMatch)
      return flash("error", "Please pick an IPL match from the list above");
    if (!cMyTeam)            return flash("error", "Pick your team");
    if (!cMatchLabel.trim()) return flash("error", "Enter a match label");
    const fee = parseInt(cEntryFee);
    if (!fee || fee <= 0)    return flash("error", "Enter a valid entry fee");
    if (fee > points)        return flash("error", "Not enough points");
    const max = parseInt(cMaxPlayers);
    if (!max || max < 2 || max > 12) return flash("error", "Max players must be 2–12");

    setLoading(true);
    try {
      const res = await fetch(`${API}/contest/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy: username,
          name: contestName.trim(),
          sport: cSport.id,
          matchLabel: cMatchLabel,
          team1: cIPLMatch?.team1 || null,
          team2: cIPLMatch?.team2 || null,
          entryFee: fee,
          maxPlayers: max,
          myTeam: cMyTeam,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.creatorPoints);
        flash("success", "Contest created! Others can now join.");
        setContestName(""); setCsport(null); setCMyTeam(null);
        setCMatchLabel(""); setCEntryFee(""); setCMaxPlayers("10"); setCIplMatch(null);
        await fetchMyContests();
        await fetchOpenContests();
        setView("contests");
      } else { flash("error", data.message || "Failed"); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleJoinContest(contestId) {
    if (!joinTeam) return flash("error", "Pick a team first");
    setLoading(true);
    try {
      const res = await fetch(`${API}/contest/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, username, team: joinTeam }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.userPoints);
        flash("success", "Joined the contest!");
        setJoiningContest(null); setJoinTeam(null);
        fetchMyContests(); fetchOpenContests();
      } else { flash("error", data.message || "Failed"); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleSettleContest(contestId) {
    if (!contestWinTeam.trim()) return flash("error", "Enter winning team");
    setLoading(true);
    try {
      const res = await fetch(`${API}/contest/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, winningTeam: contestWinTeam.trim(), settledBy: username }),
      });
      const data = await res.json();
      if (res.ok) {
        flash("success", data.message);
        setSettlingContest(null); setContestWinTeam("");
        fetchMyContests(); fetchOpenContests();
      } else { flash("error", data.message); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleCancelContest(contestId) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/contest/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, cancelledBy: username }),
      });
      const data = await res.json();
      if (res.ok) { flash("success", "Contest cancelled. Fees refunded."); fetchMyContests(); fetchOpenContests(); }
      else flash("error", data.message);
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>⚔️ Multiplayer</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Server status indicator */}
          <span style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600,
            background: serverOnline ? "#E1F5EE" : "#FCEBEB",
            color: serverOnline ? "#085041" : "#A32D2D",
          }}>
            {serverOnline ? "🟢 Server Online" : "🔴 Server Offline"}
          </span>
          {pendingIncoming.length > 0 && (
            <span style={{ background: "#E24B4A", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
              {pendingIncoming.length} incoming
            </span>
          )}
        </div>
      </div>

      {!serverOnline && (
        <div style={S.flash("error")}>
          ⚠️ Can't connect to server. Make sure your backend is running: <code>node server.js</code>
        </div>
      )}

      {error   && <div style={S.flash("error")}>{error}</div>}
      {success && <div style={S.flash("success")}>{success}</div>}

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        <button style={S.tab(view === "list")}     onClick={() => setView("list")}>My Challenges</button>
        <button style={S.tab(view === "create")}   onClick={() => setView("create")}>+ New Challenge</button>
        {pendingIncoming.length > 0 && (
          <button style={S.tab(view === "incoming")} onClick={() => setView("incoming")}>
            Incoming ({pendingIncoming.length})
          </button>
        )}
        <button style={S.tab(view === "contests")} onClick={() => { fetchMyContests(); fetchOpenContests(); setView("contests"); }}>🏆 Contests</button>
        <button style={S.tab(view === "createContest")} onClick={() => setView("createContest")}>+ New Contest</button>
      </div>

      {/* ════════════════════════════════════════════════════
          CHALLENGE — LIST VIEW
      ════════════════════════════════════════════════════ */}
      {view === "list" && (
        <div>
          {myChallenges.length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 32 }}>
              No challenges yet. Create one to get started!
            </div>
          )}
          {myChallenges.map(c => {
            const isChallenger = c.challenger === username;
            const myTeamName   = isChallenger ? c.challengerTeam : c.opponentTeam;
            const theirTeam    = isChallenger ? c.opponentTeam   : c.challengerTeam;
            const opponent     = isChallenger ? c.opponent : c.challenger;
            const sport        = SPORTS.find(s => s.id === c.sport);
            return (
              <div key={c._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#888780", marginBottom: 3 }}>{sport?.emoji} {c.matchLabel}</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>vs <span style={{ color: "#7F77DD" }}>{opponent}</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {statusBadge(c.status)}
                    <div style={{ fontSize: 13, color: "#888780", marginTop: 4 }}>💰 {c.wager} pts each</div>
                  </div>
                </div>
                {/* VS matchup — always show both team slots */}
                <div style={S.vsBox}>
                  <div style={S.teamChip(true)}>
                    {myTeamName || <span style={{ opacity: 0.5 }}>You</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#888780", fontWeight: 500 }}>VS</div>
                  {theirTeam
                    ? <div style={S.teamChip(false)}>{opponent}: {theirTeam}</div>
                    : <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#888780", fontStyle: "italic" }}>
                        {opponent} hasn't picked yet...
                      </div>
                  }
                </div>
                {c.status === "settled" && (
                  <div style={{ fontSize: 14, fontWeight: 500, color: c.winner === username ? "#0F6E56" : c.winner === "draw" ? "#888780" : "#993C1D", marginTop: 6 }}>
                    {c.winner === username ? "🏆 You won!" : c.winner === "draw" ? "🤝 Draw" : `😢 ${c.winner} won`}
                    {" "}· Pot: {c.wager * 2} pts
                  </div>
                )}
                <div style={{ ...S.row, marginTop: 12 }}>
                  {c.status === "active" && isChallenger && (
                    settlingId === c._id ? (
                      <div style={{ width: "100%" }}>
                        <div style={S.label}>Select the winning team</div>
                        <div style={S.pillRow}>
                          {getChallengeTeams(c).map(t => (
                            <button key={t} style={S.pill(winningTeam === t)} onClick={() => setWinningTeam(t)}>{t}</button>
                          ))}
                        </div>
                        <div style={S.row}>
                          <button style={S.btn("#1D9E75")} onClick={() => handleSettle(c._id)} disabled={loading}>Confirm</button>
                          <button style={S.btnGhost} onClick={() => { setSettlingId(null); setWinningTeam(""); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button style={S.btn("#1D9E75")} onClick={() => { setSettlingId(c._id); setWinningTeam(""); }}>
                        Settle Result
                      </button>
                    )
                  )}
                  {c.status === "active" && !isChallenger && (
                    <span style={{ fontSize: 13, color: "#888780" }}>Waiting for match result...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CHALLENGE — CREATE VIEW
      ════════════════════════════════════════════════════ */}
      {view === "create" && (
        <div style={S.card}>
          <div style={S.label}>Opponent username</div>
          <input style={S.input} placeholder="Enter their username..."
            value={opponentName} onChange={e => setOpponentName(e.target.value)} />

          <div style={S.label}>Sport</div>
          <div style={S.pillRow}>
            {SPORTS.map(s => (
              <button key={s.id} style={S.pill(selectedSport?.id === s.id)}
                onClick={() => { setSelectedSport(s); setMyTeam(null); setSelectedIPLMatch(null); setMatchLabel(""); }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {selectedSport?.id === "cricket" && (
            <>
              <div style={S.label}>🏏 Pick an IPL 2026 Match</div>
              <IPLMatchPicker
                selectedMatch={selectedIPLMatch}
                onSelect={(match) => handleIPLMatchSelect(match, setSelectedIPLMatch, setMatchLabel, setMyTeam)}
              />
            </>
          )}

          {selectedSport && (
            <>
              <div style={S.label}>Pick your team</div>
              <div style={S.pillRow}>
                {getTeamsFor(selectedSport, selectedIPLMatch).map(t => (
                  <button key={t} style={S.pill(myTeam === t)} onClick={() => setMyTeam(t)}>{t}</button>
                ))}
              </div>
            </>
          )}

          <div style={S.label}>Match label</div>
          <input style={S.input} placeholder="e.g. India vs Australia – Final"
            value={matchLabel} onChange={e => setMatchLabel(e.target.value)} />

          <div style={S.label}>Wager (your points: {points.toLocaleString()})</div>
          <div style={S.pillRow}>
            {[50, 100, 250, 500].map(amt => (
              <button key={amt} style={S.pill(parseInt(wager) === amt)}
                onClick={() => setWager(String(Math.min(amt, points)))}>{amt}</button>
            ))}
            <button style={S.pill(parseInt(wager) === points)} onClick={() => setWager(String(points))}>All in 🔥</button>
          </div>
          <input style={S.input} type="number" placeholder="Or enter custom amount..."
            value={wager} onChange={e => setWager(e.target.value)} max={points} />

          <div style={S.row}>
            <button style={S.btn()} onClick={handleCreate} disabled={loading}>
              {loading ? "Sending..." : "Send Challenge ⚡"}
            </button>
            <button style={S.btnGhost} onClick={() => setView("list")}>Cancel</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CHALLENGE — INCOMING VIEW  (REDESIGNED)
      ════════════════════════════════════════════════════ */}
      {view === "incoming" && (
        <div>
          {pendingIncoming.length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 32 }}>
              No incoming challenges right now.
            </div>
          )}
          {pendingIncoming.map(c => {
            const sport      = SPORTS.find(s => s.id === c.sport);
            const allTeams   = getChallengeTeams(c);          // [team1, team2]
            // The team challenger already picked
            const takenTeam  = c.challengerTeam;
            // The remaining team(s) the opponent can pick
            const myOptions  = allTeams.filter(t => t !== takenTeam);

            return (
              <div key={c._id} style={S.card}>
                {/* Match info header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888780", marginBottom: 2 }}>{sport?.emoji} {c.matchLabel}</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      <span style={{ color: "#7F77DD" }}>{c.challenger}</span>
                      <span style={{ color: "#888780", fontWeight: 400 }}> challenges you!</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {statusBadge(c.status)}
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginTop: 4 }}>💰 {c.wager} pts</div>
                  </div>
                </div>

                {/* ── VS matchup display showing BOTH teams ── */}
                <div style={S.vsMatchup}>
                  {/* Challenger's team (already picked — highlighted) */}
                  <div style={S.vsTeamBox(true)}>
                    <div style={S.vsTeamName(true)}>{allTeams[0] || "—"}</div>
                    <div style={S.vsTeamSub}>{c.challenger} picked this</div>
                  </div>
                  <div style={S.vsDivider}>VS</div>
                  {/* Opponent side — your pick */}
                  <div style={S.vsTeamBox(false)}>
                    <div style={S.vsTeamName(false)}>{allTeams[1] || "—"}</div>
                    <div style={S.vsTeamSub}>Your side</div>
                  </div>
                </div>

                {/* Wager info */}
                <div style={{
                  fontSize: 12, color: "#444441", padding: "8px 12px",
                  background: "#F8F7F3", borderRadius: 8, marginBottom: 12,
                  display: "flex", justifyContent: "space-between"
                }}>
                  <span>Total pot if accepted</span>
                  <span style={{ fontWeight: 600, color: "#1D9E75" }}>💰 {c.wager * 2} pts</span>
                </div>

                {/* Accept / Decline */}
                {acceptingId === c._id ? (
                  <div>
                    <div style={S.label}>Confirm your team pick</div>
                    <div style={S.pillRow}>
                      {myOptions.map(t => (
                        <button
                          key={t}
                          style={S.selectablePill(acceptTeam === t, false)}
                          onClick={() => setAcceptTeam(t)}
                        >
                          {t}
                          {acceptTeam === t && " ✓"}
                        </button>
                      ))}
                      {/* Also show the taken team as disabled so user sees both */}
                      <button
                        key={takenTeam}
                        style={S.selectablePill(false, true)}
                        disabled
                        title={`${c.challenger} already picked this team`}
                      >
                        {takenTeam} (taken)
                      </button>
                    </div>
                    <div style={S.row}>
                      <button style={S.btn("#1D9E75")} onClick={() => handleAccept(c._id)} disabled={loading}>
                        {loading ? "Accepting..." : "Confirm & Accept ✓"}
                      </button>
                      <button style={S.btnGhost} onClick={() => { setAcceptingId(null); setAcceptTeam(null); }}>Back</button>
                    </div>
                  </div>
                ) : (
                  <div style={S.row}>
                    <button style={S.btn("#1D9E75")} onClick={() => { setAcceptingId(c._id); setAcceptTeam(myOptions[0] || null); }}>
                      Accept Challenge
                    </button>
                    <button style={S.btn("#E24B4A")} onClick={() => handleDecline(c._id)} disabled={loading}>Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CONTESTS — LIST / BROWSE VIEW
      ════════════════════════════════════════════════════ */}
      {view === "contests" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 10 }}>My Contests</div>
          {contests.length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 24, marginBottom: 16 }}>
              {serverOnline
                ? "You haven't joined or created any contests yet."
                : "⚠️ Can't load contests — server offline. Run: node server.js"}
            </div>
          )}
          {contests.map(c => {
            const isCreator  = c.createdBy === username;
            const myEntry    = c.participants.find(p => p.username === username);
            const totalPot   = c.entryFee * c.participants.length;
            const pct        = Math.round((c.participants.length / c.maxPlayers) * 100);
            return (
              <div key={c._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>🏏 {c.matchLabel}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {statusBadge(c.status)}
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 4 }}>Entry: {c.entryFee} pts</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#444441", marginBottom: 4 }}>
                  👥 {c.participants.length}/{c.maxPlayers} players · 💰 Pot: {totalPot} pts
                </div>
                <div style={S.progressBar(pct)}><div style={S.progressFill(pct)} /></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {c.participants.map(p => (
                    <span key={p.username} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 99,
                      background: p.username === username ? "#EEEDFE" : "#F1EFE8",
                      color: p.username === username ? "#3C3489" : "#444441",
                      fontWeight: p.username === username ? 600 : 400,
                    }}>
                      {p.username}: {p.team}
                    </span>
                  ))}
                </div>
                {myEntry && (
                  <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 8 }}>
                    ✅ You picked <strong>{myEntry.team}</strong>
                  </div>
                )}
                {c.status === "settled" && (
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8,
                    color: c.winner?.includes(username) ? "#0F6E56" : "#993C1D" }}>
                    {c.winner?.includes(username)
                      ? `🏆 You won! Team: ${c.winningTeam}`
                      : `Result: ${c.winningTeam} won · Winner(s): ${c.winner}`}
                  </div>
                )}
                {isCreator && (c.status === "open" || c.status === "locked") && (
                  <div style={{ ...S.row, marginTop: 12 }}>
                    {settlingContest === c._id ? (
                      <div style={{ width: "100%" }}>
                        <div style={S.label}>Select the winning team</div>
                        <div style={S.pillRow}>
                          {(c.team1 && c.team2
                            ? [c.team1, c.team2]
                            : [...new Set(c.participants.map(p => p.team))]
                          ).map(t => (
                            <button key={t} style={S.pill(contestWinTeam === t)} onClick={() => setContestWinTeam(t)}>{t}</button>
                          ))}
                        </div>
                        <div style={S.row}>
                          <button style={S.btn("#1D9E75")} onClick={() => handleSettleContest(c._id)} disabled={loading}>Settle</button>
                          <button style={S.btnGhost} onClick={() => { setSettlingContest(null); setContestWinTeam(""); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button style={S.btn("#1D9E75")} onClick={() => { setSettlingContest(c._id); setContestWinTeam(""); }}>
                          Settle Result
                        </button>
                        <button style={S.btn("#E24B4A")} onClick={() => handleCancelContest(c._id)} disabled={loading}>
                          Cancel Contest
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", margin: "20px 0 10px" }}>Open Contests — Join Now</div>
          {openContests.filter(c => !c.participants.find(p => p.username === username)).length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 24 }}>
              {serverOnline ? "No open contests to join right now." : "⚠️ Server offline — can't load contests."}
            </div>
          )}
          {openContests
            .filter(c => !c.participants.find(p => p.username === username))
            .map(c => {
              const totalPot = c.entryFee * c.participants.length;
              const pct = Math.round((c.participants.length / c.maxPlayers) * 100);
              const matchTeams = c.team1 && c.team2 ? [c.team1, c.team2] : [];
              return (
                <div key={c._id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>🏏 {c.matchLabel}</div>
                      <div style={{ fontSize: 12, color: "#888780", marginTop: 1 }}>Created by: {c.createdBy}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {statusBadge(c.status)}
                      <div style={{ fontSize: 12, color: "#888780", marginTop: 4 }}>Entry: {c.entryFee} pts</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#444441", marginBottom: 4 }}>
                    👥 {c.participants.length}/{c.maxPlayers} players · 💰 Pot so far: {totalPot} pts
                  </div>
                  <div style={S.progressBar(pct)}><div style={S.progressFill(pct)} /></div>
                  {joiningContest === c._id ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={S.label}>Pick your team</div>
                      <div style={S.pillRow}>
                        {(matchTeams.length > 0 ? matchTeams : (SPORTS.find(s => s.id === c.sport)?.teams || [])).map(t => (
                          <button key={t} style={S.pill(joinTeam === t)} onClick={() => setJoinTeam(t)}>{t}</button>
                        ))}
                      </div>
                      <div style={S.row}>
                        <button style={S.btn("#1D9E75")} onClick={() => handleJoinContest(c._id)} disabled={loading}>
                          {loading ? "Joining..." : "Confirm Join ✓"}
                        </button>
                        <button style={S.btnGhost} onClick={() => { setJoiningContest(null); setJoinTeam(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button style={{ ...S.btn(), marginTop: 12 }} onClick={() => { setJoiningContest(c._id); setJoinTeam(null); }}>
                      Join Contest — {c.entryFee} pts
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CONTESTS — CREATE VIEW
      ════════════════════════════════════════════════════ */}
      {view === "createContest" && (
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏆 Create a Contest</div>

          <div style={S.label}>Contest name</div>
          <input style={S.input} placeholder="e.g. RCB vs SRH Final Showdown"
            value={contestName} onChange={e => setContestName(e.target.value)} />

          <div style={S.label}>Sport</div>
          <div style={S.pillRow}>
            {SPORTS.map(s => (
              <button key={s.id} style={S.pill(cSport?.id === s.id)}
                onClick={() => { setCsport(s); setCMyTeam(null); setCIplMatch(null); setCMatchLabel(""); }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {cSport?.id === "cricket" && (
            <>
              <div style={S.label}>🏏 Pick an IPL 2026 Match</div>
              <IPLMatchPicker
                selectedMatch={cIPLMatch}
                onSelect={(match) => handleIPLMatchSelect(match, setCIplMatch, setCMatchLabel, setCMyTeam)}
              />
            </>
          )}

          {cSport && (
            <>
              <div style={S.label}>Pick your team</div>
              <div style={S.pillRow}>
                {getTeamsFor(cSport, cIPLMatch).map(t => (
                  <button key={t} style={S.pill(cMyTeam === t)} onClick={() => setCMyTeam(t)}>{t}</button>
                ))}
              </div>
            </>
          )}

          <div style={S.label}>Match label</div>
          <input style={S.input} placeholder="e.g. RCB vs SRH — IPL 2026"
            value={cMatchLabel} onChange={e => setCMatchLabel(e.target.value)} />

          <div style={S.label}>Entry fee per player (your points: {points.toLocaleString()})</div>
          <div style={S.pillRow}>
            {[25, 50, 100, 250].map(amt => (
              <button key={amt} style={S.pill(parseInt(cEntryFee) === amt)}
                onClick={() => setCEntryFee(String(Math.min(amt, points)))}>{amt}</button>
            ))}
          </div>
          <input style={S.input} type="number" placeholder="Or enter custom fee..."
            value={cEntryFee} onChange={e => setCEntryFee(e.target.value)} max={points} />

          <div style={S.label}>Max players (2 – 12)</div>
          <div style={S.pillRow}>
            {[2, 4, 6, 8, 10, 12].map(n => (
              <button key={n} style={S.pill(parseInt(cMaxPlayers) === n)}
                onClick={() => setCMaxPlayers(String(n))}>{n}</button>
            ))}
          </div>
          <input style={S.input} type="number" placeholder="Custom (2–12)"
            value={cMaxPlayers} min={2} max={12} onChange={e => setCMaxPlayers(e.target.value)} />

          {cEntryFee && cMaxPlayers && (
            <div style={{ fontSize: 13, color: "#1D9E75", marginBottom: 14, padding: "8px 12px", background: "#E1F5EE", borderRadius: 8 }}>
              💰 Max pot: {(parseInt(cEntryFee) || 0) * (parseInt(cMaxPlayers) || 0)} pts
              ({parseInt(cMaxPlayers) || 0} players × {parseInt(cEntryFee) || 0} pts)
            </div>
          )}

          <div style={S.row}>
            <button style={S.btn()} onClick={handleCreateContest} disabled={loading}>
              {loading ? "Creating..." : "Create Contest 🏆"}
            </button>
            <button style={S.btnGhost} onClick={() => setView("contests")}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}