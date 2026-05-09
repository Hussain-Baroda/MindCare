import mongoose, { type InferSchemaType, type Model } from "mongoose";

const PendingCrisisAlertSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "cancelled", "sent", "failed"],
      default: "pending",
      index: true,
    },
    triggeredAt: { type: Date, required: true },
    sendAt: { type: Date, required: true, index: true },

    // minimal info only (no journal content)
    userName: { type: String, default: "A MindCare user" },
    timezone: { type: String, default: "IST" },
    delaySeconds: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export type PendingCrisisAlertDoc = InferSchemaType<typeof PendingCrisisAlertSchema>;

export const PendingCrisisAlert: Model<PendingCrisisAlertDoc> =
  (mongoose.models.PendingCrisisAlert as Model<PendingCrisisAlertDoc>) ||
  mongoose.model<PendingCrisisAlertDoc>("PendingCrisisAlert", PendingCrisisAlertSchema);