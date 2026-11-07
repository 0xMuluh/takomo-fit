import { FilesetResolver, HandLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";

type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

const WASM = "/mediapipe/wasm";
const MODELS = "/mediapipe/models";

let fileset: Promise<WasmFileset> | null = null;
const tasks = new Map<string, Promise<unknown>>();

/** VIDEO-mode landmarkers are shared, and MediaPipe rejects timestamps that don't increase across uses. */
let videoClockMs = 0;
export function videoTimestamp(stepMs: number): number {
  videoClockMs += Math.max(1, stepMs);
  return videoClockMs;
}

function vision() {
  fileset ??= FilesetResolver.forVisionTasks(WASM);
  return fileset;
}

async function withGpuFallback<T>(make: (delegate: "GPU" | "CPU") => Promise<T>): Promise<T> {
  try {
    return await make("GPU");
  } catch {
    return make("CPU");
  }
}

function once<T>(key: string, make: () => Promise<T>): Promise<T> {
  if (!tasks.has(key)) {
    const p = make().catch((e) => {
      tasks.delete(key);
      throw e;
    });
    tasks.set(key, p);
  }
  return tasks.get(key) as Promise<T>;
}

export function photoPose(): Promise<PoseLandmarker> {
  return once("pose-photo", async () => {
    const fs = await vision();
    return withGpuFallback((delegate) =>
      PoseLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: `${MODELS}/pose_landmarker_heavy.task`, delegate },
        runningMode: "IMAGE",
        numPoses: 1,
        outputSegmentationMasks: true,
      }),
    );
  });
}

export function videoPose(): Promise<PoseLandmarker> {
  return once("pose-video", async () => {
    const fs = await vision();
    return withGpuFallback((delegate) =>
      PoseLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: `${MODELS}/pose_landmarker_full.task`, delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      }),
    );
  });
}

export function photoHand(): Promise<HandLandmarker> {
  return once("hand-photo", async () => {
    const fs = await vision();
    return withGpuFallback((delegate) =>
      HandLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: `${MODELS}/hand_landmarker.task`, delegate },
        runningMode: "IMAGE",
        numHands: 1,
      }),
    );
  });
}

export function videoHand(): Promise<HandLandmarker> {
  return once("hand-video", async () => {
    const fs = await vision();
    return withGpuFallback((delegate) =>
      HandLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: `${MODELS}/hand_landmarker.task`, delegate },
        runningMode: "VIDEO",
        numHands: 1,
      }),
    );
  });
}
