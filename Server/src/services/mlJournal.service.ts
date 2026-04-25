import axios from "axios";

export async function analyzeJournalText(text: string) {
  try {
    const response = await axios.post(
      "https://atharva-mohite-ce-ai-mental-health-api.hf.space/predict",
      { text }
    );

    const data = response.data;

    return {
      status: "completed" as const,
      source: "journal" as const,
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
      source: "journal" as const,
      error: "ML API failed",
    };
  }
}