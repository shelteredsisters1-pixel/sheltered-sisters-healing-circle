import { useState } from "react";
import { useListAffirmations, useGetDailyAffirmation } from "@workspace/api-client-react";
import { Sparkles, Loader2 } from "lucide-react";

type AffirmationCategory = "all" | "self-worth" | "boundaries" | "healing" | "strength" | "identity";

const categories: { value: AffirmationCategory; label: string; color: string }[] = [
  { value: "all", label: "All", color: "hsl(18 72% 52%)" },
  { value: "self-worth", label: "Self-Worth", color: "hsl(38 65% 45%)" },
  { value: "boundaries", label: "Boundaries", color: "hsl(210 80% 55%)" },
  { value: "healing", label: "Healing", color: "hsl(140 60% 40%)" },
  { value: "strength", label: "Strength", color: "hsl(270 60% 55%)" },
  { value: "identity", label: "Identity", color: "hsl(18 72% 38%)" },
];

export default function Affirmations() {
  const [activeCategory, setActiveCategory] = useState<AffirmationCategory>("all");
  const { data: affirmations, isLoading } = useListAffirmations();
  const { data: daily } = useGetDailyAffirmation();

  const filtered = (affirmations ?? []).filter(
    (a) => activeCategory === "all" || a.category === activeCategory
  );

  const getCategoryColor = (cat: string) =>
    categories.find((c) => c.value === cat)?.color ?? "hsl(18 72% 52%)";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Affirmations</h2>
        <p className="text-muted-foreground mt-1">
          Words that remind you of who you truly are.
        </p>
      </div>

      {/* Today's Featured */}
      {daily && (
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(18 72% 38%), hsl(270 60% 45%))" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-white/70 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Today's Affirmation</span>
            </div>
            <p className="text-2xl font-semibold leading-relaxed">
              "{daily.text}"
            </p>
            {daily.author && (
              <p className="text-white/60 text-sm mt-3">— {daily.author}</p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={
              activeCategory === cat.value
                ? { background: cat.color, color: "white" }
                : { background: "hsl(30 20% 93%)", color: "hsl(20 25% 35%)" }
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(18 72% 52%)" }} />
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {filtered.map((aff) => {
            const color = getCategoryColor(aff.category);
            return (
              <div
                key={aff.id}
                className="break-inside-avoid rounded-xl p-6 border"
                style={{ background: "hsl(30 25% 99%)" }}
              >
                <div
                  className="w-8 h-1 rounded-full mb-4"
                  style={{ background: color }}
                />
                <p className="text-foreground font-medium leading-relaxed text-sm">
                  "{aff.text}"
                </p>
                {aff.author && (
                  <p className="text-xs text-muted-foreground mt-3">— {aff.author}</p>
                )}
                <div className="mt-4">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: `${color}15`, color }}
                  >
                    {aff.category.charAt(0).toUpperCase() + aff.category.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
