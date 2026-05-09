import { api } from "@/lib/api";

export type MlOutput = {
  status: "pending" | "completed" | "failed";
  source?: "journal" | "assessment";
  inputHash?: string;
  modelVersion?: string;
  primaryEmotion?: string;
  secondaryEmotion?: string;
  confidence?: number;
  score?: number;
  emotionType?: string;
  raw?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  error?: string;
};

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  ml?: MlOutput;
  createdAt: string;
  updatedAt: string;
};

export type CrisisAlertResult =
  | { status: "not_needed" }
  | { status: "disabled" }
  | { status: "missing_contact" }
  | { status: "cooldown" }
  | { status: "scheduled"; alertId: string; sendAt: string; delaySeconds: number };

export async function createJournalEntry(title: string, content: string) {
  const res = await api.post("/api/journal", { title, content });
  return res.data as {
    message: string;
    risk: { level: "low" | "medium" | "high"; reasons: string[] };
    entry: JournalEntry;
    unlockedAchievements?: string[];
    crisisAlert?: CrisisAlertResult;
  };
}

export async function listJournalEntries() {
  const res = await api.get("/api/journal");
  return res.data.entries as JournalEntry[];
}

export async function deleteJournalEntry(id: string) {
  const res = await api.delete(`/api/journal/${id}`);
  return res.data as { message: string };
}

export async function markJournalForAnalysis(id: string) {
  const res = await api.post(`/api/journal/${id}/mark-analysis`);
  return res.data as { message: string; ml: MlOutput };
}
