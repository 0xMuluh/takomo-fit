"""Launch-monitor sessions from outside the app: a photo of the screen, or a shared TrackMan report link.

Both become `Reading`s in mph, yards, degrees and millimetres. Nothing here enters a fit directly: the golfer sees
the reading, confirms the club, and the web app turns it into `Evidence.launch_monitor`.
"""
from __future__ import annotations

import asyncio
import base64
import binascii
import io
import json
import math
import re
from typing import Any, Literal, Optional
from urllib.parse import parse_qs, urlparse

import httpx
from PIL import Image, ImageFilter, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, Field

from .schemas import Shot

FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"
DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-72B-Instruct"
TRACKMAN_REPORT_HOST = "web-dynamic-reports.trackmangolf.com"
TRACKMAN_REPORT_API = "https://golf-player-activities.trackmangolf.com/api/reports"

MS_TO_MPH = 2.236936
KMH_TO_MPH = 1 / 1.609344
M_TO_YD = 1.093613

# Radar units a golfer owns; everything else is treated like a studio monitor.
HOME_DEVICES = ("garmin", "r10", "r50", "mevo", "rapsodo", "mlm", "skytrak", "swing caddie", "voice caddie",
                "prgr", "bushnell launch pro", "square", "uneekor eye mini", "flightscope mevo", "approach")


class ImportFailed(Exception):
    """`code` is a stable key the web app translates."""

    def __init__(self, code: str, detail: str = ""):
        super().__init__(detail or code)
        self.code = code


class Reading(BaseModel):
    source: Literal["photo", "video", "report"]
    device: Optional[str] = None
    kind: Literal["home_radar", "trackman"]
    club: Optional[str] = Field(None, description="Normalised club: 4i-9i, pw, gw, sw, lw, hybrid, wood, driver")
    shots: Optional[int] = None
    mean: Shot
    sd: Shot = Field(default_factory=Shot)
    shot_list: list[Shot] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list,
                             description="Codes: single_shot, units_guessed, smash_implausible, carry_implausible, "
                                         "unsure")
    unsure: list[str] = Field(default_factory=list,
                              description="Shot fields on screen that two independent reads disagreed on; left out")
    screen_distance_unit: Optional[Literal["yd", "m"]] = Field(
        None, description="Distance unit printed on a photographed screen, if it could be read; carry and side were "
                          "converted from it")


class ImportResult(BaseModel):
    readings: list[Reading]


def normalise_club(raw: Any) -> Optional[str]:
    s = re.sub(r"[\s_.-]+", "", str(raw or "")).lower()
    if not s:
        return None
    words = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9}
    for w, n in words.items():
        s = s.replace(w, str(n))
    if "driver" in s or s in ("dr", "1w"):
        return "driver"
    if "hybrid" in s or re.fullmatch(r"\d+h", s):
        return "hybrid"
    if "wood" in s or re.fullmatch(r"\d+w", s):
        return "wood"
    for key, names in {"pw": ("pitching", "pw"), "gw": ("gap", "gw", "aw", "approach"), "sw": ("sand", "sw"),
                       "lw": ("lob", "lw")}.items():
        if any(n in s for n in names):
            return key
    m = re.search(r"(\d)(?:iron|i)\b|(?:iron|i)(\d)\b|^(\d)$", s)
    if m:
        n = int(next(g for g in m.groups() if g))
        return f"{n}i" if 1 <= n <= 9 else None
    return None


def device_kind(device: Optional[str]) -> Literal["home_radar", "trackman"]:
    d = (device or "").lower()
    return "home_radar" if any(h in d for h in HOME_DEVICES) else "trackman"


def _plausibility(mean: Shot) -> list[str]:
    notes = []
    sp, carry = mean.club_speed_mph, mean.carry_yd
    if sp and carry and not 1.25 <= carry / sp <= 2.25:
        notes.append("carry_implausible")
    return notes


