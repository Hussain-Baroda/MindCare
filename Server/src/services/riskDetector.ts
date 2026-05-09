export type RiskLevel = "low" | "medium" | "high";

const HIGH_PATTERNS: Array<{ phrase: string; regex: RegExp }> = [
  { phrase: "i want to die", regex: /\bi\s*want\s*to\s*die\b/i },
  { phrase: "suicide", regex: /\bsuicid(e|al)\b/i },
  { phrase: "kill myself", regex: /\bkill\s*myself\b/i },
  { phrase: "end my life", regex: /\bend\s*my\s*life\b/i },
  { phrase: "i can't go on", regex: /\bi\s*can('|’)t\s*go\s*on\b/i },
  { phrase: "hopeless", regex: /\bhopeless\b/i },
  { phrase: "i want to disappear", regex: /\b(i\s*want\s*to\s*disappear)\b/i },
  { phrase: "self harm", regex: /\b(self\s*harm|hurt\s*myself|harm\s*myself)\b/i },
  { phrase: "no reason to live", regex: /\b(no\s*reason\s*to\s*live|nothing\s*to\s*live\s*for)\b/i },
  { phrase: "overdose", regex: /\boverdose\b/i },
];

export function assessRisk(text: string): { riskLevel: RiskLevel; reasons: string[] } {
  const t = (text || "").toLowerCase();
  const reasons = HIGH_PATTERNS.filter((p) => p.regex.test(t)).map((p) => p.phrase);

  if (reasons.length > 0) return { riskLevel: "high", reasons };

  // simple medium check (optional)
  if (/\b(depressed|worthless|empty|panic|anxious)\b/i.test(t)) {
    return { riskLevel: "medium", reasons: ["distress_keywords"] };
  }

  return { riskLevel: "low", reasons: [] };
}
