import pytest
from fastapi.testclient import TestClient

from pocketfit import launch_import as LI
from pocketfit.api import create_app
from pocketfit.evidence import from_request
from pocketfit.schemas import FitRequest, LaunchMonitor
from pocketfit.service import FitService

QUESTIONNAIRE = {"age": 34, "sex": "male", "score_bucket": 3, "carry_yd": 165, "flight": "mid", "tempo": "moderate",
                 "height_cm": 180}

# What a vision model transcribes from a TrackMan tile screen like the one golfers photograph on a simulator:
# big number = last shot, bottom-left = session average, bottom-right = consistency.
TRACKMAN_TILES = {
    "device": "TrackMan", "club": "6 Iron", "speed_unit": "mph", "distance_unit": "yd", "shots": None,
    "values": {
        "club_speed": {"shot": 88.3, "average": 88.7, "spread": 1.7},
        "ball_speed": {"shot": 121.2, "average": 120.8, "spread": 2.2},
        "carry": {"shot": 159.7, "average": 161.2, "spread": 3.0},
        "launch_angle": {"shot": 16.2, "average": 14.8, "spread": 2.1},
        "landing_angle": {"shot": 45.8, "average": 43.0, "spread": 4.5},
        "attack_angle": {"shot": -4.1, "average": -3.0, "spread": 0.9},
        "carry_side": {"shot": None, "average": None, "spread": None},
    },
}


def test_photo_reading_uses_session_averages_and_spread():
    r = LI.reading_from_vision(TRACKMAN_TILES)
    assert r.kind == "trackman" and r.club == "6i" and r.source == "photo"
    assert r.mean.club_speed_mph == 88.7 and r.mean.carry_yd == 161.2 and r.mean.attack_angle_deg == -3.0
    assert r.sd.club_speed_mph == 1.7 and r.sd.carry_yd == 3.0
    assert r.notes == []


def test_photo_reading_converts_metric_and_flags_single_shots():
    d = {"device": "Garmin R10", "club": "7i", "speed_unit": "km/h", "distance_unit": "m",
         "values": {"club_speed": {"shot": 130}, "carry": {"shot": 135}, "carry_side": {"shot": "4.0L"}}}
    r = LI.reading_from_vision(d)
    assert r.kind == "home_radar" and r.shots == 1 and "single_shot" in r.notes
    assert r.mean.club_speed_mph == pytest.approx(80.78, abs=0.01)
    assert r.mean.carry_yd == pytest.approx(147.64, abs=0.01)
    assert r.mean.side_yd == pytest.approx(-4.37, abs=0.01)
    assert r.sd.club_speed_mph is None


def test_photo_reading_rejects_what_is_not_an_iron_session():
    with pytest.raises(LI.ImportFailed) as e:
        LI.reading_from_vision({"values": {"club_speed": {"average": 160}}, "speed_unit": "mph"})
    assert e.value.code == "implausible"
    with pytest.raises(LI.ImportFailed) as e:
        LI.reading_from_vision({"values": {"spin_rate": {"average": 5300}}})
    assert e.value.code == "no_numbers"


def test_photo_reading_flags_numbers_that_disagree():
    d = {**TRACKMAN_TILES, "values": {**TRACKMAN_TILES["values"], "carry": {"average": 220.0}}}
    assert "carry_implausible" in LI.reading_from_vision(d).notes


def test_two_reads_keep_only_what_they_agree_on():
    other = {**TRACKMAN_TILES, "club": None, "values": {**TRACKMAN_TILES["values"],
                                                        "carry": {"shot": 159.7, "average": 161.2, "spread": 9.0},
                                                        "attack_angle": {"shot": -4.1, "average": -8.0}}}
    merged, unsure = LI.merge_reads(TRACKMAN_TILES, other)
    assert merged["club"] == "6i" and unsure == {"carry", "attack_angle"}
    r = LI.reading_from_vision(merged, unsure)
    assert r.mean.club_speed_mph == 88.7 and r.mean.carry_yd == 161.2 and r.sd.carry_yd is None
    assert r.mean.attack_angle_deg is None
    assert r.unsure == ["carry_yd", "attack_angle_deg"] and "unsure" in r.notes