def _num(v: Any) -> Optional[float]:
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v) if math.isfinite(v) else None
    m = re.search(r"-?\d+(?:[.,]\d+)?", str(v).replace("−", "-"))
    if not m:
        return None
    x = float(m.group(0).replace(",", "."))
    side = str(v).strip().upper()
    return -abs(x) if side.endswith("L") else abs(x) if side.endswith("R") else x


# --------------------------------------------------------------------------- photo

LOCATE_PROMPT = """Find every launch monitor data screen in this photo (TrackMan, GCQuad, Foresight, Garmin, Rapsodo, \
FlightScope, Uneekor, SkyTrak, or a phone app). Return only JSON:
{"screens": [{"bbox_2d": [x1, y1, x2, y2], "kind": "tiles" | "club_graphic" | "other"}]}
"tiles" is a screen with a grid or list of numbers (club speed, ball speed, carry...). "club_graphic" shows a club or \
ball diagram. Use an empty list if there is no such screen."""

CLUB_PROMPT = """These are screens from a golf simulator or launch monitor. Return only JSON:
{"club": string or null, "device": string or null}
"club" is the club name printed on any screen (for example "6 IRON" or "7i"); "device" is the launch monitor brand. \
Use null for anything you cannot read clearly."""

# The model only transcribes; `screen_values` decides which number is which from the printed label. Asked to fill
# named fields, it invents labels for numbers it can't attribute (a "club speed" on a strip that shows none).
VISION_PROMPT = """Transcribe the data on this golf launch monitor or simulator screen (TrackMan, GCQuad, Foresight, \
Garmin, Rapsodo, FlightScope, Uneekor, SkyTrak, Full Swing, Toptracer, or a phone app). Copy text exactly as printed; \
do not interpret it.

Return only JSON:
{"device": string or null, "club": string or null, "shots": integer or null,
 "cells": [{"label": string or null, "value": string, "unit": string or null, "average": string or null,
            "spread": string or null}]}

One entry per number shown, in reading order (left to right, top to bottom).
- "label" is the text printed with that number (for example "CLUB SPEED", "Carry", "LAUNCH ANG."). If you cannot \
read the label, use null. Never guess a label from the number or its position.
- "value" is the main number as printed, with any L or R.
- "unit" is the unit printed with it (mph, km/h, m/s, yds, m, deg, rpm), or null if you cannot read it.
- "average" and "spread": on some screens each number has a small session average and a small ± consistency figure \
beside or under it (on TrackMan tiles: bottom left and bottom right). Copy them if present and readable, else null.
- "club" is a club name printed anywhere (for example "6 Iron"). "device" is the brand if visible.
- "shots" is the number of shots in the session if the screen shows it."""

# Printed label -> field. Order matters: side and total distances are claimed before carry.
LABELS: list[tuple[str, re.Pattern]] = [(f, re.compile(p)) for f, p in [
    ("side_total", r"\btot\w*\s*side|side\s*tot"),
    ("carry_side", r"^side$|carry\s*side|side\s*carry|offline|^side\s*(dist|dev)"),
    ("total", r"\btot"),
    ("carry", r"carry"),
    ("club_speed", r"club\s*(head\s*)?(speed|spd)|^cs$|head\s*speed"),
    ("ball_speed", r"ball\s*(speed|spd)|^bs$"),
    ("smash_factor", r"smash"),
    ("face_to_path", r"face\s*to\s*path|^f2p$|^ftp$"),
    ("club_path", r"club\s*path|swing\s*path|^path$"),
    ("face_angle", r"face\s*ang"),
    ("launch_direction", r"launch\s*dir|^hla$|horiz"),
    ("launch_angle", r"launch|^vla$|^la$"),
    ("landing_angle", r"land|descent"),
    ("attack_angle", r"attack|^aoa$"),
    ("dynamic_loft", r"dyn\w*\s*loft"),
    ("spin_rate", r"spin"),
    ("height", r"height|apex|peak"),
]]


