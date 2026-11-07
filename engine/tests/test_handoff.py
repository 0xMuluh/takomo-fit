from fastapi.testclient import TestClient

from pocketfit import api
from pocketfit.api import create_app
from pocketfit.service import FitService


def test_phone_hands_a_measurement_back_to_the_computer(model, monkeypatch):
    c = TestClient(create_app(service=FitService(model)))
    made = c.post("/v1/handoff", json={"kind": "body", "lang": "fi", "units": "metric", "height_cm": 180}).json()
    code = made["code"]
    assert len(code) >= 16 and made["expires_in_s"] == api.HANDOFF_TTL_S

    assert c.get(f"/v1/handoff/{code}/events").json() == {"opened": False, "cues": [], "next": 0}
    assert c.get(f"/v1/handoff/{code}").json() == {"kind": "body", "lang": "fi", "units": "metric", "height_cm": 180}

    c.post(f"/v1/handoff/{code}", json={"cue": "[camera] Step back.", "immediate": True})
    c.post(f"/v1/handoff/{code}", json={"cue": "[camera] Hold still."})
    ev = c.get(f"/v1/handoff/{code}/events").json()
    assert ev["opened"] and ev["next"] == 2 and "evidence" not in ev
    assert [x["text"] for x in ev["cues"]] == ["[camera] Step back.", "[camera] Hold still."]
    assert c.get(f"/v1/handoff/{code}/events?after=2").json()["cues"] == []

    body = {"method": "ratio", "wrist_to_floor_ratio": 0.4421, "quality": "good"}
    assert c.post(f"/v1/handoff/{code}", json={"evidence": {"body_photo": body}}).status_code == 200
    assert c.get(f"/v1/handoff/{code}/events?after=2").json()["evidence"] == {"body_photo": body}

    monkeypatch.setattr(api.time, "time", lambda: 10**12)
    r = c.get(f"/v1/handoff/{code}/events")
    assert r.status_code == 404 and r.json()["detail"]["code"] == "handoff_expired"


def test_handoff_rejects_unknown_codes_and_kinds(model):
    c = TestClient(create_app(service=FitService(model)))
    assert c.get("/v1/handoff/nope").status_code == 404
    assert c.post("/v1/handoff", json={"kind": "launch_monitor"}).status_code == 422
