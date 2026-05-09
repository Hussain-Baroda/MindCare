import { api } from "@/lib/api";

export type DailyTrend = {
  date: string;
  avgScore: number;
  count: number;
};

export type EmotionDistribution = {
  emotion: string;
  count: number;
};

export type WeeklyAverage = {
  week: string;
  avgScore: number;
  count: number;
};

export type MoodTrendsResponse = {
  dailyTrends: DailyTrend[];
  emotionDistribution: EmotionDistribution[];
  weeklyAverages: WeeklyAverage[];
  period: number;
};

export type TriggerEntry = {
  emotion: string;
  count: number;
  type: "risk" | "positive";
  correlation: string;
};

export type TriggersResponse = {
  triggers: TriggerEntry[];
  positiveFactors: TriggerEntry[];
};

export type InsightsResponse = {
  insights: string[];
  recommendations: string[];
  stats: {
    avg7DayMood: number | null;
    avg30DayMood: number | null;
    meditationSessionsThisMonth: number;
    journalEntriesThisMonth: number;
    currentStreaks: { meditation: number; journal: number; mood: number };
    achievementsUnlocked: number;
  };
};

export type ComparisonResponse = {
  current: { period: string; avgMoodScore: number | null; meditationSessions: number; journalEntries: number; checkIns: number };
  previous: { period: string; avgMoodScore: number | null; meditationSessions: number; journalEntries: number; checkIns: number };
  changes: { moodChange: number | null; meditationChange: number; journalChange: number; checkInChange: number };
};

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  totalPoints: number;
  breakdown: { meditation: number; journal: number; mood: number; achievements: number };
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
};

export type PersonalizedTip = {
  category: string;
  title: string;
  description: string;
};

export type PersonalizedTipsResponse = {
  generatedAt: string;
  context: {
    recentScore: number | null;
    latestEmotion: string | null;
    meditationMinutesThisWeek: number;
    journalEntriesThisWeek: number;
  };
  tips: PersonalizedTip[];
};

export type UserLeaderboardStatus = {
  isPublic: boolean;
  totalPoints: number;
  rank: number | null;
  displayName: string;
};

export async function getMoodTrends(period: 7 | 30 | 90 = 30): Promise<MoodTrendsResponse> {
  const res = await api.get(`/api/analytics/mood-trends?period=${period}`);
  return res.data;
}

export async function getTriggers(): Promise<TriggersResponse> {
  const res = await api.get("/api/analytics/triggers");
  return res.data;
}

export async function getInsights(): Promise<InsightsResponse> {
  const res = await api.get("/api/analytics/insights");
  return res.data;
}

export async function getComparison(): Promise<ComparisonResponse> {
  const res = await api.get("/api/analytics/comparison");
  return res.data;
}

export async function exportReport() {
  const res = await api.get("/api/analytics/export-report");
  return res.data;
}

export async function getPersonalizedTips(): Promise<PersonalizedTipsResponse> {
  const res = await api.get("/api/analytics/personalized-tips");
  return res.data;
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const res = await api.get("/api/leaderboard");
  return res.data;
}

export async function getUserLeaderboardStatus(): Promise<UserLeaderboardStatus> {
  const res = await api.get("/api/leaderboard/me");
  return res.data;
}

export async function toggleLeaderboardVisibility(isPublic: boolean): Promise<{ message: string; isPublic: boolean }> {
  const res = await api.post("/api/leaderboard/toggle", { isPublic });
  return res.data;
}
