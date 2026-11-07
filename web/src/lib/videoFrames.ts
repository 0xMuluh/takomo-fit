/** The browser can't decode the file, typically HEVC/H.265 on a desktop browser without hardware support. */
export class VideoUnreadable extends Error {}

function event(v: HTMLVideoElement, name: string, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new VideoUnreadable(`no ${name} after ${ms} ms`)), ms);
    v.addEventListener(name, () => { clearTimeout(t); resolve(); }, { once: true });
    v.addEventListener("error", () => { clearTimeout(t); reject(new VideoUnreadable("unreadable video")); }, { once: true });
  });
}

/**
 * Frames sampled evenly through a video file, as JPEG data URLs. A launch monitor keeps each shot on screen until the
 * next one; frames 0.4 s apart catch even a 4-second clip of one swing twice before and twice after the screen updates.
 */
export async function videoFrames(file: File, max = 12, minGapS = 0.4, maxSide = 1280): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  try {
    const loaded = event(v, "loadeddata", 20_000);
    v.src = url;
    // iOS Safari loads no frames until playback starts.
    v.play().then(() => v.pause()).catch(() => {});
    await loaded;
    v.pause();
    const d = v.duration;
    if (!Number.isFinite(d) || d <= 0 || !v.videoWidth) throw new VideoUnreadable("no video track");
    const n = Math.max(2, Math.min(max, Math.floor(d / minGapS)));
    const s = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * s);
    c.height = Math.round(v.videoHeight * s);
    const ctx = c.getContext("2d")!;
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const seeked = event(v, "seeked", 10_000);
      v.currentTime = (d * (i + 0.5)) / n;
      await seeked;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      out.push(c.toDataURL("image/jpeg", 0.8));
    }
    return out;
  } finally {
    v.removeAttribute("src");
    v.load();
    URL.revokeObjectURL(url);
  }
}
