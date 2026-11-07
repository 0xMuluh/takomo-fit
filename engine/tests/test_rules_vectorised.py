"""The vectorised rule helpers used for sampling must agree with Takomo's reference rules."""
import numpy as np

from pocketfit.decide import grip_from_hand, length_from_height, lie_from_need
from takomo_fit import baseline as BL, products as PR


def _answers(height=175.0, glove="M"):
    return BL.Answers(age=45, sex="male", score_bucket=4, swing_bucket=3, characteristics=[], flight="mid",
                      tempo="moderate", height_cm=height, wrist_to_floor_cm=86.0, glove=glove)


def test_length_matches_reference_rule():
    for h in np.arange(140.0, 215.0, 0.25):
        for flex in ["regular", "lady"]:
            assert length_from_height([h], [flex == "lady"])[0] == BL.length_for(_answers(h), flex, [])


def test_grip_matches_glove_rule():
    edges = PR.GLOVE_EDGES_CM
    for hand in np.arange(15.0, 23.0, 0.01):
        glove = PR.GLOVE_ORDER[int(np.digitize(hand, edges))]
        assert grip_from_hand([hand])[0] == BL.grip_for(_answers(glove=glove), [])


def test_lie_is_rounded_and_capped():
    assert list(lie_from_need([-5.0, -0.6, -0.4, 0.4, 0.6, 2.4, 9.0])) == [-3, -1, 0, 0, 1, 2, 3]