def test_side_total_is_never_carry_side():
    d = {**TRACKMAN_TILES, "values": {**TRACKMAN_TILES["values"],
                                      "carry_side": {"label": "SIDE TOT.", "shot": -8.5, "average": -2.5}}}
    assert LI.reading_from_vision(d).mean.side_yd is None


def test_low_resolution_screens_use_only_the_big_numbers():
    r = LI.reading_from_vision(TRACKMAN_TILES, low_res=True)
    assert r.mean.club_speed_mph == 88.3 and r.mean.carry_yd == 159.7 and r.mean.attack_angle_deg == -4.1
    assert r.sd.club_speed_mph is None and r.shots == 1
    assert {"low_res", "single_shot"} <= set(r.notes)


def test_full_length_shared_trackman_links_are_accepted(model, monkeypatch):
    async def fake(url):
        assert LI.report_target(url) == ("getreport", "dbf18016-4059-4806-a07f-60f675e79fc9")
        return [LI.Reading(source="report", kind="trackman", club="6i", shots=1, mean={"club_speed_mph": 85.1})]
    monkeypatch.setattr("pocketfit.api.read_report", fake)
    link = ("https://web-dynamic-reports.trackmangolf.com/?r=dbf18016-4059-4806-a07f-60f675e79fc9&dm=c&nd=true"
            + "&mp%5B%5D=ClubSpeed&mp%5B%5D=BallSpeed&mp%5B%5D=SmashFactor&mp%5B%5D=Carry" * 8 + "&sc=6Iron")
    assert len(link) > 500
    c = TestClient(create_app(service=FitService(model)))
    assert c.post("/v1/launch-monitor/report", json={"url": link}).status_code == 200


def _frame(speed, carry, launch=16.2):
    return {"device": "Foresight GCQuad", "club": "7 iron", "speed_unit": "mph", "distance_unit": "yd",
            "values": {"club_speed": {"shot": speed}, "carry": {"shot": carry}, "launch_angle": {"shot": launch}}}


def test_video_counts_a_shot_only_when_two_frames_agree():
    frames = [_frame(80.1, 150.2), None, _frame(80.1, 150.2, launch=17.0),  # shot 1, launch misread once
              _frame(81.4, 152.0),                                         # seen once: dropped
              _frame(79.0, 147.5), _frame(79.0, 147.5), _frame(79.0, 147.5)]
    shots = LI.shots_from_frames(frames)
    assert [(s.club_speed_mph, s.carry_yd) for s in shots] == [(80.1, 150.2), (79.0, 147.5)]
    assert shots[0].launch_angle_deg is None and shots[1].launch_angle_deg == 16.2


def test_screen_values_come_only_from_printed_labels():
    cells = [{"label": "CLUB SPEED", "value": "83.7", "unit": "mph", "average": "86.2", "spread": "±1.9"},
             {"label": "CARRY", "value": "159.4", "unit": "m", "average": "159.9", "spread": "8.9"},
             {"label": "TOTAL DIST.", "value": "168.8", "unit": "m"},
             {"label": "SIDE TOT.", "value": "8.0L", "unit": "m"},
             {"label": "LAUNCH ANG.", "value": "16.7", "unit": "deg"},
             {"label": "LAUNCH DIR.", "value": "1.2R", "unit": "deg"},
             {"label": "LAND. ANG.", "value": "44.6"},
             {"label": None, "value": "-2.8"}]
    d = LI.screen_values({"device": "TrackMan", "club": "6 Iron", "cells": cells})
    assert d["speed_unit"] == "mph" and d["distance_unit"] == "m"
    assert d["values"]["club_speed"] == {"label": "CLUB SPEED", "shot": 83.7, "average": 86.2, "spread": 1.9}
    assert {k: v["shot"] for k, v in d["values"].items()} == {
        "club_speed": 83.7, "carry": 159.4, "total": 168.8, "side_total": -8.0, "launch_angle": 16.7,
        "launch_direction": 1.2, "landing_angle": 44.6}
    r = LI.reading_from_vision(d)
    assert r.mean.club_speed_mph == 86.2 and r.sd.club_speed_mph == 1.9
    assert r.mean.carry_yd == pytest.approx(159.9 * LI.M_TO_YD, abs=0.01) and r.screen_distance_unit == "m"
    assert r.mean.side_yd is None and r.mean.attack_angle_deg is None


