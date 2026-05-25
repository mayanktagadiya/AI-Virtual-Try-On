import { z } from "zod";
import { apiClient } from "./client";

export const GarmentMeasurementsSchema = z.object({
  chest_cm: z.number(),
  length_cm: z.number(),
  sleeve_cm: z.number(),
});

export const CatalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string(),
  available_sizes: z.array(z.string()),
  garment_measurements: GarmentMeasurementsSchema,
});

export type CatalogItem = z.infer<typeof CatalogItemSchema>;

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const { data } = await apiClient.get("/api/v1/catalog");
  return z.array(CatalogItemSchema).parse(data);
}

/** Resolves a catalog image_url to a full absolute URL. */
export function catalogImageUrl(image_url: string): string {
  if (image_url.startsWith("http")) return image_url;
  const base = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  return `${base}${image_url}`;
}
