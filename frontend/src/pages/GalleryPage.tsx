import { useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { clearGallery, deleteFromGallery, loadGallery, type GalleryItem } from "@/lib/gallery";
import { cn } from "@/lib/utils";

const FIT_COLORS: Record<string, string> = {
  tight: "bg-red-500/10 text-red-600 border-red-200",
  standard: "bg-green-500/10 text-green-600 border-green-200",
  loose: "bg-blue-500/10 text-blue-600 border-blue-200",
  short: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  long: "bg-purple-500/10 text-purple-600 border-purple-200",
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function GalleryCard({ item, onDelete }: { item: GalleryItem; onDelete: () => void }) {
  const { result, garmentName, timestamp } = item;
  const { fit_prediction, image_base64, mime_type, provider } = result;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={`data:${mime_type};base64,${image_base64}`}
          alt="Try-on result"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete"
        >
          ×
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        {garmentName && (
          <p className="text-sm font-medium leading-tight truncate">{garmentName}</p>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge className={cn("text-xs", FIT_COLORS[fit_prediction.chest_fit])}>
            {fit_prediction.chest_fit}
          </Badge>
          <Badge className={cn("text-xs", FIT_COLORS[fit_prediction.length])}>
            {fit_prediction.length} length
          </Badge>
          <Badge className={cn("text-xs", FIT_COLORS[fit_prediction.sleeve])}>
            {fit_prediction.sleeve} sleeve
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {fit_prediction.summary}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{timeAgo(timestamp)}</span>
          <span className="text-xs text-muted-foreground">{provider}</span>
        </div>
      </div>
    </Card>
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(() => loadGallery());

  const handleDelete = (id: string) => {
    deleteFromGallery(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClear = () => {
    clearGallery();
    setItems([]);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your recent try-on results — saved locally in this browser.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center text-3xl">
            👕
          </div>
          <div>
            <p className="font-medium">No try-ons yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Results from real AI providers are saved here automatically.
            </p>
          </div>
          <Link to="/try-on" className={buttonVariants()}>
            Start a try-on
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Showing {items.length} result{items.length !== 1 ? "s" : ""} · Stored locally in your browser
          </p>
        </>
      )}
    </main>
  );
}
