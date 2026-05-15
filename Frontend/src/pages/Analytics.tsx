import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  getMoodTrends,
  getTriggers,
  getInsights,
  getComparison,
  exportReport,
} from "@/lib/analytics";
import type {
  MoodTrendsResponse,
  TriggersResponse,
  InsightsResponse,
  ComparisonResponse,
} from "@/lib/analytics";
import { AppShell } from "@/components/AppShell";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [trends, setTrends] = useState<MoodTrendsResponse | null>(null);
  const [triggers, setTriggers] = useState<TriggersResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [t, tr, ins, comp] = await Promise.all([
        getMoodTrends(period),
        getTriggers(),
        getInsights(),
        getComparison(),
      ]);
      setTrends(t);
      setTriggers(tr);
      setInsights(ins);
      setComparison(comp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportReport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindcare-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell title="Analytics">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header row */}
            <div className="flex flex-col gap-4 animate-fade-in lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Advanced Analytics</h2>
                <p className="text-muted-foreground">Deep insights into your mental wellness journey</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Period selector */}
                <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
                  {([7, 30, 90] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium smooth-transition ${
                        period === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p}d
                    </button>
                  ))}
                </div>
                <button
                  onClick={fetchAll}
                  disabled={loading}
                  className="p-2 rounded-lg border border-border hover:bg-muted smooth-transition"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 smooth-transition"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export Report"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Key Stats */}
            {insights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">7-day Avg Mood</div>
                  <div className="text-2xl font-bold gradient-text">
                    {insights.stats.avg7DayMood ?? "--"}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">30-day Avg Mood</div>
                  <div className="text-2xl font-bold gradient-text">
                    {insights.stats.avg30DayMood ?? "--"}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Meditation (30d)</div>
                  <div className="text-2xl font-bold gradient-text">
                    {insights.stats.meditationSessionsThisMonth}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Journal (30d)</div>
                  <div className="text-2xl font-bold gradient-text">
                    {insights.stats.journalEntriesThisMonth}
                  </div>
                </div>
              </div>
            )}

            {/* Mood Trends Line Chart */}
            <div className="glass-card p-6 rounded-xl animate-fade-in-up">
              <h3 className="text-xl font-semibold mb-6">Mood Trends ({period} days)</h3>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading chart...</div>
              ) : !trends || trends.dailyTrends.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No mood data for this period. Take a Mood Test to see your trends.
                </div>
              ) : (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={trends.dailyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        name="Avg Mood"
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
              {/* Emotion Distribution Pie Chart */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : !trends || trends.emotionDistribution.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No emotion data yet.</div>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={trends.emotionDistribution}
                          dataKey="count"
                          nameKey="emotion"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                        >
                          {trends.emotionDistribution.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          iconSize={10}
                          wrapperStyle={{ fontSize: "11px", maxWidth: "120px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Weekly Averages Bar Chart */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Weekly Mood Averages</h3>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : !trends || trends.weeklyAverages.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No weekly data yet.</div>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={trends.weeklyAverages} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="avgScore" name="Avg Mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Period Comparison */}
            {comparison && (
              <div className="glass-card p-6 rounded-xl animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-6">Period Comparison</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Avg Mood",
                      current: comparison.current.avgMoodScore ?? "--",
                      previous: comparison.previous.avgMoodScore ?? "--",
                      change: comparison.changes.moodChange,
                    },
                    {
                      label: "Meditation Sessions",
                      current: comparison.current.meditationSessions,
                      previous: comparison.previous.meditationSessions,
                      change: comparison.changes.meditationChange,
                    },
                    {
                      label: "Journal Entries",
                      current: comparison.current.journalEntries,
                      previous: comparison.previous.journalEntries,
                      change: comparison.changes.journalChange,
                    },
                    {
                      label: "Mood Check-ins",
                      current: comparison.current.checkIns,
                      previous: comparison.previous.checkIns,
                      change: comparison.changes.checkInChange,
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                      <div className="text-2xl font-bold gradient-text">{item.current}</div>
                      <div className="text-xs text-muted-foreground">vs {item.previous} (prev 30d)</div>
                      {item.change !== null && item.change !== undefined && (
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${
                            Number(item.change) > 0
                              ? "text-green-600"
                              : Number(item.change) < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {Number(item.change) > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : Number(item.change) < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : null}
                          {Number(item.change) > 0 ? "+" : ""}{item.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Triggers & Positive Factors */}
            {triggers && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">⚠️ Risk Patterns</h3>
                  {triggers.triggers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Not enough data yet. Keep tracking your mood!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {triggers.triggers.map((t) => (
                        <div key={t.emotion} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{t.emotion}</div>
                            <div className="text-xs text-muted-foreground">{t.correlation}</div>
                          </div>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            {t.count}×
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">✨ Positive Patterns</h3>
                  {triggers.positiveFactors.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Not enough data yet. Keep tracking your mood!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {triggers.positiveFactors.map((t) => (
                        <div key={t.emotion} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{t.emotion}</div>
                            <div className="text-xs text-muted-foreground">{t.correlation}</div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            {t.count}×
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights & Recommendations */}
            {insights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">💡 Key Insights</h3>
                  <ul className="space-y-3">
                    {insights.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">🎯 Recommendations</h3>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-secondary mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
    </AppShell>
  );
};

export default AnalyticsPage;
