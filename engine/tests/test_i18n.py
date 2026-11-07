import re

import pytest
from fastapi.testclient import TestClient

from pocketfit.api import create_app
from pocketfit.evidence import request_from_tables
from pocketfit.i18n import LANGS, MESSAGES, SOURCES, Loc
from pocketfit.schemas import FitRequest, Locale
from pocketfit.service import FitService
from takomo_fit import products as PR

QUESTIONNAIRE = {"age": 58, "sex": "male", "handedness": "left", "score_bucket": 3, "carry_yd": 160,
                 "own_7i_loft_deg": 30, "characteristics": ["distance control", "more offset"], "flight": "mid",
                 "tempo": "smooth", "height_cm": 176}
EVIDENCE = {"body_photo": {"method": "ratio", "wrist_to_floor_ratio": 0.48},
            "swing_video": {"fps": 240, "backswing_s": 0.9, "downswing_s": 0.28, "clubhead_speed_mph": 79},
            "launch_monitor": {"kind": "home_radar",
                               "own_7i": [{"club_speed_mph": 78 + i, "carry_yd": 150 + i} for i in range(5)]}}


@pytest.fixture(scope="module")
def svc(model):
    return FitService(model)


def _text(r) -> list[str]:
    out = [r.stock_advice.message, *r.stock_advice.custom_because, *r.warnings, *[t.how for t in r.next_tests]]
    for c in r.components:
        out += [c.summary, *c.reasons, c.effect or "", *[e.source + " " + e.reading for e in c.evidence]]
    return [s for s in out if s]


def test_every_language_has_every_phrase():
    for lang in LANGS:
        assert set(MESSAGES[lang]) == set(MESSAGES["en"]), lang


def test_english_product_wording_matches_the_product_file():
    for slug in PR.HEAD_ORDER:
        assert MESSAGES["en"][f"desc.{slug}"] == PR.head(slug)["description"]


def test_every_evidence_source_the_model_reports_is_translated(model):
    names = {n for lf in model.fusion.linear.values() for route in lf.route.values() for n in route}
    assert names | {"questionnaire"} <= set(SOURCES)


@pytest.mark.parametrize("lang", LANGS)
@pytest.mark.parametrize("units", ["imperial", "metric"])
def test_language_changes_words_not_the_fit(svc, demo, lang, units):
    for gid in list(demo["questionnaire"].golfer_id)[:25]:
        base = request_from_tables(demo, gid)
        en = svc.create(base)
        loc = svc.create(base.model_copy(update={"locale": Locale(lang=lang, units=units)}))
        assert loc.spec == en.spec and loc.whole_spec_confidence == en.whole_spec_confidence
        assert [(c.part, c.value, c.confidence) for c in loc.components] == \
               [(c.part, c.value, c.confidence) for c in en.components]
        assert [t.test for t in loc.next_tests] == [t.test for t in en.next_tests]
        for s in _text(loc):
            assert "{" not in s and "}" not in s, s
        if lang != "en":
            assert not re.search(r"\d\.\d", " ".join(_text(loc))), "decimal comma expected"


def test_metric_units_convert_the_numbers(svc):
    req = {"questionnaire": QUESTIONNAIRE, "evidence": EVIDENCE}
    imp = svc.create(FitRequest(**req))
    met = svc.create(FitRequest(**req, locale={"lang": "en", "units": "metric"}))
    carry_yd = imp.estimates[f"carry_{imp.spec.head}"].mean
    lie = lambda r: next(c for c in r.components if c.part == "lie")
    assert f"{carry_yd:.0f}-yd" in lie(imp).effect
    assert f"{carry_yd * 0.9144:.0f}-m" in lie(met).effect
    speed = next(c for c in met.components if c.part == "shaft").reasons[0]
    assert f"{imp.estimates['speed'].mean * 1.609344:.0f} km/h" in speed and "mph" not in speed
    assert Loc("fi", "metric").speed_band(3) == "114-129 km/h"
    assert Loc("de", "metric").speed_band(1) == "unter 97 km/h"


def test_fit_can_be_reread_and_changed_in_another_language(model):
    client = TestClient(create_app(service=FitService(model)))
    fit = client.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE}).json()
    fi = client.get(f"/v1/fits/{fit['fit_id']}", params={"lang": "fi", "units": "metric"}).json()
    assert fi["spec"] == fit["spec"] and fi["stock_advice"]["message"] != fit["stock_advice"]["message"]
    assert client.get(f"/v1/fits/{fit['fit_id']}").json() == fit
    sv = client.post(f"/v1/fits/{fit['fit_id']}/evidence", params={"lang": "sv"},
                     json={"hand_photo": {"method": "card", "hand_length_cm": 19.5}}).json()
    assert any("handfoto" in e["source"] for c in sv["components"] for e in c["evidence"])
    assert client.get(f"/v1/fits/{fit['fit_id']}").json()["stock_advice"] == sv["stock_advice"]
    w = client.post(f"/v1/fits/{fit['fit_id']}/what-if", params={"lang": "de", "units": "metric"},
                    json={"speed_mph": 95}).json()
    assert w["changes"] and all(not c.startswith(("shaft", "length", "head")) for c in w["changes"])
    assert w["before"]["spec"] == sv["spec"]


def test_catalog_in_another_language(model):
    client = TestClient(create_app(service=FitService(model)))
    en = client.get("/v1/catalog").json()
    de = client.get("/v1/catalog", params={"lang": "de"}).json()
    assert en["heads"] == PR.load()["heads"]
    assert [h["slug"] for h in de["heads"]] == [h["slug"] for h in en["heads"]]
    assert de["heads"][0]["description"] == MESSAGES["de"]["desc.101-mkii"]
    assert de["heads"][0]["target_score_label"] == "über 92"
