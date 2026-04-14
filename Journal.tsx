import { useListJournalEntries } from "@workspace/api-client-react";
import { Link } from "wouter";
import { PenLine, Loader2 } from "lucide-react";
import { format } from "date-fns";

const moodColors: Record<string, string> = {
  hopeful: "#f59e0b",
  healing: "#10b981",
  struggling: "#ef4444",
  strong: "#8b5cf6",
  peaceful: "#3b82f6",
  uncertain: "#6b7280",
};

const moodLabels: Record<string, string> = {
  hopeful: "Hopeful",
  healing: "Healing",
  struggling: "Struggling",
  strong: "Strong",
  peaceful: "Peaceful",
  uncertain: "Uncertain",
};

export default function Journal() {
  const { data: entries, isLoading } = useListJournalEntries();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Journal</h2>
          <p className="text-muted-foreground mt-1">Your private space to reflect, process, and grow.</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
          style={{ background: "hsl(18 72% 52%)" }}
        >
          <PenLine className="w-4 h-4" />
          New Entry
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(18 72% 52%)" }} />
        </div>
      ) : (entries ?? []).length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: "hsl(30 25% 99%)" }}>
          <PenLine className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg mb-2">Your journal is waiting</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Writing is one of the most powerful tools in healing. Start with just one thought.
          </p>
          <Link href="/journal/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "hsl(18 72% 52%)" }}
            >
              Write your first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {[...(entries ?? [])].reverse().map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}
                className="flex items-start gap-4 p-5 rounded-xl border hover:shadow-sm transition-all duration-200 block"
                style={{ background: "hsl(30 25% 99%)" }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: moodColors[entry.mood] ?? "#6b7280" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-foreground truncate">{entry.title}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                  <div className="mt-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `${moodColors[entry.mood] ?? "#6b7280"}20`,
                        color: moodColors[entry.mood] ?? "#6b7280",
                      }}
                    >
                      {moodLabels[entry.mood] ?? entry.mood}
                    </span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
