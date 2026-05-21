import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface PhotoUploadProps {
  label?: string;
  hint?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function PhotoUpload({
  label = "Upload photo",
  hint = "Front-facing, good lighting, plain background recommended",
  value,
  onChange,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG and PNG files are accepted.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        onChange(null);
        return;
      }
      setError(null);
      onChange(file);
    },
    [validate, onChange]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const previewUrl = value ? URL.createObjectURL(value) : null;

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {previewUrl ? (
        <div className="relative w-full max-w-xs">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full rounded-xl object-cover aspect-[3/4] border border-border"
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 border border-border shadow text-sm hover:bg-background transition-colors"
            aria-label="Remove photo"
          >
            ✕
          </button>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {value?.name} · {((value?.size ?? 0) / 1024).toFixed(0)} KB
          </p>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <svg
              className="size-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Drop your photo here, or{" "}
              <span className="text-primary">browse</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPEG or PNG · max 5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={onInputChange}
        aria-label={label}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
