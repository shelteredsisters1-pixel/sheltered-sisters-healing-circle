import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, User, CheckCircle, X, Loader2, CalendarDays, CreditCard, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useLocation } from "wouter";

const PRIMARY = "hsl(340 60% 42%)";
const PRIMARY_LIGHT = "hsl(340 55% 96%)";
const GOLD = "hsl(42 80% 52%)";

interface Session {
  id: number;
  title: string;
  description: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  maxSpots: number;
  spotsBooked: number;
  sessionType: string;
  zoomLink?: string;
  isActive: boolean;
}

interface MyBooking {
  bookingId: number;
  status: string;
  notes: string | null;
  createdAt: string;
  sessionId: number;
  title: string;
  description: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  sessionType: string;
  zoomLink?: string;
}

type Tab = "available" | "my-bookings";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEE, MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function BookingModal({
  session,
  onClose,
  onConfirm,
  loading,
}: {
  session: Session;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  loading: boolean;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${GOLD})` }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "hsl(340 50% 18%)" }}>
              Confirm &amp; Pay
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session summary */}
          <div className="rounded-xl p-4 mb-4" style={{ background: PRIMARY_LIGHT }}>
            <p className="font-semibold text-sm mb-2" style={{ color: PRIMARY }}>
              {session.title}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {formatDate(session.sessionDate)}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" /> {session.sessionTime} &bull; {session.durationMinutes} min
              </p>
              <p className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 flex-shrink-0" /> Private 1-on-1 session via Zoom
              </p>
            </div>
          </div>

          {/* Price */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3 mb-4"
            style={{ background: "hsl(42 80% 97%)", border: `1px solid hsl(42 60% 85%)` }}
          >
            <span className="text-sm font-medium text-muted-foreground">Session fee</span>
            <span className="text-lg font-bold" style={{ color: GOLD }}>
              €35.00
            </span>
          </div>

          {/* Notes */}
          <label className="block text-sm font-medium mb-2" style={{ color: "hsl(340 40% 25%)" }}>
            Any notes or questions? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. I'm working through co-parenting challenges..."
            className="w-full rounded-xl px-4 py-3 text-sm border resize-none outline-none focus:ring-2 transition mb-5"
            style={{ borderColor: "hsl(340 15% 82%)", background: "hsl(340 20% 98%)" }}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(notes)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, hsl(310 55% 36%))` }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Pay &amp; Book — €35
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Secure payment via Stripe. You will be redirected to complete payment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Booking() {
  const [tab, setTab] = useState<Tab>("available");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancel" | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const didConfirm = useRef(false);

  // Read URL params on mount to detect post-Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const cs = params.get("cs");

    if (payment === "cancel") {
      setPaymentStatus("cancel");
      navigate("/booking", { replace: true });
      return;
    }

    if (payment === "success" && cs && !didConfirm.current) {
      didConfirm.current = true;
      navigate("/booking", { replace: true });
      // Confirm the booking via API
      fetch(`${BASE}/api/booking/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSessionId: cs }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Confirmation failed");
          }
          return res.json();
        })
        .then(() => {
          setPaymentStatus("success");
          setTab("my-bookings");
          queryClient.invalidateQueries({ queryKey: ["/api/booking/sessions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/booking/my-bookings"] });
        })
        .catch((e) => {
          setConfirmError(e.message);
        });
    }
  }, []);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/booking/sessions"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/booking/sessions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
  });

  const { data: myBookings = [], isLoading: bookingsLoading } = useQuery<MyBooking[]>({
    queryKey: ["/api/booking/my-bookings"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/booking/my-bookings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: number; notes: string }) => {
      const res = await fetch(`${BASE}/api/booking/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payment link");
      }
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await fetch(`${BASE}/api/booking/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to cancel");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/booking/my-bookings"] });
    },
  });

  // Group sessions by date
  const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.sessionDate]) acc[s.sessionDate] = [];
    acc[s.sessionDate].push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(340 50% 18%)" }}>
          Book a Session
        </h2>
        <p className="text-muted-foreground text-sm">
          Tuesday to Friday, 10am–4pm &bull; 1-on-1 sessions via Zoom &bull; <strong style={{ color: GOLD }}>€35 / hour</strong>
        </p>
      </div>

      {/* Welcome message on successful booking */}
      {paymentStatus === "success" && (
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ border: `1px solid hsl(340 30% 85%)`, boxShadow: "0 4px 24px rgba(160,40,80,0.10)" }}
        >
          {/* Gradient header bar */}
          <div
            className="px-6 pt-6 pb-5 text-white"
            style={{ background: `linear-gradient(135deg, hsl(340 60% 38%) 0%, hsl(310 55% 32%) 100%)` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Session Confirmed</p>
                <h3 className="text-lg font-bold leading-tight">You're booked, Sister!</h3>
              </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Your payment has gone through and your session is reserved. I am looking forward to sitting with you in this space.
            </p>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-5 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: "hsl(340 20% 25%)" }}>
              This is your time. A whole hour that belongs entirely to you — no performance, no pretending, no having to hold it all together. You can come exactly as you are.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(340 20% 25%)" }}>
              Before our session, you may find it helpful to jot down one or two things you want to make sure we talk about. Your journal is a good place for that. There are no wrong things to bring.
            </p>
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: PRIMARY_LIGHT, color: PRIMARY }}
            >
              <p className="font-semibold mb-1">What happens next</p>
              <ul className="space-y-1 text-xs leading-relaxed" style={{ color: "hsl(340 30% 38%)" }}>
                <li>• You will receive a Zoom link by email before your session</li>
                <li>• Sessions run for 60 minutes via Zoom — find a quiet, private spot if you can</li>
                <li>• Everything shared stays between us</li>
                <li>• If you need to cancel, go to My Bookings and cancel at least 24 hours ahead</li>
              </ul>
            </div>
            <p className="text-sm italic" style={{ color: "hsl(340 20% 40%)" }}>
              Healing is brave work. I'm proud of you for taking this step.
            </p>
            <p className="text-sm font-semibold" style={{ color: PRIMARY }}>
              With love, Sheltered Sisters
            </p>
          </div>
        </div>
      )}

      {paymentStatus === "cancel" && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-5 text-sm font-medium"
          style={{ background: "hsl(42 80% 95%)", color: "hsl(42 60% 30%)", border: "1px solid hsl(42 60% 80%)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Payment was not completed. Your session has not been reserved.
        </div>
      )}

      {confirmError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-5 text-sm font-medium"
          style={{ background: "hsl(0 60% 96%)", color: "hsl(0 55% 38%)", border: "1px solid hsl(0 50% 85%)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {confirmError}
        </div>
      )}

      {checkoutMutation.error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-5 text-sm font-medium"
          style={{ background: "hsl(0 60% 96%)", color: "hsl(0 55% 38%)", border: "1px solid hsl(0 50% 85%)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {(checkoutMutation.error as Error).message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "hsl(340 15% 91%)" }}>
        {(["available", "my-bookings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={
              tab === t
                ? { background: "white", color: PRIMARY, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "hsl(340 10% 48%)" }
            }
          >
            {t === "available"
              ? "Available Sessions"
              : `My Bookings${myBookings.length ? ` (${myBookings.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Available Sessions */}
      {tab === "available" && (
        <div>
          {sessionsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: PRIMARY }} />
            </div>
          ) : Object.keys(byDate).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No upcoming sessions yet.</p>
              <p className="text-sm mt-1">Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDate).map(([date, dateSessions]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                      {formatDate(date)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-2.5">
                    {dateSessions.map((session) => {
                      const full = session.spotsBooked >= session.maxSpots;
                      const alreadyBooked = myBookings.some(
                        (b) => b.sessionId === session.id
                      );
                      return (
                        <div
                          key={session.id}
                          className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md"
                          style={{ borderColor: "hsl(340 15% 88%)" }}
                        >
                          <div className="flex items-stretch">
                            <div
                              className="w-1 flex-shrink-0"
                              style={{ background: PRIMARY }}
                            />
                            <div className="flex-1 px-5 py-4">
                              <div className="flex items-center justify-between gap-3">
                                {/* Time */}
                                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(340 50% 18%)" }}>
                                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: PRIMARY }} />
                                  {session.sessionTime}
                                  <span className="text-xs font-normal text-muted-foreground">
                                    &bull; {session.durationMinutes} min
                                  </span>
                                </div>

                                {/* Price badge */}
                                <span
                                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                                  style={{ background: "hsl(42 80% 95%)", color: "hsl(42 55% 30%)" }}
                                >
                                  €35
                                </span>
                              </div>

                              <div className="flex items-center gap-3 mt-3">
                                {alreadyBooked ? (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "hsl(140 55% 32%)" }}>
                                    <CheckCircle className="w-3.5 h-3.5" /> Booked
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setSelectedSession(session)}
                                    disabled={full || checkoutMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    style={{
                                      background: full
                                        ? "hsl(340 10% 70%)"
                                        : `linear-gradient(135deg, ${PRIMARY}, hsl(310 55% 36%))`,
                                    }}
                                  >
                                    {checkoutMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CreditCard className="w-3 h-3" />
                                    )}
                                    {full ? "Fully Booked" : "Book & Pay"}
                                  </button>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <User className="w-3 h-3" /> Private session
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings */}
      {tab === "my-bookings" && (
        <div>
          {bookingsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: PRIMARY }} />
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No upcoming bookings.</p>
              <button
                onClick={() => setTab("available")}
                className="text-sm font-semibold mt-2 underline underline-offset-2"
                style={{ color: PRIMARY }}
              >
                Browse available sessions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-2xl border overflow-hidden"
                  style={{ borderColor: "hsl(340 15% 88%)" }}
                >
                  <div className="flex items-stretch">
                    <div className="w-1 flex-shrink-0" style={{ background: PRIMARY }} />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "hsl(340 50% 18%)" }}>
                            {booking.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {formatDate(booking.sessionDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {booking.sessionTime} &bull; {booking.durationMinutes} min
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: "hsl(140 50% 95%)", color: "hsl(140 55% 30%)" }}
                        >
                          Confirmed
                        </span>
                      </div>

                      {booking.zoomLink ? (
                        <a
                          href={booking.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 transition hover:brightness-110"
                          style={{ background: PRIMARY_LIGHT, color: PRIMARY }}
                        >
                          Join Zoom Session
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-3">
                          Zoom link will be sent to your email before the session.
                        </p>
                      )}

                      <button
                        onClick={() => cancelMutation.mutate(booking.bookingId)}
                        disabled={cancelMutation.isPending}
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        {cancelMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        Cancel booking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking modal */}
      {selectedSession && (
        <BookingModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onConfirm={(notes) =>
            checkoutMutation.mutate({ sessionId: selectedSession.id, notes })
          }
          loading={checkoutMutation.isPending}
        />
      )}
    </div>
  );
}
