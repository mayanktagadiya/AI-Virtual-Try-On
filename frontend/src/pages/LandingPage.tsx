import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchHealth } from "@/api/health";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload Your Photo",
    description:
      "Take a front-facing photo in good lighting. We use AI pose detection to measure your body proportions directly in the browser.",
  },
  {
    step: "02",
    title: "Pick a Garment",
    description:
      "Browse our t-shirt catalog or upload a flat-lay photo of any garment you want to try on.",
  },
  {
    step: "03",
    title: "See the Result",
    description:
      "Our AI generates a realistic image of you wearing the garment, plus a fit prediction based on your measurements.",
  },
];

export default function LandingPage() {
  const { data: health, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 2,
  });

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-20 text-center">
        <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          Portfolio Project · AI + Computer Vision
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4">
          Try clothes on —
          <br />
          <span className="text-primary">without trying them on.</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-8">
          Upload a photo of yourself, choose a t-shirt, and see an AI-generated
          image of you wearing it — with a fit prediction based on your body
          measurements.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/try-on"
            className={cn(buttonVariants({ size: "lg" }), "px-8")}
          >
            Try it now — it's free
          </Link>
          <a
            href="https://github.com/mayanktagadiya/AI-Virtual-Try-On"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-8"
            )}
          >
            View on GitHub
          </a>
        </div>

        {/* Backend status pill */}
        <div className="mt-8 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              health
                ? "bg-green-500/10 text-green-600"
                : isError
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                health
                  ? "bg-green-500"
                  : isError
                    ? "bg-destructive"
                    : "bg-muted-foreground animate-pulse"
              )}
            />
            {health
              ? `API online · v${health.version}`
              : isError
                ? "API offline"
                : "Checking API…"}
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold mb-10">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div
                key={step}
                className="rounded-xl border border-border bg-background p-6"
              >
                <span className="text-4xl font-bold text-primary/20">
                  {step}
                </span>
                <h3 className="mt-2 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech callout */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Built with modern tooling</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          React 18 + FastAPI + IDM-VTON · provider-swappable AI layer ·
          MediaPipe pose detection · Zod end-to-end type safety
        </p>
        <Link to="/about" className={buttonVariants({ variant: "outline" })}>
          Read the architecture notes
        </Link>
      </section>
    </main>
  );
}
