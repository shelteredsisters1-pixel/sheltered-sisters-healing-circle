import { useState } from "react";
import { useListResources } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookOpen, Clock, Loader2 } from "lucide-react";

type Category = "awareness" | "processing" | "boundaries" | "thriving";
type ResourceType = "article" | "workbook" | "exercise" | "video";

const categories: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All Stages" },
  { value: "awareness", label: "Awareness" },
  { value: "processing", label: "Processing" },
  { value: "boundaries", label: "Boundaries" },
  { value: "thriving", label: "Thriving" },
];

const categoryColors: Record<string, string> = {
  awareness: "hsl(210 80% 55%)",
  processing: "hsl(270 60% 55%)",
  boundaries: "hsl(18 72% 52%)",
  thriving: "hsl(140 60% 40%)",
};

const typeIcons: Record<ResourceType, string> = {
  article: "Article",
  workbook: "Workbook",
  exercise: "Exercise",
  video: "Video",
};

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const { data: resources, isLoading } = useListResources(
    activeCategory !== "all" ? { category: activeCategory } : {}
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Resource Hub</h2>
        <p className="text-muted-foreground mt-1">
          Curated knowledge and tools for every stage of your healing journey.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={
              activeCategory === cat.value
                ? { background: "hsl(18 72% 52%)", color: "white" }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(resources ?? []).map((resource) => (
            <Link key={resource.id} href={`/resources/${resource.id}`} className="block rounded-xl border p-6 hover:shadow-md transition-all duration-200 group" style={{ background: "hsl(30 25% 99%)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: categoryColors[resource.category] ?? "hsl(18 72% 52%)" }}
                  >
                    {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                  </div>
                  <div className="text-xs text-muted-foreground px-2.5 py-1 rounded-full" style={{ background: "hsl(30 20% 93%)" }}>
                    {typeIcons[resource.type as ResourceType] ?? resource.type}
                  </div>
                </div>

                <h3 className="font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2" style={{ "--tw-text-opacity": "1" } as React.CSSProperties}>
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{resource.readTime}</span>
                </div>
            </Link>
          ))}

          {(resources ?? []).length === 0 && !isLoading && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No resources found for this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
