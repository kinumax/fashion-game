/* Design philosophy: Continental Editorial — a fashion-editorial frame around a detailed sculptural platformer. */
import { useEffect, useRef, useState } from "react";
import { createGameScene, GameSnapshot, PopupEvent, TOTAL_STAGES, SECTIONS_PER_STAGE, TOTAL_STAGE_SECTIONS } from "@/game/scene";
import { loadPremiumState, purchasePremium, restorePremium, PremiumStoreState } from "@/lib/premiumStore";

type Popup = { id: number; value: number; x: number; y: number; kind: PopupEvent["kind"]; t: number };
  const MUSIC_TRACKS = Array.from({ length: TOTAL_STAGES }, (_, index) => `/assets/bgm/stage-${String(index + 1).padStart(2, "0")}.wav`);
const initialSnapshot: GameSnapshot = { score: 0, city: "NEW YORK", progress: 0, running: false, gameOver: false, finished: false, combo: 0, lives: 3, checkpoint: false, outfit: 0, jumpBoost: false, speedBoost: false, bagAmmo: 99, shoeAmmo: 99, highScore: Number(localStorage.getItem("frw-high") || "0"), flyFuel: 0, hasWings: false, crouching: false, partyCount: 1, collection: 0, stageIndex: 0, sectionIndex: 0, totalStages: TOTAL_STAGES, sectionsPerStage: SECTIONS_PER_STAGE, stageMode: "runway" };

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineStarted = useRef(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [joystickX, setJoystickX] = useState(0);
  const [popups, setPopups] = useState<Popup[]>([]);
  const popupId = useRef(0);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const prevComboRef = useRef(0);
  const [comboBurst, setComboBurst] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(0);
  const prevScoreRef = useRef(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicTracksRef = useRef<HTMLAudioElement[]>([]);
  const titleQueueRef = useRef<number[]>([]);
  const runningRef = useRef(false);
  const stageIndexRef = useRef(0);
  const [musicMuted, setMusicMuted] = useState(false);
  const [loadout, setLoadout] = useState<"balanced" | "arsenal" | "sky">("balanced");
  const [premium, setPremium] = useState<PremiumStoreState>({ supported: false, owned: false, loading: true });
  const [premiumMessage, setPremiumMessage] = useState("");

  useEffect(() => {
    const tracks = MUSIC_TRACKS.map((src) => {
      const audio = new Audio(src);
      audio.loop = false;
      audio.volume = 0.34;
      audio.preload = "auto";
      return audio;
    });
    const refillTitleQueue = () => {
      const shuffled = tracks.map((_, index) => index);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      titleQueueRef.current = shuffled;
    };
    const playNextTitleTrack = () => {
      if (runningRef.current) return;
      if (titleQueueRef.current.length === 0) refillTitleQueue();
      const index = titleQueueRef.current.shift();
      if (index === undefined) return;
      const audio = tracks[index];
      audio.loop = false;
      audio.currentTime = 0;
      audio.muted = musicMuted;
      audio.volume = musicMuted ? 0 : 0.34;
      musicRef.current = audio;
      void audio.play().catch(() => undefined);
    };
    tracks.forEach((audio) => audio.addEventListener("ended", playNextTitleTrack));
    musicTracksRef.current = tracks;
    const startMusicOnGesture = () => {
      if (!runningRef.current && !musicRef.current) playNextTitleTrack();
      else if (musicRef.current && !musicMuted) void musicRef.current.play().catch(() => undefined);
    };
    window.addEventListener("pointerdown", startMusicOnGesture, { once: true });
    window.addEventListener("keydown", startMusicOnGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startMusicOnGesture);
      window.removeEventListener("keydown", startMusicOnGesture);
      tracks.forEach((audio) => { audio.removeEventListener("ended", playNextTitleTrack); audio.pause(); audio.src = ""; });
      musicTracksRef.current = []; musicRef.current = null; titleQueueRef.current = [];
    };
  }, []);
  useEffect(() => {
    runningRef.current = snapshot.running;
    stageIndexRef.current = snapshot.stageIndex;
  }, [snapshot.running, snapshot.stageIndex]);
  useEffect(() => {
    const desiredIndex = snapshot.running || snapshot.finished ? snapshot.stageIndex % MUSIC_TRACKS.length : undefined;
    if (desiredIndex === undefined) return;
    const next = musicTracksRef.current[desiredIndex];
    const previous = musicRef.current;
    if (!next || next === previous) return;
    next.loop = true;
    next.currentTime = 0; next.muted = musicMuted; next.volume = 0;
    musicRef.current = next;
    void next.play().catch(() => undefined);
    const fadeStart = performance.now();
    const fade = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - fadeStart) / 900);
      next.volume = musicMuted ? 0 : 0.34 * progress;
      if (previous) previous.volume = musicMuted ? 0 : 0.34 * (1 - progress);
      if (progress >= 1) { window.clearInterval(fade); previous?.pause(); }
    }, 40);
    return () => window.clearInterval(fade);
  }, [snapshot.stageIndex, snapshot.running, snapshot.finished, musicMuted]);
  const startMusic = () => { const audio = musicRef.current; if (audio && !musicMuted) void audio.play().catch(() => undefined); };
  const toggleMusic = () => { const nextMuted = !musicMuted; setMusicMuted(nextMuted); if (musicRef.current) { musicRef.current.muted = nextMuted; if (!nextMuted) startMusic(); } };
  useEffect(() => {
    let active = true;
    void loadPremiumState().then((state) => { if (active) setPremium(state); });
    return () => { active = false; };
  }, []);
  const buyPremium = async () => {
    setPremiumMessage("");
    const result = await purchasePremium();
    if (result.owned) setPremium((current) => ({ ...current, owned: true, error: undefined }));
    if (result.message) setPremiumMessage(result.message);
  };
  const restorePremiumPurchase = async () => {
    setPremiumMessage("");
    const owned = await restorePremium();
    setPremium((current) => ({ ...current, owned }));
    setPremiumMessage(owned ? "Premium Passを復元しました。" : "復元できる購入が見つかりませんでした。");
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || engineStarted.current) return;
    engineStarted.current = true;
    let disposed = false;
    let handle: Awaited<ReturnType<typeof createGameScene>> | undefined;
    const onPopup = (ev: PopupEvent) => {
      popupId.current += 1;
      const id = popupId.current;
      setPopups((p) => [...p, { id, value: ev.value, x: ev.x, y: ev.y, kind: ev.kind, t: performance.now() }]);
      window.setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 1100);
    };
    createGameScene(canvas, (next: GameSnapshot) => {
      if (!disposed) {
        if (next.combo > prevComboRef.current) setComboBurst((c) => c + 1);
        if (next.score > prevScoreRef.current + 99) setScoreFlash((f) => f + 1);
        prevComboRef.current = next.combo;
        prevScoreRef.current = next.score;
        setSnapshot(next);
      }
    }, onPopup).then((created) => { handle = created; if (disposed) created.dispose(); });
    return () => { disposed = true; handle?.dispose(); engineStarted.current = false; };
  }, []);
  const event = (name: string, detail?: unknown) => window.dispatchEvent(detail === undefined ? new Event(name) : new CustomEvent(name, { detail }));
  const jump = () => event("frw:jump");
  const jumpDown = () => event("frw:jump-down");
  const jumpUp = () => event("frw:jump-up");
  const dash = () => event("frw:dash");
  const attack = () => event("frw:attack");
  const attackDown = () => event("frw:attack-down");
  const attackUp = () => event("frw:attack-up");
  const kick = () => event("frw:kick");
  const kickDown = () => event("frw:kick-down");
  const kickUp = () => event("frw:kick-up");
  const move = (direction: -1 | 1) => event("frw:lane", direction);
  const restart = () => event("frw:restart");
  const nextStage = () => event("frw:next-stage");
  const crouchDown = () => event("frw:crouch-down");
  const crouchUp = () => event("frw:crouch-up");
  const joystickActive = useRef(false);
  const updateJoystick = (ev: React.PointerEvent<HTMLDivElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((ev.clientX - rect.left) / rect.width - 0.5) * 2));
    setJoystickX(x); if (Math.abs(x) > 0.18) move(x < 0 ? -1 : 1);
  };
  const startJoystick = (ev: React.PointerEvent<HTMLDivElement>) => { joystickActive.current = true; ev.currentTarget.setPointerCapture?.(ev.pointerId); updateJoystick(ev); };
  const moveJoystick = (ev: React.PointerEvent<HTMLDivElement>) => { if (joystickActive.current) updateJoystick(ev); };
  const endJoystick = (ev: React.PointerEvent<HTMLDivElement>) => { joystickActive.current = false; setJoystickX(0); ev.currentTarget.releasePointerCapture?.(ev.pointerId); };
  const gameOver = snapshot.gameOver && !snapshot.running;
  const finishedRun = snapshot.finished && !snapshot.running;
  const introShown = !snapshot.running && !gameOver && !finishedRun;
  const progressPct = Math.max(3, snapshot.progress * 100);
  const isHighScoreRun = snapshot.score > 0 && snapshot.score >= snapshot.highScore - 1 && snapshot.highScore > 0;

  return (
    <main ref={shellRef} className="game-shell" data-city={snapshot.city.replace(" ", "_")} data-mode={snapshot.stageMode ?? "runway"}>
      <canvas ref={canvasRef} className="game-canvas" aria-label="Fashion Runway Worlds game canvas" />
      <div className="game-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div key={`cb-${comboBurst}`} className={`combo-burst ${snapshot.combo >= 10 ? "big" : snapshot.combo >= 5 ? "mid" : ""}`} style={{ display: snapshot.combo > 0 ? "block" : "none" }}>
        {snapshot.combo >= 5 && <span className="combo-label">COMBO</span>}
        <strong className="combo-num">x{snapshot.combo}</strong>
      </div>

      <header className="hud-top">
        <div className="brand-lockup">
          <span className="brand-mark">FRW</span>
          <span className="brand-caption">FASHION<br />RUNWAY<br />WORLDS</span>
        </div>
        <div className="hud-city-wrap">
          <div className="hud-city">{snapshot.stageName ?? snapshot.city}</div>
          <div className="hud-mode">{snapshot.stageMode === "vertical" ? "VERTICAL RUN" : snapshot.stageMode === "underground" ? "DEEP DESCENT" : snapshot.stageMode === "race" ? "RUNWAY RACE" : snapshot.stageMode === "dogfight" ? "DRONE HUNT" : snapshot.stageMode === "flight" ? "SKY ASSAULT" : "RUNWAY SPRINT"}</div>
          <div className="hud-high">HI <b>{String(snapshot.highScore).padStart(5, "0")}</b></div>
        </div>
        <div className={`hud-score ${scoreFlash !== 0 ? "flash" : ""}`} key={`sf-${scoreFlash}`}>
          <span>SCORE</span>
          <strong>{String(snapshot.score).padStart(5, "0")}</strong>
          {isHighScoreRun && snapshot.running && <em className="new-record">NEW RECORD</em>}
        </div>
        <button className="music-toggle" onClick={toggleMusic} aria-label={musicMuted ? "Turn music on" : "Mute music"}>{musicMuted ? "MUSIC OFF" : "MUSIC ON"}</button>
      </header>

      <div className="hud-secondary">
        <span className="hud-lives">LIVES <b>{"◆".repeat(Math.max(0, snapshot.lives))}{snapshot.lives <= 0 && "—"}</b></span>
        <span className="hud-combo">COMBO <b>x{snapshot.combo}</b></span>
        <span className="hud-party">PARTY <b>{snapshot.partyCount}/4</b></span>
        {snapshot.jumpBoost && <span className="hud-check boost-j">HIGH JUMP ↑</span>}
        {snapshot.speedBoost && <span className="hud-check boost-s">FAST SHOES »</span>}
        <span className="hud-check boost-b">BAG ∞</span>
        <span className="hud-check boost-sh">SHOE ∞</span>
        {snapshot.hasWings && <span className="hud-check boost-w">WINGS ✈</span>}
        {snapshot.crouching && <span className="hud-check boost-cr">CROUCH ↓</span>}
        {snapshot.checkpoint && <span className="hud-check boost-cp">CHECKPOINT ✓</span>}
        <span className="hud-relics">RELICS <b>{snapshot.relics ?? 0}</b></span>
        <span className="hud-check boost-cp">RESCUE KEYS <b>{snapshot.rescueKeys ?? 0}</b></span>
      </div>
      {snapshot.bossName && snapshot.bossHp !== undefined && <div className="boss-meter"><span className="boss-name">BOSS · {snapshot.bossName}</span><span className="boss-bar"><i style={{ width: `${Math.max(0, Math.min(1, (snapshot.bossHp ?? 0) / Math.max(1, snapshot.bossMaxHp ?? 1))) * 100}%` }} /></span></div>}
      <div className={`fly-meter ${snapshot.hasWings ? "visible" : ""}`}><span style={{ width: `${Math.max(0, Math.min(1, snapshot.flyFuel)) * 100}%` }} /></div>
      <div className="hud-progress"><span style={{ width: `${progressPct}%` }} /><em /></div>

      <div className="popup-layer" aria-hidden="true">
        {popups.map((p) => {
          const age = (performance.now() - p.t) / 1100;
          const leftBase = 6 + (p.x / 250) * 88;
          const topBase = 52 - (p.y / 6) * 46;
          const left = `${leftBase}%`;
          const top = `${topBase - age * 18}%`;
          const op = Math.max(0, 1 - age);
          const scale = 1 + age * 0.4;
          const cls = `popup popup-${p.kind}`;
          return (
            <div key={p.id} className={cls} style={{ left, top, opacity: op, transform: `translate(-50%, -50%) scale(${scale})` }}>
              {p.kind === "combo" && <small>COMBO</small>}
              {p.kind === "checkpoint" && <small>CHECKPOINT</small>}
              {p.kind === "power" && <small>POWER</small>}
              {p.kind === "wings" && <small>WINGS</small>}
              {p.kind === "rescue" && <small>RESCUED!</small>}
              <strong>{p.kind === "rescue" ? `+${p.value.toLocaleString()}` : `+${p.value.toLocaleString()}`}</strong>
            </div>
          );
        })}
      </div>

      {introShown && (
        <section className="start-card intro start-card-simple" aria-label="Start game">
          <p className="eyebrow">FASHION RUNWAY WORLDS</p>
          <h1>WEAR THE CITY.</h1>
          <p className="start-subtitle">12 STAGES · 4 SECTIONS EACH</p>
        </section>
      )}
      {introShown && <button className="start-run-overlay" onClick={() => { startMusic(); event("frw:start"); }}>START RUN</button>}
      {(gameOver || finishedRun) && (
        <section className={`start-card game-over-card ${finishedRun ? "win" : ""}`}>
          <p className="eyebrow">{finishedRun ? (snapshot.collection >= TOTAL_STAGE_SECTIONS - 1 ? "FASHION TOUR COMPLETE" : "STAGE GATE OPEN") : "RUNWAY PAUSED"}</p>
          <h1>{finishedRun ? (snapshot.collection >= TOTAL_STAGE_SECTIONS - 1 ? "ALL STAGES CLEARED." : "ENTER THE NEXT WORLD.") : "RESET THE LOOK."}</h1>
          <p>スコア <b>{snapshot.score.toLocaleString()}</b>。{finishedRun ? `${snapshot.partyCount}人のパーティで${snapshot.city}をクリア！${snapshot.collection >= TOTAL_STAGE_SECTIONS - 1 ? `${TOTAL_STAGES}ステージコンプリート、おめでとう！` : "次の区画・ステージへ進もう。"}` : "足場を読み、もう一度挑戦しよう。"}</p>
          <div className="result-grid">
            <div><span>PROGRESS</span><b>{Math.round(snapshot.progress * 100)}%</b></div>
            <div><span>BEST</span><b>{snapshot.highScore.toLocaleString()}</b></div>
            <div><span>CITY</span><b>{snapshot.city}</b></div>
            <div><span>PARTY</span><b>{snapshot.partyCount}/4</b></div>
            <div><span>MAX COMBO</span><b>x{Math.max(snapshot.combo, 0)}</b></div>
          </div>
          {finishedRun && snapshot.collection < TOTAL_STAGE_SECTIONS - 1 && (
            <div className="wardrobe-picker">
              <button className={snapshot.outfit === 0 ? "wardrobe-option active" : "wardrobe-option"} onClick={() => event("frw:select-outfit", 0)}>NOIR / 01</button>
              <button className={snapshot.outfit === 1 ? "wardrobe-option active" : "wardrobe-option"} onClick={() => event("frw:select-outfit", 1)}>SCARLET / 02</button>
              <button className={snapshot.outfit === 2 ? "wardrobe-option active" : "wardrobe-option"} onClick={() => event("frw:select-outfit", 2)}>COBALT / 03</button>
            </div>
          )}
          <button onClick={finishedRun && snapshot.collection < TOTAL_STAGE_SECTIONS - 1 ? nextStage : restart}>{finishedRun ? (snapshot.collection >= TOTAL_STAGE_SECTIONS - 1 ? "PLAY AGAIN" : "NEXT SECTION") : "RESTART"}</button>
        </section>
      )}

      <div className="city-stamp" aria-hidden="true">
        <span>{snapshot.city}</span>
        <small>STAGE {String(snapshot.stageIndex + 1).padStart(2, "0")} / {TOTAL_STAGES} · SECTION {snapshot.sectionIndex + 1}/{SECTIONS_PER_STAGE}</small>
      </div>

      <div className="touch-controls" aria-label="Game controls">
        <div className="joystick" role="application" aria-label="Move with joystick" onPointerDown={startJoystick} onPointerMove={moveJoystick} onPointerUp={endJoystick} onPointerCancel={endJoystick}>
          <span className="joystick-ring" />
          <span className="joystick-knob" style={{ transform: `translateX(${joystickX * 22}px)` }} />
        </div>
        <div className="control-cluster-left">
          <button
            className="control-button control-crouch"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); crouchDown(); }}
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture?.(e.pointerId); crouchUp(); }}
            onPointerCancel={() => crouchUp()}
            onPointerLeave={() => crouchUp()}
            aria-label="Crouch"
          >CROUCH</button>
          <button className="control-button control-dash" onClick={dash} aria-label="Dash">DASH</button>
        </div>
        <div className="control-cluster-right">
          <button
            className="control-button control-attack"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); attackDown(); }}
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture?.(e.pointerId); attackUp(); }}
            onPointerCancel={attackUp}
            onPointerLeave={attackUp}
            onClick={attack}
            aria-label="Hold to throw handbags"
          >BAG</button>
          <button
            className="control-button control-kick"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); kickDown(); }}
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture?.(e.pointerId); kickUp(); }}
            onPointerCancel={kickUp}
            onPointerLeave={kickUp}
            onClick={kick}
            aria-label="Hold to kick shoes"
          >SHOE</button>
          <button
            className="control-button control-jump"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); jumpDown(); }}
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture?.(e.pointerId); jumpUp(); }}
            onPointerCancel={() => jumpUp()}
            onPointerLeave={() => jumpUp()}
            aria-label="Jump"
          >JUMP</button>
        </div>
      </div>
      <p className="control-hint">DRAG JOYSTICK · HOLD JUMP TO FLY · HOLD BAG/SHOE TO ATTACK · CROUCH · DASH · RESCUE FRIENDS · MOBILE FRIENDLY</p>
    </main>
  );
}
