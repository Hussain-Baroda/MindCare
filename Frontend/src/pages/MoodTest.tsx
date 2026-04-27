// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { Button } from "@/components/ui/button";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { createMoodAssessment } from "@/lib/mood";
// import { QUESTION_BANK as NEW_QUESTION_BANK } from "../data/moodTestQuestionBank";

// const OLD_QUESTION_BANK = [
//   {
//     id: 1,
//     question: "How would you describe your overall mood today?",
//     options: ["Very Good", "Good", "Neutral", "Not Good", "Very Bad"],
//   },
//   {
//     id: 2,
//     question: "How well did you sleep last night?",
//     options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
//   },
//   {
//     id: 3,
//     question: "How energetic do you feel right now?",
//     options: ["Very Energetic", "Energetic", "Moderate", "Low Energy", "Exhausted"],
//   },
//   {
//     id: 4,
//     question: "How stressed are you feeling?",
//     options: ["Not at all", "A little", "Moderately", "Very", "Extremely"],
//   },
// ];

// const convertedNewQuestions = NEW_QUESTION_BANK.map((q: any, index: number) => ({
//   id: index + 100,
//   question: q.text,
//   options: [
//     "Not at all",
//     "Slightly",
//     "Moderately",
//     "Very",
//     "Extremely",
//   ],
// }));

// function shuffleArray<T>(array: T[]): T[] {
//   return [...array].sort(() => Math.random() - 0.5);
// }

// const MoodTest = () => {
//   alert("THIS IS THE REAL MOODTEST FILE");
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const questions = useMemo(() => {
//     console.log("New Questions:", convertedNewQuestions.length);
//     return shuffleArray(
//   convertedNewQuestions
// ).slice(0, 15);
//   }, []);

//   const [answers, setAnswers] = useState<Record<number, string>>({});
//   const [notes, setNotes] = useState("");
//   const [saving, setSaving] = useState(false);

//   const handleAnswerChange = (id: number, value: string) => {
//     setAnswers((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (Object.keys(answers).length < questions.length) {
//       toast({
//         title: "Incomplete Test",
//         description: "Please answer all questions",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setSaving(true);

//       await createMoodAssessment(answers, notes);

//       toast({
//         title: "Assessment Complete",
//         description: "Your results were saved successfully.",
//       });

//       setTimeout(() => navigate("/dashboard"), 1000);
//     } catch (err: any) {
//       toast({
//         title: "Save failed",
//         description: err?.response?.data?.message || "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />

//       <main className="flex-1 pt-24 pb-12">
//         <div className="container mx-auto max-w-3xl px-4">
//           <h1 className="text-4xl font-bold mb-10 text-center">
//             Mood Assessment
//           </h1>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {questions.map((q, index) => (
//               <div key={q.id} className="glass-card p-6 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-4">
//                   {index + 1}. {q.question}
//                 </h3>

//                 <RadioGroup
//                   value={answers[q.id]}
//                   onValueChange={(value) =>
//                     handleAnswerChange(q.id, value)
//                   }
//                 >
//                   <div className="space-y-3">
//                     {q.options.map((option) => (
//                       <div
//                         key={option}
//                         className="flex items-center space-x-3"
//                       >
//                         <RadioGroupItem
//                           value={option}
//                           id={`q${q.id}-${option}`}
//                         />
//                         <Label htmlFor={`q${q.id}-${option}`}>
//                           {option}
//                         </Label>
//                       </div>
//                     ))}
//                   </div>
//                 </RadioGroup>
//               </div>
//             ))}

//             <div className="glass-card p-6 rounded-xl">
//               <Label htmlFor="notes">Additional Notes</Label>

//               <Textarea
//                 id="notes"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Write anything you feel..."
//               />
//             </div>

//             <Button
//               type="submit"
//               disabled={saving}
//               className="w-full"
//             >
//               {saving ? "Saving..." : "Submit Assessment"}
//             </Button>
//           </form>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default MoodTest;

import React, { useMemo, useState } from "react";

export default function MoodTest() {
  const allQuestions = [
    "How positive do you feel right now?",
    "Did you feel calm throughout the day?",
    "How stressed are you feeling right now?",
    "Did you feel lonely today?",
    "How energetic do you feel right now?",
    "Did you feel anxious today?",
    "How well did you sleep last night?",
    "Did you exercise today?",
    "How confident did you feel today?",
    "Did distractions affect your work?",
    "Did you feel sad today?",
    "How often did you smile today?",
    "Did you feel emotionally stable today?",
    "Did you feel isolated?",
    "How peaceful do you feel right now?",
    "Did you lose interest in activities?",
    "How productive were you today?",
    "Did you feel tired during the day?",
    "How organized were you today?",
    "Did you spend time on hobbies?"
  ];

  function shuffle(array: string[]) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const questions = useMemo(() => {
    return shuffle(allQuestions).slice(0, 10);
  }, []);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  return (
    <div style={{ padding: "30px" }}>
      <h1>Mood Test Working</h1>

      {questions.map((q, index) => (
        <div
          key={index}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
          }}
        >
          <h3>{index + 1}. {q}</h3>

          {["Not at all", "Slightly", "Moderately", "Very", "Extremely"].map(
            (option) => (
              <label
                key={option}
                style={{ display: "block", marginTop: "8px" }}
              >
                <input
                  type="radio"
                  name={`q-${index}`}
                  value={option}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [index]: option,
                    }))
                  }
                />
                {" "}{option}
              </label>
            )
          )}
        </div>
      ))}

      <button
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Submit
      </button>
    </div>
  );
}