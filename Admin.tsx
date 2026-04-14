import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CalendarDays, Mail, Loader2, TrendingUp, Copy, Check, AlertCircle, Video, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const PRIMARY = "hsl(340 60% 42%)";
const GOLD = "hsl(42 80% 52%)";
const PRIMARY_LIGHT = "hsl(340 55% 96%)";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Tab = "members" | "bookings" | "zoom";

interface Member {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

interface Booking {
  bookingId: number;
  userId: string;
  email: string;
  status: string;
  notes: string | null;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  title: string;
  createdAt: string;
}

interface Stats {
  members: number;
  confirmedBookings: number;
  estimatedRevenue: number;
}

interface Session {
  id: number;
  title: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  spotsBooked: number;
  maxSpots: number;
  zoomLink: string | null;
  isActive: boolean;
}

function formatDate(d: string) {
  try { return format(parseISO(d), "EEE, d MMM yyyy"); } catch { return d; }
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 p-0.5 rounded hover:bg-black/10 transition"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

function ZoomLinkRow({ session, onSaved }: { session: Session; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(session.zoomLink || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/sessions/${session.id}/zoom`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoomLink: value.trim() || null }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  const isBooked = session.spotsBooked >= session.maxSpots;

  return (
    <div
      className="bg-white rounded-xl border px-5 py-4"
      style={{ borderColor: isBooked ? "hsl(340 30% 82%)" : "hsl(340 15% 88%)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: isBooked ? "hsl(340 60% 42%)" : "hsl(340 15% 94%)" }}
        >
          <Video className="w-4 h-4" style={{ color: isBooked ? "white" : "hsl(340 10% 60%)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: "hsl(340 50% 18%)" }}>
              {formatDate(session.sessionDate)} at {session.sessionTime}
            </p>
            {isBooked && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(340 60% 42%)", color: "white" }}>
                Booked
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">{session.durationMinutes} min session</p>

          {editing ? (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="flex-1 text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
                style={{ borderColor: "hsl(340 20% 82%)", focusRingColor: PRIMARY }}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              />
              <button
                onClick={save}
                disabled={saving}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex items-center gap-1"
                style={{ background: PRIMARY }}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setValue(session.zoomLink || ""); }}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: "hsl(340 10% 50%)", background: "hsl(340 10% 95%)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {session.zoomLink ? (
                <a
                  href={session.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 underline underline-offset-2"
                  style={{ color: PRIMARY }}
                >
                  <LinkIcon className="w-3 h-3" />
                  {session.zoomLink.length > 50 ? session.zoomLink.slice(0, 50) + "..." : session.zoomLink}
                </a>
              ) : (
                <span className="text-xs text-muted-foreground italic">No Zoom link set</span>
              )}
              {saved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              <button
                onClick={() => { setValue(session.zoomLink || ""); setEditing(true); }}
                className="text-xs font-medium px-2.5 py-1 rounded-lg ml-auto"
                style={{ background: PRIMARY_LIGHT, color: PRIMARY }}
              >
                {session.zoomLink ? "Edit" : "Add link"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("members");
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/stats`, { credentials: "include" });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "members",
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/bookings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "bookings",
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/admin/sessions"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/sessions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "zoom",
  });

  if (statsError?.message === "forbidden") {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: PRIMARY }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(340 50% 18%)" }}>Access Restricted</h2>
        <p className="text-muted-foreground text-sm">This page is only accessible to the site administrator.</p>
      </div>
    );
  }

  const allEmails = members.filter((m) => m.email).map((m) => m.email).join(", ");

  const tabs: { key: Tab; label: (s: any) => string }[] = [
    { key: "members", label: () => `Members${members.length ? ` (${members.length})` : ""}` },
    { key: "bookings", label: () => `Session Bookings${bookings.length ? ` (${bookings.length})` : ""}` },
    { key: "zoom", label: () => "Zoom Links" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(340 50% 18%)" }}>Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">Member overview, session bookings, and Zoom links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Members", value: statsLoading ? "..." : stats?.members ?? 0, icon: Users, color: PRIMARY },
          { label: "Sessions Booked", value: statsLoading ? "..." : stats?.confirmedBookings ?? 0, icon: CalendarDays, color: GOLD },
          { label: "Revenue (est.)", value: statsLoading ? "..." : `€${stats?.estimatedRevenue ?? 0}`, icon: TrendingUp, color: "hsl(140 55% 32%)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-5" style={{ borderColor: "hsl(340 15% 88%)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "hsl(340 50% 18%)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "hsl(340 15% 91%)" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={tab === key
              ? { background: "white", color: PRIMARY, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
              : { color: "hsl(340 10% 48%)" }}
          >
            {label(null)}
          </button>
        ))}
      </div>

      {/* Members */}
      {tab === "members" && (
        <div>
          {members.length > 0 && (
            <div className="mb-4 p-4 rounded-xl flex items-start gap-3" style={{ background: PRIMARY_LIGHT, border: `1px solid hsl(340 30% 85%)` }}>
              <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1" style={{ color: PRIMARY }}>All member emails</p>
                <p className="text-xs text-muted-foreground break-all leading-relaxed">{allEmails}</p>
              </div>
              <CopyBtn text={allEmails} />
            </div>
          )}

          {membersLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No members yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between gap-3" style={{ borderColor: "hsl(340 15% 88%)" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: PRIMARY }}>
                      {(m.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate" style={{ color: "hsl(340 50% 18%)" }}>{m.email || "No email"}</p>
                        {m.email && <CopyBtn text={m.email} />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {m.created_at ? formatDate(m.created_at) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.stripe_subscription_id ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "hsl(140 50% 95%)", color: "hsl(140 55% 30%)" }}>
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "hsl(0 0% 95%)", color: "hsl(0 0% 50%)" }}>
                        No sub
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === "bookings" && (
        <div>
          {bookingsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.bookingId} className="bg-white rounded-xl border px-5 py-4" style={{ borderColor: "hsl(340 15% 88%)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-semibold" style={{ color: "hsl(340 50% 18%)" }}>{b.email}</p>
                        <CopyBtn text={b.email} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {b.sessionDate ? formatDate(b.sessionDate) : "—"}
                        </span>
                        <span>{b.sessionTime} &bull; {b.durationMinutes} min</span>
                        <span style={{ color: GOLD }} className="font-semibold">€35</span>
                      </div>
                      {b.notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic">"{b.notes}"</p>
                      )}
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={b.status === "confirmed"
                        ? { background: "hsl(140 50% 95%)", color: "hsl(140 55% 30%)" }
                        : { background: "hsl(0 0% 95%)", color: "hsl(0 0% 45%)" }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zoom Links */}
      {tab === "zoom" && (
        <div>
          <div className="mb-4 p-4 rounded-xl flex items-start gap-3" style={{ background: PRIMARY_LIGHT, border: `1px solid hsl(340 30% 85%)` }}>
            <Video className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
            <p className="text-xs leading-relaxed" style={{ color: "hsl(340 40% 35%)" }}>
              Add a Zoom link to each booked session so your client receives it before the call. Booked sessions are highlighted.
            </p>
          </div>

          {sessionsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No sessions found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions
                .filter((s) => s.spotsBooked > 0 || !s.zoomLink)
                .slice(0, 60)
                .map((s) => (
                  <ZoomLinkRow
                    key={s.id}
                    session={s}
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] })}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
