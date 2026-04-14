import { Link, useLocation } from "wouter";
import { Home, BookOpen, PenLine, Sparkles, TrendingUp, Sun, ShieldAlert, LogOut, Video, Radio, Star, CalendarDays, ShieldCheck } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/daily", label: "Daily Practice", icon: Sun },
  { href: "/resources", label: "Resource Library", icon: BookOpen },
  { href: "/videos", label: "Video Library", icon: Video },
  { href: "/live", label: "Live Sessions", icon: Radio },
  { href: "/booking", label: "Book a Session", icon: CalendarDays },
  { href: "/journal", label: "My Journal", icon: PenLine },
  { href: "/affirmations", label: "Affirmations", icon: Sparkles },
  { href: "/journey", label: "My Journey", icon: TrendingUp },
  { href: "/membership", label: "Membership", icon: Star },
];

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

export default function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Sister";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const isAdmin = ADMIN_EMAIL && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-20" style={{ background: "linear-gradient(180deg, hsl(340 62% 30%) 0%, hsl(330 55% 22%) 100%)" }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="Sheltered Sisters"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid rgba(255,255,255,0.25)" }}
          />
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Sheltered Sisters</h1>
            <p className="text-white/60 text-xs mt-0.5">Welcome, {firstName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? location === "/dashboard" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
              {label === "Live Sessions" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Check for live sessions" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full",
              location === "/admin"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            )}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Admin Panel
          </Link>
        )}
        <Link
          href="/emergency"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full",
            location === "/emergency"
              ? "bg-red-500/30 text-white"
              : "bg-red-500/20 text-red-200 hover:bg-red-500/30 hover:text-white"
          )}
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          Emergency Grounding
        </Link>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>

        <p className="text-white/30 text-xs leading-relaxed px-1">
          You are not alone on this journey.
        </p>
      </div>
    </aside>
  );
}
