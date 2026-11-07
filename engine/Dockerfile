FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY pyproject.toml ./
COPY src ./src
RUN pip install . && useradd --uid 10001 --create-home app && mkdir /data && chown app /data

COPY artifacts/model.joblib artifacts/model.json ./artifacts/
ENV PF_MODEL_PATH=/app/artifacts/model.joblib
USER 10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:8080/health'); sys.exit(0)"
# Set PF_STORE_PATH=/data/fits.db with a volume on /data to keep fits across redeploys.
# One worker and one instance: the store is a single SQLite file and the voice rate limit is per process.
CMD ["uvicorn", "pocketfit.api:app_factory", "--factory", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
