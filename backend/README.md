# tryon-backend

FastAPI backend for AI Virtual Try-On.

## Setup

```bash
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `TRYON_PROVIDER` | `stub` | Active inference provider (`stub` / `huggingface` / `nanobanana` / `replicate`) |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## Tests

```bash
uv run pytest
```

## Deploy (Render)

Connect this repo to Render as a **Web Service**:
- **Build command:** `pip install uv && uv sync --frozen`
- **Start command:** `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set env vars in the Render dashboard
