import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, Tag } from "lucide-react";

interface Video {
  id: number;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
  duration?: string;
  publishedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  "teaching": "Teaching",
  "qa": "Q&A",
  "healing-exercise": "Healing Exercise",
  "testimony": "Testimony",
};

const CATEGORY_COLORS: Record<string, string> = {
  "teaching": "bg-amber-100 text-amber-800",
  "qa": "bg-blue-100 text-blue-800",
  "healing-exercise": "bg-green-100 text-green-800",
  "testimony": "bg-purple-100 text-purple-800",
};

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-stone-900 cursor-pointer" onClick={() => setPlaying(true)}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <>
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: "hsl(18 72% 28%)" }}>
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[video.category] || "bg-stone-100 text-stone-600"}`}>
            <Tag className="w-3 h-3" />
            {CATEGORY_LABELS[video.category] || video.category}
          </span>
          {video.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-stone-800 leading-snug mb-1">{video.title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{video.description}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "hsl(18 72% 28% / 0.1)" }}>
        <Play className="w-8 h-8" style={{ color: "hsl(18 72% 28%)" }} />
      </div>
      <h3 className="text-lg font-semibold text-stone-700 mb-2">Sessions coming soon</h3>
      <p className="text-stone-500 max-w-sm text-sm leading-relaxed">
        Your recorded sessions and teachings will appear here. Come back soon, sister.
      </p>
    </div>
  );
}

const ALL = "all";

export default function VideoLibrary() {
  const [activeCategory, setActiveCategory] = useState(ALL);

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const res = await fetch("/api/videos", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load videos");
      return res.json();
    },
  });

  const categories = [ALL, ...Array.from(new Set(videos.map((v) => v.category)))];
  const filtered = activeCategory === ALL ? videos : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Video Library</h1>
        <p className="text-stone-500">Teachings, healing exercises, and sessions — watch at your own pace.</p>
      </div>

      {videos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
              style={activeCategory === cat ? { background: "hsl(18 72% 28%)" } : {}}
            >
              {cat === ALL ? "All Videos" : (CATEGORY_LABELS[cat] || cat)}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-stone-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-stone-200 rounded w-1/3" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? <EmptyState /> : filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
