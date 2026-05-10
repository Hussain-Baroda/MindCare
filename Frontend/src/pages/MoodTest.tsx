import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createMoodAssessment } from "@/lib/mood";
import { QUESTION_BANK as NEW_QUESTION_BANK } from "../data/moodTestQuestionBank";

const OLD_QUESTION_BANK = [
  {
    id: 1,
    scoringDirection: "positive",
    question: "How would you describe your overall mood today?",
    options: ["Very Good", "Good", "Neutral", "Not Good", "Very Bad"],
  },
  {
    id: 2,
    scoringDirection: "positive",
    question: "How well did you sleep last night?",
    options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
  },
  {
    id: 3,
    scoringDirection: "positive",
    question: "How energetic do you feel right now?",
    options: ["Very Energetic", "Energetic", "Moderate", "Low Energy", "Exhausted"],
  },
  {
    id: 4,
    scoringDirection: "negative",
    question: "How stressed are you feeling?",
    options: ["Not at all", "A little", "Moderately", "Very", "Extremely"],
  },
];

const convertedNewQuestions = NEW_QUESTION_BANK.map((q: any, index: number) => ({
  id: index + 100,
  scoringDirection: q.scoringDirection,
  question: q.text,
  options: [
    "Not at all",
    "Slightly",
    "Moderately",
    "Very",
    "Extremely",
  ],
}));

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getQuestionCount() {
  return Math.random() < 0.5 ? 9 : 10;
}

const OLD_SCORE_MAP: Record<string, number> = {
  "Very Good": 9,
  Good: 7,
  Neutral: 5,
  "Not Good": 3,
  "Very Bad": 1,
  Excellent: 9,
  Fair: 5,
  Poor: 3,
  "Very Poor": 1,
  "Very Energetic": 9,
  Energetic: 7,
  Moderate: 5,
  "Low Energy": 3,
  Exhausted: 1,
  "A little": 7,
};

const LIKERT_VALUE_MAP: Record<string, number> = {
  "Not at all": 0,
  Slightly: 1,
  Moderately: 2,
  Very: 3,
  Extremely: 4,
};

function scoreAnswer(answer: string, direction: string) {
  const likertValue = LIKERT_VALUE_MAP[answer];

  if (typeof likertValue === "number") {
    const directionalScore = direction === "positive" ? likertValue : 4 - likertValue;
    return 1 + (directionalScore / 4) * 8;
  }

  return OLD_SCORE_MAP[answer] ?? null;
}

const MoodTest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const questions = useMemo(() => {
    const questionCount = getQuestionCount();

    return shuffleArray([
      ...OLD_QUESTION_BANK,
      ...convertedNewQuestions,
    ]).slice(0, questionCount);
  }, []);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete Test",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const answersForApi = Object.fromEntries(
        questions.map((question) => [
          `${question.scoringDirection}:${question.question}`,
          answers[question.id],
        ])
      );
      const scoreValues = questions
        .map((question) =>
          scoreAnswer(answers[question.id], question.scoringDirection)
        )
        .filter((value): value is number => value !== null);
      const assessmentScore =
        scoreValues.length > 0
          ? Math.round(
              (scoreValues.reduce((sum, value) => sum + value, 0) /
                scoreValues.length) *
                10
            ) / 10
          : undefined;

      const assessment = await createMoodAssessment(
        answersForApi,
        notes,
        assessmentScore
      );
      const scoreText =
        assessment.ml?.score !== undefined ? ` Mood score: ${assessment.ml.score}.` : "";

      toast({
        title: "Assessment Complete",
        description: `Your results were saved successfully.${scoreText}`,
      });

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-10 text-center">
            Mood Assessment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((q, index) => (
              <div key={q.id} className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {q.question}
                </h3>

                <RadioGroup
                  value={answers[q.id]}
                  onValueChange={(value) =>
                    handleAnswerChange(q.id, value)
                  }
                >
                  <div className="space-y-3">
                    {q.options.map((option) => (
                      <div
                        key={option}
                        className="flex items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`q${q.id}-${option}`}
                        />
                        <Label htmlFor={`q${q.id}-${option}`}>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}

            <div className="glass-card p-6 rounded-xl">
              <Label htmlFor="notes">Additional Notes</Label>

              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write anything you feel..."
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Submit Assessment"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MoodTest;
