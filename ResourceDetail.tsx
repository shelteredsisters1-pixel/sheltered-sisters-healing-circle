import { useGetResource } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";

interface Props {
  id: string;
}

const categoryColors: Record<string, string> = {
  awareness: "hsl(210 80% 55%)",
  processing: "hsl(270 60% 55%)",
  boundaries: "hsl(18 72% 52%)",
  thriving: "hsl(140 60% 40%)",
};

export default function ResourceDetail({ id }: Props) {
  const numId = Number(id);
  const { data: resource, isLoading } = useGetResource(numId, {
    query: { enabled: !!numId },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(18 72% 52%)" }} />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Resource not found.</p>
        <Link href="/resources" className="text-sm font-medium mt-2 block" style={{ color: "hsl(18 72% 52%)" }}>
            Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/resources" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Resources
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full text-white"
            style={{ background: categoryColors[resource.category] ?? "hsl(18 72% 52%)" }}
          >
            {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {resource.readTime}
          </div>
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-3">{resource.title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{resource.description}</p>
      </div>

      <div className="h-px" style={{ background: "hsl(30 20% 88%)" }} />

      <div className="prose max-w-none text-foreground">
        {resource.content.split("\n\n").map((para, i) => (
          <p key={i} className="text-base leading-relaxed mb-4 last:mb-0">
            {para}
          </p>
        ))}
      </div>

      <div
        className="rounded-xl p-6 mt-8"
        style={{ background: "hsl(18 72% 96%)", borderLeft: "4px solid hsl(18 72% 52%)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "hsl(18 72% 38%)" }}>
          A note to you
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Take what serves you from this resource. You are the expert on your own experience. 
          Healing is not a race — go at your own pace.
        </p>
      </div>
    </div>
  );
}
