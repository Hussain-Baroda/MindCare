import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Trash2, X } from "lucide-react";
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  markJournalForAnalysis,
  type JournalEntry,
} from "@/lib/journal";
import { MoodInsight } from "@/components/MoodInsight";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const Journal = () => {
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resettingAnalysis, setResettingAnalysis] = useState(false);

  const { toast } = useToast();

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await listJournalEntries();
      setEntries(data);
    } catch (err: any) {
      toast({
        title: "Failed to load journal entries",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !entry.trim()) {
      toast({
        title: "Incomplete Entry",
        description: "Please add both a title and content",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await createJournalEntry(title, entry);

      toast({
        title: "Entry Saved!",
        description: "Your journal entry has been recorded successfully.",
      });

      if (result.risk.level === "high") {
        if (result.crisisAlert?.status === "scheduled") {
          toast({
            title: "Safety alert scheduled",
            description: `A trusted contact alert will send in ${result.crisisAlert.delaySeconds}s unless cancelled from Settings.`,
          });
        } else if (result.crisisAlert?.status === "missing_contact") {
          toast({
            title: "Add a trusted contact",
            description: "High-risk text was detected, but no trusted contact is saved yet.",
            variant: "destructive",
          });
        } else if (result.crisisAlert?.status === "disabled") {
          toast({
            title: "Crisis alerts are off",
            description: "High-risk text was detected. Enable crisis alerts in Settings for automatic support emails.",
            variant: "destructive",
          });
        }
      }

      setTitle("");
      setEntry("");
      await loadEntries();
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

  async function handleDeleteSelected() {
    if (!selected) return;

    setDeleting(true);
    try {
      await deleteJournalEntry(selected.id);
      toast({ title: "Deleted", description: "Journal entry deleted." });
      setSelected(null);
      await loadEntries();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleMarkForAnalysis() {
    if (!selected) return;
    setResettingAnalysis(true);
    try {
      const result = await markJournalForAnalysis(selected.id);
      setSelected((prev) => prev ? { ...prev, ml: result.ml } : prev);
      toast({ title: "Queued for analysis", description: "This entry will be analyzed shortly." });
    } catch (err: any) {
      toast({
        title: "Failed to queue",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setResettingAnalysis(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">
                Your <span className="gradient-text">Journal</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Express your thoughts and feelings in a safe, private space
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 animate-fade-in-up sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg">
                  Entry Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What's on your mind today?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="text-sm text-muted-foreground">{todayLabel}</div>

              <div className="space-y-2">
                <Label htmlFor="entry" className="text-lg">
                  Your Thoughts
                </Label>
                <Textarea
                  id="entry"
                  placeholder="Write freely... Let your thoughts flow without judgment."
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="min-h-64 text-base leading-relaxed sm:min-h-96"
                />
                <p className="text-xs text-muted-foreground">
                  {entry.length} characters
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 flex-1"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setTitle("");
                    setEntry("");
                  }}
                  disabled={saving}
                >
                  Clear
                </Button>
              </div>
            </form>
          </div>

          {/* Recent Entries */}
          <div className="mt-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold mb-2">Recent Entries</h2>
              <Button variant="outline" onClick={loadEntries} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No entries yet. Write your first one above.
              </div>
            ) : (
              entries.slice(0, 20).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e)}
                  className="w-full text-left glass-card p-6 rounded-xl hover-lift smooth-transition"
                >
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-semibold">{e.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(e.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{e.content}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {/* View modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onMouseDown={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-4 sm:p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatDate(selected.createdAt)}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>

                <Button variant="outline" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {selected.content}
            </div>

            <div className="mt-4">
              <MoodInsight
                ml={selected.ml}
                onMarkForAnalysis={handleMarkForAnalysis}
                isResetting={resettingAnalysis}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Journal;
