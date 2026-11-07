"use client";

let audioCtx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  if (audioCtx?.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/** Short confirmation tones for hands-free capture: "ready" when address locks, "ping" for one frame, "lock" when done. */
export function playChime(type: "ready" | "ping" | "lock" = "ping") {
  try {
    const ctx = context();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const notes = type === "ready" ? [440, 659.25] : type === "ping" ? [587.33, 880] : [523.25, 659.25, 783.99];
    const len = type === "ready" ? 0.22 : type === "ping" ? 0.25 : 0.45;
    osc.type = type === "lock" ? "triangle" : "sine";
    notes.forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.08));
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + len);
    osc.start(now);
    osc.stop(now + len);
  } catch {}
}
