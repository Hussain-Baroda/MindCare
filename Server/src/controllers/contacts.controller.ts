import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { TrustedContact } from "../models/TrustedContact.js";

const MAX_CONTACTS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listContacts(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
  const items = await TrustedContact.find({ userId: req.userId }).sort({ createdAt: -1 });
  return res.json({
    contacts: items.map((c) => ({ id: c._id, name: c.name, email: c.email, createdAt: c.createdAt })),
  });
}

export async function createContact(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const count = await TrustedContact.countDocuments({ userId: req.userId });
  if (count >= MAX_CONTACTS) {
    return res.status(400).json({ message: `Maximum ${MAX_CONTACTS} contacts allowed` });
  }

  const { name, email } = req.body as { name?: string; email?: string };
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "name and email are required" });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  const doc = await TrustedContact.create({
    userId: req.userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
  });

  return res.status(201).json({
    message: "Contact added",
    contact: { id: doc._id, name: doc.name, email: doc.email, createdAt: doc.createdAt },
  });
}

export async function updateContact(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { name, email } = req.body as { name?: string; email?: string };
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "name and email are required" });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  const updated = await TrustedContact.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { name: name.trim(), email: email.trim().toLowerCase() },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Contact not found" });

  return res.json({
    message: "Contact updated",
    contact: { id: updated._id, name: updated.name, email: updated.email, createdAt: updated.createdAt },
  });
}

export async function deleteContact(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const deleted = await TrustedContact.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: "Contact not found" });

  return res.json({ message: "Contact deleted" });
}
