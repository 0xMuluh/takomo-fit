"""Versioned model artifact: fitted fusion plus the validation evidence it shipped with."""
from __future__ import annotations

import hashlib
import json
import platform
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn

from takomo_fit import products as PR

from . import __version__
from .decide import Decision, apply_overrides, decide, decide_one
from .evidence import from_tables, load_split
from .fusion import Fusion

ARTIFACT_FORMAT = 1


def _products_hash() -> str:
    raw = json.dumps({k: v for k, v in PR.load().items() if not k.startswith("_")}, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()[:12]


@dataclass
class FitModel:
    fusion: Fusion
    version: str
    meta: dict = field(default_factory=dict)

    @classmethod
    def train(cls, train_dir: str | Path) -> "FitModel":
        t = load_split(train_dir)
        fusion = Fusion().fit(from_tables(t), t["labels"])
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")
        meta = {"artifact_format": ARTIFACT_FORMAT, "package_version": __version__, "trained_at": stamp,
                "train_rows": int(len(t["labels"])), "train_dir": str(train_dir), "products_sha": _products_hash(),
                "sklearn": sklearn.__version__, "python": platform.python_version()}
        return cls(fusion=fusion, version=f"pf-{__version__}-{stamp}", meta=meta)

    def posterior(self, evidence: pd.DataFrame) -> pd.DataFrame:
        return self.fusion.posterior(evidence)

    def decide_batch(self, evidence: pd.DataFrame, seed: int = 7) -> list[Decision]:
        return decide(self.posterior(evidence), seed=seed)

    def decide_single(self, evidence: pd.DataFrame, overrides=None, seed: int = 7) -> tuple[Decision, pd.Series]:
        post = apply_overrides(self.posterior(evidence).iloc[0], overrides)
        return decide_one(post, np.random.default_rng(seed)), post

    def save(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, path, compress=3)
        path.with_suffix(".json").write_text(json.dumps({"version": self.version, **self.meta}, indent=2))
        return path

    @staticmethod
    def load(path: str | Path) -> "FitModel":
        m = joblib.load(path)
        if m.meta.get("artifact_format") != ARTIFACT_FORMAT:
            raise RuntimeError(f"artifact format {m.meta.get('artifact_format')} != {ARTIFACT_FORMAT}")
        if m.meta.get("products_sha") != _products_hash():
            raise RuntimeError("artifact was trained against a different product file; retrain")
        return m
