import { useEffect } from "react";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";
import { cn } from "@/lib/utils";
import PhotoUpload from "./PhotoUpload";
import PoseCanvas from "./PoseCanvas";

interface PhotoStepProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

const STATUS_CONFIG = {
  idle: null,
  loading: { color: "text-muted-foreground", icon: "⏳", text: "Analysing pose…" },
  detected: { color: "text-green-600", icon: "✓", text: "Pose detected" },
  no_person: { color: "text-destructive", icon: "✕", text: null },
  multiple_people: { color: "text-destructive", icon: "✕", text: null },
  side_angle: { color: "text-yellow-600", icon: "⚠", text: null },
  low_confidence: { color: "text-yellow-600", icon: "⚠", text: null },
  error: { color: "text-muted-foreground", icon: "ℹ", text: null },
} as const;

export default function PhotoStep({ value, onChange }: PhotoStepProps) {
  const { status, landmarks, ratios, message, detect, reset } =
    usePoseLandmarker();

  // Run pose detection whenever a new file is selected
  useEffect(() => {
    if (value) {
      detect(value);
    } else {
      reset();
    }
  }, [value, detect, reset]);

  const handleChange = (file: File | null) => {
    onChange(file);
  };

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="space-y-5">
      {/* Photo tips */}
      {!value && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Photo tips</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Stand straight, facing the camera</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Arms slightly away from your body</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Wear a plain t-shirt for best results</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Light or white background works best</li>
          </ul>
        </div>
      )}

      {/* If we have landmarks show the annotated canvas; otherwise show the normal upload */}
      {value && status === "detected" ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Your photo</p>
          <PoseCanvas file={value} landmarks={landmarks} />
          <button
            type="button"
            onClick={() => handleChange(null)}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Remove photo
          </button>
        </div>
      ) : (
        <PhotoUpload
          label="Your photo"
          hint="Front-facing, good lighting. Upper body clearly visible."
          value={value}
          onChange={handleChange}
        />
      )}

      {/* Pose status indicator */}
      {cfg && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
            status === "detected" && "border-green-200 bg-green-50",
            (status === "no_person" || status === "multiple_people") &&
              "border-destructive/30 bg-destructive/5",
            (status === "side_angle" || status === "low_confidence") &&
              "border-yellow-200 bg-yellow-50",
            status === "loading" && "border-border bg-muted/30",
            status === "error" && "border-border bg-muted/30"
          )}
        >
          <span className={cn("mt-0.5 font-medium", cfg.color)}>
            {cfg.icon}
          </span>
          <span className={cfg.color}>
            {message ?? cfg.text}
          </span>
        </div>
      )}

      {/* Body ratios display */}
      {status === "detected" && ratios && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "Shoulder width", value: ratios.shoulder_width },
            { label: "Hip width", value: ratios.hip_width },
            { label: "Torso length", value: ratios.torso_length },
          ].map(({ label, value: v }) => (
            <div key={label} className="rounded-lg border border-border bg-muted/40 p-2">
              <p className="font-mono font-semibold text-foreground">
                {(v * 100).toFixed(1)}%
              </p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Non-blocking hint for error/low-confidence states */}
      {(status === "error" ||
        status === "low_confidence" ||
        status === "side_angle") &&
        value && (
          <p className="text-xs text-muted-foreground">
            You can still continue — pose detection is optional.
          </p>
        )}
    </div>
  );
}
