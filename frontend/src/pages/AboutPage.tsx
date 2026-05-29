import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

const STACK = [
  { layer: "Frontend", tech: "React 18 + Vite + TypeScript", detail: "Tailwind CSS v4, shadcn/ui, TanStack Query, Zod, React Router" },
  { layer: "Backend", tech: "FastAPI + Python 3.12", detail: "Pydantic v2, uv package manager, loguru, 30 pytest tests" },
  { layer: "AI Inference", tech: "IDM-VTON (HuggingFace)", detail: "Diffusion-based virtual try-on via gradio_client, provider-swappable" },
  { layer: "Fit Analysis", tech: "Gemini 2.0 Flash", detail: "Vision model analyses the try-on result and writes personalised fit advice" },
  { layer: "Pose Detection", tech: "MediaPipe (in-browser)", detail: "Validates front-facing photo client-side before upload — no server round-trip" },
  { layer: "Deploy", tech: "Vercel + Render", detail: "Auto-deploy on push, CORS configured, free tier" },
];

const DECISIONS = [
  {
    title: "Provider pattern",
    body: "The AI inference layer is a swappable ABC — StubProvider for dev, HuggingFaceProvider for production. Switching providers is a one-line env var change with zero code changes.",
  },
  {
    title: "Client-side pose detection",
    body: "MediaPipe runs entirely in the browser via WebAssembly. No image is sent to the server until the pose check passes — faster feedback and less wasted API calls.",
  },
  {
    title: "Gemini for fit analysis",
    body: "Instead of pure rule-based chest/length/sleeve math, the try-on result image is sent to Gemini Flash which visually assesses the fit. Falls back to rule-based if the key is missing.",
  },
  {
    title: "Offline test suite",
    body: "All 30 tests run in ~0.5s by stubbing the provider. Integration tests verify the full request/response cycle including validation, 404s, and 502 error handling.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-5">
          Portfolio Project · Full-Stack + AI
        </span>
        <h1 className="text-4xl font-bold tracking-tight mb-4">About this project</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          A 7-day MVP built to demonstrate senior-level full-stack and AI engineering —
          from MediaPipe pose detection to diffusion-model inference and Gemini vision analysis.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Link to="/try-on" className={buttonVariants()}>Try it now</Link>
          <a
            href="https://github.com/mayanktagadiya/AI-Virtual-Try-On"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            View source
          </a>
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-border bg-muted/40 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Tech stack</h2>
          <div className="flex flex-col gap-3">
            {STACK.map(({ layer, tech, detail }) => (
              <div key={layer} className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-0.5">{layer}</span>
                <div>
                  <p className="text-sm font-semibold">{tech}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture decisions */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold mb-8 text-center">Key design decisions</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {DECISIONS.map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built by */}
      <section className="border-t border-border bg-muted/40 py-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm text-muted-foreground">
            Built in 7 days by{" "}
            <a
              href="https://github.com/mayanktagadiya"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Mayank Tagadiya
            </a>{" "}
            · React 18 · FastAPI · IDM-VTON · Gemini · MediaPipe
          </p>
        </div>
      </section>
    </main>
  );
}
