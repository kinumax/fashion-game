// Starlit Pulse style: sound is synthetic, bright, and original; no copyrighted audio is used.
export class BeatAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private started = false;

  start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.12;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    this.started = true;
  }

  tick(time = this.ctx?.currentTime ?? 0, accent = false) {
    if (!this.ctx || !this.master || !this.started) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = accent ? "square" : "triangle";
    osc.frequency.setValueAtTime(accent ? 220 : 165, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.2 : 0.11, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    osc.connect(gain).connect(this.master);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  hit(lane: number, quality: "Perfect" | "Great" | "Good" | "Miss") {
    if (!this.ctx || !this.master || !this.started) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const frequencies = [440, 554.37, 659.25, 783.99];
    osc.type = quality === "Perfect" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(frequencies[lane] ?? 440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.16);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }
}
