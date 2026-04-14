import { useGetJourneyProgress, useUpdateJourneyProgress } from "@workspace/api-client-react";
import { TrendingUp, BookOpen, PenLine, Flame, Loader2 } from "lucide-react";
import { format } from "date-fns";

type Stage = "awareness" | "processing" | "boundaries" | "thriving";

const stages: { value: Stage; label: string; description: string; color: string }[] = [
  {
    value: "awareness",
    label: "Awareness",
    description: "Recognizing what happened and how it affected you.",
    color: "hsl(210 80% 55%)",
  },
  {
    value: "processing",
    label: "Processing",
    description: "Working through emotions, grief, and rebuilding trust.",
    color: "hsl(270 60% 55%)",
  },
  {
    value: "boundaries",
    label: "Boundaries",
    description: "Learning to protect your peace and honor your needs.",
    color: "hsl(18 72% 52%)",
  },
  {
    value: "thriving",
    label: "Thriving",
    description: "Living fully, with joy and connection on your terms.",
    color: "hsl(140 60% 40%)",
  },
];

export default function Journey() {
  const { data: progress, isLoading, refetch } = useGetJourneyProgress();
  const updateProgress = useUpdateJourneyProgress();

  const handleStageChange = async (stage: Stage) => {
    if (!progress) return;
    await updateProgress.mutateAsync({ data: { currentStage: stage } });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(18 72% 52%)" }} />
      </div>
    );
  }

  if (!progress) return null;

  const currentStageIndex = stages.findIndex((s) => s.value === progress.currentStage);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">My Healing Journey</h2>
        <p className="text-muted-foreground mt-1">
          Track where you are and celebrate how far you have come.
        </p>
      </div>

      {/* Current Stage Banner */}
      <div
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${stages[currentStageIndex]?.color ?? "hsl(18 72% 52%)"}, hsl(18 72% 28%))`,
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-2">Current Stage</p>
          <h3 className="text-3xl font-bold mb-2">
            {stages[currentStageIndex]?.label ?? progress.currentStage}
          </h3>
          <p className="text-white/80 text-sm max-w-md leading-relaxed">
            {stages[currentStageIndex]?.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-5" style={{ background: "hsl(30 25% 99%)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(18 72% 95%)" }}>
            <PenLine className="w-4 h-4" style={{ color: "hsl(18 72% 52%)" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "hsl(18 72% 52%)" }}>{progress.totalJournalEntries}</p>
          <p className="text-xs text-muted-foreground mt-1">Journal Entries</p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "hsl(30 25% 99%)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(38 65% 95%)" }}>
            <BookOpen className="w-4 h-4" style={{ color: "hsl(38 65% 45%)" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "hsl(38 65% 45%)" }}>{progress.resourcesCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">Resources Completed</p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "hsl(30 25% 99%)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(18 72% 95%)" }}>
            <Flame className="w-4 h-4" style={{ color: "hsl(18 72% 52%)" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "hsl(18 72% 52%)" }}>{progress.streakDays}</p>
          <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
        </div>
      </div>

      {/* Stage Journey Map */}
      <div className="rounded-xl border p-6" style={{ background: "hsl(30 25% 99%)" }}>
        <h3 className="font-semibold text-foreground mb-6">Your Path</h3>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isPast = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isFuture = index > currentStageIndex;

            return (
              <div key={stage.value} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStageChange(stage.value)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
                    style={
                      isCurrent
                        ? { background: stage.color, boxShadow: `0 0 0 4px ${stage.color}30` }
                        : isPast
                        ? { background: stage.color, opacity: 0.5 }
                        : { background: "hsl(30 20% 88%)" }
                    }
                  >
                    {isPast ? (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    ) : isCurrent ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full" style={{ background: "hsl(30 20% 70%)" }} />
                    )}
                  </button>
                  {index < stages.length - 1 && (
                    <div
                      className="w-0.5 h-6 mt-1"
                      style={{ background: isPast ? stage.color : "hsl(30 20% 88%)", opacity: isPast ? 0.5 : 1 }}
                    />
                  )}
                </div>
                <div className={`pb-4 ${isFuture ? "opacity-50" : ""}`}>
                  <p className={`font-semibold text-sm ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    {stage.label}
                    {isCurrent && (
                      <span
                        className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full text-white"
                        style={{ background: stage.color }}
                      >
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-md">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Last updated: {format(new Date(progress.updatedAt), "MMMM d, yyyy")}
        </p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          Click a stage above to update your progress.
        </p>
      </div>
    </div>
  );
}
