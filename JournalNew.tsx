import { useState } from "react";
import { useCreateJournalEntry } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { ChevronLeft, Loader2 } from "lucide-react";

const moods = [
  { value: "hopeful", label: "Hopeful", color: "#f59e0b", description: "I see possibility ahead" },
  { value: "healing", label: "Healing", color: "#10b981", description: "I feel myself getting better" },
  { value: "struggling", label: "Struggling", color: "#ef4444", description: "It is hard right now" },
  { value: "strong", label: "Strong", color: "#8b5cf6", description: "I feel my power today" },
  { value: "peaceful", label: "Peaceful", color: "#3b82f6", description: "I am calm and grounded" },
  { value: "uncertain", label: "Uncertain", color: "#6b7280", description: "I am not sure how I feel" },
] as const;

type Mood = typeof moods[number]["value"];

const prompts = [
  "What is one moment from this week that showed you your own strength?",
  "What have you let go of recently? How does that feel?",
  "Write a letter to your past self about what you now know.",
  "What boundaries did you honor today? How did it feel?",
  "What does the person you are becoming look like?",
  "What are three things you are grateful for in your healing journey?",
];

export default function JournalNew() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [prompt, setPrompt] = useState("");
  const createEntry = useCreateJournalEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return;
    const entry = await createEntry.mutateAsync({
      title: title || "Untitled Entry",
      content,
      mood,
      prompt: prompt || undefined,
    });
    navigate(`/journal/${entry.id}`);
  };

  const pickPrompt = () => {
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
    if (!content) setContent(random + "\n\n");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Journal
      </Link>

      <div>
        <h2 className="text-3xl font-bold">New Journal Entry</h2>
        <p className="text-muted-foreground mt-1">This space is yours. Write freely.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Picker */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">
            How are you feeling right now?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className="p-3 rounded-xl border text-left transition-all duration-200"
                style={
                  mood === m.value
                    ? {
                        background: `${m.color}15`,
                        borderColor: m.color,
                        boxShadow: `0 0 0 2px ${m.color}30`,
                      }
                    : { background: "hsl(30 25% 99%)" }
                }
              >
                <div
                  className="w-3 h-3 rounded-full mb-1.5"
                  style={{ background: m.color }}
                />
                <p className="text-sm font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{m.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-foreground">Guided Prompt (optional)</label>
            <button
              type="button"
              onClick={pickPrompt}
              className="text-xs font-medium transition-colors"
              style={{ color: "hsl(18 72% 52%)" }}
            >
              Get a prompt
            </button>
          </div>
          {prompt && (
            <div
              className="text-sm text-muted-foreground p-3 rounded-lg italic"
              style={{ background: "hsl(18 72% 97%)", borderLeft: "3px solid hsl(18 72% 52%)" }}
            >
              {prompt}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Entry Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this entry a title..."
            className="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm"
            style={{ "--tw-ring-color": "hsl(18 72% 52%)" } as React.CSSProperties}
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Your Thoughts</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin writing here. There is no right or wrong way to do this..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm leading-relaxed resize-none"
            style={{ "--tw-ring-color": "hsl(18 72% 52%)" } as React.CSSProperties}
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!mood || !content || createEntry.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "hsl(18 72% 52%)" }}
          >
            {createEntry.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Entry
          </button>
          <Link href="/journal" className="px-6 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
