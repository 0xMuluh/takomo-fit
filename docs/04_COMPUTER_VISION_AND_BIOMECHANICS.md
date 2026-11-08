# Computer vision & biomechanics (client)

**Code:** `pocket-fitter/web/src/lib/vision/` · capture UI under `web/src/components/capture/`  
Pose / hands / card / tempo / ball-line geometry run in the browser (WASM). Frames for those flows are not uploaded as video.

---

## 1. Card scale (hand)

Lab starter kit used a printed A4 measurement sheet. The app scales hands with any **ISO/IEC 7810 ID-1** card (`card.ts`): 85.60 mm × 53.98 mm. The UI supplies a card box; `fitCard` snaps edges and yields mm/px (rejects bad skew).

\[
s = \frac{85.60\,\mathrm{mm}}{w_{\mathrm{card,px}}}
\]

---

## 2. Hand → grip

`hand.ts`: MediaPipe Hands landmarks wrist → middle fingertip; length in cm after card scale + crease offset.

Engine grip mapping (`GLOVE_EDGES_CM` / `grip_by_glove_size`), not ad-hoc 17.5 / 19.5 bands:

| Hand length (cm) | Glove bin | Grip |
|---|---|---|
| below 16.8 | XS | standard |
| 16.8–17.8 | S | standard |
| 17.8–18.59 | M | standard |
| 18.59–19.4 | M/L | midsize |
| 19.4–20.22 | L | midsize |
| 20.22 and up | XL | oversize |

(Bins are half-open at the upper edge, matching `np.digitize` on `GLOVE_EDGES_CM`.)

API field: `Evidence.hand_photo` → `HandPhoto { method, hand_length_cm, finger_length_cm? }`.

---

## 3. Body height & wrist-to-floor

`body.ts` + `BodyPhoto` schema:

- `method="ratio"`: wrist-to-floor as fraction of height; stated height sets scale.
- `method="reference"`: reference object can also yield absolute height.

Stance quality (`good` / `poor`) is passed through. Handoff can stream coaching cues while pose runs on the phone.

---

## 4. Swing tempo

`SwingVideo`: `fps`, `backswing_s`, `downswing_s`, optional `clubhead_speed_mph`. Client timing from lead-wrist track on phone video; engine fuses with questionnaire tempo when present.

---

## 5. Ball-line lie (manual 4-point tap)

Not Canny / Hough. UI (`BallLineCapture.tsx`): golfer photographs the face and taps four points — line bottom, line top, heel, toe. `tiltDeg` in `ballLine.ts` returns degrees (toe-up positive), same geometry as the lab ball-line helper.

Need ≥3 tilts → `Evidence.ball_line_tilts_deg: number[]`.

Static height/WTF lie is a prior; ball-line / TrackMan toe-up supply direct delivery evidence. Dev **lie exact = 58.3%** (`model.json`). B1 questionnaire lie match ~41% (START_HERE).