def _unit(u: Any) -> Optional[str]:
    s = re.sub(r"[\s.]", "", str(u or "")).lower()
    if s in ("mph",):
        return "mph"
    if s in ("km/h", "kmh", "kph"):
        return "km/h"
    if s in ("m/s", "ms", "mps"):
        return "m/s"
    if s in ("yd", "yds", "yards", "yard"):
        return "yd"
    if s in ("m", "meters", "metres", "meter", "metre"):
        return "m"
    return None


def screen_values(t: dict) -> dict:
    """Map a transcription's labelled cells to fields. Unlabelled cells are dropped, and a field claimed by two cells
    with different numbers is dropped too."""
    values: dict[str, dict] = {}
    clash: set[str] = set()
    units: dict[str, Optional[str]] = {}
    for cell in t.get("cells") or []:
        if not isinstance(cell, dict) or not cell.get("label"):
            continue
        label = re.sub(r"[.:]", "", str(cell["label"])).strip().lower()
        field = next((f for f, p in LABELS if p.search(label)), None)
        if field is None:
            continue
        v = {"label": str(cell["label"]), "shot": _num(cell.get("value")), "average": _num(cell.get("average")),
             "spread": _num(cell.get("spread"))}
        if field in values and values[field]["shot"] != v["shot"]:
            clash.add(field)
        values[field] = v
        units[field] = _unit(cell.get("unit"))
    for f in clash:
        values.pop(f)
    dist = units.get("carry") if "carry" in values else None
    return {"device": t.get("device"), "club": t.get("club"), "shots": t.get("shots"),
            "speed_unit": units.get("club_speed") if "club_speed" in values else None,
            "distance_unit": dist, "values": values}

PHOTO_FIELDS = {"club_speed": "club_speed_mph", "carry": "carry_yd", "launch_angle": "launch_angle_deg",
                "landing_angle": "landing_angle_deg", "dynamic_loft": "dynamic_loft_deg",
                "attack_angle": "attack_angle_deg", "face_to_path": "face_to_path_deg", "carry_side": "side_yd"}
# Models file "TOTAL" under carry and "SIDE TOT." under carry_side; the printed label settles it.
CARRY_ONLY = ("carry", "carry_side")


def _json_block(text: str) -> dict:
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ImportFailed("unreadable", "vision model returned no JSON")
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError as e:
        raise ImportFailed("unreadable", f"bad JSON from vision model: {e}")


