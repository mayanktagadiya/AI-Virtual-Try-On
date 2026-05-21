import { TryOnResultSchema, type Measurements, type TryOnResult } from "@/types/tryon";
import { apiClient } from "./client";

// 1x1 grey PNG used as placeholder until real provider is wired (Day 3)
const PLACEHOLDER_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export async function runTryOn(
  personImage: File,
  garmentImage: File,
  measurements: Measurements
): Promise<TryOnResult> {
  const form = new FormData();
  form.append("person_image", personImage);
  form.append("garment_image", garmentImage);
  form.append("measurements", JSON.stringify(measurements));

  try {
    const { data } = await apiClient.post("/api/v1/tryon", form);
    return TryOnResultSchema.parse(data);
  } catch {
    // Backend tryon endpoint arrives Day 3 — return mock for now
    return mockTryOnResult(measurements);
  }
}

function mockTryOnResult(measurements: Measurements): TryOnResult {
  const { height_cm, weight_kg, body_type } = measurements;
  const bmi = weight_kg / ((height_cm / 100) ** 2);

  const chest_fit =
    body_type === "slim" ? "loose" : bmi > 27 ? "tight" : "standard";
  const length =
    height_cm > 185 ? "short" : height_cm < 165 ? "long" : "standard";
  const sleeve =
    height_cm > 183 ? "short" : height_cm < 165 ? "long" : "standard";

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
