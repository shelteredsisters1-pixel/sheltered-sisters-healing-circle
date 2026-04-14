import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, CreditCard, ExternalLink, Shield, Heart, BookOpen, Video, Sparkles } from "lucide-react";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  prices: Price[];
}

const INCLUDED = [
  { icon: BookOpen,  text: "Full resource library — all articles and tools" },
  { icon: Heart,     text: "Private journal, just for you" },
  { icon: Sparkles,  text: "Daily healing practices and mood check-ins" },
  { icon: Sparkles,  text: "Affirmations rooted in African womanhood" },
  { icon: Heart,     text: "Healing journey tracker" },
  { icon: Video,     text: "Video library — all recorded sessions" },
  { icon: Video,     text: "Live sessions with the community" },
  { icon: Shield,    text: "Emergency grounding toolkit" },
  { icon: BookOpen,  text: "New content added every month" },
];

const PRIMARY = "hsl(340 60% 42%)";
const PRIMARY_LIGHT = "hsl(340 55% 96%)";
const GOLD = "hsl(42 80% 52%)";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatPrice(p: Price) {
  const amount = (p.unit_amount / 100).toFixed(0);
  const interval = p.recurring?.interval || "month";
  return `$${amount} / ${interval}`;
}

export default function Membership() {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subData } = useQuery<{ status: string; subscription: any }>({
    queryKey: ["/api/stripe/subscription"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/stripe/subscription`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load subscription");
      return res.json();
    },
  });

  const { data: productData } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/stripe/products"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/stripe/products`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  const isActive = subData?.status === "active" || subData?.status === "trialing";
  const product = productData?.data?.[0];
  const price = product?.prices?.[0];

  async function handleCheckout() {
    if (!price) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: price.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/portal`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.jpg`}
          alt="Sheltered Sisters"
          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg"
          style={{ border: `3px solid ${PRIMARY}` }}
        />
        <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(340 50% 20%)" }}>
          {isActive ? "You are a Sheltered Sister" : "Join Sheltered Sisters"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isActive
            ? "You have full access to everything in this community."
            : "Everything you need to heal, in one safe place."}
        </p>
      </div>

      {isActive ? (
        /* Active member card */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid hsl(340 30% 88%)` }}>
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${GOLD})` }} />
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: PRIMARY_LIGHT }}>
              <Check className="w-6 h-6" style={{ color: PRIMARY }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "hsl(340 50% 20%)" }}>Active membership</p>
              <p className="text-sm text-muted-foreground">Full access to all content and sessions</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              To update your payment details, cancel, or view billing history, open the member portal.
            </p>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage Billing
            </button>
          </div>
        </div>
      ) : (
        /* Join card */
        <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ border: `1px solid hsl(340 30% 88%)` }}>
          {/* Price banner */}
          <div
            className="px-7 py-7 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, hsl(340 62% 28%) 0%, hsl(310 50% 20%) 100%)` }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 translate-x-1/4 -translate-y-1/4"
              style={{ background: "white" }} />
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
              Sheltered Sisters Membership
            </p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-bold text-white">$20</span>
              <span className="text-white/65 text-lg mb-1.5">/ month</span>
            </div>
            <p className="text-white/55 text-sm">Cancel any time. No commitment.</p>
          </div>

          {/* Features list */}
          <div className="px-7 py-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>
              Everything included
            </p>
            <ul className="space-y-3 mb-7">
              {INCLUDED.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: PRIMARY_LIGHT }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <span className="text-sm text-muted-foreground leading-snug">{text}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || !price}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 shadow-md hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, hsl(310 55% 36%))` }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Join Now — {price ? formatPrice(price) : "$20 / month"}
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              Secure payment powered by Stripe. Cancel any time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