def test_an_unlabelled_strip_gives_no_numbers():
    strip = {"cells": [{"label": None, "value": v} for v in ("162.9", "176.8", "24.5", "4178", "15.7", "41.2")]}
    with pytest.raises(LI.ImportFailed) as e:
        LI.reading_from_vision(LI.screen_values(strip))
    assert e.value.code == "no_numbers"


def test_a_field_claimed_twice_with_different_numbers_is_dropped():
    d = LI.screen_values({"cells": [{"label": "Club Speed", "value": "84.2", "unit": "mph"},
                                    {"label": "Carry", "value": "153.3"}, {"label": "CLUB SPEED", "value": "74.6"}]})
    assert "club_speed" not in d["values"] and d["speed_unit"] is None
    r = LI.reading_from_vision(d)
    assert r.mean.carry_yd == 153.3 and r.screen_distance_unit is None and "units_guessed" in r.notes


def test_video_frames_borrow_labels_only_from_the_same_layout():
    labelled = {"cells": [{"label": "CLUB SPEED", "value": "84.2", "unit": "mph"}, {"label": "CARRY", "value": "153.3"}]}
    blank = {"cells": [{"label": None, "value": "84.2"}, {"label": None, "value": "153.3"}]}
    other = {"cells": [{"label": None, "value": "84.2"}]}
    out = LI.borrow_labels([labelled, blank, other, None])
    assert out[1]["cells"][0] == {"label": "CLUB SPEED", "value": "84.2", "unit": "mph"} and out[2] is other
    assert [s.club_speed_mph for s in LI.shots_from_frames([LI.screen_values(r) for r in out[:2]])] == [84.2]
    strip = [{"cells": [{"label": None, "value": "162.9"}]}] * 2
    assert LI.borrow_labels(strip) == strip


def test_summary_matches_trackmans_average_and_consistency_rows():
    speeds = [87.4, 84.4, 88.3, 85.1, 83.7, 84.2, 85.1, 89.2, 88.1]  # 6 iron, report dbf18016: Average 86.2, ±1.9
    carries = [158.5, 165.4, 159.7, 162.9, 159.4, 153.3, 166.4, 139.9, 173.4]  # metres: Average 159.9, ±8.9
    mean, sd = LI._summary([LI.Shot(club_speed_mph=s, carry_yd=c) for s, c in zip(speeds, carries)],
                           ["club_speed_mph", "carry_yd"])
    assert round(mean["club_speed_mph"], 1) == 86.2 and round(mean["carry_yd"], 1) == 159.9
    assert sd["club_speed_mph"] == pytest.approx(1.9, abs=0.06) and round(sd["carry_yd"], 1) == 8.9


def test_screen_crop_maps_boxes_back_to_the_full_photo():
    im = LI.Image.new("RGB", (2000, 3000))
    small = LI._fit(im, 1288)
    assert small.width % 28 == 0 and small.height % 28 == 0
    scale = (im.width / small.width, im.height / small.height)
    crop = LI._crop(im, [100, 200, 500, 400], scale, pad=0)
    assert crop.size == (round(500 * scale[0]) - round(100 * scale[0]), round(400 * scale[1]) - round(200 * scale[1]))
    assert LI._crop(im, [10, 10, 12, 12], scale) is None and LI._crop(im, ["x"], scale) is None
    with pytest.raises(LI.ImportFailed) as e:
        LI._decode("data:image/jpeg;base64,AAAA")
    assert e.value.code == "bad_image"


@pytest.mark.parametrize("raw,club", [("7 Iron", "7i"), ("7Iron", "7i"), ("I7", "7i"), ("seven iron", "7i"),
                                      ("PitchingWedge", "pw"), ("Driver", "driver"), ("3 Wood", "wood"),
                                      ("4H", "hybrid"), ("", None), ("putter", None)])
def test_normalise_club(raw, club):
    assert LI.normalise_club(raw) == club


