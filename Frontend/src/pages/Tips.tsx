import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Sun, Moon, Activity, Coffee, Users, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getPersonalizedTips, type PersonalizedTip } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const tips = [
  {
    icon: Sun,
    title: "Start Your Day Right",
    description:
      "Begin each morning with 5 minutes of mindful breathing. This sets a positive tone for the entire day.",
    category: "Morning Routine",
  },
  {
    icon: Activity,
    title: "Move Your Body",
    description:
      "Regular exercise releases endorphins that boost mood. Even a 15-minute walk can make a difference.",
    category: "Physical Health",
  },
  {
    icon: Moon,
    title: "Prioritize Sleep",
    description:
      "Aim for 7-9 hours of quality sleep. Create a calming bedtime routine and stick to a schedule.",
    category: "Sleep Hygiene",
  },
  {
    icon: Heart,
    title: "Practice Gratitude",
    description:
      "Write down three things you're grateful for each day. This simple practice rewires your brain for positivity.",
    category: "Mindfulness",
  },
  {
    icon: Users,
    title: "Stay Connected",
    description:
      "Maintain meaningful relationships. Regular social interaction is crucial for mental wellbeing.",
    category: "Social Connection",
  },
  {
    icon: Coffee,
    title: "Take Breaks",
    description:
      "Step away from work every hour. Short breaks improve focus and reduce stress throughout the day.",
    category: "Work-Life Balance",
  },
];

const articles = [
  {
    title: "Understanding Anxiety: A Complete Guide",
    excerpt: "Learn about anxiety triggers, symptoms, and effective coping strategies...",
    readTime: "8 min read",
    category: "Mental Health",
    link: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/about-anxiety/",
  },
  {
    title: "The Science of Happiness",
    excerpt: "Discover evidence-based practices that can improve your overall wellbeing...",
    readTime: "6 min read",
    category: "Psychology",
    link: "https://positivepsychology.com/happiness/",
  },
  {
    title: "Building Resilience in Difficult Times",
    excerpt: "Practical tips for developing mental strength and emotional flexibility...",
    readTime: "10 min read",
    category: "Personal Growth",
    link: "https://www.mentalhealthctr.com/9-ways-to-foster-resilience-in-challenging-times/",
  },
];

const Tips = () => {
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [tipsError, setTipsError] = useState("");

  async function loadTips() {
    try {
      setTipsError("");
      setLoadingTips(true);
      const data = await getPersonalizedTips();
      setPersonalizedTips(data.tips);
    } catch (err: any) {
      setTipsError(err?.response?.data?.message || "Could not load personalized tips");
    } finally {
      setLoadingTips(false);
    }
  }

  useEffect(() => {
    loadTips();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">
              Wellness <span className="gradient-text">Tips & Resources</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert advice and practical tips for better mental health
            </p>
          </div>

          <section className="mb-16">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold">Personalized AI Tips</h2>
              <Button
                type="button"
                variant="outline"
                onClick={loadTips}
                disabled={loadingTips}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loadingTips ? "animate-spin" : ""}`} />
                Refresh Tips
              </Button>
            </div>
            {tipsError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 mb-4">
                {tipsError}
              </div>
            )}
            {loadingTips ? (
              <div className="text-sm text-muted-foreground">Reading your latest wellness signals...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedTips.map((tip, index) => (
                  <div
                    key={`${tip.title}-${index}`}
                    className="glass-card p-6 rounded-xl hover-lift smooth-transition animate-fade-in-up border-primary/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-xs text-primary font-medium mb-2">{tip.category}</div>
                    <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                    <p className="text-muted-foreground text-sm">{tip.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Daily Tips */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Daily Wellness Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-xl hover-lift smooth-transition animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <tip.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-xs text-primary font-medium mb-2">{tip.category}</div>
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">{tip.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Articles */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
            <div className="space-y-6">
              {articles.map((article, index) => (
                <div
                  key={index}
                  className="glass-card p-8 rounded-xl hover-lift smooth-transition cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {article.category}
                    </div>
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{article.title}</h3>
                  <p className="text-muted-foreground mb-4">{article.excerpt}</p>

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent smooth-transition font-medium"
                  >
                    Read more →
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tips;
