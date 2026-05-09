import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getMoodTrends,
  getTriggers,
  getInsights,
  getComparison,
  exportReport,
  mlInsights,
  personalizedTips,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/mood-trends", requireAuth, getMoodTrends);
router.get("/triggers", requireAuth, getTriggers);
router.get("/insights", requireAuth, getInsights);
router.get("/ml-insights", requireAuth, mlInsights);
router.get("/personalized-tips", requireAuth, personalizedTips);
router.get("/comparison", requireAuth, getComparison);
router.get("/export-report", requireAuth, exportReport);

export default router;
