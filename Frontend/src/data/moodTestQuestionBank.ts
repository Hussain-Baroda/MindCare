// src/data/moodTestQuestionBank.js

export const QUESTION_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Slightly", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "Very", value: 3 },
  { label: "Extremely", value: 4 },
];

/**
 * scoringDirection:
 * - "positive": higher value means better mental state (e.g., calm, satisfied)
 * - "negative": higher value means worse mental state (e.g., stressed, hopeless)
 *
 * For "negative" questions, we reverse-score so that overall score is consistent
 * (higher final score = better mental wellness).
 */
export const QUESTION_BANK = [
  // 1) MOOD (15)
  { id: "mood_1", category: "Mood", scoringDirection: "positive", text: "How would you describe your overall mood today?" },
  { id: "mood_2", category: "Mood", scoringDirection: "positive", text: "How positive do you feel right now?" },
  { id: "mood_3", category: "Mood", scoringDirection: "positive", text: "How often did you feel happy today?" },
  { id: "mood_4", category: "Mood", scoringDirection: "positive", text: "Did you feel emotionally stable today?" },
  { id: "mood_5", category: "Mood", scoringDirection: "positive", text: "How satisfied are you with your day?" },
  { id: "mood_6", category: "Mood", scoringDirection: "positive", text: "How often did you smile today?" },
  { id: "mood_7", category: "Mood", scoringDirection: "positive", text: "How hopeful do you feel about things?" },
  { id: "mood_8", category: "Mood", scoringDirection: "positive", text: "Did you feel calm throughout the day?" },
  { id: "mood_9", category: "Mood", scoringDirection: "negative", text: "How often did you feel overwhelmed?" },
  { id: "mood_10", category: "Mood", scoringDirection: "positive", text: "How would you rate your emotional balance?" },
  { id: "mood_11", category: "Mood", scoringDirection: "positive", text: "Did you feel content today?" },
  { id: "mood_12", category: "Mood", scoringDirection: "negative", text: "How frequently did your mood change today?" },
  { id: "mood_13", category: "Mood", scoringDirection: "positive", text: "How peaceful do you feel right now?" },
  { id: "mood_14", category: "Mood", scoringDirection: "positive", text: "Did you feel emotionally strong today?" },
  { id: "mood_15", category: "Mood", scoringDirection: "positive", text: "How would you rate your overall mental state?" },

  // 2) SLEEP (10)
  { id: "sleep_1", category: "Sleep", scoringDirection: "positive", text: "How well did you sleep last night?" },
  { id: "sleep_2", category: "Sleep", scoringDirection: "positive", text: "Did you wake up feeling refreshed?" },
  { id: "sleep_3", category: "Sleep", scoringDirection: "positive", text: "How many hours did you sleep?" },
  { id: "sleep_4", category: "Sleep", scoringDirection: "negative", text: "Did you experience disturbed sleep?" },
  { id: "sleep_5", category: "Sleep", scoringDirection: "positive", text: "How easy was it for you to fall asleep?" },
  { id: "sleep_6", category: "Sleep", scoringDirection: "negative", text: "Did you wake up multiple times during the night?" },
  { id: "sleep_7", category: "Sleep", scoringDirection: "positive", text: "How energetic did you feel after waking up?" },
  { id: "sleep_8", category: "Sleep", scoringDirection: "negative", text: "Did you feel tired during the day?" },
  { id: "sleep_9", category: "Sleep", scoringDirection: "positive", text: "How consistent is your sleep schedule?" },
  { id: "sleep_10", category: "Sleep", scoringDirection: "negative", text: "Did you have trouble sleeping due to stress?" },

  // 3) ENERGY (10)
  { id: "energy_1", category: "Energy", scoringDirection: "positive", text: "How energetic do you feel right now?" },
  { id: "energy_2", category: "Energy", scoringDirection: "positive", text: "Did you feel motivated to work today?" },
  { id: "energy_3", category: "Energy", scoringDirection: "positive", text: "How active were you physically today?" },
  { id: "energy_4", category: "Energy", scoringDirection: "negative", text: "Did you feel exhausted during the day?" },
  { id: "energy_5", category: "Energy", scoringDirection: "positive", text: "How productive were you today?" },
  { id: "energy_6", category: "Energy", scoringDirection: "negative", text: "Did you feel mentally tired?" },
  { id: "energy_7", category: "Energy", scoringDirection: "positive", text: "How focused were you today?" },
  { id: "energy_8", category: "Energy", scoringDirection: "negative", text: "Did you feel lazy or unmotivated?" },
  { id: "energy_9", category: "Energy", scoringDirection: "positive", text: "How alert did you feel throughout the day?" },
  { id: "energy_10", category: "Energy", scoringDirection: "negative", text: "How much effort did daily tasks require?" },

  // 4) STRESS & ANXIETY (15)
  { id: "stress_1", category: "Stress/Anxiety", scoringDirection: "negative", text: "How stressed are you feeling right now?" },
  { id: "stress_2", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did you feel anxious today?" },
  { id: "stress_3", category: "Stress/Anxiety", scoringDirection: "negative", text: "How often did you feel worried?" },
  { id: "stress_4", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did you experience panic or fear?" },
  { id: "stress_5", category: "Stress/Anxiety", scoringDirection: "positive", text: "How well did you handle stress today?" },
  { id: "stress_6", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did you feel under pressure?" },
  { id: "stress_7", category: "Stress/Anxiety", scoringDirection: "negative", text: "How often did you overthink things?" },
  { id: "stress_8", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did small things irritate you?" },
  { id: "stress_9", category: "Stress/Anxiety", scoringDirection: "negative", text: "How tense did you feel today?" },
  { id: "stress_10", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did you feel mentally overloaded?" },
  { id: "stress_11", category: "Stress/Anxiety", scoringDirection: "negative", text: "How often did you feel nervous?" },
  { id: "stress_12", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did you feel out of control?" },
  { id: "stress_13", category: "Stress/Anxiety", scoringDirection: "negative", text: "How often did you feel restless?" },
  { id: "stress_14", category: "Stress/Anxiety", scoringDirection: "negative", text: "Did stress affect your performance today?" },
  { id: "stress_15", category: "Stress/Anxiety", scoringDirection: "negative", text: "How difficult was it to relax?" },

  // 5) SADNESS (10)
  { id: "sad_1", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel sad today?" },
  { id: "sad_2", category: "Sadness/Low Mood", scoringDirection: "negative", text: "How often did you feel low or down?" },
  { id: "sad_3", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel emotionally drained?" },
  { id: "sad_4", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel like avoiding people?" },
  { id: "sad_5", category: "Sadness/Low Mood", scoringDirection: "negative", text: "How often did you feel hopeless?" },
  { id: "sad_6", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel disconnected from others?" },
  { id: "sad_7", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you lose interest in activities?" },
  { id: "sad_8", category: "Sadness/Low Mood", scoringDirection: "negative", text: "How often did you feel like crying?" },
  { id: "sad_9", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel lonely today?" },
  { id: "sad_10", category: "Sadness/Low Mood", scoringDirection: "negative", text: "Did you feel empty inside?" },

  // 6) ANGER (10)
  { id: "ang_1", category: "Anger/Irritation", scoringDirection: "negative", text: "Did you feel angry today?" },
  { id: "ang_2", category: "Anger/Irritation", scoringDirection: "negative", text: "How often did you feel irritated?" },
  { id: "ang_3", category: "Anger/Irritation", scoringDirection: "negative", text: "Did small things annoy you?" },
  { id: "ang_4", category: "Anger/Irritation", scoringDirection: "positive", text: "How well did you control your anger?" },
  { id: "ang_5", category: "Anger/Irritation", scoringDirection: "negative", text: "Did you feel frustrated?" },
  { id: "ang_6", category: "Anger/Irritation", scoringDirection: "negative", text: "Did you react aggressively to situations?" },
  { id: "ang_7", category: "Anger/Irritation", scoringDirection: "negative", text: "Did you feel impatient today?" },
  { id: "ang_8", category: "Anger/Irritation", scoringDirection: "negative", text: "How often did you feel upset with others?" },
  { id: "ang_9", category: "Anger/Irritation", scoringDirection: "negative", text: "Did you feel like shouting or arguing?" },
  { id: "ang_10", category: "Anger/Irritation", scoringDirection: "negative", text: "Did anger affect your mood?" },

  // 7) SOCIAL (10)
  { id: "soc_1", category: "Social/Relationships", scoringDirection: "positive", text: "How connected did you feel with others?" },
  { id: "soc_2", category: "Social/Relationships", scoringDirection: "positive", text: "Did you enjoy conversations today?" },
  { id: "soc_3", category: "Social/Relationships", scoringDirection: "positive", text: "Did you feel supported by people around you?" },
  { id: "soc_4", category: "Social/Relationships", scoringDirection: "positive", text: "How comfortable were you interacting socially?" },
  { id: "soc_5", category: "Social/Relationships", scoringDirection: "negative", text: "Did you avoid social interactions?" },
  { id: "soc_6", category: "Social/Relationships", scoringDirection: "positive", text: "Did you feel valued by others?" },
  { id: "soc_7", category: "Social/Relationships", scoringDirection: "positive", text: "Did you feel understood by others?" },
  { id: "soc_8", category: "Social/Relationships", scoringDirection: "positive", text: "How often did you communicate with friends/family?" },
  { id: "soc_9", category: "Social/Relationships", scoringDirection: "negative", text: "Did you feel isolated?" },
  { id: "soc_10", category: "Social/Relationships", scoringDirection: "positive", text: "How satisfied are you with your relationships?" },

  // 8) SELF-PERCEPTION (10)
  { id: "self_1", category: "Self-Perception", scoringDirection: "positive", text: "How confident did you feel today?" },
  { id: "self_2", category: "Self-Perception", scoringDirection: "positive", text: "Did you feel good about yourself?" },
  { id: "self_3", category: "Self-Perception", scoringDirection: "positive", text: "Did you feel capable of handling problems?" },
  { id: "self_4", category: "Self-Perception", scoringDirection: "negative", text: "How often did you doubt yourself?" },
  { id: "self_5", category: "Self-Perception", scoringDirection: "positive", text: "Did you feel proud of your actions?" },
  { id: "self_6", category: "Self-Perception", scoringDirection: "negative", text: "Did you feel like a failure?" },
  { id: "self_7", category: "Self-Perception", scoringDirection: "positive", text: "How motivated were you to improve yourself?" },
  { id: "self_8", category: "Self-Perception", scoringDirection: "positive", text: "Did you feel satisfied with your progress?" },
  { id: "self_9", category: "Self-Perception", scoringDirection: "positive", text: "How positive was your self-talk?" },
  { id: "self_10", category: "Self-Perception", scoringDirection: "negative", text: "Did you feel insecure?" },

  // 9) FOCUS (5)
  { id: "focus_1", category: "Focus/Productivity", scoringDirection: "positive", text: "How well could you concentrate today?" },
  { id: "focus_2", category: "Focus/Productivity", scoringDirection: "positive", text: "Did you complete your tasks on time?" },
  { id: "focus_3", category: "Focus/Productivity", scoringDirection: "negative", text: "Did distractions affect your work?" },
  { id: "focus_4", category: "Focus/Productivity", scoringDirection: "positive", text: "How organized were you today?" },
  { id: "focus_5", category: "Focus/Productivity", scoringDirection: "positive", text: "Did you feel mentally sharp?" },

  // 10) LIFESTYLE (5)
  { id: "life_1", category: "Lifestyle/Habits", scoringDirection: "positive", text: "Did you exercise today?" },
  { id: "life_2", category: "Lifestyle/Habits", scoringDirection: "positive", text: "How healthy was your diet today?" },
  { id: "life_3", category: "Lifestyle/Habits", scoringDirection: "positive", text: "Did you take breaks when needed?" },
  { id: "life_4", category: "Lifestyle/Habits", scoringDirection: "positive", text: "Did you spend time on hobbies?" },
  { id: "life_5", category: "Lifestyle/Habits", scoringDirection: "positive", text: "How balanced was your day?" },
];