def reading_from_vision(d: dict, unsure: frozenset[str] = frozenset(), low_res: bool = False) -> Reading:
    """Turn the vision model's transcription into a Reading, converting units and rejecting what doesn't add up.

    `unsure` holds screen fields (club_speed, carry...) that two reads disagreed on; `merge_reads` already nulled them.
    `low_res` means the screen was too few pixels for its small print, so averages and spreads are ignored.
    """
    values = d.get("values") or {}
    notes: list[str] = ["low_res"] if low_res else []
    speed_unit = (d.get("speed_unit") or "").lower().replace(" ", "")
    dist_unit = (d.get("distance_unit") or "").lower()

    def pick(field: str, part: str) -> Optional[float]:
        v = values.get(field)
        if low_res and part != "shot":
            return None
        if field in CARRY_ONLY and isinstance(v, dict) and re.search(r"tot", str(v.get("label") or ""), re.I):
            return None
        return _num(v.get(part)) if isinstance(v, dict) else (_num(v) if part == "shot" else None)

    has_avg = any(pick(f, "average") is not None for f in ("club_speed", "carry"))
    part = "average" if has_avg else "shot"
    if not has_avg:
        notes.append("single_shot")

    raw_speed = pick("club_speed", part)
    if not speed_unit and raw_speed is not None:
        speed_unit = "km/h" if raw_speed > 135 else "mph"
        notes.append("units_guessed")
    sk = {"km/h": KMH_TO_MPH, "kmh": KMH_TO_MPH, "m/s": MS_TO_MPH, "ms": MS_TO_MPH}.get(speed_unit, 1.0)
    dk = M_TO_YD if dist_unit.startswith("m") else 1.0
    if pick("carry", part) is not None and not dist_unit and "units_guessed" not in notes:
        notes.append("units_guessed")

    mean, sd = {}, {}
    for src, dst in PHOTO_FIELDS.items():
        k = sk if dst == "club_speed_mph" else dk if dst in ("carry_yd", "side_yd") else 1.0
        c, s = pick(src, part), pick(src, "spread")
        if c is not None:
            mean[dst] = round(c * k, 2)
            if s is not None and has_avg:
                sd[dst] = round(abs(s) * k, 2)

    sp = mean.get("club_speed_mph")
    if sp is not None and not 40 <= sp <= 130:
        raise ImportFailed("implausible", f"club speed {sp:.0f} mph")
    if mean.get("carry_yd") is not None and not 40 <= mean["carry_yd"] <= 260:
        raise ImportFailed("implausible", f"carry {mean['carry_yd']:.0f} yd")
    if sp is None and mean.get("carry_yd") is None:
        raise ImportFailed("no_numbers", "no club speed or carry")
    ball = pick("ball_speed", part)
    if sp and ball and not 1.1 <= ball * sk / sp <= 1.55:
        notes.append("smash_implausible")

    mean_shot = Shot(**mean)
    notes += _plausibility(mean_shot)
    missing = [dst for src, dst in PHOTO_FIELDS.items()
               if src in unsure and (mean.get(dst) is None or (has_avg and sd.get(dst) is None))]
    if missing:
        notes.append("unsure")
    shots = d.get("shots")
    device = (d.get("device") or None) and str(d["device"])[:60]
    return Reading(source="photo", device=device, kind=device_kind(device), club=normalise_club(d.get("club")),
                   shots=int(shots) if isinstance(shots, (int, float)) and shots >= 1 else (1 if not has_avg else None),
                   mean=mean_shot, sd=Shot(**sd), notes=notes, unsure=missing,
                   screen_distance_unit="m" if dk != 1.0 else "yd" if dist_unit.startswith("y") else None)


def merge_reads(a: dict, b: dict) -> tuple[dict, frozenset[str]]:
    """Keep only what two independent transcriptions agree on.

    Small digits on a distant screen get misread in ways that look plausible (3.0 vs 9.0), so a value survives only if
    both reads produced the same number. Returns the merged transcription and the fields that lost a number.
    """
    def same(x: Any, y: Any) -> Any:
        return x if x == y else None

    va, vb = a.get("values") or {}, b.get("values") or {}
    values, unsure = {}, set()
    for f in set(va) | set(vb):
        pa = va.get(f) if isinstance(va.get(f), dict) else {"shot": va.get(f)}
        pb = vb.get(f) if isinstance(vb.get(f), dict) else {"shot": vb.get(f)}
        labels = [str(p.get("label")) for p in (pa, pb) if p.get("label")]
        out: dict[str, Any] = {"label": next((x for x in labels if re.search(r"tot", x, re.I)), labels[0])} \
            if labels else {}
        for part in ("shot", "average", "spread"):
            x, y = _num(pa.get(part)), _num(pb.get(part))
            if x is not None and y is not None and abs(x - y) < 1e-6:
                out[part] = x
            elif x is not None or y is not None:
                out[part] = None
                unsure.add(f)
        values[f] = out

    def text(k: str) -> Optional[str]:
        x, y = a.get(k), b.get(k)
        return x if not y else y if not x else same(x, y)

    def club() -> Optional[str]:
        x, y = normalise_club(a.get("club")), normalise_club(b.get("club"))
        return (x or y) if not (x and y) else same(x, y)

    merged = {"device": text("device"), "club": club(), "speed_unit": text("speed_unit"),
              "distance_unit": text("distance_unit"), "shots": same(a.get("shots"), b.get("shots")), "values": values}
    return merged, frozenset(unsure)


