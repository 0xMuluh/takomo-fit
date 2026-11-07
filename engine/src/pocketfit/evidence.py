"""One evidence row per golfer, built either from the lab's CSV tables or from an API request.

Both builders must produce identical values for the same golfer; the model is
validated on the table path and served on the request path
(tests/test_evidence_parity.py checks this).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from takomo_fit import products as PR

from .schemas import FitRequest

FLIGHTS = ["low", "mid", "high"]
TEMPOS = ["smooth", "moderate", "quick"]
ROUNDS = ["Under 10", "10-30", "31-50", "Over 50"]
GLOVE_DEFAULT = {"male": "M", "female": "S"}

NUMERIC = [
    "age", "female", "rounds", "score_bucket_self", "rep_speed", "rep_carry", "own_loft", "flight_self",
    "tempo_self", "height_self", "wtf_self", "glove_self", "glove_guessed",
    "height_photo", "wtf_photo", "photo_good", "hand_photo", "finger_photo",
    "video_back_s", "video_down_s", "video_total_s", "video_fps", "video_speed",
    "ball_line_tilt", "spray_mean", "spray_sd",
    "radar_speed", "radar_carry", "radar_launch",
    "tm_speed", "tm_carry", "tm_toe_up_own", "tm_land_own", "tm_launch_own", "tm_dyn_loft", "tm_attack",
    "tm_offset_sd", "tm_side_sd", "tm_face_to_path_sd", "tm_toe_up_takomo", "tm_land_201",
]
TEXT = ["chars", "handedness", "sex"]
COLUMNS = NUMERIC + TEXT

SOURCE_COLUMNS = {
    "body": ["height_photo", "wtf_photo", "photo_good"],
    "hand": ["hand_photo", "finger_photo"],
    "video": ["video_total_s", "video_back_s", "video_down_s", "video_fps", "video_speed"],
    "home_tests": ["ball_line_tilt", "spray_mean", "spray_sd"],
    "radar": ["radar_speed", "radar_carry", "radar_launch"],
    "trackman": ["tm_speed", "tm_carry", "tm_toe_up_own", "tm_toe_up_takomo", "tm_land_201", "tm_land_own",
                 "tm_dyn_loft", "tm_attack", "tm_offset_sd", "tm_side_sd", "tm_face_to_path_sd", "tm_launch_own"],
}
TIERS = {
    "questionnaire": [],
    "+photos": ["body", "hand"],
    "+swing video": ["body", "hand", "video"],
    "+home tests": ["body", "hand", "video", "home_tests"],
    "+launch monitor": ["body", "hand", "video", "home_tests", "radar", "trackman"],
}


def load_split(data_dir: str | Path) -> dict[str, pd.DataFrame]:
    d = Path(data_dir)
    return {f: pd.read_csv(d / f"{f}.csv") for f in
            ["golfers", "questionnaire", "phone_measurements", "home_tests", "shots", "labels"]
            if (d / f"{f}.csv").exists()}


def _sd(values) -> float:
    v = pd.Series(values, dtype=float).dropna()
    return float(v.std()) if len(v) > 1 else np.nan


def _mean(values) -> float:
    v = pd.Series(values, dtype=float).dropna()
    return float(v.mean()) if len(v) else np.nan


def _median(values) -> float:
    v = pd.Series(values, dtype=float).dropna()
    return float(v.median()) if len(v) else np.nan


def from_tables(t: dict[str, pd.DataFrame]) -> pd.DataFrame:
    q = t["questionnaire"].set_index("golfer_id")
    g = t["golfers"].set_index("golfer_id").reindex(q.index)
    ph = t["phone_measurements"].set_index("golfer_id").reindex(q.index)
    sh, te = t["shots"], t["home_tests"]

    e = pd.DataFrame(index=q.index)
    e["age"] = q.age.astype(float)
    e["female"] = (q.sex == "female").astype(float)
    e["rounds"] = q.rounds_per_year.map({r: i for i, r in enumerate(ROUNDS)}).astype(float)
    e["score_bucket_self"] = q.score_bucket.astype(float)
    e["rep_speed"] = q.reported_7i_speed_mph.astype(float)
    e["rep_carry"] = q.reported_7i_carry_yd.astype(float)
    e["own_loft"] = g.own_7i_loft_deg.astype(float)
    e["flight_self"] = q.flight.map({f: i for i, f in enumerate(FLIGHTS)}).astype(float)
    e["tempo_self"] = q.tempo.map({x: i for i, x in enumerate(TEMPOS)}).astype(float)
    e["height_self"] = q.height_cm.astype(float)
    e["wtf_self"] = q.wrist_to_floor_cm.astype(float)
    e["glove_self"] = q.glove.map({s: i for i, s in enumerate(PR.GLOVE_ORDER)}).astype(float)
    e["glove_guessed"] = q.glove_was_guessed.astype(float)

    e["height_photo"] = ph.height_photo_cm.astype(float)
    e["wtf_photo"] = ph.wrist_to_floor_photo_cm.astype(float)
    has_body = ph.height_photo_cm.notna() | ph.wrist_to_floor_photo_cm.notna()
    e["photo_good"] = np.where(has_body, (ph.body_photo_quality == "good").astype(float), np.nan)
    e["hand_photo"] = ph.hand_length_photo_cm.astype(float)
    e["finger_photo"] = ph.finger_length_photo_cm.astype(float)
    e["video_back_s"] = ph.backswing_video_s.astype(float)
    e["video_down_s"] = ph.downswing_video_s.astype(float)
    e["video_total_s"] = e.video_back_s + e.video_down_s
    e["video_fps"] = ph.swing_video_fps.astype(float)
    e["video_speed"] = ph.clubhead_speed_video_mph.astype(float)

    tests = te.groupby(["golfer_id", "test"]).value
    mean, sd = tests.mean().unstack(), tests.std().unstack()
    e["ball_line_tilt"] = mean.get("ball_line_tilt", pd.Series(dtype=float)).reindex(e.index)
    e["spray_mean"] = mean.get("impact_spray_offset", pd.Series(dtype=float)).reindex(e.index)
    e["spray_sd"] = sd.get("impact_spray_offset", pd.Series(dtype=float)).reindex(e.index)

    own = sh[sh.club == "own_7i"]
    rad = own[own.session == "home_radar"].groupby("golfer_id")
    e["radar_speed"] = rad.club_speed_mph.median().reindex(e.index)
    e["radar_carry"] = rad.carry_yd.median().reindex(e.index)
    e["radar_launch"] = rad.launch_angle_deg.median().reindex(e.index)
    tmo = own[own.session == "trackman_fitting"].groupby("golfer_id")
    e["tm_speed"] = tmo.club_speed_mph.median().reindex(e.index)
    e["tm_carry"] = tmo.carry_yd.median().reindex(e.index)
    e["tm_toe_up_own"] = tmo.impact_toe_up_deg.mean().reindex(e.index)
    e["tm_land_own"] = tmo.landing_angle_deg.mean().reindex(e.index)
    e["tm_launch_own"] = tmo.launch_angle_deg.mean().reindex(e.index)
    e["tm_dyn_loft"] = tmo.dynamic_loft_deg.mean().reindex(e.index)
    e["tm_attack"] = tmo.attack_angle_deg.mean().reindex(e.index)
    e["tm_offset_sd"] = tmo.impact_offset_mm.std().reindex(e.index)
    e["tm_side_sd"] = tmo.side_yd.std().reindex(e.index)
    e["tm_face_to_path_sd"] = tmo.face_to_path_deg.std().reindex(e.index)
    tk = sh[sh.club.str.startswith("takomo_")]
    e["tm_toe_up_takomo"] = tk.groupby("golfer_id").impact_toe_up_deg.mean().reindex(e.index)
    t201 = tk[tk.club.str.startswith("takomo_201")]
    e["tm_land_201"] = t201.groupby("golfer_id").landing_angle_deg.mean().reindex(e.index)

    e["chars"] = q.characteristics.fillna("").astype(str)
    e["handedness"] = q.handedness
    e["sex"] = q.sex
    return e[COLUMNS]


def from_request(req: FitRequest, golfer_id: str = "request") -> pd.DataFrame:
    q, ev = req.questionnaire, req.evidence
    r: dict[str, float | str] = {c: np.nan for c in NUMERIC}
    r.update(age=float(q.age), female=float(q.sex == "female"),
             rounds=float(ROUNDS.index(q.rounds_per_year)) if q.rounds_per_year else np.nan,
             score_bucket_self=float(q.score_bucket),
             rep_speed=q.speed_mph if q.speed_mph is not None else np.nan,
             rep_carry=q.carry_yd if q.speed_mph is None and q.carry_yd is not None else np.nan,
             own_loft=q.own_7i_loft_deg if q.own_7i_loft_deg is not None else np.nan,
             flight_self=float(FLIGHTS.index(q.flight)), tempo_self=float(TEMPOS.index(q.tempo)),
             height_self=q.height_cm)
    # the questionnaire asks for wrist-to-floor; if the golfer skipped it, the photo-free prior is used
    r["wtf_self"] = q.wrist_to_floor_cm if q.wrist_to_floor_cm is not None else 0.4855 * q.height_cm + 2.0
    glove = q.glove or GLOVE_DEFAULT[q.sex]
    r["glove_self"] = float(PR.GLOVE_ORDER.index(glove))
    r["glove_guessed"] = float(q.glove is None)

    if ev.body_photo:
        b = ev.body_photo
        if b.method == "reference":
            r["height_photo"] = b.height_cm if b.height_cm is not None else np.nan
            r["wtf_photo"] = b.wrist_to_floor_cm if b.wrist_to_floor_cm is not None else np.nan
            r["photo_good"] = float(b.quality == "good")
        elif b.wrist_to_floor_ratio is not None:
            # Scale comes from the stated height, so its error is shared with the answer:
            # enter it at the conservative error class until measured on real golfers.
            r["wtf_photo"] = b.wrist_to_floor_ratio * q.height_cm
            r["photo_good"] = 0.0
    if ev.hand_photo:
        r["hand_photo"] = ev.hand_photo.hand_length_cm
        r["finger_photo"] = ev.hand_photo.finger_length_cm if ev.hand_photo.finger_length_cm else np.nan
    if ev.swing_video:
        v = ev.swing_video
        r.update(video_back_s=v.backswing_s, video_down_s=v.downswing_s,
                 video_total_s=v.backswing_s + v.downswing_s, video_fps=v.fps)
        if v.clubhead_speed_mph is not None and v.fps >= 200:
            r["video_speed"] = v.clubhead_speed_mph
    if ev.ball_line_tilts_deg:
        r["ball_line_tilt"] = _mean(ev.ball_line_tilts_deg)
    if ev.impact_spray_offsets_mm:
        r["spray_mean"] = _mean(ev.impact_spray_offsets_mm)
        r["spray_sd"] = _sd(ev.impact_spray_offsets_mm)
    lm = ev.launch_monitor
    if lm:
        if len(lm.own_7i) >= 3:
            own = pd.DataFrame([s.model_dump() for s in lm.own_7i])
            med = {f: _median(own[f]) for f in own.columns}
            avg = {f: _mean(own[f]) for f in own.columns}
            spread = {f: _sd(own[f]) for f in own.columns}
        else:
            # A screen's session average stands in for both median and mean: launch-monitor groups are near-symmetric.
            s = lm.own_7i_summary
            med = avg = {k: (np.nan if v is None else v) for k, v in s.mean.model_dump().items()}
            spread = {k: (np.nan if v is None or (s.shots or 0) == 1 else v) for k, v in s.sd.model_dump().items()}
        if lm.kind == "home_radar":
            r.update(radar_speed=med["club_speed_mph"], radar_carry=med["carry_yd"],
                     radar_launch=med["launch_angle_deg"])
        else:
            r.update(tm_speed=med["club_speed_mph"], tm_carry=med["carry_yd"],
                     tm_toe_up_own=avg["impact_toe_up_deg"], tm_land_own=avg["landing_angle_deg"],
                     tm_launch_own=avg["launch_angle_deg"], tm_dyn_loft=avg["dynamic_loft_deg"],
                     tm_attack=avg["attack_angle_deg"], tm_offset_sd=spread["impact_offset_mm"],
                     tm_side_sd=spread["side_yd"], tm_face_to_path_sd=spread["face_to_path_deg"])
            if lm.takomo_test_club:
                tk = pd.DataFrame([s.model_dump() for s in lm.takomo_test_club])
                r["tm_toe_up_takomo"] = _mean(tk.impact_toe_up_deg)
            if lm.takomo_201_landing_angles:
                r["tm_land_201"] = _mean(lm.takomo_201_landing_angles)
    r["chars"] = "|".join(q.characteristics)
    r["handedness"] = q.handedness
    r["sex"] = q.sex
    return pd.DataFrame([r], index=pd.Index([golfer_id], name="golfer_id"))[COLUMNS]


def _clean(v):
    return None if v is None or (isinstance(v, float) and np.isnan(v)) else v


def request_from_tables(t: dict[str, pd.DataFrame], golfer_id: str) -> FitRequest:
    """Express one lab golfer as an API request (used for parity tests and demos)."""
    q = t["questionnaire"].set_index("golfer_id").loc[golfer_id]
    g = t["golfers"].set_index("golfer_id").loc[golfer_id]
    ph = t["phone_measurements"].set_index("golfer_id").loc[golfer_id]
    sh = t["shots"][t["shots"].golfer_id == golfer_id]
    te = t["home_tests"][t["home_tests"].golfer_id == golfer_id]
    c = lambda v: _clean(float(v)) if v is not None and not pd.isna(v) else None

    questionnaire = dict(
        age=int(q.age), sex=q.sex, handedness=q.handedness, rounds_per_year=_clean(q.rounds_per_year),
        score_bucket=int(q.score_bucket),
        speed_mph=c(q.reported_7i_speed_mph) if q.speed_or_carry == "speed" else None,
        carry_yd=c(q.reported_7i_carry_yd) if q.speed_or_carry == "carry" else None,
        own_7i_loft_deg=c(g.own_7i_loft_deg),
        characteristics=[x for x in str(q.characteristics).split("|") if x and x != "nan"],
        flight=q.flight, tempo=q.tempo, height_cm=float(q.height_cm), wrist_to_floor_cm=float(q.wrist_to_floor_cm),
        glove=None if bool(q.glove_was_guessed) else q.glove)
    ev: dict = {}
    if c(ph.height_photo_cm) is not None or c(ph.wrist_to_floor_photo_cm) is not None:
        ev["body_photo"] = dict(method="reference", height_cm=c(ph.height_photo_cm),
                                wrist_to_floor_cm=c(ph.wrist_to_floor_photo_cm), quality=ph.body_photo_quality)
    if c(ph.hand_length_photo_cm) is not None:
        ev["hand_photo"] = dict(method="sheet", hand_length_cm=c(ph.hand_length_photo_cm),
                                finger_length_cm=c(ph.finger_length_photo_cm))
    if c(ph.backswing_video_s) is not None:
        ev["swing_video"] = dict(fps=c(ph.swing_video_fps), backswing_s=c(ph.backswing_video_s),
                                 downswing_s=c(ph.downswing_video_s), clubhead_speed_mph=c(ph.clubhead_speed_video_mph))
    bl = te[te.test == "ball_line_tilt"].value.tolist()
    sp = te[te.test == "impact_spray_offset"].value.tolist()
    if bl:
        ev["ball_line_tilts_deg"] = bl
    if sp:
        ev["impact_spray_offsets_mm"] = sp
    shot_fields = ["club_speed_mph", "carry_yd", "launch_angle_deg", "landing_angle_deg", "dynamic_loft_deg",
                   "attack_angle_deg", "face_to_path_deg", "side_yd", "impact_offset_mm", "impact_toe_up_deg"]
    shots = lambda df: [{f: c(r[f]) for f in shot_fields} for _, r in df.iterrows()]
    own = sh[sh.club == "own_7i"]
    if len(own):
        kind = "trackman" if (own.session == "trackman_fitting").any() else "home_radar"
        tk = sh[sh.club.str.startswith("takomo_")]
        ev["launch_monitor"] = dict(
            kind=kind, own_7i=shots(own), takomo_test_club=shots(tk),
            takomo_201_landing_angles=tk[tk.club.str.startswith("takomo_201")].landing_angle_deg.dropna().tolist())
    return FitRequest.model_validate({"questionnaire": questionnaire, "evidence": ev})


def mask_sources(e: pd.DataFrame, keep: list[str]) -> pd.DataFrame:
    m = e.copy()
    for src, cols in SOURCE_COLUMNS.items():
        if src not in keep:
            m[cols] = np.nan
    return m
