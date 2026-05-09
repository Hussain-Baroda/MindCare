import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { MeditationSession } from "../models/MeditationSession.js";
import { processMeditationAchievements } from "../services/achievementService.js";

export async function logMeditationSession(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, minutes } = req.body as { title?: string; minutes?: number };

    if (!title?.trim() || !minutes || minutes < 0.1) {
      return res.status(400).json({ message: "title and minutes are required" });
    }

    const doc = await MeditationSession.create({
      userId: req.userId,
      title: title.trim(),
      minutes: Math.round(minutes * 10) / 10,
    });

    // Fire and forget — process achievements without blocking the response
    const unlockedAchievements = await processMeditationAchievements(req.userId);

    return res.status(201).json({
      message: "Meditation logged",
      session: {
        id: doc._id,
        title: doc.title,
        minutes: doc.minutes,
        createdAt: doc.createdAt,
      },
      unlockedAchievements,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMeditationSummary(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    // week starts Monday (simple local week)
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Mon=0...Sun=6
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await MeditationSession.find({
      userId: req.userId,
      createdAt: { $gte: weekStart },
    }).select("minutes createdAt");

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

    return res.json({
      weekStart: weekStart.toISOString(),
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10, // 1 decimal
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
