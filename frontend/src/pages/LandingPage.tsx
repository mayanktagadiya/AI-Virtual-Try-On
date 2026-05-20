import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "@/api/health";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 2,
  });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 text-center">
      <section className="max-w-2xl space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          AI Virtual Try-On
        </h1>
        <p className="text-xl text-muted-foreground">
          Upload a photo, pick a t-shirt, and see yourself wearing it — powered
          by AI.
        </p>
        <Link to="/try-on" className={buttonVariants({ size: "lg" }) + " mt-4"}>
          Try it now
        </Link>
      </section>

      <section className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <p className="font-medium">Backend status</p>
        {isPending && (
          <span className="text-yellow-500">Checking connection…</span>
        )}
        {isError && (
          <span className="text-destructive">
            Backend unreachable — start the API server
          </span>
        )}
        {data && (
          <span className="text-green-500">
            Connected · v{data.version}
          </span>
        )}
      </section>
    </main>
  );
}
