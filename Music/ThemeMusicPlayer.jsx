import { useState, useEffect, useRef, useCallback } from "react";

// ─── YOUR 3 TRACKS ────────────────────────────────────────────────────────────
// Put the audio files in: frontend/public/audio/
//   track1.mp3  ← WhatsApp_Audio_2026-05-02_at_09_53_38.mpeg  (Marvel Theme, 30s)
//   track2.mp3  ← WhatsApp_Audio_2026-05-02_at_09_54_23__1_.mpeg  (29s)
//   track3.mp3  ← WhatsApp_Audio_2026-05-02_at_09_54_23.mpeg  (17s)
const TRACKS = [
  {
    id: "track1",
    icon: "⚡",
    name: "Marvel Theme",
    vibe: "Epic & heroic",
    url: "/audio/track1.mp3",
    accentColor: "#DC2626",
    waveHeights: [14, 22, 10, 26, 8, 20, 14, 24, 10, 18],
  },
  {
    id: "track2",
    icon: "🏆",
    name: "Track 2",
    vibe: "Pump it up",
    url: "/audio/track2.mp3",
    accentColor: "#7C3AED",
    waveHeights: [18, 12, 24, 8, 22, 14, 20, 10, 24, 16],
  },
  {
    id: "track3",
    icon: "🔥",
    name: "Track 3",
    vibe: "High energy",
    url: "/audio/track3.mp3",
    accentColor: "#D97706",
    waveHeights: [10, 20, 6, 24, 12, 18, 8, 22, 10, 16],
  },
];

// ─── WAVEFORM VISUALIZER ──────────────────────────────────────────────────────
function Waveform({ heights, isPlaying, accentColor }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
      <style>{`
        @keyframes tmwave {
          from { height: 4px; }
          to { height: var(--tmwave-h); }
        }
      `}</style>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: accentColor,
            opacity: isPlaying ? 0.85 : 0.25,
            height: isPlaying ? undefined : 4,
            animation: isPlaying
              ? `tmwave ${(0.4 + i * 0.06).toFixed(2)}s ease-in-out infinite alternate`
              : "none",
            "--tmwave-h": `${h}px`,
            transition: "opacity 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── TRACK DRAWER ─────────────────────────────────────────────────────────────
function TrackDrawer({ tracks, activeId, onSelect }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        marginBottom: 8,
        background: "#0f0f13",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 8,
        zIndex: 9999,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Choose your theme
      </div>
      {tracks.map((t) => {
        const isActive = t.id === activeId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            style={{
              background: isActive ? `${t.accentColor}22` : "rgba(255,255,255,0.03)",
              border: isActive
                ? `1px solid ${t.accentColor}88`
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "10px 14px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? t.accentColor : "#e5e5e5",
              }}
            >
              {t.name}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {t.vibe}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN PLAYER ──────────────────────────────────────────────────────────────
export default function ThemeMusicPlayer() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("canplay", () => setIsLoading(false));
    audio.addEventListener("waiting", () => setIsLoading(true));

    return () => {
      audio.pause();
      audio.src = "";
      clearInterval(tickerRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    clearInterval(tickerRef.current);
    if (isPlaying) {
      tickerRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        setCurrentTime(audio.currentTime);
        setProgress(audio.currentTime / audio.duration);
      }, 250);
    }
    return () => clearInterval(tickerRef.current);
  }, [isPlaying]);

  const loadAndPlay = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    audio.src = track.url;
    audio.load();
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const handleSelectTrack = (track) => {
    setActiveTrack(track);
    loadAndPlay(track);
    setShowDrawer(false);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src || audio.src === window.location.href) {
      loadAndPlay(activeTrack);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
    setCurrentTime(audio.currentTime);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const accent = activeTrack.accentColor;

  return (
    <>
      {showDrawer && (
        <div
          onClick={() => setShowDrawer(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(10, 10, 16, 0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          userSelect: "none",
          boxSizing: "border-box",
        }}
      >
        {/* Track selector */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {showDrawer && (
            <TrackDrawer
              tracks={TRACKS}
              activeId={activeTrack.id}
              onSelect={handleSelectTrack}
            />
          )}
          <button
            onClick={() => setShowDrawer((v) => !v)}
            title="Change theme music"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: showDrawer ? "rgba(255,255,255,0.07)" : "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "6px 12px 6px 8px",
              cursor: "pointer",
              minWidth: 160,
              maxWidth: 210,
              transition: "background 0.15s",
            }}
          >
            <span style={{ fontSize: 22 }}>{activeTrack.icon}</span>
            <div style={{ textAlign: "left", overflow: "hidden", flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: accent,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeTrack.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {activeTrack.vibe}
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                transition: "transform 0.2s",
                transform: showDrawer ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▲
            </span>
          </button>
        </div>

        {/* Center controls */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={togglePlay}
              disabled={isLoading}
              title={isPlaying ? "Pause" : "Play"}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: isLoading ? "rgba(255,255,255,0.1)" : accent,
                border: "none",
                cursor: isLoading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                color: "#fff",
                transition: "transform 0.1s, background 0.2s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 32, textAlign: "right" }}>
              {fmt(currentTime)}
            </span>
            <div
              onClick={handleSeek}
              style={{
                flex: 1,
                height: 4,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${(progress * 100).toFixed(1)}%`,
                  background: accent,
                  borderRadius: 2,
                  transition: "width 0.25s linear",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 32 }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Right: visualizer + volume */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Waveform
            heights={activeTrack.waveHeights}
            isPlaying={isPlaying}
            accentColor={accent}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setIsMuted((m) => !m)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "rgba(255,255,255,0.5)",
                padding: 0,
              }}
            >
              {isMuted || volume === 0 ? "🔇" : volume < 0.4 ? "🔉" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              style={{ width: 80, accentColor: accent, cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: 76 }} />
    </>
  );
}