# tryon-frontend

React 18 + Vite + TypeScript frontend for AI Virtual Try-On.

## Setup

```bash
cp .env.example .env.local
# Set VITE_API_URL to your backend URL
npm install
npm run dev
```

App: http://localhost:5173

## Stack

- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS v4 + shadcn/ui
- React Router v6
- TanStack Query v5
- Zod for API response validation
- Axios

## Deploy (Vercel)

Connect this repo to Vercel, set **Root Directory** to `frontend`, and add the `VITE_API_URL` environment variable pointing to your Render backend.
