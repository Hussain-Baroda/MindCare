import axios from "axios";

const DEFAULT_ML_API_URL = "https://atharva-mohite-ce-ai-mental-health-api.hf.space";

export async function analyzeJournalText(
  text: string,
  source: "journal" | "assessment" = "journal"
) {
  try {
    const mlApiUrl = process.env.ML_API_URL || DEFAULT_ML_API_URL;
    const response = await axios.post(
      `${mlApiUrl.replace(/\/$/, "")}/predict`,
      { text }
    );

    const data = response.data;

    return {
      status: "completed" as const,
      source,
      primaryEmotion: data["Primary Emotion"],
      secondaryEmotion: data["Secondary Emotion"],
      confidence: Number(data["Confidence"]),
      score: Number(data["Score"]),
      emotionType: data["Emotion Type"],
    };
  } catch (error) {
    console.error(error);

    return {
      status: "failed" as const,
      source,
      error: "ML API failed",
    };
  }
}
