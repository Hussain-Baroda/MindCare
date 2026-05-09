import mongoose, { Schema } from "mongoose";

export type MeditationSessionDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  title: string;
  minutes: number;
  createdAt: Date;
  updatedAt: Date;
};

const MeditationSessionSchema = new Schema<MeditationSessionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    minutes: { type: Number, required: true, min: 0.1, max: 180 },
  },
  { timestamps: true }
);

export const MeditationSession = mongoose.model<MeditationSessionDoc>(
  "MeditationSession",
  MeditationSessionSchema
);
