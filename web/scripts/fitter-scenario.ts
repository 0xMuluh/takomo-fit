/**
 * Plays the voice fitter's side of a session through the real client tools, against a running engine.
 * Checks what the LLM would be told at each step. No ElevenLabs key needed.
 *
 *   PF_API_URL=http://localhost:8077 npx jiti scripts/fitter-scenario.ts
 */
import assert from "node:assert/strict";
import { FitterSession } from "../src/lib/fitter/session";

const API = process.env.PF_API_URL ?? "http://localhost:8077";
const realFetch = globalThis.fetch;
globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) =>
  realFetch(typeof url === "string" && url.startsWith("/api/pf") ? API + url.slice("/api/pf".length) : url, init)) as typeof fetch;

const opened: (string | undefined)[] = [];
let resultsShown = false;
const s = new FitterSession(
  {
    onState: () => {},
    onMeasure: (k) => opened.push(k),
    onResults: () => (resultsShown = true),
  },
  () => ({ lang: "en", units: "imperial" }),
);
const t = s.tools();

function show(step: string, out: unknown) {
  console.log(`\n── ${step}\n${String(out)}`);
  return String(out);
}

async function main() {
  let out = show("start_measurement before any answers", await t.start_measurement({ kind: "body" }));
  assert.match(out, /Not yet/);
  assert.equal(opened.length, 0);

  out = show("record_answers: name, hand, score, carry", await t.record_answers({
    first_name: "Mikko Virtanen", handedness: "right", score_band: 4, carry_7i_yards: 170 }));
  assert.match(out, /Still needed before a fit: ball flight, tempo, age, sex, height/);
  assert.match(out, /Double-check: A 170 yd 7-iron is long/);

  out = show("record_answers: current club, misses, impossible height", await t.record_answers({
    current_7i: "Ping G430", current_7i_loft_deg: 28.5, misses: "right, heel", height_cm: 300 }));
  assert.match(out, /Not saved, check with the golfer: height_cm 300/);
  assert.doesNotMatch(out, /A 170 yd 7-iron is long/, "a doubt is raised once, not on every call");
  assert.match(out, /28\.5° loft, stronger than any Takomo 7-iron/);

  out = show("record_answers: carry corrected, the rest of the interview", await t.record_answers({
    carry_7i_yards: 150, flight: "high", tempo: "unsure", priorities: "forgiveness and distance", age: 46, sex: "male",
    height_cm: 183, glove_size: "unsure", rounds_per_year: "10-30" }));
  assert.match(out, /Fit ready/);
  assert.match(out, /Spec: Iron /);
  assert.match(out, /Measurements to suggest, most useful first:\n1\. full-body photo \(can do now at home\)/);
  assert.match(out, /ball-line test \(needs balls and a mat or range/);
  assert.equal(s.s.answers.x.name, "Mikko");
  assert.deepEqual(s.s.answers.q.characteristics, ["forgiveness", "distance"]);

  out = show("start_measurement: body", await t.start_measurement({ kind: "body" }));
  assert.match(out, /open on their screen/);
  assert.equal(opened.at(-1), "body");

  const body = await s.addEvidence("body", { body_photo: { method: "ratio", wrist_to_floor_ratio: 0.47, quality: "good" } });
  out = show("[measurement] body", body?.message);
  assert.match(out, /^\[measurement\] full-body photo finished\. Your photo puts your wrist-to-floor at 86\.0 cm\./);
  assert.match(out, /Most useful next: |No further measurement/);

  const swing = await s.addEvidence("swing", { swing_video: { fps: 30, backswing_s: 0.92, downswing_s: 0.29 } });
  out = show("[measurement] live swing", swing?.message);
  assert.match(out, /3\.2:1 tempo/);

  out = show("get_fit", await t.get_fit({}));
  assert.match(out, /Measurements done: .*body.*swing/);
  assert.match(out, /confirmed means the engine is at least 95% sure/);

  out = show("explain_part: lie", await t.explain_part({ part: "lie" }));
  assert.match(out, /They said bad shots go right/);

  out = show("compare: current_club", await t.compare({ what: "current_club" }));
  assert.match(out, /Ping G430/);
  assert.match(out, /club speed at \d+ mph/);
  assert.match(out, /more loft|less loft|about the same/);

  out = show("compare: heads", await t.compare({ what: "heads" }));
  assert.match(out, /Compared with: |No different head/);

  out = show("compare: shafts", await t.compare({ what: "shafts" }));
  assert.match(out, /Recommended: /);

  out = show("what_if: faster swing", await t.what_if({ speed_mph: 90 }));
  assert.match(out, /If that were true|Nothing in the spec would change/);

  out = show("what_if: nothing given", await t.what_if({}));
  assert.match(out, /Tell me which value/);

  out = show("show_results", await t.show_results({}));
  assert.ok(resultsShown);

  console.log("\nAll fitter tool checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
