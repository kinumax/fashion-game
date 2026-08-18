// Starlit Pulse style: note silhouettes communicate the action before the timing moment.
export type Difficulty = "EASY" | "NORMAL" | "HARD";
export type Note = { id: number; lane: number; time: number; kind: "tap" | "hold"; duration?: number };

const patterns = [[0, 1, 2, 3, 1, 2, 0, 3], [0, 2, 1, 3, 0, 3, 1, 2], [3, 2, 1, 0, 2, 1, 3, 0]];

export function createChart(difficulty: Difficulty): Note[] {
  const step = difficulty === "EASY" ? 0.62 : difficulty === "NORMAL" ? 0.46 : 0.34;
  const bars = difficulty === "EASY" ? 9 : difficulty === "NORMAL" ? 12 : 15;
  const notes: Note[] = [];
  let id = 0;
  for (let bar = 0; bar < bars; bar++) {
    const pattern = patterns[bar % patterns.length];
    const count = difficulty === "EASY" ? 4 : 8;
    for (let i = 0; i < count; i++) {
      const time = 1.6 + (bar * 8 + i) * step;
      const lane = pattern[i % pattern.length];
      const hold = (difficulty !== "EASY" && bar % 3 === 1 && i === 2) || (difficulty === "HARD" && i % 5 === 0);
      notes.push({ id: id++, lane, time, kind: hold ? "hold" : "tap", ...(hold ? { duration: difficulty === "HARD" ? 1.1 : 0.8 } : {}) });
      if (difficulty === "HARD" && i % 4 === 1) notes.push({ id: id++, lane: (lane + 2) % 4, time: time + step * 0.5, kind: "tap" });
    }
  }
  return notes.sort((a, b) => a.time - b.time);
}
