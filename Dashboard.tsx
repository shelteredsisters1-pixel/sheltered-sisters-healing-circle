import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookOpen, PenLine, Flame, Star, ChevronRight, Loader2, Sun, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

const PRIMARY = "hsl(340 60% 42%)";
const PRIMARY_LIGHT = "hsl(340 55% 96%)";
const GOLD = "hsl(42 80% 52%)";
const GOLD_LIGHT = "hsl(42 80% 96%)";

const stageColors: Record<string, string> = {
  awareness: "hsl(210 80% 55%)",
  processing: "hsl(270 60% 55%)",
  boundaries: PRIMARY,
  thriving: "hsl(140 60% 40%)",
};

const stageLabels: Record<string, string> = {
  awareness: "Awareness",
  processing: "Processing",
  boundaries: "Building Boundaries",
  thriving: "Thriving",
};

const moodColors: Record<string, string> = {
  hopeful: "#f59e0b",
  healing: "#10b981",
  struggling: "#ef4444",
  strong: "#8b5cf6",
  peaceful: "#3b82f6",
  uncertain: "#6b7280",
};

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (!summary) return null;

  const stagePercents: Record<string, number> = {
    awareness: 25,
    processing: 50,
    boundaries: 75,
    thriving: 100,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold" style={{ color: "hsl(340 40% 14%)" }}>
          Welcome, Sheltered Sister
        </h2>
        <p className="text-muted-foreground mt-1">You are doing the work. That takes courage.</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/daily"
          className="group relative rounded-2xl p-5 overflow-hidden flex items-start gap-4 cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${GOLD}, hsl(38 75% 44%))` }}
        >
          <div className="absolute inset-0 opacity-10 rounded-full" style={{ background: "white", width: 120, height: 120, top: -40, right: -30 }} />
          <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center flex-shrink-0">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Daily Practice</p>
            <p className="text-white/70 text-xs mt-0.5 leading-relaxed">Today's reflection, body check-in & 5-min stillness</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50 absolute right-4 top-1/2 -translate-y-1/2" />
        </Link>

        <Link
          href="/emergency"
          className="group relative rounded-2xl p-5 overflow-hidden flex items-start gap-4 cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${PRIMARY}, hsl(340 55% 30%))` }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">I Need Support Now</p>
            <p className="text-white/70 text-xs mt-0.5 leading-relaxed">Breathing exercises & grounding tools</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50 absolute right-4 top-1/2 -translate-y-1/2" />
        </Link>
      </div>

      {/* Daily Affirmation */}
      <div
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, hsl(340 60% 34%), hsl(310 50% 28%))` }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-white/70 text-sm font-medium">
            <Star className="w-4 h-4" />
            <span>Today's Affirmation</span>
          </div>
          <p className="text-xl font-semibold leading-relaxed mb-3">
            "{summary.dailyAffirmation.text}"
          </p>
          {summary.dailyAffirmation.author && (
            <p className="text-white/60 text-sm">— {summary.dailyAffirmation.author}</p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: PRIMARY_LIGHT }}>
              <PenLine className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Journal Entries</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: PRIMARY }}>{summary.journalEntryCount}</p>
        </div>

        <div className="rounded-xl p-5 border bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: GOLD_LIGHT }}>
              <BookOpen className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Resources Read</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: GOLD }}>{summary.resourcesCompleted}</p>
        </div>

        <div className="rounded-xl p-5 border bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: PRIMARY_LIGHT }}>
              <Flame className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Day Streak</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: PRIMARY }}>{summary.streakDays}</p>
        </div>
      </div>

      {/* Healing Stage */}
      <div className="rounded-xl p-6 border bg-white">
        <h3 className="font-semibold text-foreground mb-4">Your Healing Journey</h3>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full text-white"
            style={{ background: stageColors[summary.currentStage] ?? stageColors.awareness }}
          >
            {stageLabels[summary.currentStage] ?? summary.currentStage}
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${stagePercents[summary.currentStage] ?? 25}%`,
              background: stageColors[summary.currentStage] ?? stageColors.awareness,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Awareness</span>
          <span>Processing</span>
          <span>Boundaries</span>
          <span>Thriving</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Resources */}
        <div className="rounded-xl border overflow-hidden bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">Recent Resources</h3>
            <Link href="/resources" className="text-sm flex items-center gap-1" style={{ color: PRIMARY }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {summary.recentResources.slice(0, 3).map((r) => (
              <Link key={r.id} href={`/resources/${r.id}`} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors block">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: PRIMARY_LIGHT }}>
                  <BookOpen className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Journal */}
        <div className="rounded-xl border overflow-hidden bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">Recent Journal</h3>
            <Link href="/journal" className="text-sm flex items-center gap-1" style={{ color: PRIMARY }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {summary.recentJournalEntries.slice(0, 3).map((e) => (
              <Link key={e.id} href={`/journal/${e.id}`} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors block">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                  style={{ background: moodColors[e.mood] ?? "#6b7280" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-1">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(e.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </Link>
            ))}
            {summary.recentJournalEntries.length === 0 && (
              <div className="p-5">
                <p className="text-sm text-muted-foreground">No entries yet.</p>
                <Link href="/journal/new" className="text-sm font-medium mt-1 block" style={{ color: PRIMARY }}>
                  Write your first entry
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
