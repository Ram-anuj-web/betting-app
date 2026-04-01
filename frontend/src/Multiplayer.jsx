import React, { useState, useEffect, useCallback, useRef } from "react";
import Fantasy11 from "./Fantasy11";

const API = "https://betting-backend-xq1q.onrender.com";

const SPORTS = [
  { id: "cricket",    name: "Cricket",    emoji: "🏏", teams: ["India", "Australia", "England", "Pakistan"] },
  { id: "football",  name: "Football",   emoji: "⚽", teams: ["Real Madrid", "Barcelona", "Man City", "PSG"] },
  { id: "basketball",name: "Basketball", emoji: "🏀", teams: ["Lakers", "Warriors", "Bulls", "Celtics"] },
  { id: "tennis",    name: "Tennis",     emoji: "🎾", teams: ["Djokovic", "Alcaraz", "Sinner", "Medvedev"] },
];

const IPL_MATCHES = [
  { id: "ipl-1",  team1: "RCB",  team2: "SRH",  date: "2026-03-28", time: "19:30", venue: "Bangalore" },
  { id: "ipl-2",  team1: "MI",   team2: "KKR",  date: "2026-03-29", time: "19:30", venue: "Mumbai" },
  { id: "ipl-3",  team1: "RR",   team2: "CSK",  date: "2026-03-30", time: "19:30", venue: "Guwahati" },
  { id: "ipl-4",  team1: "PBKS", team2: "GT",   date: "2026-03-31", time: "19:30", venue: "Mohali" },
  { id: "ipl-5",  team1: "LSG",  team2: "DC",   date: "2026-04-01", time: "19:30", venue: "Lucknow" },
  { id: "ipl-6",  team1: "KKR",  team2: "SRH",  date: "2026-04-02", time: "19:30", venue: "Kolkata" },
  { id: "ipl-7",  team1: "CSK",  team2: "PBKS", date: "2026-04-03", time: "19:30", venue: "Chennai" },
  { id: "ipl-8",  team1: "DC",   team2: "MI",   date: "2026-04-04", time: "15:30", venue: "Delhi" },
  { id: "ipl-9",  team1: "GT",   team2: "RR",   date: "2026-04-04", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-10", team1: "SRH",  team2: "LSG",  date: "2026-04-05", time: "15:30", venue: "Hyderabad" },
  { id: "ipl-11", team1: "RCB",  team2: "CSK",  date: "2026-04-05", time: "19:30", venue: "Bangalore" },
  { id: "ipl-12", team1: "KKR",  team2: "PBKS", date: "2026-04-06", time: "19:30", venue: "Kolkata" },
  { id: "ipl-13", team1: "RR",   team2: "MI",   date: "2026-04-07", time: "19:30", venue: "Jaipur" },
  { id: "ipl-14", team1: "DC",   team2: "GT",   date: "2026-04-08", time: "19:30", venue: "Delhi" },
  { id: "ipl-15", team1: "KKR",  team2: "LSG",  date: "2026-04-09", time: "19:30", venue: "Kolkata" },
  { id: "ipl-16", team1: "RR",   team2: "RCB",  date: "2026-04-10", time: "19:30", venue: "Jaipur" },
  { id: "ipl-17", team1: "PBKS", team2: "SRH",  date: "2026-04-11", time: "15:30", venue: "Mohali" },
  { id: "ipl-18", team1: "CSK",  team2: "DC",   date: "2026-04-11", time: "19:30", venue: "Chennai" },
  { id: "ipl-19", team1: "LSG",  team2: "GT",   date: "2026-04-12", time: "15:30", venue: "Lucknow" },
  { id: "ipl-20", team1: "MI",   team2: "RCB",  date: "2026-04-12", time: "19:30", venue: "Mumbai" },
  { id: "ipl-21", team1: "SRH",  team2: "RR",   date: "2026-04-13", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-22", team1: "CSK",  team2: "KKR",  date: "2026-04-14", time: "19:30", venue: "Chennai" },
  { id: "ipl-23", team1: "RCB",  team2: "LSG",  date: "2026-04-15", time: "19:30", venue: "Bangalore" },
  { id: "ipl-24", team1: "MI",   team2: "PBKS", date: "2026-04-16", time: "19:30", venue: "Mumbai" },
  { id: "ipl-25", team1: "GT",   team2: "KKR",  date: "2026-04-17", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-26", team1: "RCB",  team2: "DC",   date: "2026-04-18", time: "15:30", venue: "Bangalore" },
  { id: "ipl-27", team1: "SRH",  team2: "CSK",  date: "2026-04-18", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-28", team1: "KKR",  team2: "RR",   date: "2026-04-19", time: "15:30", venue: "Kolkata" },
  { id: "ipl-29", team1: "PBKS", team2: "LSG",  date: "2026-04-19", time: "19:30", venue: "Mohali" },
  { id: "ipl-30", team1: "GT",   team2: "MI",   date: "2026-04-20", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-31", team1: "SRH",  team2: "DC",   date: "2026-04-21", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-32", team1: "LSG",  team2: "RR",   date: "2026-04-22", time: "19:30", venue: "Lucknow" },
  { id: "ipl-33", team1: "MI",   team2: "CSK",  date: "2026-04-23", time: "19:30", venue: "Mumbai" },
  { id: "ipl-34", team1: "RCB",  team2: "GT",   date: "2026-04-24", time: "19:30", venue: "Bangalore" },
  { id: "ipl-35", team1: "DC",   team2: "PBKS", date: "2026-04-25", time: "15:30", venue: "Delhi" },
  { id: "ipl-36", team1: "RR",   team2: "SRH",  date: "2026-04-25", time: "19:30", venue: "Jaipur" },
  { id: "ipl-37", team1: "GT",   team2: "CSK",  date: "2026-04-26", time: "15:30", venue: "Ahmedabad" },
  { id: "ipl-38", team1: "LSG",  team2: "KKR",  date: "2026-04-26", time: "19:30", venue: "Lucknow" },
  { id: "ipl-39", team1: "DC",   team2: "RCB",  date: "2026-04-27", time: "19:30", venue: "Delhi" },
  { id: "ipl-40", team1: "PBKS", team2: "RR",   date: "2026-04-28", time: "19:30", venue: "Mohali" },
  { id: "ipl-41", team1: "MI",   team2: "SRH",  date: "2026-04-29", time: "19:30", venue: "Mumbai" },
  { id: "ipl-42", team1: "GT",   team2: "RCB",  date: "2026-04-30", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-43", team1: "RR",   team2: "DC",   date: "2026-05-01", time: "19:30", venue: "Jaipur" },
  { id: "ipl-44", team1: "CSK",  team2: "MI",   date: "2026-05-02", time: "19:30", venue: "Chennai" },
  { id: "ipl-45", team1: "SRH",  team2: "KKR",  date: "2026-05-03", time: "15:30", venue: "Hyderabad" },
  { id: "ipl-46", team1: "GT",   team2: "PBKS", date: "2026-05-03", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-47", team1: "MI",   team2: "LSG",  date: "2026-05-04", time: "19:30", venue: "Mumbai" },
  { id: "ipl-48", team1: "DC",   team2: "CSK",  date: "2026-05-05", time: "19:30", venue: "Delhi" },
  { id: "ipl-49", team1: "SRH",  team2: "PBKS", date: "2026-05-06", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-50", team1: "LSG",  team2: "RCB",  date: "2026-05-07", time: "19:30", venue: "Lucknow" },
  { id: "ipl-51", team1: "DC",   team2: "KKR",  date: "2026-05-08", time: "19:30", venue: "Delhi" },
  { id: "ipl-52", team1: "RR",   team2: "GT",   date: "2026-05-09", time: "19:30", venue: "Jaipur" },
  { id: "ipl-53", team1: "CSK",  team2: "LSG",  date: "2026-05-10", time: "15:30", venue: "Chennai" },
  { id: "ipl-54", team1: "RCB",  team2: "MI",   date: "2026-05-10", time: "19:30", venue: "Bangalore" },
  { id: "ipl-55", team1: "PBKS", team2: "DC",   date: "2026-05-11", time: "19:30", venue: "Mohali" },
  { id: "ipl-56", team1: "GT",   team2: "SRH",  date: "2026-05-12", time: "19:30", venue: "Ahmedabad" },
  { id: "ipl-57", team1: "RCB",  team2: "KKR",  date: "2026-05-13", time: "19:30", venue: "Bangalore" },
  { id: "ipl-58", team1: "PBKS", team2: "MI",   date: "2026-05-14", time: "19:30", venue: "Dharamsala" },
  { id: "ipl-59", team1: "LSG",  team2: "CSK",  date: "2026-05-15", time: "19:30", venue: "Lucknow" },
  { id: "ipl-60", team1: "KKR",  team2: "GT",   date: "2026-05-16", time: "19:30", venue: "Kolkata" },
  { id: "ipl-61", team1: "PBKS", team2: "RCB",  date: "2026-05-17", time: "15:30", venue: "Dharamsala" },
  { id: "ipl-62", team1: "DC",   team2: "RR",   date: "2026-05-17", time: "19:30", venue: "Delhi" },
  { id: "ipl-63", team1: "CSK",  team2: "SRH",  date: "2026-05-18", time: "19:30", venue: "Chennai" },
  { id: "ipl-64", team1: "RR",   team2: "LSG",  date: "2026-05-19", time: "19:30", venue: "Jaipur" },
  { id: "ipl-65", team1: "KKR",  team2: "MI",   date: "2026-05-20", time: "19:30", venue: "Kolkata" },
  { id: "ipl-66", team1: "CSK",  team2: "GT",   date: "2026-05-21", time: "19:30", venue: "Chennai" },
  { id: "ipl-67", team1: "SRH",  team2: "RCB",  date: "2026-05-22", time: "19:30", venue: "Hyderabad" },
  { id: "ipl-68", team1: "LSG",  team2: "PBKS", date: "2026-05-23", time: "19:30", venue: "Lucknow" },
  { id: "ipl-69", team1: "MI",   team2: "RR",   date: "2026-05-24", time: "15:30", venue: "Mumbai" },
  { id: "ipl-70", team1: "KKR",  team2: "DC",   date: "2026-05-24", time: "19:30", venue: "Kolkata" },
];

// ── Helper: check if a contest's match has started based on IST time ──────────
function isMatchStarted(contest) {
  if (contest.status === "locked") return true;
  const iplMatch = IPL_MATCHES.find(
    m => m.team1 === contest.team1 && m.team2 === contest.team2
  );
  if (!iplMatch || !iplMatch.time) return false;
  const matchDate = new Date(`${iplMatch.date}T${iplMatch.time}:00+05:30`);
  return new Date() >= matchDate;
}

// ── Mode Picker Component ─────────────────────────────────────────────────────
function ModePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={S.label}>Game Mode</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { key: "bet",       icon: "🎯", label: "Bet",        desc: "Pick a team, stake points. Winning team takes the pot." },
          { key: "fantasy11", icon: "🏏", label: "Fantasy 11", desc: "Build your 11-player squad. Highest fantasy points wins 2×." },
        ].map(opt => (
          <div key={opt.key} onClick={() => onChange(opt.key)} style={{
            padding: "12px 14px", borderRadius: 10, cursor: "pointer",
            border: value === opt.key ? "1.5px solid #7F77DD" : "0.5px solid #d3d1c7",
            background: value === opt.key ? "#EEEDFE" : "#FAFAF7", transition: "all 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{opt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: value === opt.key ? "#3C3489" : "#444441" }}>{opt.label}</span>
              {value === opt.key && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#7F77DD" }} />}
            </div>
            <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.4 }}>{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fantasy11 Info Banner ─────────────────────────────────────────────────────
function Fantasy11Banner({ matchId, matchLabel, teams }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1117, #1a2236)",
      border: "1px solid #ffd16644",
      borderRadius: 10, padding: "14px 16px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🏏</span>
        <span style={{ fontWeight: 700, color: "#ffd166", fontSize: 14 }}>Fantasy 11 Mode</span>
      </div>
      <div style={{ fontSize: 12, color: "#7d8590", lineHeight: 1.6 }}>
        Both players must build an 11-player squad for <b style={{ color: "#e6edf3" }}>{matchLabel}</b>.
        Pick from <b style={{ color: "#e6edf3" }}>{teams?.join(" & ")}</b> squads.
        Whoever scores the highest fantasy points wins <b style={{ color: "#00C896" }}>2× the wager</b>.
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#ffd166", background: "#ffd16610", borderRadius: 6, padding: "4px 8px", display: "inline-block" }}>
        ⚡ After creating this challenge, go to Fantasy 11 tab to build your squad for {matchLabel}
      </div>
    </div>
  );
}

// ── FIX 1: Added "live" entry to statusBadge ──────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:   { label: "Pending",   color: "#BA7517", bg: "#FAEEDA" },
    active:    { label: "Active",    color: "#085041", bg: "#E1F5EE" },
    settled:   { label: "Settled",   color: "#3C3489", bg: "#EEEDFE" },
    cancelled: { label: "Cancelled", color: "#5F5E5A", bg: "#F1EFE8" },
    open:      { label: "Open",      color: "#085041", bg: "#E1F5EE" },
    locked:    { label: "Locked",    color: "#BA7517", bg: "#FAEEDA" },
    live:      { label: "🔴 Live",   color: "#8B0000", bg: "#FFE4E4" }, // ✅ NEW
  };
  const s = map[status] || map.cancelled;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color }}>
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

function PointsInfoBox({ icon, label, value, color }) {
  return (
    <div style={{
      flex: 1, textAlign: "center", padding: "10px 8px",
      background: color ? `${color}11` : "#F8F7F3",
      borderRadius: 8, border: `1px solid ${color ? `${color}33` : "#e8e6dc"}`,
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || "#444441" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#888780", marginTop: 1 }}>{label}</div>
    </div>
  );
}

function RecipientTagInput({ recipients, onChange, maxRecipients = 5 }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);
  function addRecipient(val) {
    const trimmed = val.trim().replace(/,$/, "");
    if (trimmed && !recipients.includes(trimmed) && recipients.length < maxRecipients) onChange([...recipients, trimmed]);
    setInputVal("");
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRecipient(inputVal); }
    else if (e.key === "Backspace" && inputVal === "" && recipients.length > 0) onChange(recipients.slice(0, -1));
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "#fff", cursor: "text", minHeight: 42, marginBottom: 12, boxSizing: "border-box" }} onClick={() => inputRef.current?.focus()}>
      {recipients.map((r, i) => (
        <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EEEDFE", border: "0.5px solid #AFA9EC", color: "#3C3489", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>
          {r}
          <span onClick={e => { e.stopPropagation(); onChange(recipients.filter((_, j) => j !== i)); }} style={{ cursor: "pointer", color: "#7F77DD", fontSize: 14, lineHeight: 1 }}>×</span>
        </span>
      ))}
      {recipients.length < maxRecipients && (
        <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => inputVal.trim() && addRecipient(inputVal)}
          placeholder={recipients.length === 0 ? "Type username and press Enter..." : "Add another..."}
          style={{ border: "none", outline: "none", fontSize: 13, color: "#444441", background: "transparent", minWidth: 160, flex: 1 }} />
      )}
    </div>
  );
}

function PrivacyToggle({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
      {[{ key: "public", icon: "🌐", label: "Public", desc: "Anyone can see & join" }, { key: "private", icon: "🔒", label: "Private", desc: "Password required to join" }].map(opt => (
        <div key={opt.key} onClick={() => onChange(opt.key)} style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", border: value === opt.key ? "1.5px solid #7F77DD" : "0.5px solid #d3d1c7", background: value === opt.key ? "#EEEDFE" : "#FAFAF7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15 }}>{opt.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: value === opt.key ? "#3C3489" : "#444441" }}>{opt.label}</span>
            {value === opt.key && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#7F77DD" }} />}
          </div>
          <div style={{ fontSize: 11, color: "#888780" }}>{opt.desc}</div>
        </div>
      ))}
    </div>
  );
}

function PasswordField({ value, onChange, label = "Password" }) {
  function generate() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pw = "";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    onChange(pw);
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={S.label}>{label}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input style={{ ...S.input, marginBottom: 0, flex: 1, fontFamily: "monospace", letterSpacing: "0.1em" }} placeholder="Set a join password..." value={value} onChange={e => onChange(e.target.value)} />
        <button type="button" onClick={generate} style={{ padding: "9px 14px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "#F1EFE8", color: "#444441", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>Generate</button>
      </div>
      <div style={{ fontSize: 11, color: "#888780", marginTop: 4 }}>Share this password with invited players so they can join.</div>
    </div>
  );
}

function PasswordEntryModal({ contest, matchTeams, onConfirm, onCancel }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [pwVerified, setPwVerified] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  function handleVerify() {
    if (!pw.trim()) { setErr("Password required"); return; }
    setPwVerified(true); setErr("");
  }
  function handleConfirm() {
    if (!selectedTeam) { setErr("Pick your team first"); return; }
    onConfirm(pw.trim(), selectedTeam);
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", width: "100%", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}>
        {!pwVerified ? (
          <>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🔒 Private Contest</div>
            <div style={{ fontSize: 13, color: "#888780", marginBottom: 20 }}><strong style={{ color: "#444441" }}>{contest.name}</strong> is private — enter the password to join.</div>
            <div style={S.label}>Enter password</div>
            <input style={{ ...S.input, fontFamily: "monospace", letterSpacing: "0.1em" }} placeholder="Enter join password..." value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleVerify()} autoFocus />
            {err && <div style={{ fontSize: 12, color: "#A32D2D", marginBottom: 8 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn()} onClick={handleVerify}>Continue →</button>
              <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🏏 Pick Your Team</div>
            <div style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>Joining <strong style={{ color: "#444441" }}>{contest.name}</strong></div>
            <div style={S.label}>Pick your team</div>
            <div style={S.pillRow}>
              {matchTeams.map(t => (
                <button key={t} style={S.pill(selectedTeam === t)} onClick={() => { setSelectedTeam(t); setErr(""); }}>{t}</button>
              ))}
            </div>
            {err && <div style={{ fontSize: 12, color: "#A32D2D", marginBottom: 8 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn("#1D9E75")} onClick={handleConfirm}>Confirm — Pay {contest.entryFee} pts ✓</button>
              <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  container: { padding: "24px 0", maxWidth: 700, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 500 },
  tabs: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
  tab: (active) => ({ padding: "6px 16px", borderRadius: 8, border: "0.5px solid", borderColor: active ? "#7F77DD" : "#d3d1c7", background: active ? "#EEEDFE" : "transparent", color: active ? "#3C3489" : "#888780", cursor: "pointer", fontSize: 13, fontWeight: active ? 500 : 400 }),
  card: { background: "#fff", border: "0.5px solid #d3d1c7", borderRadius: 12, padding: "16px 20px", marginBottom: 10 },
  cardDark: { background: "#F1EFE8", border: "0.5px solid #d3d1c7", borderRadius: 12, padding: "16px 20px", marginBottom: 10 },
  label: { fontSize: 11, color: "#888780", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #d3d1c7", fontSize: 14, marginBottom: 12, boxSizing: "border-box" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  pill: (active) => ({ padding: "6px 14px", borderRadius: 99, border: "0.5px solid", borderColor: active ? "#7F77DD" : "#d3d1c7", background: active ? "#EEEDFE" : "transparent", color: active ? "#3C3489" : "#444441", cursor: "pointer", fontSize: 13 }),
  iplCard: (active) => ({ padding: "10px 14px", borderRadius: 10, border: "1px solid", borderColor: active ? "#7F77DD" : "#d3d1c7", background: active ? "#EEEDFE" : "#fff", cursor: "pointer", marginBottom: 8, transition: "all 0.15s" }),
  btn: (color) => ({ padding: "9px 20px", borderRadius: 8, border: "none", background: color || "#7F77DD", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }),
  btnGhost: { padding: "8px 16px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "transparent", color: "#444441", cursor: "pointer", fontSize: 13 },
  btnDisabled: { padding: "9px 20px", borderRadius: 8, border: "0.5px solid #d3d1c7", background: "#F1EFE8", color: "#b0ada4", cursor: "not-allowed", fontSize: 14, fontWeight: 500 },
  row: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  flash: (type) => ({ padding: "10px 16px", borderRadius: 8, marginBottom: 14, fontSize: 13, background: type === "error" ? "#FCEBEB" : "#E1F5EE", color: type === "error" ? "#A32D2D" : "#085041", border: `0.5px solid ${type === "error" ? "#F09595" : "#5DCAA5"}` }),
  vsBox: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F1EFE8", borderRadius: 8, marginBottom: 12 },
  teamChip: (mine) => ({ flex: 1, textAlign: "center", padding: "8px 12px", borderRadius: 8, background: mine ? "#EEEDFE" : "#FAECE7", color: mine ? "#3C3489" : "#712B13", fontWeight: 500, fontSize: 14 }),
  progressBar: () => ({ height: 6, borderRadius: 99, background: "#E8E6DC", marginTop: 8, overflow: "hidden" }),
  progressFill: (pct) => ({ height: "100%", borderRadius: 99, width: `${pct}%`, background: pct >= 100 ? "#E24B4A" : "#1D9E75", transition: "width 0.3s" }),
  vsMatchup: { display: "flex", alignItems: "stretch", gap: 0, borderRadius: 10, overflow: "hidden", marginBottom: 14, border: "1px solid #e8e6dc" },
  vsTeamBox: (highlight) => ({ flex: 1, padding: "14px 16px", textAlign: "center", background: highlight ? "#EEEDFE" : "#F8F7F3" }),
  vsTeamName: (highlight) => ({ fontWeight: 700, fontSize: 18, color: highlight ? "#3C3489" : "#444441" }),
  vsTeamSub: { fontSize: 11, color: "#888780", marginTop: 3 },
  vsDivider: { display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", background: "#F1EFE8", fontSize: 11, fontWeight: 700, color: "#888780", letterSpacing: "0.05em" },
  selectablePill: (selected, disabled) => ({ padding: "8px 18px", borderRadius: 99, border: "1.5px solid", borderColor: selected ? "#7F77DD" : disabled ? "#e8e6dc" : "#d3d1c7", background: selected ? "#EEEDFE" : disabled ? "#f8f7f3" : "transparent", color: selected ? "#3C3489" : disabled ? "#c0bdb5" : "#444441", cursor: disabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: selected ? 600 : 400, opacity: disabled ? 0.6 : 1, transition: "all 0.15s" }),
  pointsRow: { display: "flex", gap: 8, marginBottom: 14 },
  autoSettleNotice: { marginTop: 12, fontSize: 12, color: "#888780", padding: "8px 12px", borderRadius: 8, background: "#F8F7F3", border: "0.5px solid #e8e6dc", display: "flex", alignItems: "center", gap: 6 },
  matchStartedWarn: { fontSize: 12, color: "#BA7517", marginTop: 6, display: "flex", alignItems: "center", gap: 5 },
  privateBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #AFA9EC" },
  f11badge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#ffd16622", color: "#8a6a00", border: "0.5px solid #ffd166" },
};

function IPLMatchPicker({ selectedMatch, onSelect }) {
  const scrollRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (!scrollRef.current) return;
    const firstUpcomingIndex = IPL_MATCHES.findIndex(m => m.date >= today);
    if (firstUpcomingIndex > 0) scrollRef.current.scrollTop = firstUpcomingIndex * 62;
    else scrollRef.current.scrollTop = 0;
  }, []);
  return (
    <div ref={scrollRef} style={{ maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
      {IPL_MATCHES.map(match => {
        const isPast = match.date < today;
        return (
          <div key={match.id} style={{ ...S.iplCard(selectedMatch?.id === match.id), opacity: isPast ? 0.45 : 1 }} onClick={() => onSelect(match)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{match.team1} <span style={{ color: "#888780", fontWeight: 400 }}>vs</span> {match.team2}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isPast && <span style={{ fontSize: 10, color: "#888780", background: "#F1EFE8", padding: "1px 6px", borderRadius: 99 }}>past</span>}
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

function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, borderRadius: 10, border: "0.5px solid #d3d1c7", background: "#FAFAF7", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>💡</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#444441" }}>How Points Work</span>
        </div>
        <span style={{ fontSize: 13, color: "#888780", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid #e8e6dc" }}>
          <div style={{ marginTop: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3C3489", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🎯 Bet Mode</div>
            {[
              { icon: "💰", text: "Pick a team and stake points. Winner takes the full pot (2× wager)." },
              { icon: "🏆", text: "Settled automatically when the match ends." },
              { icon: "🤝", text: "Draw? Both players get their wager refunded." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "#444441", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "#e8e6dc", margin: "12px 0" }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8a6a00", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🏏 Fantasy 11 Mode</div>
            {[
              { icon: "🏏", text: "Both players build an 11-player squad from the match squads." },
              { icon: "⭐", text: "Captain scores 2× points, Vice-Captain 1.5× points." },
              { icon: "🏆", text: "Whoever's squad scores the highest fantasy points wins 2× the wager." },
              { icon: "📊", text: "Points are awarded after the match ends based on real player performance." },
              { icon: "⚡", text: "After creating a Fantasy 11 challenge, go to the Fantasy 11 tab to lock your squad." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "#444441", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "#e8e6dc", margin: "12px 0" }} />
          <div style={{ background: "#EEEDFE", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3C3489", marginBottom: 6 }}>📘 Quick Example</div>
            <div style={{ fontSize: 12, color: "#3C3489", lineHeight: 1.6 }}>
              Bet mode: You wager <strong>100 pts</strong> on MI. Opponent bets on KKR. MI wins → <strong>You get 200 pts</strong>.<br />
              Fantasy 11 mode: You wager <strong>100 pts</strong>. Your squad scores 320 pts, opponent's scores 285 pts → <strong>You get 200 pts</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Multiplayer({ username, points, setPoints }) {
  const [view, setView] = useState("list");

  // Challenge state
  const [challenges, setChallenges]           = useState([]);
  const [challengeMode, setChallengeMode]     = useState("bet");
  const [challengeVisibility, setChallengeVisibility] = useState("public");
  const [invitedPlayers, setInvitedPlayers]   = useState([]);
  const [challengePassword, setChallengePassword] = useState("");
  const [opponentName, setOpponentName]       = useState("");
  const [selectedSport, setSelectedSport]     = useState(null);
  const [selectedIPLMatch, setSelectedIPLMatch] = useState(null);
  const [myTeam, setMyTeam]                   = useState(null);
  const [matchLabel, setMatchLabel]           = useState("");
  const [wager, setWager]                     = useState("");
  const [acceptingId, setAcceptingId]         = useState(null);
  const [acceptTeam, setAcceptTeam]           = useState(null);

  // Contest state
  const [contests, setContests]             = useState([]);
  const [openContests, setOpenContests]     = useState([]);
  const [contestMode, setContestMode]       = useState("bet");
  const [contestName, setContestName]       = useState("");
  const [cSport, setCsport]                 = useState(null);
  const [cIPLMatch, setCIplMatch]           = useState(null);
  const [cMyTeam, setCMyTeam]               = useState(null);
  const [cMatchLabel, setCMatchLabel]       = useState("");
  const [cEntryFee, setCEntryFee]           = useState("");
  const [cMaxPlayers, setCMaxPlayers]       = useState("10");
  const [cVisibility, setCVisibility]       = useState("public");
  const [cPassword, setCPassword]           = useState("");
  const [joiningContest, setJoiningContest] = useState(null);
  const [joinTeam, setJoinTeam]             = useState(null);
  const [passwordModal, setPasswordModal]   = useState(null);

  const [f11ChallengeMatch, setF11ChallengeMatch] = useState(null);

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [serverOnline, setServerOnline] = useState(true);

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
    fetchChallenges(); fetchMyContests(); fetchOpenContests();
    const iv = setInterval(() => { fetchChallenges(); fetchMyContests(); fetchOpenContests(); }, 10000);
    return () => clearInterval(iv);
  }, [fetchChallenges, fetchMyContests, fetchOpenContests]);

  const pendingIncoming = challenges.filter(
    c => c.status === "pending" && (
      c.opponent === username ||
      (c.visibility === "private" && c.invitedPlayers?.includes(username))
    )
  );
  const myChallenges = challenges.filter(c => c.status !== "cancelled");

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

  async function handleCreate() {
    const isPrivate = challengeVisibility === "private";
    const isF11 = challengeMode === "fantasy11";

    if (isPrivate) {
      if (invitedPlayers.length === 0) return flash("error", "Add at least one player to invite");
      if (!challengePassword.trim())   return flash("error", "Set a password for the private challenge");
    } else {
      if (!opponentName.trim()) return flash("error", "Enter an opponent username");
    }
    if (!selectedSport) return flash("error", "Pick a sport");
    if (selectedSport.id === "cricket" && !selectedIPLMatch) return flash("error", "Please pick an IPL match");
    if (!matchLabel.trim()) return flash("error", "Enter a match label");
    if (!isF11 && !myTeam) return flash("error", "Pick your team");

    const w = parseInt(wager);
    if (!w || w <= 0) return flash("error", "Enter a valid wager");
    if (w > points)   return flash("error", "Not enough points");

    setLoading(true);
    try {
      const body = {
        challenger: username,
        sport: selectedSport.id,
        matchLabel,
        matchId: selectedIPLMatch ? selectedIPLMatch.id : "manual",
        challengerTeam: isF11 ? "fantasy11" : myTeam,
        wager: w,
        team1: selectedIPLMatch?.team1 || null,
        team2: selectedIPLMatch?.team2 || null,
        visibility: challengeVisibility,
        mode: challengeMode,
        ...(isPrivate
          ? { invitedPlayers, password: challengePassword.trim() }
          : { opponent: opponentName.trim() }
        ),
      };

      const res = await fetch(`${API}/challenge/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.challengerPoints);
        const msg = isF11
          ? `Fantasy 11 challenge created! Now go to the Fantasy 11 tab to build your squad for ${matchLabel}.`
          : isPrivate
            ? `Private challenge created! Share the password with ${invitedPlayers.join(", ")}.`
            : `Challenge sent to ${opponentName}! ${w} pts escrowed.`;
        flash("success", msg);

        if (isF11 && selectedIPLMatch) {
          setF11ChallengeMatch({
            matchId: selectedIPLMatch.id,
            matchLabel,
            teams: [selectedIPLMatch.team1, selectedIPLMatch.team2],
          });
        }

        setView("list");
        setOpponentName(""); setSelectedSport(null); setMyTeam(null);
        setMatchLabel(""); setWager(""); setSelectedIPLMatch(null);
        setChallengeVisibility("public"); setInvitedPlayers([]); setChallengePassword("");
        setChallengeMode("bet");
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
        body: JSON.stringify({ challengeId, opponentTeam: acceptTeam, username }),
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

  async function handleCreateContest() {
    const isF11 = contestMode === "fantasy11";
    if (!contestName.trim()) return flash("error", "Enter a contest name");
    if (!cSport) return flash("error", "Pick a sport");
    if (cSport.id === "cricket" && !cIPLMatch) return flash("error", "Please pick an IPL match");
    if (!isF11 && !cMyTeam) return flash("error", "Pick your team");
    if (!cMatchLabel.trim()) return flash("error", "Enter a match label");
    const fee = parseInt(cEntryFee);
    if (!fee || fee <= 0) return flash("error", "Enter a valid entry fee");
    if (fee > points) return flash("error", "Not enough points");
    const max = parseInt(cMaxPlayers);
    if (!max || max < 2 || max > 12) return flash("error", "Max players must be 2–12");
    if (cVisibility === "private" && !cPassword.trim()) return flash("error", "Set a password for the private contest");

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
          matchId: cIPLMatch ? cIPLMatch.id : "manual",
          team1: cIPLMatch?.team1 || null,
          team2: cIPLMatch?.team2 || null,
          entryFee: fee,
          maxPlayers: max,
          myTeam: isF11 ? "fantasy11" : cMyTeam,
          mode: contestMode,
          visibility: cVisibility,
          ...(cVisibility === "private" ? { password: cPassword.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.creatorPoints);
        flash("success", isF11
          ? "Fantasy 11 contest created! Go to Fantasy 11 tab to build your squad."
          : cVisibility === "private"
            ? "Private contest created! Share the password with your friends."
            : "Contest created! Others can now join.");
        setContestName(""); setCsport(null); setCMyTeam(null);
        setCMatchLabel(""); setCEntryFee(""); setCMaxPlayers("10"); setCIplMatch(null);
        setCVisibility("public"); setCPassword(""); setContestMode("bet");
        await fetchMyContests(); await fetchOpenContests();
        setView("contests");
      } else { flash("error", data.message || "Failed"); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  async function handleJoinContest(contestId, password, team) {
    const teamToUse = team || joinTeam;
    if (!teamToUse) return flash("error", "Pick a team first");
    setLoading(true);
    try {
      const res = await fetch(`${API}/contest/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, username, team: teamToUse, ...(password ? { password } : {}) }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.userPoints);
        flash("success", "Joined the contest!");
        setJoiningContest(null); setJoinTeam(null); setPasswordModal(null);
        fetchMyContests(); fetchOpenContests();
      } else { flash("error", data.message || "Failed — check your password and try again"); }
    } catch { flash("error", "Can't connect to server"); }
    setLoading(false);
  }

  function initiateJoin(contest) {
    setJoinTeam(null);
    if (contest.visibility === "private") { setPasswordModal(contest); setJoiningContest(null); }
    else { setJoiningContest(contest._id); }
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

  function getContestTeams(c) {
    if (c.team1 && c.team2) return [c.team1, c.team2];
    return SPORTS.find(s => s.id === c.sport)?.teams || [];
  }

  const isF11Challenge = (c) => c.mode === "fantasy11" || c.challengerTeam === "fantasy11";
  const isF11Contest   = (c) => c.mode === "fantasy11" || c.myTeam === "fantasy11";

  return (
    <div style={S.container}>
      {passwordModal && (
        <PasswordEntryModal
          contest={passwordModal}
          matchTeams={getContestTeams(passwordModal)}
          onConfirm={(pw, team) => handleJoinContest(passwordModal._id, pw, team)}
          onCancel={() => { setPasswordModal(null); setJoiningContest(null); setJoinTeam(null); }}
        />
      )}

      <div style={S.header}>
        <div style={S.title}>⚔️ Multiplayer</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, background: serverOnline ? "#E1F5EE" : "#FCEBEB", color: serverOnline ? "#085041" : "#A32D2D" }}>
            {serverOnline ? "🟢 Server Online" : "🔴 Server Offline"}
          </span>
          {pendingIncoming.length > 0 && (
            <span style={{ background: "#E24B4A", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
              {pendingIncoming.length} incoming
            </span>
          )}
        </div>
      </div>

      {!serverOnline && <div style={S.flash("error")}>⚠️ Can't connect to server.</div>}
      {error   && <div style={S.flash("error")}>{error}</div>}
      {success && <div style={S.flash("success")}>{success}</div>}

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

      {(view === "list" || view === "contests") && <HowItWorks />}

      {/* ── Inline Fantasy11 Builder ── */}
      {f11ChallengeMatch && (view === "list") && (
        <div style={{ marginBottom: 20, background: "#0d1117", borderRadius: 16, padding: 16, border: "1px solid #ffd16644" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#ffd166", fontSize: 15 }}>🏏 Build Your Fantasy 11 Squad</div>
            <button onClick={() => setF11ChallengeMatch(null)} style={{ background: "none", border: "1px solid #30363d", color: "#7d8590", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Done</button>
          </div>
          <Fantasy11
            username={username}
            points={points}
            setPoints={setPoints}
            matchInfo={f11ChallengeMatch}
            matchStatus={null}
          />
        </div>
      )}

      {/* ── My Challenges ── */}
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
            const isF11        = isF11Challenge(c);
            return (
              <div key={c._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#888780" }}>{sport?.emoji} {c.matchLabel}</span>
                      {c.visibility === "private" && <span style={S.privateBadge}>🔒 Private</span>}
                      {isF11 && <span style={S.f11badge}>🏏 Fantasy 11</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>vs <span style={{ color: "#7F77DD" }}>{opponent || "Invited players"}</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>{statusBadge(c.status)}</div>
                </div>

                <div style={S.pointsRow}>
                  <PointsInfoBox icon="💰" label="Your Wager" value={`${c.wager} pts`} color="#BA7517" />
                  <PointsInfoBox icon="🏆" label="Win Prize" value={`${c.wager * 2} pts`} color="#1D9E75" />
                  <PointsInfoBox icon="📈" label="Profit" value={`+${c.wager} pts`} color="#7F77DD" />
                </div>

                {isF11 ? (
                  <div style={{ background: "#ffd16610", border: "1px solid #ffd16644", borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "#8a6a00" }}>
                    🏏 Fantasy 11 — highest squad points wins. Build your squad in the <b>Fantasy 11 tab</b> for <b>{c.matchLabel}</b>.
                  </div>
                ) : (
                  <div style={S.vsBox}>
                    <div style={S.teamChip(true)}>{myTeamName || <span style={{ opacity: 0.5 }}>You</span>}</div>
                    <div style={{ fontSize: 12, color: "#888780", fontWeight: 500 }}>VS</div>
                    {theirTeam
                      ? <div style={S.teamChip(false)}>{opponent}: {theirTeam}</div>
                      : <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#888780", fontStyle: "italic" }}>{opponent ? `${opponent} hasn't picked yet...` : "Waiting for invited player..."}</div>
                    }
                  </div>
                )}

                {c.status === "active" && <div style={S.autoSettleNotice}>⏳ Auto-settling after match ends via Cricket API</div>}
                {c.status === "settled" && (
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, padding: "10px 14px", borderRadius: 8, background: c.winner === username ? "#E1F5EE" : c.winner === "draw" ? "#F1EFE8" : "#FCEBEB", color: c.winner === username ? "#0F6E56" : c.winner === "draw" ? "#888780" : "#993C1D" }}>
                    {c.winner === username ? `🏆 You won ${c.wager * 2} pts! (+${c.wager} profit)` : c.winner === "draw" ? `🤝 Draw — ${c.wager} pts refunded` : `😢 ${c.winner} won · You lost ${c.wager} pts`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Challenge ── */}
      {view === "create" && (
        <div style={S.card}>
          <ModePicker value={challengeMode} onChange={(m) => { setChallengeMode(m); setMyTeam(null); }} />

          <div style={S.label}>Challenge type</div>
          <PrivacyToggle value={challengeVisibility} onChange={(v) => {
            setChallengeVisibility(v); setInvitedPlayers([]); setChallengePassword(""); setOpponentName("");
          }} />

          {challengeVisibility === "private" ? (
            <>
              <div style={{ background: "#EEEDFE", border: "0.5px solid #AFA9EC", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#3C3489", display: "flex", gap: 8 }}>
                <span>🔒</span><span>Only {invitedPlayers.length > 0 ? invitedPlayers.join(", ") : "the players you invite"} will be able to see and join.</span>
              </div>
              <div style={S.label}>Invite players (up to 5)</div>
              <RecipientTagInput recipients={invitedPlayers} onChange={setInvitedPlayers} maxRecipients={5} />
              <PasswordField value={challengePassword} onChange={setChallengePassword} label="Challenge password" />
            </>
          ) : (
            <>
              <div style={S.label}>Opponent username</div>
              <input style={S.input} placeholder="Enter their username..." value={opponentName} onChange={e => setOpponentName(e.target.value)} />
            </>
          )}

          <div style={S.label}>Sport</div>
          <div style={S.pillRow}>
            {SPORTS.map(s => (
              <button key={s.id} style={S.pill(selectedSport?.id === s.id)} onClick={() => { setSelectedSport(s); setMyTeam(null); setSelectedIPLMatch(null); setMatchLabel(""); }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {selectedSport?.id === "cricket" && (
            <>
              <div style={S.label}>🏏 Pick an IPL 2026 Match</div>
              <IPLMatchPicker selectedMatch={selectedIPLMatch} onSelect={(match) => handleIPLMatchSelect(match, setSelectedIPLMatch, setMatchLabel, setMyTeam)} />
            </>
          )}

          {challengeMode === "fantasy11" && selectedIPLMatch ? (
            <Fantasy11Banner matchId={selectedIPLMatch.id} matchLabel={matchLabel} teams={[selectedIPLMatch.team1, selectedIPLMatch.team2]} />
          ) : challengeMode === "bet" && selectedSport && (
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
          <input style={S.input} placeholder="e.g. MI vs KKR – IPL 2026" value={matchLabel} onChange={e => setMatchLabel(e.target.value)} />

          <div style={S.label}>Wager (your points: {points.toLocaleString()})</div>
          <div style={S.pillRow}>
            {[50, 100, 250, 500].map(amt => (
              <button key={amt} style={S.pill(parseInt(wager) === amt)} onClick={() => setWager(String(Math.min(amt, points)))}>{amt}</button>
            ))}
            <button style={S.pill(parseInt(wager) === points)} onClick={() => setWager(String(points))}>All in 🔥</button>
          </div>
          <input style={S.input} type="number" placeholder="Or enter custom amount..." value={wager} onChange={e => setWager(e.target.value)} max={points} />

          {parseInt(wager) > 0 && (
            <div style={S.pointsRow}>
              <PointsInfoBox icon="💰" label="You Wager" value={`${wager} pts`} color="#BA7517" />
              <PointsInfoBox icon="🏆" label="If You Win" value={`${parseInt(wager) * 2} pts`} color="#1D9E75" />
              <PointsInfoBox icon="📈" label="Profit" value={`+${wager} pts`} color="#7F77DD" />
            </div>
          )}

          <div style={S.row}>
            <button style={S.btn(challengeMode === "fantasy11" ? "#ffd166" : "#7F77DD")} onClick={handleCreate} disabled={loading}>
              {loading ? "Sending..." : challengeMode === "fantasy11" ? "🏏 Create Fantasy 11 Challenge" : challengeVisibility === "private" ? "Send Private Challenge 🔒" : "Send Challenge ⚡"}
            </button>
            <button style={S.btnGhost} onClick={() => setView("list")}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Incoming Challenges ── */}
      {view === "incoming" && (
        <div>
          {pendingIncoming.length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 32 }}>No incoming challenges right now.</div>
          )}
          {pendingIncoming.map(c => {
            const sport      = SPORTS.find(s => s.id === c.sport);
            const allTeams   = getChallengeTeams(c);
            const takenTeam  = c.challengerTeam;
            const myOptions  = allTeams.filter(t => t !== takenTeam && t !== "fantasy11");
            const isF11      = isF11Challenge(c);

            return (
              <div key={c._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#888780" }}>{sport?.emoji} {c.matchLabel}</span>
                      {c.visibility === "private" && <span style={S.privateBadge}>🔒 Private</span>}
                      {isF11 && <span style={S.f11badge}>🏏 Fantasy 11</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      <span style={{ color: "#7F77DD" }}>{c.challenger}</span>
                      <span style={{ color: "#888780", fontWeight: 400 }}> challenges you!</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>{statusBadge(c.status)}</div>
                </div>

                <div style={S.pointsRow}>
                  <PointsInfoBox icon="💰" label="Entry Cost" value={`${c.wager} pts`} color="#BA7517" />
                  <PointsInfoBox icon="🏆" label="Prize Pool" value={`${c.wager * 2} pts`} color="#1D9E75" />
                  <PointsInfoBox icon="📈" label="Profit" value={`+${c.wager} pts`} color="#7F77DD" />
                </div>

                {isF11 ? (
                  <div style={{ background: "#ffd16610", border: "1px solid #ffd16644", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#8a6a00" }}>
                    🏏 Fantasy 11 challenge — accept to stake {c.wager} pts, then build your squad in the Fantasy 11 tab for <b>{c.matchLabel}</b>. Highest fantasy points wins!
                  </div>
                ) : (
                  <div style={S.vsMatchup}>
                    <div style={S.vsTeamBox(true)}>
                      <div style={S.vsTeamName(true)}>{allTeams[0] || "—"}</div>
                      <div style={S.vsTeamSub}>{c.challenger} picked this</div>
                    </div>
                    <div style={S.vsDivider}>VS</div>
                    <div style={S.vsTeamBox(false)}>
                      <div style={S.vsTeamName(false)}>{allTeams[1] || "—"}</div>
                      <div style={S.vsTeamSub}>Your side</div>
                    </div>
                  </div>
                )}

                {acceptingId === c._id ? (
                  <div>
                    {!isF11 && (
                      <>
                        <div style={S.label}>Confirm your team pick</div>
                        <div style={S.pillRow}>
                          {myOptions.map(t => (
                            <button key={t} style={S.selectablePill(acceptTeam === t, false)} onClick={() => setAcceptTeam(t)}>{t}{acceptTeam === t && " ✓"}</button>
                          ))}
                          <button key={takenTeam} style={S.selectablePill(false, true)} disabled title={`${c.challenger} already picked this team`}>{takenTeam} (taken)</button>
                        </div>
                      </>
                    )}
                    {isF11 && (
                      <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 12 }}>
                        After accepting, go to <b>Fantasy 11 tab → {c.matchLabel}</b> to build your squad.
                      </div>
                    )}
                    <div style={S.row}>
                      <button style={S.btn("#1D9E75")} onClick={() => handleAccept(c._id)} disabled={loading || (!isF11 && !acceptTeam)}>
                        {loading ? "Accepting..." : `Accept & Pay ${c.wager} pts ✓`}
                      </button>
                      <button style={S.btnGhost} onClick={() => { setAcceptingId(null); setAcceptTeam(null); }}>Back</button>
                    </div>
                  </div>
                ) : (
                  <div style={S.row}>
                    <button style={S.btn("#1D9E75")} onClick={() => { setAcceptingId(c._id); setAcceptTeam(isF11 ? "fantasy11" : (myOptions[0] || null)); }}>
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

      {/* ── Contests List ── */}
      {view === "contests" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 10 }}>My Contests</div>
          {contests.length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 24, marginBottom: 16 }}>
              {serverOnline ? "You haven't joined or created any contests yet." : "⚠️ Can't load contests — server offline."}
            </div>
          )}
          {contests.map(c => {
            const myEntry   = c.participants.find(p => p.username === username);
            const totalPot  = c.entryFee * c.participants.length;
            const pct       = Math.round((c.participants.length / c.maxPlayers) * 100);
            const isCreator = c.createdBy === username;
            const isF11     = isF11Contest(c) || c.mode === "fantasy11";

            // ✅ FIX: Use actual IST match time to determine if match has started
            const matchStarted = isMatchStarted(c);

            // ✅ FIX: Show "Live" badge when match is ongoing but not yet settled
            const displayStatus =
              (c.status === "open" || c.status === "locked") && matchStarted
                ? "live"
                : c.status;

            return (
              <div key={c._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                      {c.visibility === "private" && <span style={S.privateBadge}>🔒 Private</span>}
                      {isF11 && <span style={S.f11badge}>🏏 Fantasy 11</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>🏏 {c.matchLabel}</div>
                  </div>
                  {/* ✅ FIX: Use displayStatus so badge shows "Live" during match */}
                  <div style={{ textAlign: "right" }}>{statusBadge(displayStatus)}</div>
                </div>

                {isF11 && (
                  <div style={{ background: "#ffd16610", border: "1px solid #ffd16633", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#8a6a00" }}>
                    🏏 Fantasy 11 contest — build your squad in the Fantasy 11 tab for <b>{c.matchLabel}</b>. Highest points wins.
                  </div>
                )}

                <div style={S.pointsRow}>
                  <PointsInfoBox icon="🎟️" label="Entry Fee" value={`${c.entryFee} pts`} color="#BA7517" />
                  <PointsInfoBox icon="💰" label="Total Pot" value={`${totalPot} pts`} color="#7F77DD" />
                  <PointsInfoBox icon="🏆" label="Max Prize" value={`${totalPot} pts`} color="#1D9E75" />
                </div>

                <div style={{ fontSize: 12, color: "#444441", marginBottom: 4 }}>👥 {c.participants.length}/{c.maxPlayers} players</div>
                <div style={S.progressBar()}><div style={S.progressFill(pct)} /></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {c.participants.map(p => (
                    <span key={p.username} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: p.username === username ? "#EEEDFE" : "#F1EFE8", color: p.username === username ? "#3C3489" : "#444441", fontWeight: p.username === username ? 600 : 400 }}>
                      {p.username}{!isF11 && p.team && p.team !== "fantasy11" ? `: ${p.team}` : ""}
                    </span>
                  ))}
                </div>

                {myEntry && !isF11 && myEntry.team && myEntry.team !== "fantasy11" && (
                  <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 8 }}>✅ You picked <strong>{myEntry.team}</strong></div>
                )}

                {(c.status === "open" || c.status === "locked") && (
                  <div style={S.autoSettleNotice}>⏳ Auto-settling after match ends via Cricket API</div>
                )}

                {/* ✅ FIX: Cancel button blocked by real match time, not just "locked" status */}
                {isCreator && (c.status === "open" || c.status === "locked") && (
                  <div style={{ marginTop: 8 }}>
                    {matchStarted ? (
                      <>
                        <button style={S.btnDisabled} disabled>🔒 Cancel Contest</button>
                        <div style={S.matchStartedWarn}>⚠️ Match has started — cancellation is no longer available</div>
                      </>
                    ) : (
                      <button style={S.btn("#E24B4A")} onClick={() => handleCancelContest(c._id)} disabled={loading}>
                        Cancel Contest
                      </button>
                    )}
                  </div>
                )}

                {c.status === "settled" && (
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, padding: "10px 14px", borderRadius: 8, background: c.winner?.includes(username) ? "#E1F5EE" : "#FCEBEB", color: c.winner?.includes(username) ? "#0F6E56" : "#993C1D" }}>
                    {c.winner?.includes(username)
                      ? `🏆 You won! ${isF11 ? "Highest fantasy points" : `Team ${c.winningTeam} won`} · Prize: ${Math.floor(totalPot / (c.winner.split(", ").length))} pts`
                      : `Result: ${isF11 ? "Settled by fantasy points" : `${c.winningTeam} won`} · Winner(s): ${c.winner}`}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", margin: "20px 0 6px" }}>All Contests — Join Now</div>
          <div style={{ fontSize: 12, color: "#888780", marginBottom: 12 }}>🌐 Public · 🔒 Private (password required) · 🏏 Fantasy 11 (build squad after joining)</div>
          {openContests.filter(c => !c.participants.find(p => p.username === username)).length === 0 && (
            <div style={{ ...S.cardDark, textAlign: "center", color: "#888780", fontSize: 14, padding: 24 }}>
              {serverOnline ? "No contests to join right now." : "⚠️ Server offline — can't load contests."}
            </div>
          )}
          {openContests.filter(c => !c.participants.find(p => p.username === username)).map(c => {
            const totalPot  = c.entryFee * c.participants.length;
            const pct       = Math.round((c.participants.length / c.maxPlayers) * 100);
            const matchTeams = getContestTeams(c);
            const maxPrize  = c.entryFee * c.maxPlayers;
            const isPrivate = c.visibility === "private";
            const isF11     = c.mode === "fantasy11" || (c.participants.length > 0 && c.participants[0]?.team === "fantasy11");

            return (
              <div key={c._id} style={{ ...S.card, borderColor: isPrivate ? "#AFA9EC" : "#d3d1c7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                      {isPrivate
                        ? <span style={S.privateBadge}>🔒 Private — password required</span>
                        : <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#E1F5EE", color: "#0F6E56", border: "0.5px solid #5DCAA5" }}>🌐 Public</span>
                      }
                      {isF11 && <span style={S.f11badge}>🏏 Fantasy 11</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>🏏 {c.matchLabel}</div>
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 1 }}>Created by: {c.createdBy}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>{statusBadge(c.status)}</div>
                </div>

                {isF11 && (
                  <div style={{ background: "#ffd16610", border: "1px solid #ffd16633", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#8a6a00" }}>
                    🏏 Fantasy 11 mode — after joining, build your squad for <b>{c.matchLabel}</b> in the Fantasy 11 tab. Highest points wins the pot.
                  </div>
                )}

                <div style={S.pointsRow}>
                  <PointsInfoBox icon="🎟️" label="Entry Fee" value={`${c.entryFee} pts`} color="#BA7517" />
                  <PointsInfoBox icon="💰" label="Pot So Far" value={`${totalPot} pts`} color="#7F77DD" />
                  <PointsInfoBox icon="🏆" label="Max Prize" value={`${maxPrize} pts`} color="#1D9E75" />
                </div>

                <div style={{ fontSize: 12, color: "#444441", marginBottom: 4 }}>👥 {c.participants.length}/{c.maxPlayers} players</div>
                <div style={S.progressBar()}><div style={S.progressFill(pct)} /></div>

                {joiningContest === c._id ? (
                  <div style={{ marginTop: 12 }}>
                    {!isF11 && (
                      <>
                        <div style={S.label}>Pick your team</div>
                        <div style={S.pillRow}>
                          {matchTeams.map(t => (
                            <button key={t} style={S.pill(joinTeam === t)} onClick={() => setJoinTeam(t)}>{t}</button>
                          ))}
                        </div>
                      </>
                    )}
                    {isF11 && (
                      <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 12 }}>
                        You'll build your Fantasy 11 squad after joining. Click confirm to pay the entry fee.
                      </div>
                    )}
                    <div style={S.row}>
                      <button style={S.btn("#1D9E75")} onClick={() => handleJoinContest(c._id, null, isF11 ? "fantasy11" : joinTeam)} disabled={loading || (!isF11 && !joinTeam)}>
                        {loading ? "Joining..." : `Confirm — Pay ${c.entryFee} pts ✓`}
                      </button>
                      <button style={S.btnGhost} onClick={() => { setJoiningContest(null); setJoinTeam(null); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button style={{ ...S.btn(isF11 ? "#ffd166" : isPrivate ? "#534AB7" : "#1D9E75"), marginTop: 12, color: isF11 ? "#000" : "#fff" }} onClick={() => initiateJoin(c)}>
                    {isF11 ? "🏏 Join Fantasy 11 Contest" : isPrivate ? "🔒 Join with Password" : `Join Contest — ${c.entryFee} pts entry`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Contest ── */}
      {view === "createContest" && (
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏆 Create a Contest</div>

          <ModePicker value={contestMode} onChange={(m) => { setContestMode(m); setCMyTeam(null); }} />

          <div style={S.label}>Contest name</div>
          <input style={S.input} placeholder="e.g. MI vs KKR Fantasy Showdown" value={contestName} onChange={e => setContestName(e.target.value)} />

          <div style={S.label}>Visibility</div>
          <PrivacyToggle value={cVisibility} onChange={(v) => { setCVisibility(v); setCPassword(""); }} />

          {cVisibility === "private" && <PasswordField value={cPassword} onChange={setCPassword} label="Contest password" />}

          <div style={S.label}>Sport</div>
          <div style={S.pillRow}>
            {SPORTS.map(s => (
              <button key={s.id} style={S.pill(cSport?.id === s.id)} onClick={() => { setCsport(s); setCMyTeam(null); setCIplMatch(null); setCMatchLabel(""); }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {cSport?.id === "cricket" && (
            <>
              <div style={S.label}>🏏 Pick an IPL 2026 Match</div>
              <IPLMatchPicker selectedMatch={cIPLMatch} onSelect={(match) => handleIPLMatchSelect(match, setCIplMatch, setCMatchLabel, setCMyTeam)} />
            </>
          )}

          {contestMode === "fantasy11" && cIPLMatch ? (
            <Fantasy11Banner matchId={cIPLMatch.id} matchLabel={cMatchLabel} teams={[cIPLMatch.team1, cIPLMatch.team2]} />
          ) : contestMode === "bet" && cSport && (
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
          <input style={S.input} placeholder="e.g. MI vs KKR — IPL 2026" value={cMatchLabel} onChange={e => setCMatchLabel(e.target.value)} />

          <div style={S.label}>Entry fee per player (your points: {points.toLocaleString()})</div>
          <div style={S.pillRow}>
            {[25, 50, 100, 250].map(amt => (
              <button key={amt} style={S.pill(parseInt(cEntryFee) === amt)} onClick={() => setCEntryFee(String(Math.min(amt, points)))}>{amt}</button>
            ))}
          </div>
          <input style={S.input} type="number" placeholder="Or enter custom fee..." value={cEntryFee} onChange={e => setCEntryFee(e.target.value)} max={points} />

          <div style={S.label}>Max players (2 – 12)</div>
          <div style={S.pillRow}>
            {[2, 4, 6, 8, 10, 12].map(n => (
              <button key={n} style={S.pill(parseInt(cMaxPlayers) === n)} onClick={() => setCMaxPlayers(String(n))}>{n}</button>
            ))}
          </div>
          <input style={S.input} type="number" placeholder="Custom (2–12)" value={cMaxPlayers} min={2} max={12} onChange={e => setCMaxPlayers(e.target.value)} />

          {cEntryFee && cMaxPlayers && parseInt(cEntryFee) > 0 && (
            <div style={S.pointsRow}>
              <PointsInfoBox icon="🎟️" label="Your Entry" value={`${parseInt(cEntryFee)} pts`} color="#BA7517" />
              <PointsInfoBox icon="💰" label="Max Pot" value={`${(parseInt(cEntryFee) || 0) * (parseInt(cMaxPlayers) || 0)} pts`} color="#7F77DD" />
              <PointsInfoBox icon="🏆" label="Max Prize" value={`${(parseInt(cEntryFee) || 0) * (parseInt(cMaxPlayers) || 0)} pts`} color="#1D9E75" />
            </div>
          )}

          <div style={S.row}>
            <button style={S.btn(contestMode === "fantasy11" ? "#ffd166" : "#7F77DD")} onClick={handleCreateContest} disabled={loading}>
              {loading ? "Creating..." : contestMode === "fantasy11" ? "🏏 Create Fantasy 11 Contest" : cVisibility === "private" ? "Create Private Contest 🔒" : "Create Contest 🏆"}
            </button>
            <button style={S.btnGhost} onClick={() => setView("contests")}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}