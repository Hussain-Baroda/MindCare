import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { TrustedContact } from "../models/TrustedContact.js";
import { CrisisSettings } from "../models/CrisisSettings.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env");

  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      trustedContactName?: string;
      trustedContactEmail?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const trustedContactName = req.body.trustedContactName?.trim();
    const trustedContactEmail = req.body.trustedContactEmail?.trim().toLowerCase();

    if (trustedContactName || trustedContactEmail) {
      if (!trustedContactName || !trustedContactEmail) {
        return res.status(400).json({ message: "Trusted contact name and email are both required" });
      }
      if (!EMAIL_RE.test(trustedContactEmail)) {
        return res.status(400).json({ message: "Trusted contact email must be valid" });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    if (trustedContactName || trustedContactEmail) {
      await TrustedContact.create({
        userId: user._id,
        name: trustedContactName,
        email: trustedContactEmail,
      });

      await CrisisSettings.create({
        userId: user._id,
        enabled: true,
        mode: "auto",
        delaySeconds: 30,
      });
    } else {
      await CrisisSettings.create({
        userId: user._id,
        enabled: false,
        mode: "auto",
        delaySeconds: 30,
      });
    }

    const token = signToken(user._id.toString());

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id.toString());

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}



export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.userId).select("_id name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
