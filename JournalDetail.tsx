import { useState } from "react";
import { useGetJournalEntry, useUpdateJournalEntry, useDeleteJournalEntry } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  id: string;
}

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

export default function JournalDetail({ id }: Props) {
  const [, navigate] = useLocation();
  const numId = Number(id);
  const { data: entry, isLoading } = useGetJournalEntry(numId, { query: { enabled: !!numId } });
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const startEdit = () => {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!entry) return;
    await updateEntry.mutateAsync({ id: numId, data: { title: editTitle, content: editContent } });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this journal entry? This cannot be undone.")) return;
    await deleteEntry.mutateAsync({ id: numId });
    navigate("/journal");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(18 72% 52%)" }} />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Entry not found.</p>
        <Link href="/journal" className="text-sm font-medium mt-2 block" style={{ color: "hsl(18 72% 52%)" }}>
            Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Journal
      </Link>

      <div className="rounded-2xl border p-8 space-y-5" style={{ background: "hsl(30 25% 99%)" }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-b-2 focus:outline-none pb-1"
                style={{ borderColor: "hsl(18 72% 52%)" }}
              />
            ) : (
              <h2 className="text-2xl font-bold text-foreground">{entry.title}</h2>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: `${moodColors[entry.mood] ?? "#6b7280"}20`,
                  color: moodColors[entry.mood] ?? "#6b7280",
                }}
              >
                {moodLabels[entry.mood] ?? entry.mood}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={updateEntry.isPending}
                  className="p-2 rounded-lg transition-colors text-white"
                  style={{ background: "hsl(18 72% 52%)" }}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEdit}
                  className="p-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {entry.prompt && (
          <div
            className="text-sm text-muted-foreground italic p-3 rounded-lg"
            style={{ background: "hsl(18 72% 97%)", borderLeft: "3px solid hsl(18 72% 52%)" }}
          >
            Prompt: {entry.prompt}
          </div>
        )}

        <div className="h-px" style={{ background: "hsl(30 20% 88%)" }} />

        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={12}
            className="w-full bg-transparent text-foreground leading-relaxed text-sm focus:outline-none resize-none"
          />
        ) : (
          <div className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
            {entry.content}
          </div>
        )}
      </div>
    </div>
  );
}