def test_report_link_must_be_a_trackman_report():
    assert LI.report_target("https://web-dynamic-reports.trackmangolf.com/?r=abc-123") == ("getreport", "abc-123")
    assert LI.report_target("https://web-dynamic-reports.trackmangolf.com/activities?a=XY99") == ("getactivityreport", "XY99")
    for bad in ["https://evil.example/?r=abc123", "http://web-dynamic-reports.trackmangolf.com/?r=abc123",
                "https://web-dynamic-reports.trackmangolf.com/", "https://web-dynamic-reports.trackmangolf.com/?r=../x"]:
        with pytest.raises(LI.ImportFailed):
            LI.report_target(bad)


def test_report_in_si_units_becomes_mph_and_yards_per_club():
    def stroke(club, speed_ms, carry_m, offset_m):
        return {"Club": club, "Measurement": {"ClubSpeed": speed_ms, "Carry": carry_m, "LaunchAngle": 18.0,
                                              "CarrySide": -2.0, "ImpactOffset": offset_m}}
    report = {"StrokeGroups": [
        {"Club": "7Iron", "Strokes": [stroke("7Iron", 36.0 + i * 0.5, 130.0 + i, 0.002 * i) for i in range(5)]},
        {"Club": "Driver", "Strokes": [stroke("Driver", 45.0, 210.0, 0.0)]},
    ]}
    rs = {r.club: r for r in LI.readings_from_report(report)}
    assert set(rs) == {"7i", "driver"}
    seven = rs["7i"]
    assert seven.shots == 5 and len(seven.shot_list) == 5
    assert seven.mean.club_speed_mph == pytest.approx(37.0 * LI.MS_TO_MPH, abs=0.02)
    assert seven.mean.carry_yd == pytest.approx(132.0 * LI.M_TO_YD, abs=0.02)
    assert seven.shot_list[4].impact_offset_mm == pytest.approx(8.0)
    assert "single_shot" in rs["driver"].notes


def test_summary_evidence_reaches_the_model_like_shots_do():
    summary = {"kind": "trackman", "source": "photo",
               "own_7i_summary": {"mean": {"club_speed_mph": 86.0, "carry_yd": 158.0, "launch_angle_deg": 17.0},
                                  "sd": {"side_yd": 6.0, "face_to_path_deg": 1.5}}}
    row = from_request(FitRequest(questionnaire=QUESTIONNAIRE, evidence={"launch_monitor": summary})).iloc[0]
    assert row.tm_speed == 86.0 and row.tm_carry == 158.0 and row.tm_launch_own == 17.0
    assert row.tm_side_sd == 6.0 and row.tm_face_to_path_sd == 1.5

    one = {**summary, "own_7i_summary": {**summary["own_7i_summary"], "shots": 1}}
    row = from_request(FitRequest(questionnaire=QUESTIONNAIRE, evidence={"launch_monitor": one})).iloc[0]
    assert row.tm_speed == 86.0 and row.isna().tm_side_sd


def test_launch_monitor_needs_shots_or_a_summary():
    with pytest.raises(ValueError):
        LaunchMonitor(kind="trackman", own_7i=[{"club_speed_mph": 80}])
    with pytest.raises(ValueError):
        LaunchMonitor(kind="trackman", own_7i_summary={"mean": {"launch_angle_deg": 15}})


def test_photo_endpoint_reports_when_not_configured(model, monkeypatch):
    monkeypatch.delenv("FEATHERLESS_API_KEY", raising=False)
    c = TestClient(create_app(service=FitService(model)))
    r = c.post("/v1/launch-monitor/photo", json={"image": "data:image/jpeg;base64,AAAA"})
    assert r.status_code == 503 and r.json()["detail"]["code"] == "not_configured"
    r = c.post("/v1/launch-monitor/report", json={"url": "https://example.com/?r=abc123"})
    assert r.status_code == 422 and r.json()["detail"]["code"] == "not_trackman_link"


def test_fit_with_a_photo_summary(model):
    c = TestClient(create_app(service=FitService(model)))
    lm = LaunchMonitor(kind="trackman", source="photo",
                       own_7i_summary={"mean": {"club_speed_mph": 88.7, "carry_yd": 161.2}, "sd": {}}).model_dump()
    r = c.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE, "evidence": {"launch_monitor": lm}})
    assert r.status_code == 200
    assert "TrackMan" in r.json()["estimates"]["speed"]["sources"]
