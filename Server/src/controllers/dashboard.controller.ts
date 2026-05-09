import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { MoodAssessment } from "../models/MoodAssessment.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { MeditationSession } from "../models/MeditationSession.js";

const MOOD_SCORE_MAP: Record<string, number> = {
  "Very Good": 9,
  Good: 7,
  Neutral: 5,
  "Not Good": 3,
  "Very Bad": 1,
  Excellent: 9,
  Fair: 5,
  Poor: 3,
  "Very Poor": 1,
  "Very Energetic": 9,
  Energetic: 7,
  Moderate: 5,
  "Low Energy": 3,
  Exhausted: 1,
  "Not at all": 9,
  "A little": 7,
  Moderately: 5,
  Very: 3,
  Extremely: 1,
};

function computeScore(answers: Record<string, string>) {
  const values = Object.values(answers)
    .map((a) => MOOD_SCORE_MAP[a])
    .filter((n): n is number => typeof n === "number");

  if (values.length === 0) return null;
  const avg = values.reduce((s, n) => s + n, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

function getMlScore(ml: unknown): number | null {
  const score = (ml as { score?: unknown } | undefined)?.score;
  return typeof score === "number" && Number.isFinite(score)
    ? Math.round(score * 10) / 10
    : null;
}

function normalizeMlScore(ml: unknown): number | null {
  const rawScore = getMlScore(ml);
  if (rawScore === null) return null;
  if (rawScore >= 0 && rawScore <= 10) return rawScore;

  const normalized = ((Math.max(-3, Math.min(3, rawScore)) + 3) / 6) * 10;
  return Math.round(normalized * 10) / 10;
}

function getAssessmentScore(mood: { answers: unknown; ml?: unknown }) {
  return (
    normalizeMlScore(mood.ml) ??
    computeScore(mood.answers as Record<string, string>)
  );
}

function getJournalScore(journal: { riskLevel?: unknown; ml?: unknown }) {
  if (journal.riskLevel === "high") return 1;
  return normalizeMlScore(journal.ml);
}

export async function getDashboardSummary(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const [moods, journals] = await Promise.all([
      MoodAssessment.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(14)
        .select("answers ml createdAt"),
      JournalEntry.find({ userId: req.userId, "ml.status": "completed" })
        .sort({ createdAt: -1 })
        .limit(14)
        .select("title ml riskLevel createdAt"),
    ]);

    const moodSeries = [
      ...moods.map((m) => ({
        date: m.createdAt,
        score: getAssessmentScore(m),
        source: "mood" as const,
      })),
      ...journals.map((j) => ({
        date: j.createdAt,
        score: getJournalScore(j),
        source: "journal" as const,
      })),
    ]
      .filter((x) => x.score !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-14);

    const latestMoodScore =
      moodSeries.length > 0 ? moodSeries[moodSeries.length - 1].score : null;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const journalThisMonth = await JournalEntry.countDocuments({
      userId: req.userId,
      createdAt: { $gte: monthStart },
    });

    const day = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const meditationSessions = await MeditationSession.find({
      userId: req.userId,
      createdAt: { $gte: weekStart },
    }).select("minutes");

    const meditationMinutesThisWeek = meditationSessions.reduce(
      (sum, s) => sum + (s.minutes || 0),
      0
    );

    const meditationHoursThisWeek =
      Math.round((meditationMinutesThisWeek / 60) * 10) / 10;

    return res.json({
      latestMoodScore,
      moodSeries: moodSeries.map((x) => ({
        date: x.date.toISOString(),
        score: x.score,
        source: x.source,
      })),
      journalThisMonth,
      meditationMinutesThisWeek,
      meditationHoursThisWeek,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