def _decode(data_url: str) -> Image.Image:
    m = re.match(r"^data:image/(jpeg|png|webp);base64,", data_url)
    if not m:
        raise ImportFailed("bad_image", "expected a base64 JPEG, PNG or WebP data URL")
    try:
        im = Image.open(io.BytesIO(base64.b64decode(data_url[m.end():], validate=True)))
        im.load()
    except (binascii.Error, UnidentifiedImageError, OSError, ValueError):
        raise ImportFailed("bad_image", "the image could not be decoded")
    return ImageOps.exif_transpose(im).convert("RGB")


def _encode(im: Image.Image) -> str:
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def _fit(im: Image.Image, long_side: int) -> Image.Image:
    """Resize to `long_side` with both sides a multiple of 28, the patch size Qwen2.5-VL works in, so the boxes it
    returns are in this image's pixels."""
    s = long_side / max(im.size)
    w, h = (max(28, round(v * s / 28) * 28) for v in im.size)
    return im.resize((w, h), Image.LANCZOS)


def _crop(im: Image.Image, box: list, scale: tuple[float, float], pad: float = 0.04) -> Optional[Image.Image]:
    try:
        x1, y1, x2, y2 = (float(v) for v in box[:4])
    except (TypeError, ValueError):
        return None
    x1, x2 = sorted((x1 * scale[0], x2 * scale[0]))
    y1, y2 = sorted((y1 * scale[1], y2 * scale[1]))
    px, py = (x2 - x1) * pad, (y2 - y1) * pad
    x1, y1, x2, y2 = max(0, x1 - px), max(0, y1 - py), min(im.width, x2 + px), min(im.height, y2 + py)
    if x2 - x1 < 40 or y2 - y1 < 30:
        return None
    return im.crop((round(x1), round(y1), round(x2), round(y2)))


