import { useQuery } from "@tanstack/react-query";
import { Radio, Calendar, Clock, ExternalLink } from "lucide-react";

interface LiveSession {
  id: number;
  title: string;
  description?: string;
  scheduledAt: string;
  youtubeVideoId?: string;
  isActive: boolean;
}

interface LiveData {
  activeSession: LiveSession | null;
  upcomingSessions: LiveSession[];
}

const YOUTUBE_CHANNEL = "https://www.youtube.com/@ShelteredSisters";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white">
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      LIVE NOW
    </span>
  );
}

export default function LiveSessions() {
  const { data, isLoading } = useQuery<LiveData>({
    queryKey: ["/api/videos/live"],
    queryFn: async () => {
      const res = await fetch("/api/videos/live", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load live sessions");
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const { activeSession, upcomingSessions = [] } = data ?? {};

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Live Sessions</h1>
        <p className="text-stone-500">Join your sisters live. Heal together in real time.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-8 animate-pulse space-y-4">
          <div className="h-6 bg-stone-200 rounded w-1/3" />
          <div className="aspect-video bg-stone-200 rounded-xl" />
        </div>
      ) : activeSession ? (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm mb-8">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <LiveBadge />
              <h2 className="text-lg font-bold text-stone-800 mt-2">{activeSession.title}</h2>
              {activeSession.description && (
                <p className="text-stone-500 text-sm mt-1">{activeSession.description}</p>
              )}
            </div>
          </div>
          {activeSession.youtubeVideoId ? (
            <div className="aspect-video bg-stone-900">
              <iframe
                src={`https://www.youtube.com/embed/${activeSession.youtubeVideoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeSession.title}
              />
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-4" style={{ background: "hsl(18 72% 28% / 0.05)" }}>
              <Radio className="w-12 h-12" style={{ color: "hsl(18 72% 28%)" }} />
              <p className="text-stone-600 font-medium">Stream starting soon — join on YouTube</p>
              <a
                href={YOUTUBE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "hsl(18 72% 28%)" }}
              >
                <ExternalLink className="w-4 h-4" />
                Open YouTube
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 p-8 mb-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(18 72% 28% / 0.1)" }}>
            <Radio className="w-8 h-8" style={{ color: "hsl(18 72% 28%)" }} />
          </div>
          <h2 className="text-lg font-semibold text-stone-700 mb-2">No live session right now</h2>
          <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            When a session goes live, it will appear right here. You can also watch directly on the YouTube channel.
          </p>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "hsl(18 72% 28%)" }}
          >
            <ExternalLink className="w-4 h-4" />
            Visit YouTube Channel
          </a>
        </div>
      )}

      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl border border-stone-100 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(18 72% 28% / 0.1)" }}>
                  <Calendar className="w-5 h-5" style={{ color: "hsl(18 72% 28%)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800">{session.title}</h3>
                  {session.description && (
                    <p className="text-sm text-stone-500 mt-0.5">{session.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-stone-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(session.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(session.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingSessions.length === 0 && !activeSession && (
        <div>
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Stay Connected</h2>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <p className="text-stone-700 text-sm leading-relaxed">
              Subscribe to the <strong>Sheltered Sisters</strong> YouTube channel so you never miss a live session. You will get a notification the moment we go live.
            </p>
            <a
              href={YOUTUBE_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold"
              style={{ color: "hsl(18 72% 28%)" }}
            >
              <ExternalLink className="w-4 h-4" />
              Subscribe on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
