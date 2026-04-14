import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, hsl(340 65% 20%) 0%, hsl(310 45% 16%) 50%, hsl(270 40% 14%) 100%)" }}
    >
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, hsl(340 60% 60%), transparent)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, hsl(42 80% 60%), transparent)" }} />

      {/* Main card */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, hsl(340 60% 50%), hsl(42 80% 52%))" }} />

        <div className="flex flex-col items-center px-8 pt-10 pb-8 text-center">
          {/* Logo with glow ring */}
          <div className="relative mb-6">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40 scale-110"
              style={{ background: "hsl(42 80% 52%)" }}
            />
            <img
              src="/logo.jpg"
              alt="Sheltered Sisters"
              className="relative w-32 h-32 rounded-full object-cover shadow-2xl"
              style={{ border: "3px solid rgba(255,255,255,0.4)" }}
            />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Sheltered Sisters
          </h1>
          <p className="text-sm font-medium uppercase tracking-widest mb-5" style={{ color: "hsl(42 80% 62%)" }}>
            African Women Healing Together
          </p>

          <p className="text-white/80 text-base leading-relaxed mb-2">
            A private, safe space built just for you — healing from narcissistic and emotional abuse.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Your journal, daily practices, healing tracker, live sessions, and a community who truly understands.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate("/sign-up")}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ background: "linear-gradient(135deg, hsl(42 85% 54%), hsl(38 90% 48%))", color: "hsl(340 60% 14%)" }}
            >
              Join Now — $20 / month
            </button>
            <button
              type="button"
              onClick={() => navigate("/sign-in")}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Already a member? Sign In
            </button>
          </div>

          <p className="text-white/35 text-xs mt-6 leading-relaxed">
            Skool community member? Sign up here with your email to access all your healing tools.
          </p>
        </div>

        {/* Bottom trust bar */}
        <div className="px-8 py-4 flex items-center justify-center gap-4 border-t border-white/8">
          {["Private", "Secure", "Cancel anytime"].map((label) => (
            <span key={label} className="text-white/35 text-xs flex items-center gap-1">
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: "hsl(42 80% 52%)" }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
