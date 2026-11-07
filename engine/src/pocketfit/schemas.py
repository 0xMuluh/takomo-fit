"""Request and response contracts for the fitting API."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

Characteristic = Literal["forgiveness", "distance", "forged feel", "distance control", "workability",
                         "less offset", "more offset"]
Glove = Literal["XS", "S", "M", "M/L", "L", "XL"]


class Questionnaire(BaseModel):
    age: int = Field(ge=8, le=100)
    sex: Literal["male", "female"]
    handedness: Literal["right", "left"] = "right"
    rounds_per_year: Optional[Literal["Under 10", "10-30", "31-50", "Over 50"]] = None
    score_bucket: int = Field(ge=1, le=5, description="1 Under 71, 2 71-77, 3 78-84, 4 85-92, 5 Over 92")
    speed_mph: Optional[float] = Field(None, gt=20, lt=150)
    carry_yd: Optional[float] = Field(None, gt=30, lt=260)
    own_7i_loft_deg: Optional[float] = Field(None, ge=24, le=40)
    characteristics: list[Characteristic] = Field(default_factory=list, max_length=3)
    flight: Literal["low", "mid", "high"]
    tempo: Literal["smooth", "moderate", "quick"]
    height_cm: float = Field(gt=100, lt=230)
    wrist_to_floor_cm: Optional[float] = Field(None, gt=50, lt=120)
    glove: Optional[Glove] = None

    @model_validator(mode="after")
    def _speed_or_carry(self):
        if self.speed_mph is None and self.carry_yd is None:
            raise ValueError("give either speed_mph or carry_yd")
        return self


class BodyPhoto(BaseModel):
    """Output of the on-device body measurement.

    method="ratio": no reference object; the photo gives wrist-to-floor as a share
    of height and the golfer's stated height sets the scale.
    method="reference": a reference object of known size sets the scale, so the
    photo also gives an absolute height.
    """
    method: Literal["ratio", "reference"] = "ratio"
    wrist_to_floor_ratio: Optional[float] = Field(None, gt=0.35, lt=0.6)
    height_cm: Optional[float] = Field(None, gt=100, lt=230)
    wrist_to_floor_cm: Optional[float] = Field(None, gt=50, lt=120)
    quality: Literal["good", "poor"] = "good"


class HandPhoto(BaseModel):
    method: Literal["card", "sheet"] = "card"
    hand_length_cm: float = Field(gt=12, lt=26)
    finger_length_cm: Optional[float] = Field(None, gt=5, lt=12)


class SwingVideo(BaseModel):
    fps: float = Field(gt=10, le=1000)
    backswing_s: float = Field(ge=0.3, le=2.5)
    downswing_s: float = Field(ge=0.08, le=0.9)
    clubhead_speed_mph: Optional[float] = Field(None, gt=20, lt=150)


class Shot(BaseModel):
    club_speed_mph: Optional[float] = None
    carry_yd: Optional[float] = None
    launch_angle_deg: Optional[float] = None
    landing_angle_deg: Optional[float] = None
    dynamic_loft_deg: Optional[float] = None
    attack_angle_deg: Optional[float] = None
    face_to_path_deg: Optional[float] = None
    side_yd: Optional[float] = None
    impact_offset_mm: Optional[float] = None
    impact_toe_up_deg: Optional[float] = None


class ShotSummary(BaseModel):
    """A session as a launch-monitor screen shows it: the average of each value and its shot-to-shot spread."""
    shots: Optional[int] = Field(None, ge=1, le=500)
    mean: Shot
    sd: Shot = Field(default_factory=Shot)


class LaunchMonitor(BaseModel):
    kind: Literal["home_radar", "trackman"]
    source: Literal["csv", "photo", "video", "report"] = "csv"
    device: Optional[str] = Field(None, max_length=60)
    own_7i: list[Shot] = Field(default_factory=list)
    own_7i_summary: Optional[ShotSummary] = None
    converted_from: Optional[Literal["5i", "6i", "8i", "9i"]] = Field(
        None, description="The iron the shots were hit with, if not a 7-iron; own_7i_summary then holds only a club "
                          "speed converted to a 7-iron estimate")
    takomo_test_club: list[Shot] = Field(default_factory=list,
                                         description="Shots with a Takomo test 7-iron built at standard lie")
    takomo_201_landing_angles: list[float] = Field(default_factory=list)

    @model_validator(mode="after")
    def _shots_or_summary(self):
        if len(self.own_7i) < 3 and self.own_7i_summary is None:
            raise ValueError("give at least three own_7i shots or an own_7i_summary")
        if self.own_7i_summary is not None and self.own_7i_summary.mean.club_speed_mph is None \
                and self.own_7i_summary.mean.carry_yd is None:
            raise ValueError("own_7i_summary needs an average club speed or carry")
        return self


class Evidence(BaseModel):
    body_photo: Optional[BodyPhoto] = None
    hand_photo: Optional[HandPhoto] = None
    swing_video: Optional[SwingVideo] = None
    ball_line_tilts_deg: Optional[list[float]] = Field(None, min_length=3)
    impact_spray_offsets_mm: Optional[list[float]] = Field(None, min_length=3)
    launch_monitor: Optional[LaunchMonitor] = None


class Overrides(BaseModel):
    """What-if changes to the estimated truth, applied after fusion."""
    speed_mph: Optional[float] = Field(None, gt=20, lt=150)
    height_cm: Optional[float] = Field(None, gt=100, lt=230)
    hand_length_cm: Optional[float] = Field(None, gt=12, lt=26)
    lie_need_deg: Optional[float] = Field(None, ge=-6, le=6)
    score_bucket: Optional[int] = Field(None, ge=1, le=5)
    flight: Optional[Literal["low", "mid", "high"]] = None
    tempo: Optional[Literal["smooth", "moderate", "quick"]] = None
    characteristics: Optional[list[Characteristic]] = Field(None, max_length=3)


class Locale(BaseModel):
    """Language and units for the golfer-facing text. Inputs and spec values are always yards, mph, cm and inches."""
    lang: Literal["en", "fi", "sv", "de"] = "en"
    units: Literal["imperial", "metric"] = "imperial"


class FitRequest(BaseModel):
    questionnaire: Questionnaire
    evidence: Evidence = Field(default_factory=Evidence)
    overrides: Optional[Overrides] = None
    locale: Locale = Field(default_factory=Locale)


class EvidenceItem(BaseModel):
    source: str
    reading: str


class Component(BaseModel):
    part: Literal["head", "shaft", "length", "lie", "grip", "purchase"]
    value: str
    confidence: float
    alternative: Optional[str] = None
    alternative_probability: Optional[float] = None
    close_call: bool
    summary: str
    reasons: list[str]
    effect: Optional[str] = None
    evidence: list[EvidenceItem] = Field(default_factory=list)


class Shaft(BaseModel):
    slug: str
    model: str
    flex: str
    material: str
    weight_g: Optional[float] = None
    flight_profile: list[str] = Field(default_factory=list)
    tempo_profile: list[str] = Field(default_factory=list)


class Spec(BaseModel):
    head: str
    head_name: str
    shaft: Shaft
    length_in: float
    lie_deg: int
    grip: str
    handedness: str
    purchase: Literal["stock", "custom"]


class Estimate(BaseModel):
    mean: float
    sd: float
    sources: str


class NextTest(BaseModel):
    test: str
    how: str
    improves: dict[str, list[float]]
    whole_spec_confidence_after: float


class StockAdvice(BaseModel):
    recommendation: Literal["stock", "custom"]
    probability_stock_is_right: float
    custom_because: list[str]
    message: str


class FitResponse(BaseModel):
    fit_id: str
    model_version: str
    spec: Spec
    runner_up_head: str
    whole_spec_confidence: float
    components: list[Component]
    stock_advice: StockAdvice
    estimates: dict[str, Estimate]
    probabilities: dict[str, dict[str, float]]
    next_tests: list[NextTest]
    warnings: list[str] = Field(default_factory=list)
