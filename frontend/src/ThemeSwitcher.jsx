import { useState, useEffect } from "react";

const THEMES = [
  { id: "dark",     icon: "🌑", label: "Dark Gold",     dot: "#f0b429" },
  { id: "midnight", icon: "🌊", label: "Midnight Blue",  dot: "#38bdf8" },
  { id: "crimson",  icon: "🔥", label: "Crimson Red",    dot: "#ff3c5a" },
  { id: "comic",    icon: "💥", label: "Comic Book",     dot: "#e6b800" },
];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(
    () => localStorage.getItem("fb-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", active);
    localStorage.setItem("fb-theme", active);
  }, [active]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest(".theme-switcher")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = THEMES.find(t => t.id === active);

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-btn"
        onClick={() => setOpen(o => !o)}
        title="Change theme"
      >
        <span>{current?.icon}</span>
        <span>Theme</span>
      </button>

      {open && (
        <div className="theme-dropdown">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-option ${active === t.id ? "active" : ""}`}
              onClick={() => { setActive(t.id); setOpen(false); }}
            >
              <span
                className="theme-dot"
                style={{ background: t.dot }}
              />
              {t.icon} {t.label}
              {active === t.id && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}