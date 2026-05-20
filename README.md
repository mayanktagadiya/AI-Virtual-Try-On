# AI Virtual Try-On

> Portfolio project — AI-powered virtual clothing try-on with fit prediction.

**Live demo:** _coming Day 7_  
**Frontend:** Vercel · **Backend:** Render

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | FastAPI + Python 3.12 + uv |
| AI inference | IDM-VTON (HuggingFace) · Gemini image generation |
| DB | SQLite via SQLModel |

## Monorepo layout

```
├── frontend/   # React app
├── backend/    # FastAPI service
└── docs/       # ADRs + architecture diagrams
```

## Quick start

```bash
# Backend
cd backend && uv sync && uv run uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

_Full setup instructions, architecture diagram, and ADRs added by Day 7._
