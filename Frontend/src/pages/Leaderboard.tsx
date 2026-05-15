import { useEffect, useState, useCallback } from "react";
import {
  Crown,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  getLeaderboard,
  getUserLeaderboardStatus,
  toggleLeaderboardVisibility,
} from "@/lib/analytics";
import type { LeaderboardEntry, UserLeaderboardStatus } from "@/lib/analytics";
import { AppShell } from "@/components/AppShell";

const RANK_STYLES = [
  "text-yellow-500 font-bold text-lg",   // 1st
  "text-gray-400 font-bold text-base",    // 2nd
  "text-amber-600 font-bold text-base",   // 3rd
];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStatus, setMyStatus] = useState<UserLeaderboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [board, status] = await Promise.all([
        getLeaderboard(),
        getUserLeaderboardStatus(),
      ]);
      setLeaderboard(board.leaderboard);
      setMyStatus(status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load leaderboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async () => {
    if (!myStatus) return;
    try {
      setToggling(true);
      const result = await toggleLeaderboardVisibility(!myStatus.isPublic);
      setMyStatus((prev) => prev ? { ...prev, isPublic: result.isPublic } : prev);
      // Refresh leaderboard
      const board = await getLeaderboard();
      setLeaderboard(board.leaderboard);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle visibility";
      setError(msg);
    } finally {
      setToggling(false);
    }
  };

  return (
    <AppShell title="Leaderboard">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-2">Wellness Leaderboard</h2>
              <p className="text-muted-foreground">
                Top wellness champions — all names are anonymized by default 🔒
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Your status card */}
            {myStatus && (
              <div className="glass-card p-6 rounded-xl animate-fade-in-up">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Your Status</div>
                    <div className="text-xl font-bold">{myStatus.displayName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {myStatus.totalPoints} pts
                      {myStatus.rank && (
                        <span className="ml-2">• Rank #{myStatus.rank}</span>
                      )}
                      {!myStatus.isPublic && (
                        <span className="ml-2 text-muted-foreground">(hidden from leaderboard)</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={toggling}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium smooth-transition sm:w-auto ${
                      myStatus.isPublic
                        ? "border-red-300 text-red-600 hover:bg-red-50"
                        : "border-primary/40 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {myStatus.isPublic ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        {toggling ? "Hiding..." : "Hide from Leaderboard"}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        {toggling ? "Showing..." : "Join Leaderboard"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Top 10 */}
            <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top Wellness Champions
                </h3>
              </div>

              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading leaderboard...</div>
              ) : leaderboard.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No public entries yet. Be the first to join the leaderboard!
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="p-4 flex items-center gap-4 hover:bg-muted/20 smooth-transition">
                      <div className={`w-8 text-center ${RANK_STYLES[entry.rank - 1] || "text-muted-foreground"}`}>
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{entry.displayName}</div>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                          <span>🧘 {entry.breakdown.meditation} pts</span>
                          <span>📓 {entry.breakdown.journal} pts</span>
                          <span>🏆 {entry.breakdown.achievements} pts</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold gradient-text">{entry.totalPoints}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              🔒 Privacy first — all names are anonymized. Points are earned through meditation sessions,
              journal entries, mood check-ins, and achievements.
            </div>
          </div>
        </div>
    </AppShell>
  );
};

export default LeaderboardPage;
