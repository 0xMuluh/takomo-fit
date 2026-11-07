// Copies the MediaPipe wasm runtime and downloads the models so the app serves them itself.
import { copyFile, mkdir, stat, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmSrc = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const wasmDst = join(root, "public/mediapipe/wasm");
const modelDst = join(root, "public/mediapipe/models");

const MODELS = {
  "pose_landmarker_heavy.task":
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
  "pose_landmarker_full.task":
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
  "hand_landmarker.task":
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
};

async function exists(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

await mkdir(wasmDst, { recursive: true });
await mkdir(modelDst, { recursive: true });
for (const f of await readdir(wasmSrc)) await copyFile(join(wasmSrc, f), join(wasmDst, f));

for (const [name, url] of Object.entries(MODELS)) {
  const out = join(modelDst, name);
  if (await exists(out)) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log(`fetched ${name}`);
}
console.log("vision assets ready");
