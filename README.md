# AI Virtual Try-On

> Upload a photo of yourself, pick a t-shirt, and see an AI-generated image of you wearing it — with a personalised fit prediction.

**Live demo:** _add Vercel URL after deploy_  
**Stack:** React 18 · FastAPI · IDM-VTON · Gemini · MediaPipe · TypeScript · Python 3.12

---

## Architecture

```
Browser
  └─ React 18 + Vite (Vercel)
       ├─ MediaPipe Pose Landmarker  ← client-side pose detection
       ├─ TanStack Query + Axios     ← API layer
       └─ Zod                        ← end-to-end type safety

FastAPI backend (Render)
  ├─ POST /api/v1/tryon
  │    ├─ TryOnProvider (swappable via TRYON_PROVIDER env var)
  │    │    ├─ StubProvider        ← instant placeholder (dev)
  │    │    ├─ HuggingFaceProvider ← yisol/IDM-VTON via gradio_client
  │    │    └─ ReplicateProvider   ← (wired, ready to enable)
  │    └─ Fit Prediction
  │         ├─ Rule-based predictor (always available)
  │         └─ Gemini 2.0 Flash vision (when GEMINI_API_KEY set)
  ├─ GET  /api/v1/catalog           ← 8 t-shirt catalog items
  └─ GET  /static/catalog/*.png     ← catalog images
```

## Features

- **4-step wizard** — photo upload → measurements → garment selection → result
- **Pose validation** — MediaPipe detects a front-facing person before submission
- **Dual garment modes** — browse the built-in catalog or upload your own flat-lay image
- **AI try-on** — IDM-VTON generates a realistic composite via HuggingFace Spaces
- **Gemini fit analysis** — vision model analyses the result image and writes a personalised fit summary
- **Gallery** — past results auto-saved to `localStorage`, browsable at `/gallery`
- **30 tests** — unit tests for fit prediction + integration tests for the API (0.5s offline suite)

## Quick start

### Backend

```bash
cd backend
cp .env.example .env        # fill in HF_TOKEN and GEMINI_API_KEY
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8001
# → http://localhost:8001
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8001" > .env.local
npm run dev
# → http://localhost:5173
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `TRYON_PROVIDER` | yes | `stub` \| `huggingface` \| `replicate` |
| `HF_TOKEN` | for huggingface | HuggingFace token (read access) |
| `GEMINI_API_KEY` | optional | Enables AI fit analysis via Gemini Flash |
| `FRONTEND_ORIGIN` | yes | CORS origin, e.g. `http://localhost:5173` |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8001` | Backend base URL |

## Deploy

### Backend → Render

1. Push this repo to GitHub
2. New Web Service → connect repo → root dir: `backend`
3. Build command: `pip install uv && uv sync --frozen`
4. Start command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set env vars in Render dashboard: `TRYON_PROVIDER`, `HF_TOKEN`, `GEMINI_API_KEY`, `FRONTEND_ORIGIN`

### Frontend → Vercel

1. New Project → import repo → root dir: `frontend`
2. Add env var: `VITE_API_URL` = your Render service URL (e.g. `https://tryon-backend.onrender.com`)
3. Deploy — `vercel.json` handles SPA routing automatically

## Running tests

```bash
cd backend
uv run pytest tests/ -v
# 30 passed in ~0.5s (fully offline, no HuggingFace calls)
```

## Tech decisions

| Decision | Choice | Why |
|---|---|---|
| AI inference | HuggingFace Spaces (IDM-VTON) | Free GPU, no infrastructure cost for portfolio |
| Pose detection | MediaPipe in-browser | No server round-trip, instant feedback |
| Fit analysis | Gemini 2.0 Flash vision | Cheap per-call, vision model sees the actual result image |
| Provider pattern | ABC + registry | Swap providers via env var with zero code changes |
| Tests | pytest + FastAPI TestClient | Offline suite with stub provider, runs in 0.5s |
| Deploy | Render (backend) + Vercel (frontend) | Free tier, auto-deploy on push |