def _variants(screen: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Two different renderings of the same screen, so the two reads are independent."""
    plain = _fit(screen, 1400)
    sharp = ImageOps.autocontrast(_fit(screen, 1792), cutoff=1).filter(ImageFilter.UnsharpMask(2, 160, 2))
    return plain, sharp


# A launch-monitor screen's small print (averages, spreads, units) is about 1/45 of its height; below this many pixels
# it is under ~9 px and two reads can agree on the same wrong digit.
MIN_SCREEN_PX = 400


async def _ask(c: httpx.AsyncClient, key: str, model: str, prompt: str, images: list[Image.Image],
               max_tokens: int) -> dict:
    content = [{"type": "text", "text": prompt}]
    content += [{"type": "image_url", "image_url": {"url": _encode(i)}} for i in images]
    body = {"model": model, "temperature": 0, "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": content}]}
    r = None
    for attempt in range(3):
        try:
            r = await c.post(FEATHERLESS_URL, json=body, headers={"Authorization": f"Bearer {key}"})
        except httpx.TransportError as e:
            if attempt == 2:
                raise ImportFailed("provider", f"vision provider unreachable: {type(e).__name__}")
        else:
            if r.status_code != 429 and r.status_code < 500:
                break
        if attempt < 2:
            await asyncio.sleep(2 + 3 * attempt)
    if r.status_code != 200:
        raise ImportFailed("provider", f"vision provider error {r.status_code}: {r.text[:200]}")
    try:
        text = r.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError):
        raise ImportFailed("provider", "unexpected vision provider response")
    return _json_block(text if isinstance(text, str) else json.dumps(text))


async def read_photo(data_url: str, api_key: str, model: str = DEFAULT_VISION_MODEL) -> Reading:
    """Find the screens, crop the data screen at full resolution, read it twice and keep what both reads agree on."""
    im = _decode(data_url)
    async with httpx.AsyncClient(timeout=90) as c:
        overview = _fit(im, 1288)
        scale = (im.width / overview.width, im.height / overview.height)
        found = (await _ask(c, api_key, model, LOCATE_PROMPT, [overview], 300)).get("screens") or []
        screens = [(s.get("kind"), _crop(im, s.get("bbox_2d") or [], scale)) for s in found if isinstance(s, dict)]
        screens = [(k, s) for k, s in screens if s is not None]
        tiles = [s for k, s in screens if k == "tiles"]
        data = max(tiles, key=lambda s: s.width * s.height) if tiles else im
        others = [_fit(s, 896) for _, s in screens if s is not data][:2]
        plain, sharp = _variants(data)
        reads = [_ask(c, api_key, model, VISION_PROMPT, [plain], 1500),
                 _ask(c, api_key, model, VISION_PROMPT, [sharp], 1500)]
        if others:
            reads.append(_ask(c, api_key, model, CLUB_PROMPT, others, 100))
        a, b, *label = await asyncio.gather(*reads)
    merged, unsure = merge_reads(screen_values(a), screen_values(b))
    if label and not merged["club"]:
        merged["club"] = label[0].get("club")
    merged["device"] = merged["device"] or (label[0].get("device") if label else None)
    return reading_from_vision(merged, unsure, low_res=min(data.size) < MIN_SCREEN_PX)


# --------------------------------------------------------------------------- video

def _majority(xs: list[Optional[str]]) -> Optional[str]:
    xs = [x for x in xs if x]
    return max(set(xs), key=xs.count) if xs else None


def borrow_labels(raw: list[Optional[dict]]) -> list[Optional[dict]]:
    """A video's frames show one screen with a fixed layout, but the model sometimes reads a frame's numbers and
    leaves its labels blank. Such a frame takes its missing labels and units, cell by cell, from the frame with the
    most labels, if both read the same number of cells. A strip whose labels no frame could read stays unlabelled."""
    def cells(r: Optional[dict]) -> list:
        return [x for x in (r or {}).get("cells") or [] if isinstance(x, dict)]

    def labelled(r: Optional[dict]) -> int:
        return sum(1 for x in cells(r) if x.get("label"))

    best = max(raw, key=labelled, default=None)
    if not labelled(best):
        return raw
    ref = cells(best)
    out = []
    for r in raw:
        cs = cells(r)
        if r is not None and r is not best and len(cs) == len(ref):
            r = {**r, "cells": [{**c, "label": c.get("label") or t.get("label"), "unit": c.get("unit") or t.get("unit")}
                                for c, t in zip(cs, ref)]}
        out.append(r)
    return out


def shots_from_frames(frames: list[Optional[dict]]) -> list[Shot]:
    """Shots from a video's frames, in order. A launch monitor shows each shot for several seconds, so the same shot
    appears in consecutive frames; a shot counts only when at least two frames read the same club speed and carry,
    and keeps only the values every one of those frames agrees on. Unreadable frames (None) don't break a run."""
    shots: list[Shot] = []
    run: list[Shot] = []

    def close() -> None:
        if len(run) >= 2:
            first = run[0].model_dump()
            shots.append(Shot(**{k: v for k, v in first.items()
                                 if v is not None and all(getattr(s, k) == v for s in run[1:])}))

    for d in frames:
        if d is None:
            continue
        try:
            s = reading_from_vision(d, low_res=True).mean
        except ImportFailed:
            continue
        key = (s.club_speed_mph, s.carry_yd)
        if run and key != (run[0].club_speed_mph, run[0].carry_yd):
            close()
            run = []
        run.append(s)
    close()
    return shots


def _summary(shots: list[Shot], fields) -> tuple[dict, dict]:
    """Mean and population SD: what TrackMan prints as Average and Consistency, so the golfer sees the same numbers.
    The fit itself works from the shot list, with its own robust statistics."""
    cols = {f: [getattr(s, f) for s in shots if getattr(s, f) is not None] for f in fields}
    mean = {f: round(sum(v) / len(v), 2) for f, v in cols.items() if v}
    sd = {f: round((sum((x - sum(v) / len(v)) ** 2 for x in v) / len(v)) ** 0.5, 2)
          for f, v in cols.items() if len(v) > 1}
    return mean, sd


async def read_video(frames: list[str], api_key: str, model: str = DEFAULT_VISION_MODEL) -> Reading:
    """Shots from frames of a video that shows a launch-monitor screen, filmed while the golfer hits."""
    ims = [_decode(f) for f in frames]
    if len(ims) < 2:
        raise ImportFailed("bad_image", "a video needs at least two frames")
    gate = asyncio.Semaphore(4)
    failures: list[ImportFailed] = []

    async def ask(prompt: str, images: list[Image.Image], tokens: int) -> Optional[dict]:
        async with gate:
            try:
                return await _ask(c, api_key, model, prompt, images, tokens)
            except ImportFailed as e:
                if e.code == "provider":
                    failures.append(e)
                return None

    async with httpx.AsyncClient(timeout=90) as c:
        box = None
        for i in (len(ims) // 2, 0):  # the middle frame, then the first if the screen was hidden mid-swing
            o = _fit(ims[i], 1288)
            found = (await ask(LOCATE_PROMPT, [o], 300) or {}).get("screens") or []
            tiles = [s for s in found if isinstance(s, dict) and s.get("kind") == "tiles"]
            if tiles:
                box = (tiles[0].get("bbox_2d") or [], (ims[i].width / o.width, ims[i].height / o.height))
                break
        if box is None:
            if failures:
                raise failures[-1]
            raise ImportFailed("no_screen", "no launch-monitor screen in the video")
        # A hand-held phone drifts a little; the wider margin keeps the screen in every frame's crop.
        crops = [_crop(im, *box, pad=0.08) for im in ims]
        raw = await asyncio.gather(*(ask(VISION_PROMPT, [_fit(cr, 1400)], 1500) if cr else asyncio.sleep(0)
                                     for cr in crops))
        reads = [screen_values(r) if r else None for r in borrow_labels(list(raw))]
    shots = shots_from_frames(list(reads))
    if not shots:
        if sum(r is None for r in reads) > len(reads) // 2 and failures:
            raise failures[-1]
        raise ImportFailed("video_unclear", "no shot was read the same way in two frames")
    device = _majority([str(r.get("device"))[:60] for r in reads if r and r.get("device")])
    mean, sd = _summary(shots, PHOTO_FIELDS.values())
    mean_shot = Shot(**mean)
    dist = _majority([_unit(r.get("distance_unit")) for r in reads if r])
    notes = ["single_shot"] if len(shots) == 1 else []
    if mean_shot.carry_yd is not None and dist is None:
        notes.append("units_guessed")
    return Reading(source="video", device=device, kind=device_kind(device),
                   club=_majority([normalise_club(r.get("club")) for r in reads if r]), shots=len(shots),
                   mean=mean_shot, sd=Shot(**sd), shot_list=shots, notes=notes + _plausibility(mean_shot),
                   screen_distance_unit=dist if dist in ("yd", "m") else None)


# --------------------------------------------------------------------------- TrackMan report link

def report_target(url: str) -> tuple[str, str]:
    """('getreport', id) or ('getactivityreport', id) from a shared web-dynamic-reports link."""
    u = urlparse(url.strip())
    if u.scheme != "https" or u.hostname != TRACKMAN_REPORT_HOST:
        raise ImportFailed("not_trackman_link", "expected a https://web-dynamic-reports.trackmangolf.com link")
    q = {k.lower(): v[0] for k, v in parse_qs(u.query).items() if v}
    if q.get("r") or q.get("reportid"):
        kind, rid = "getreport", q.get("r") or q["reportid"]
    elif q.get("a") or q.get("activityid"):
        kind, rid = "getactivityreport", q.get("a") or q["activityid"]
    else:
        raise ImportFailed("not_trackman_link", "the link has no report id")
    if not re.fullmatch(r"[A-Za-z0-9-]{4,80}", rid):
        raise ImportFailed("not_trackman_link", "malformed report id")
    return kind, rid


REPORT_FIELDS = {"ClubSpeed": "club_speed_mph", "Carry": "carry_yd", "LaunchAngle": "launch_angle_deg",
                 "LandingAngle": "landing_angle_deg", "DynamicLoft": "dynamic_loft_deg",
                 "AttackAngle": "attack_angle_deg", "FaceToPath": "face_to_path_deg", "CarrySide": "side_yd",
                 "ImpactOffset": "impact_offset_mm"}


def _find(d: Any, key: str) -> Any:
    if isinstance(d, dict):
        if key in d:
            return d[key]
        for v in d.values():
            found = _find(v, key)
            if found is not None:
                return found
    elif isinstance(d, list):
        for v in d:
            found = _find(v, key)
            if found is not None:
                return found
    return None


def readings_from_report(report: dict) -> list[Reading]:
    """One Reading per club in the report. TrackMan's report API is SI; units are detected, not assumed."""
    groups = _find(report, "StrokeGroups") or []
    by_club: dict[str, list[dict]] = {}
    for g in groups:
        for st in g.get("Strokes") or []:
            m = st.get("Measurement") or {}
            club = normalise_club(st.get("Club") or g.get("Club"))
            if club and m:
                by_club.setdefault(club, []).append(m)
    out = []
    for club, ms in by_club.items():
        speeds = sorted(x for x in (_num(m.get("ClubSpeed")) for m in ms) if x)
        si = bool(speeds) and speeds[len(speeds) // 2] < 60
        offs = [abs(x) for x in (_num(m.get("ImpactOffset")) for m in ms) if x is not None]
        off_m = bool(offs) and max(offs) < 0.1
        shots = []
        for m in ms:
            s = {}
            for src, dst in REPORT_FIELDS.items():
                v = _num(m.get(src))
                if v is None:
                    continue
                if dst == "club_speed_mph" and si:
                    v *= MS_TO_MPH
                elif dst in ("carry_yd", "side_yd") and si:
                    v *= M_TO_YD
                elif dst == "impact_offset_mm" and off_m:
                    v *= 1000
                s[dst] = round(v, 2)
            if s.get("club_speed_mph") or s.get("carry_yd"):
                shots.append(Shot(**s))
        if not shots:
            continue
        mean, sd = _summary(shots, REPORT_FIELDS.values())
        mean_shot = Shot(**mean)
        out.append(Reading(source="report", device="TrackMan", kind="trackman", club=club, shots=len(shots),
                           mean=mean_shot, sd=Shot(**sd), shot_list=shots,
                           notes=(["single_shot"] if len(shots) == 1 else []) + _plausibility(mean_shot)))
    if not out:
        raise ImportFailed("no_numbers", "the report has no shots with club speed or carry")
    return out


async def read_report(url: str) -> list[Reading]:
    kind, rid = report_target(url)
    payload = {"ActivityId" if kind == "getactivityreport" else "ReportId": rid}
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.post(f"{TRACKMAN_REPORT_API}/{kind}", json=payload,
                         headers={"Origin": f"https://{TRACKMAN_REPORT_HOST}",
                                  "Referer": f"https://{TRACKMAN_REPORT_HOST}/"})
    if r.status_code == 404:
        raise ImportFailed("report_not_found", "TrackMan has no report with that id")
    if r.status_code in (401, 403):
        raise ImportFailed("report_private", "that report needs a TrackMan login")
    if r.status_code != 200:
        raise ImportFailed("provider", f"TrackMan error {r.status_code}")
    try:
        return readings_from_report(r.json())
    except ValueError:
        raise ImportFailed("unreadable", "TrackMan returned something that isn't a report")
