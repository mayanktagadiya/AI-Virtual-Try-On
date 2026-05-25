import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { catalogImageUrl, fetchCatalog, type CatalogItem } from "@/api/catalog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PhotoUpload from "./PhotoUpload";

export type GarmentSelection =
  | { mode: "catalog"; garmentId: string; item: CatalogItem }
  | { mode: "upload"; garmentImage: File };

interface GarmentStepProps {
  value: GarmentSelection | null;
  onChange: (v: GarmentSelection | null) => void;
}

type TabMode = "catalog" | "upload";

export default function GarmentStep({ value, onChange }: GarmentStepProps) {
  const [tab, setTab] = useState<TabMode>(
    value?.mode === "upload" ? "upload" : "catalog"
  );

  const { data: catalog, isPending, isError } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: Infinity,
  });

  const selectedId =
    value?.mode === "catalog" ? value.garmentId : null;

  const uploadedFile =
    value?.mode === "upload" ? value.garmentImage : null;

  const handleTabChange = (next: TabMode) => {
    setTab(next);
    onChange(null);
  };

  const handleSelect = (item: CatalogItem) => {
    if (selectedId === item.id) {
      onChange(null);
    } else {
      onChange({ mode: "catalog", garmentId: item.id, item });
    }
  };

  const handleUpload = (file: File | null) => {
    onChange(file ? { mode: "upload", garmentImage: file } : null);
  };

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex rounded-lg border border-border p-1 gap-1 w-fit">
        {(["catalog", "upload"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "catalog" ? "Browse catalog" : "Upload your own"}
          </button>
        ))}
      </div>

      {/* Catalog grid */}
      {tab === "catalog" && (
        <>
          {isPending && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              Could not load catalog. Start the backend server and refresh.
            </p>
          )}

          {catalog && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catalog.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "group relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all",
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                      <img
                        src={catalogImageUrl(item.image_url)}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.available_sizes.join(" · ")}
                      </p>
                    </div>

                    {/* Selected checkmark */}
                    {selected && (
                      <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected garment detail */}
          {value?.mode === "catalog" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
              <img
                src={catalogImageUrl(value.item.image_url)}
                alt={value.item.name}
                className="size-12 rounded-lg object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{value.item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Chest {value.item.garment_measurements.chest_cm} cm ·
                  Length {value.item.garment_measurements.length_cm} cm ·
                  Sleeve {value.item.garment_measurements.sleeve_cm} cm
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                Selected
              </Badge>
            </div>
          )}
        </>
      )}

      {/* Upload own garment */}
      {tab === "upload" && (
        <PhotoUpload
          label="Garment image"
          hint="Flat-lay or product shot on a plain/white background works best"
          value={uploadedFile}
          onChange={handleUpload}
        />
      )}
    </div>
  );
}
