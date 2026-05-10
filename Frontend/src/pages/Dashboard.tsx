import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Brain,
  TrendingUp,
  Lightbulb,
  Trophy,
  BarChart2,
  Crown,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardSummary, type DashboardSummary } from "@/lib/dashboard";
import { getProfile, type UserProfile } from "@/lib/profile";

function formatMinutes(minutes: number) {
  const roundedMinutes = Math.round((minutes || 0) * 10) / 10;
  if (!roundedMinutes) return "0 min";
  if (roundedMinutes < 1) return `${Math.round(roundedMinutes * 60)} sec`;
  if (roundedMinutes < 60) return `${roundedMinutes} min`;

  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = Math.round(roundedMinutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

const Dashboard = () => {
  const location = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryError("");
      setLoadingSummary(true);
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      console.log(
        "DASHBOARD SUMMARY ERROR:",
        err?.response?.status,
        err?.response?.data
      );
      setSummaryError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {
        setProfile(null);
      });
  }, []);

  // 1) Initial load (once)
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 2) If arriving with ?refresh=1, refetch once and then remove the param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refresh = params.get("refresh");

    if (refresh === "1") {
      // refetch
      fetchSummary();

      // remove param so it can't trigger again
      params.delete("refresh");
      const next = params.toString();
      nav(
        { pathname: location.pathname, search: next ? `?${next}` : "" },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, fetchSummary, nav]);

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.moodSeries.map((p) => ({
      date: new Date(p.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: p.score,
    }));
  }, [summary]);

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { icon: Heart, label: "Mood Test", path: "/mood-test" },
    { icon: BookOpen, label: "Journal", path: "/journal" },
    { icon: Brain, label: "Meditation", path: "/meditation" },
    { icon: Lightbulb, label: "Tips", path: "/tips" },
    { icon: Trophy, label: "Achievements", path: "/achievements" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: Crown, label: "Leaderboard", path: "/leaderboard" },
    { icon: SettingsIcon, label: "Profile", path: "/settings" },
  ];

  const moodScoreDisplay = loadingSummary ? "..." : summary?.latestMoodScore ?? "--";
  const journalThisMonthDisplay = loadingSummary ? "..." : summary?.journalThisMonth ?? 0;

  // keep hours display as you requested
  const meditationHoursDisplay = loadingSummary
    ? "..."
    : formatMinutes(summary?.meditationMinutesThisWeek ?? 0);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2 mb-8">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">MindCare</span>
          </Link>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user?.name} ({user?.email})
            </div>

            <button
              onClick={() => {
                logout();
                nav("/login", { replace: true });
              }}
              className="text-sm text-muted-foreground hover:text-foreground smooth-transition"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-muted-foreground">
                Here's your mental wellness overview
              </p>
            </div>

            {summaryError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
                {summaryError}
              </div>
            )}

            <div className="glass-card p-6 rounded-xl animate-fade-in-up">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Profile</div>
                    <h3 className="text-xl font-semibold">
                      {profile?.name || user?.name || "MindCare user"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-64">
                  <div className="rounded-lg border border-border/70 p-3">
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{profile?.phone || "Not added"}</div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-3">
                    <div className="text-muted-foreground">Age</div>
                    <div className="font-medium">{profile?.age || "Not added"}</div>
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-sidebar-accent smooth-transition"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Mood Score</span>
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {moodScoreDisplay}
                </div>
                <div className="flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="w-4 h-4" />
                  <span>Based on mood tests and journals</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Journal Entries</span>
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {journalThisMonthDisplay}
                </div>
                <div className="text-sm text-muted-foreground">This month</div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Meditation Time</span>
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {meditationHoursDisplay}
                </div>
                <div className="text-sm text-muted-foreground">Total this week</div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl animate-fade-in-up">
              <h3 className="text-xl font-semibold mb-6">Mood Trends</h3>

              {loadingSummary ? (
                <div className="text-sm text-muted-foreground">Loading chart...</div>
              ) : chartData.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No mood data yet. Take a Mood Test to see your trend.
                </div>
              ) : (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Wellness score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <Link
                to="/mood-test"
                className="glass-card p-6 rounded-xl hover-lift smooth-transition"
              >
                <Heart className="w-8 h-8 text-accent mb-3" />
                <h3 className="text-lg font-semibold mb-2">Take Mood Test</h3>
                <p className="text-sm text-muted-foreground">
                  Check in with your emotions and track your progress
                </p>
              </Link>

              <Link
                to="/journal"
                className="glass-card p-6 rounded-xl hover-lift smooth-transition"
              >
                <BookOpen className="w-8 h-8 text-secondary mb-3" />
                <h3 className="text-lg font-semibold mb-2">Write in Journal</h3>
                <p className="text-sm text-muted-foreground">
                  Express your thoughts and feelings in a safe space
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
