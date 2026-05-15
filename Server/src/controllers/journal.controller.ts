import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { assessRisk } from "../services/riskDetector.js";
import { processJournalAchievements } from "../services/achievementService.js";
import { analyzeJournalText } from "../services/mlJournal.service.js";
import mongoose from "mongoose";
import { CrisisSettings } from "../models/CrisisSettings.js";
import { TrustedContact } from "../models/TrustedContact.js";
import { PendingCrisisAlert } from "../models/PendingCrisisAlert.js";
import { User } from "../models/User.js";
import { processDueCrisisAlerts } from "../workers/crisisAlertWorker.js";

async function scheduleJournalCrisisAlert(userId: string) {
  const settings =
    (await CrisisSettings.findOne({ userId })) ||
    (await CrisisSettings.create({
      userId,
      enabled: true,
      mode: "auto",
      delaySeconds: 10,
    }));

  const contacts = await TrustedContact.find({ userId }).limit(3);
  if (contacts.length === 0) return { status: "missing_contact" as const };

  if (settings && !settings.enabled) {
    settings.enabled = true;
    settings.mode = "auto";
    await settings.save();
  }

  const cooldownMinutes = 10;
  const cutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  const recentAlert = await PendingCrisisAlert.findOne({
    userId,
    status: { $in: ["pending", "sent"] },
    createdAt: { $gte: cutoff },
  } as any).sort({ createdAt: -1 });

  if (recentAlert) return { status: "cooldown" as const };

  await PendingCrisisAlert.updateMany(
    { userId, status: "pending" },
    { $set: { status: "cancelled" } }
  );

  const delaySeconds = settings?.delaySeconds ?? 30;
  const user = await User.findById(userId).select("name");
  const alert = await PendingCrisisAlert.create({
    userId,
    status: "pending",
    triggeredAt: new Date(),
    sendAt: new Date(Date.now() + delaySeconds * 1000),
    userName: user?.name || "A MindCare user",
    timezone: "IST",
    delaySeconds,
  });

  setTimeout(() => {
    processDueCrisisAlerts().catch((err) =>
      console.error("[journal] Failed to process scheduled crisis alert", err)
    );
  }, delaySeconds * 1000 + 500);

  return {
    status: "scheduled" as const,
    alertId: alert._id,
    sendAt: alert.sendAt,
    delaySeconds,
  };
}


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
    const crisisAlert =
      risk.riskLevel === "high"
        ? await scheduleJournalCrisisAlert(req.userId)
        : { status: "not_needed" as const };

    const unlockedAchievements = await processJournalAchievements(req.userId);

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
      unlockedAchievements,
      crisisAlert,
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
