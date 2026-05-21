import { z } from "zod";

// ── Wizard step index ────────────────────────────────────────────────────────
export type WizardStep = 0 | 1 | 2 | 3;

export const WIZARD_STEPS = [
  { label: "Your Photo", description: "Upload a front-facing photo" },
  { label: "Measurements", description: "Height, weight & body type" },
  { label: "Choose Garment", description: "Pick from catalog or upload" },
  { label: "Your Result", description: "See yourself wearing it" },
] as const;

// ── Measurement form ─────────────────────────────────────────────────────────
export const MeasurementSchema = z.object({
  height_cm: z
    .number()
    .min(100, "Must be at least 100 cm")
    .max(250, "Must be at most 250 cm"),
  weight_kg: z
    .number()
    .min(30, "Must be at least 30 kg")
    .max(300, "Must be at most 300 kg"),
  body_type: z.enum(["slim", "athletic", "average", "heavier"]),
  gender: z.enum(["male", "female", "other"]),
});

export type Measurements = z.infer<typeof MeasurementSchema>;

// ── Wizard state ─────────────────────────────────────────────────────────────
export interface WizardState {
  personImage: File | null;
  measurements: Measurements | null;
  garmentId: string | null;
  garmentImage: File | null;
}

// ── Mock / real try-on result ────────────────────────────────────────────────
export const FitPredictionSchema = z.object({
  chest_fit: z.enum(["tight", "standard", "loose"]),
  length: z.enum(["short", "standard", "long"]),
  sleeve: z.enum(["short", "standard", "long"]),
  summary: z.string(),
});

export const TryOnResultSchema = z.object({
  image_base64: z.string(),
  mime_type: z.string(),
  fit_prediction: FitPredictionSchema,
  provider: z.string(),
});

export type TryOnResult = z.infer<typeof TryOnResultSchema>;
