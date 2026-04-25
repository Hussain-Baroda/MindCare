import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { assessRisk } from "../services/riskDetector.js";
import { processJournalAchievements } from "../services/achievementService.js";
import { analyzeJournalText } from "../services/mlJournal.service.js";
import mongoose from "mongoose";



export async function deleteEntry(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid entry id" });
    }

    const deleted = await JournalEntry.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createEntry(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    
    const { title, content } = req.body as { title?: string; content?: string };
    const risk = assessRisk(`${title}\n\n${content}`);
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "title and content are required" });
    }

 const textForMl = `${title.trim()}\n\n${content.trim()}`;

const mlResult = await analyzeJournalText(textForMl);

const entry = await JournalEntry.create({
  userId: req.userId,
  title: title.trim(),
  content: content.trim(),
  riskLevel: risk.riskLevel,
  riskReasons: risk.reasons,
  riskAssessedAt: new Date(),
  ml: mlResult,
});

    // Fire and forget — process achievements without blocking the response
    processJournalAchievements(req.userId).catch((err) =>
      console.error("Achievement processing error:", err)
    );

    return res.status(201).json({
      message: "Entry saved",
      risk: { level: entry.riskLevel, reasons: entry.riskReasons },
      entry: {
        id: entry._id,
        title: entry.title,
        content: entry.content,
        ml: entry.ml,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listEntries(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const entries = await JournalEntry.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("_id title content ml createdAt updatedAt");

    return res.json({
      entries: entries.map((e) => ({
        id: e._id,
        title: e.title,
        content: e.content,
        ml: e.ml,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markJournalForAnalysis(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid entry id" });
    }

const entry = await JournalEntry.findOne({
  _id: id,
  userId: req.userId,
});

if (!entry) {
  return res.status(404).json({ message: "Entry not found" });
}

const textForMl = `${entry.title}\n\n${entry.content}`;

const mlResult = await analyzeJournalText(textForMl);

entry.set("ml", mlResult);
await entry.save();

return res.json({
  message: "Marked for analysis",
  ml: entry.ml,
});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
