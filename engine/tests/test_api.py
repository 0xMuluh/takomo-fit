import httpx
import pytest
from fastapi.testclient import TestClient

from pocketfit.api import create_app
from pocketfit.evidence import request_from_tables
from pocketfit.service import FitService, SqliteStore
from takomo_fit import products as PR


@pytest.fixture(scope="module")
def client(model):
    return TestClient(create_app(service=FitService(model)))


def _buildable(spec):
    sh = PR.shaft(spec["shaft"]["slug"])
    data = PR.load()
    return (spec["head"] in sh["heads"] and spec["length_in"] in data["length_options_in"]
            and spec["lie_deg"] in data["lie_options_deg"] and spec["grip"] in PR.GRIP_ORDER)


QUESTIONNAIRE = {"age": 46, "sex": "male", "handedness": "right", "score_bucket": 4, "carry_yd": 160,
                 "characteristics": ["forgiveness", "distance"], "flight": "mid", "tempo": "moderate",
                 "height_cm": 181, "wrist_to_floor_cm": 87, "glove": "L"}


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["model_version"].startswith("pf-")


def test_every_demo_golfer_gets_a_buildable_explained_fit(client, demo):
    for gid in demo["questionnaire"].golfer_id:
        req = request_from_tables(demo, gid)
        r = client.post("/v1/fits", json=req.model_dump(mode="json"))
        assert r.status_code == 200, r.text
        body = r.json()
        assert _buildable(body["spec"])
        parts = [c["part"] for c in body["components"]]
        assert parts == ["head", "shaft", "length", "lie", "grip", "purchase"]
        assert all(c["reasons"] for c in body["components"])
        assert 0 <= body["whole_spec_confidence"] <= 1


def test_questionnaire_only_then_progressive_evidence(client):
    r = client.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE}).json()
    fit_id = r["fit_id"]
    assert any(t["test"] == "ball-line test" for t in r["next_tests"])
    lie_before = next(c for c in r["components"] if c["part"] == "lie")["confidence"]

    r2 = client.post(f"/v1/fits/{fit_id}/evidence",
                     json={"ball_line_tilts_deg": [-1.5, -2.2, -0.8, -1.9, -1.4],
                           "hand_photo": {"method": "card", "hand_length_cm": 19.8}}).json()
    assert r2["fit_id"] == fit_id
    assert "ball-line test" in r2["estimates"]["lie"]["sources"]
    assert "hand photo" in r2["estimates"]["hand"]["sources"]
    assert not any(t["test"] == "ball-line test" for t in r2["next_tests"])
    lie_after = next(c for c in r2["components"] if c["part"] == "lie")["confidence"]
    assert r2["estimates"]["lie"]["sd"] < r["estimates"]["lie"]["sd"]
    assert lie_after != lie_before


def test_ratio_body_photo_is_flagged(client):
    r = client.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE,
                                      "evidence": {"body_photo": {"method": "ratio", "wrist_to_floor_ratio": 0.49}}})
    assert r.status_code == 200
    assert r.json()["warnings"]


def test_what_if_speed_changes_flex(client):
    fit_id = client.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE}).json()["fit_id"]
    r = client.post(f"/v1/fits/{fit_id}/what-if", json={"speed_mph": 95}).json()
    assert r["after"]["spec"]["shaft"]["flex"] == "x-stiff"
    assert any("shaft" in c for c in r["changes"])


def test_agent_tools(client):
    fit_id = client.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE}).json()["fit_id"]
    for path, body in [("summary", {}), ("explain", {"part": "lie"}), ("next-test", {}),
                       ("compare-heads", {}), ("what-if", {"height_cm": 192})]:
        r = client.post(f"/v1/agent/{path}", json={"fit_id": fit_id, **body})
        assert r.status_code == 200, (path, r.text)
        assert len(r.json()["say"]) > 20


def test_fits_survive_restart_with_sqlite_store(model, tmp_path):
    db = str(tmp_path / "fits.db")
    before = TestClient(create_app(service=FitService(model, SqliteStore(db))))
    fit = before.post("/v1/fits", json={"questionnaire": QUESTIONNAIRE}).json()
    after = TestClient(create_app(service=FitService(model, SqliteStore(db))))
    assert after.get(f"/v1/fits/{fit['fit_id']}").json() == fit
    r = after.post(f"/v1/fits/{fit['fit_id']}/evidence", json={"hand_photo": {"method": "card", "hand_length_cm": 19.5}})
    assert r.status_code == 200 and r.json()["fit_id"] == fit["fit_id"]


def test_voice_session_needs_config(client, monkeypatch):
    monkeypatch.delenv("ELEVENLABS_API_KEY", raising=False)
    assert client.get("/v1/voice/session").status_code == 503


def test_voice_session_without_fit_and_rate_limited(model, monkeypatch):
    monkeypatch.setenv("ELEVENLABS_API_KEY", "k")
    monkeypatch.setenv("ELEVENLABS_AGENT_ID", "a")
    monkeypatch.setenv("PF_VOICE_SESSIONS_PER_HOUR", "2")

    async def fake_get(self, url, params=None, headers=None):
        assert params == {"agent_id": "a"} and headers == {"xi-api-key": "k"}
        return httpx.Response(200, json={"signed_url": "wss://signed"})

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    c = TestClient(create_app(service=FitService(model)))
    assert c.get("/v1/voice/session").json()["signed_url"] == "wss://signed"
    assert c.get("/v1/voice/session?fit_id=nope").status_code == 404
    assert c.get("/v1/voice/session", headers={"x-forwarded-for": "1.2.3.4"}).status_code == 200
    assert c.get("/v1/voice/session").status_code == 200
    assert c.get("/v1/voice/session").status_code == 429


def test_errors(client):
    assert client.get("/v1/fits/nope").status_code == 404
    bad = dict(QUESTIONNAIRE)
    bad.pop("carry_yd")
    assert client.post("/v1/fits", json={"questionnaire": bad}).status_code == 422
