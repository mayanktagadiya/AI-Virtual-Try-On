import {
  TryOnResultSchema,
  type Measurements,
  type TryOnResult,
} from "@/types/tryon";
import { apiClient } from "./client";

interface GarmentSource {
  garmentImage: File | null;
  garmentId: string | null;
}

export async function runTryOn(
  personImage: File,
  measurements: Measurements,
  garment: GarmentSource
): Promise<TryOnResult> {
  const form = new FormData();
  form.append("person_image", personImage);
  form.append("height_cm", measurements.height_cm.toString());
  form.append("weight_kg", measurements.weight_kg.toString());
  form.append("body_type", measurements.body_type);
  form.append("gender", measurements.gender);

  if (garment.garmentId) {
    form.append("garment_id", garment.garmentId);
  } else if (garment.garmentImage) {
    form.append("garment_image", garment.garmentImage);
  } else {
    throw new Error("Provide either garmentId or garmentImage");
  }

  try {
    const { data } = await apiClient.post("/api/v1/tryon", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return TryOnResultSchema.parse(data);
  } catch {
    return mockTryOnResult(measurements);
  }
}

// ── Mock fallback (backend offline / provider not configured) ────────────────

const PLACEHOLDER_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function mockTryOnResult(measurements: Measurements): TryOnResult {
  const { height_cm, weight_kg, body_type } = measurements;
  const bmi = weight_kg / (height_cm / 100) ** 2;

  const chest_fit =
    body_type === "slim" ? "loose" : bmi > 27 ? "tight" : "standard";
  const length = height_cm > 185 ? "short" : height_cm < 165 ? "long" : "standard";
  const sleeve = height_cm > 183 ? "short" : height_cm < 165 ? "long" : "standard";

  return {
    image_base64: PLACEHOLDER_BASE64,
    mime_type: "image/png",
    provider: "mock",
    fit_prediction: {
      chest_fit,
      length,
      sleeve,
      summary: `Based on your measurements (${height_cm} cm, ${weight_kg} kg, ${body_type}), this garment will fit ${chest_fit} through the chest with ${length} length and ${sleeve} sleeves.`,
    },
  };
}
