import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { startCrisisAlertWorker } from "./workers/crisisAlertWorker.js";

import testEmailRoutes from "./routes/test-email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import meditationRoutes from "./routes/meditation.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import crisisRoutes from "./routes/crisis.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());

// General API rate limiter: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is healthy" });
});

if (process.env.NODE_ENV !== "production") {
  app.use("/api", testEmailRoutes);
}

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/meditation", meditationRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/crisis", crisisRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

connectDB()
  .then(() => {
    startCrisisAlertWorker();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });