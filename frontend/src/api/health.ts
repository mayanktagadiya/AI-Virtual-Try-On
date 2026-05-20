import { z } from "zod";
import { apiClient } from "./client";

export const HealthResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get("/health");
  return HealthResponseSchema.parse(data);
}
