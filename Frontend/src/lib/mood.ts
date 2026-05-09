import { api } from "@/lib/api";
import type { MlOutput } from "@/lib/journal";

export type MoodAssessment = {
  id: string;
  answers: Record<string, string>;
  notes: string;
  ml?: MlOutput;
  createdAt: string;
};

export async function createMoodAssessment(
  answers: Record<number | string, string>,
  notes: string
) {
  const res = await api.post("/api/mood", { answers, notes });
  return res.data.assessment as MoodAssessment;
}

export async function markMoodForAnalysis(id: string) {
  const res = await api.post(`/api/mood/${id}/mark-analysis`);
  return res.data as { message: string; ml: MlOutput };
}
