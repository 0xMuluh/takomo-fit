import os
from pathlib import Path

import pytest

from pocketfit.evidence import load_split
from pocketfit.model import FitModel

ENGINE = Path(__file__).resolve().parents[1]
DATA_DEFAULT = ENGINE / "tests" / "data" if (ENGINE / "tests" / "data").exists() else ENGINE.parent / "lab" / "data"
DATA = Path(os.environ.get("PF_DATA_DIR", DATA_DEFAULT))
ARTIFACT = Path(os.environ.get("PF_MODEL_PATH", ENGINE / "artifacts" / "model.joblib"))


@pytest.fixture(scope="session")
def model() -> FitModel:
    if ARTIFACT.exists():
        return FitModel.load(ARTIFACT)
    return FitModel.train(DATA / "train")


@pytest.fixture(scope="session")
def dev():
    return load_split(DATA / "dev")


@pytest.fixture(scope="session")
def demo():
    return load_split(DATA / "demo")
