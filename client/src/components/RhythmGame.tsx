// Starlit Pulse style: the stage is a focused vertical instrument, with coral as the hit signature.
import { useEffect, useRef, useState } from "react";
import { createChart, type Difficulty } from "@/game/chart";
import { BeatAudio } from "@/game/audio";
import { RhythmEngine, type Judgment } from "@/game/rhythmEngine";

const laneColors = ["#26F0E5", "#FF5470", "#FFD23F", "#A98CFF"];
const lanes = ["D", "F", "J", "K"];

type Screen = "title" | "play" | "result";
export default function RhythmGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef(new BeatAudio());
  const engineRef = useRef<RhythmEngine | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const lastBeatRef = useRef(-1);
  const particlesRef = useRef<{ x: number; y: number; life: number; color: string }[]>([]);
  const [screen, setScreen] = useState<Screen>("title");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [hud, setHud] = useState({ score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, miss: 0 });
  const [judgment, setJudgment] = useState<Judgment | "">("");
  const [flashLane, setFlashLane] = useState<number | null>(null);
  const [holdingLane, setHoldingLane] = useState<number | null>(null);

  const start = () => {
    audioRef.current.start();
    const engine = new RhythmEngine(createChart(difficulty));
    engine.start(performance.now());
    engineRef.current = engine;
    setHud({ ...engine.stats });
    setJudgment("");
    setScreen("play");
  };

  const handleLane = (lane: number) => {
    if (screen !== "play" || !engineRef.current) return;
    audioRef.current.start();
    const result = engineRef.current.hit(lane, performance.now());
    audioRef.current.hit(lane, result.judgment);
    setJudgment(result.judgment);
    if (result.holding) setHoldingLane(lane);
    setHud({ ...engineRef.current.stats });
    setFlashLane(lane);
    window.setTimeout(() => setFlashLane(current => current === lane ? null : current), 120);
    if (result.note) {
      const canvas = canvasRef.current;
      if (canvas) particlesRef.current.push({ x: (lane + 0.5) * canvas.clientWidth / 4, y: canvas.clientHeight * 0.71, life: 1, color: laneColors[lane] });
    }
  };

  const releaseLane = (lane: number) => {
    if (!engineRef.current || !engineRef.current.isHolding(lane)) return;
    const result = engineRef.current.release(lane, performance.now());
    setHoldingLane(null); setJudgment(result.judgment); setHud({ ...engineRef.current.stats });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { const lane = lanes.indexOf(event.key.toUpperCase()); if (lane >= 0 && !event.repeat) handleLane(lane); };
    const onKeyUp = (event: KeyboardEvent) => { const lane = lanes.indexOf(event.key.toUpperCase()); if (lane >= 0) releaseLane(lane); };
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const draw = (now: number) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const gradient = ctx.createLinearGradient(0, 0, 0, h); gradient.addColorStop(0, "#0E102A"); gradient.addColorStop(1, "#090915"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 11; i++) { ctx.strokeStyle = i % 2 ? "#26F0E5" : "#FF5470"; ctx.beginPath(); ctx.moveTo(w * (i / 10), 0); ctx.lineTo(w * 0.5 + (i - 5) * 20, h * 0.73); ctx.stroke(); }
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 32; i++) { const x = (i * 97) % w; const y = (i * 53 + now * 0.01 * (i % 3 + 1)) % (h * 0.73); ctx.fillStyle = i % 4 === 0 ? "#FFD23F" : "#BBD9FF"; ctx.fillRect(x, y, i % 3 + 1, i % 3 + 1); }
      ctx.globalAlpha = 1;
      const horizonY = h * 0.22, hitY = h * 0.69, vanishX = w * 0.5, laneW = w / 4;
      const perspective = (y: number) => Math.max(0.06, Math.min(1, (y - horizonY) / (hitY - horizonY)));
      for (let lane = 0; lane <= 4; lane++) { const bottomX = lane * laneW; const topX = vanishX + (lane - 2) * 13; ctx.strokeStyle = lane === 2 ? "rgba(255,255,255,.3)" : "rgba(38,240,229,.18)"; ctx.lineWidth = lane === 2 ? 1.5 : 1; ctx.beginPath(); ctx.moveTo(topX, horizonY); ctx.lineTo(bottomX, hitY + 32); ctx.stroke(); }
      for (let row = 0; row < 7; row++) { const y = horizonY + Math.pow((row + 1) / 8, 1.65) * (hitY - horizonY); const p = perspective(y); const left = vanishX - (w * .5) * p; const right = vanishX + (w * .5) * p; ctx.strokeStyle = `rgba(255,255,255,${.06 + p * .12})`; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }
      ctx.strokeStyle = "#FF5470"; ctx.lineWidth = 3; ctx.shadowBlur = 18; ctx.shadowColor = "#FF5470"; ctx.beginPath(); ctx.moveTo(0, hitY); ctx.lineTo(w, hitY); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.78)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(vanishX, hitY, 18 + Math.sin(now * 0.004) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = "#26F0E5"; ctx.globalAlpha = .65; ctx.beginPath(); ctx.arc(vanishX, hitY, 29 + Math.sin(now * 0.004 + 1) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      const engine = engineRef.current;
      if (screen === "play" && engine) {
        engine.update(now);
        const t = engine.time(now);
        const beat = Math.floor(t / 0.46); if (beat !== lastBeatRef.current) { lastBeatRef.current = beat; audioRef.current.tick(undefined, beat % 4 === 0); }
        for (const note of engine.visible(now)) { const progress = Math.max(0, Math.min(1, 1 - (note.time - t) / 2.0)); const y = horizonY + Math.pow(progress, 1.7) * (hitY - horizonY); const p = perspective(y); const x = vanishX + (note.lane - 1.5) * laneW * p; const barW = Math.max(12, laneW * .66 * p); const barH = Math.max(5, 22 * p); const color = laneColors[note.lane]; ctx.fillStyle = color; ctx.shadowBlur = 22 * p; ctx.shadowColor = color; if (note.kind === "hold") { const endProgress = Math.max(0, Math.min(1, 1 - (note.time + (note.duration ?? .8) - t) / 2.0)); const endY = horizonY + Math.pow(endProgress, 1.7) * (hitY - horizonY); const endP = perspective(endY); const endX = vanishX + (note.lane - 1.5) * laneW * endP; const endW = Math.max(8, laneW * .66 * endP); ctx.globalAlpha = .45; ctx.fillRect(endX - endW / 2, endY, endW, Math.max(4, y - endY)); ctx.globalAlpha = 1; ctx.beginPath(); ctx.roundRect(x - barW / 2, y - barH / 2, barW, barH, barH / 2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(endX, endY, Math.max(6, endW * .25), 0, Math.PI * 2); ctx.stroke(); } else { ctx.beginPath(); ctx.roundRect(x - barW / 2, y - barH / 2, barW, barH, barH / 2); ctx.fill(); } ctx.shadowBlur = 0; }
        particlesRef.current = particlesRef.current.filter(p => p.life > 0); for (const p of particlesRef.current) { p.life -= 0.035; ctx.globalAlpha = p.life; ctx.strokeStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, (1 - p.life) * 52, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1;
        if (engine.ended(now)) { setHud({ ...engine.stats }); setScreen("result"); }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [screen]);

  return <div className="game-shell">
    <canvas ref={canvasRef} className="stage-canvas" aria-label="NEON BEAT STAR game canvas" />
    <header className="game-header"><div className="brand-lockup"><img src="/assets/neon-beat-star-logo.png" alt="" /><span>NEON BEAT <b>STAR</b></span></div><span className="live-pill"><i /> LIVE / {difficulty}</span></header>
    {screen === "title" && <main className="title-panel"><img className="title-art" src="/assets/neon-beat-star-title-card.jpg" alt="星の光線が集まるステージ" /><div className="title-copy"><p className="eyebrow">ORIGINAL RHYTHM STAGE · ANDROID READY</p><h1>NEON<br /><em>BEAT STAR</em></h1><p className="lead">指先で、夜を鳴らす。</p><div className="difficulty-row">{(["EASY", "NORMAL", "HARD"] as Difficulty[]).map(d => <button key={d} className={difficulty === d ? "difficulty active" : "difficulty"} onClick={() => setDifficulty(d)}>{d}</button>)}</div><button className="start-button" onClick={start}><span>ENTER THE STAGE</span><small>Tap to begin</small></button><p className="hint">Four lanes. One pulse. D / F / J / K supported.</p></div><div className="title-lane-preview" aria-hidden="true"><div className="preview-gate"><i /><i /></div>{lanes.map((key, lane) => <div key={key} className="preview-lane" style={{ "--lane": laneColors[lane] } as React.CSSProperties}><span>{lane + 1}</span><b>{key}</b></div>)}</div></main>}
    {screen === "play" && <><img className="stage-character" src="/assets/neon-beat-star-character.png" alt="NEON BEAT STARのオリジナルステージパフォーマー" /><div className="play-hud"><div><span>SCORE</span><strong>{String(hud.score).padStart(7, "0")}</strong></div><div className="combo"><strong>{hud.combo}</strong><span>COMBO</span></div></div><div className={judgment ? `judgment ${judgment.toLowerCase()}` : "judgment"}>{judgment}</div><div className="lane-pad-row">{lanes.map((key, lane) => <button key={key} className={holdingLane === lane ? "lane-pad holding" : flashLane === lane ? "lane-pad pressed" : "lane-pad"} style={{ "--lane": laneColors[lane] } as React.CSSProperties} onPointerDown={() => handleLane(lane)} onPointerUp={() => releaseLane(lane)} onPointerCancel={() => releaseLane(lane)} aria-label={`Lane ${lane + 1}`}><span>{lane + 1}</span><b>{key}</b></button>)}</div></>}
    {screen === "result" && <main className="result-panel"><p className="eyebrow">LIVE COMPLETE · {difficulty}</p><h2>STAGE<br /><em>CLEARED</em></h2><div className="result-score"><span>FINAL SCORE</span><strong>{String(hud.score).padStart(7, "0")}</strong></div><div className="result-grid"><div><b>{hud.maxCombo}</b><span>MAX COMBO</span></div><div><b>{hud.perfect}</b><span>PERFECT</span></div><div><b>{hud.great + hud.good}</b><span>GOOD HITS</span></div></div><button className="start-button" onClick={() => setScreen("title")}><span>PLAY AGAIN</span><small>Choose another stage</small></button></main>}
  </div>;
}
