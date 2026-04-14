import { useState, useEffect, useRef } from "react";

const grounding554 = [
  { count: 5, sense: "things you can SEE", color: "text-amber-700", bg: "bg-amber-50", icon: "👁️" },
  { count: 4, sense: "things you can FEEL", color: "text-terracotta", bg: "bg-orange-50", icon: "🤲" },
  { count: 3, sense: "things you can HEAR", color: "text-amber-800", bg: "bg-yellow-50", icon: "👂" },
  { count: 2, sense: "things you can SMELL", color: "text-terracotta", bg: "bg-orange-50", icon: "🌸" },
  { count: 1, sense: "thing you can TASTE", color: "text-amber-700", bg: "bg-amber-50", icon: "✨" },
];

const crisisAffirmations = [
  "I am safe right now, in this moment.",
  "This feeling is temporary. It will pass.",
  "I have survived every hard moment so far.",
  "I am not in danger. I am healing.",
  "My body is protecting me. I am okay.",
  "This wave of pain will pass. I will breathe through it.",
  "I am stronger than this moment feels.",
];

type Phase = "inhale" | "hold" | "exhale" | "pause";

export default function Emergency() {
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingStarted, setGroundingStarted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [breathPhase, setBreathPhase] = useState<Phase>("inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathActive, setBreathActive] = useState(false);
  const [affirmIndex, setAffirmIndex] = useState(0);
  const breathTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = grounding554[groundingStep];

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checkedItems).filter(
    (v) => v && Object.keys(checkedItems).find((k) => k.startsWith(`${groundingStep}-`))
  ).length;

  const countForStep = Object.keys(checkedItems).filter(
    (k) => k.startsWith(`${groundingStep}-`) && checkedItems[k]
  ).length;

  const startBreath = () => {
    setBreathActive(true);
    setBreathPhase("inhale");
    setBreathCount(4);
  };

  const stopBreath = () => {
    setBreathActive(false);
    if (breathTimer.current) clearInterval(breathTimer.current);
  };

  useEffect(() => {
    if (!breathActive) return;

    const phases: { phase: Phase; duration: number }[] = [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 4 },
      { phase: "exhale", duration: 4 },
      { phase: "pause", duration: 4 },
    ];

    let phaseIndex = 0;
    let count = 4;
    setBreathPhase("inhale");
    setBreathCount(4);

    const tick = setInterval(() => {
      count--;
      if (count <= 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        count = phases[phaseIndex].duration;
        setBreathPhase(phases[phaseIndex].phase);
      }
      setBreathCount(count);
    }, 1000);

    breathTimer.current = tick;
    return () => clearInterval(tick);
  }, [breathActive]);

  const phaseLabel: Record<Phase, string> = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
    pause: "Rest",
  };

  const phaseScale: Record<Phase, string> = {
    inhale: "scale-150",
    hold: "scale-150",
    exhale: "scale-100",
    pause: "scale-100",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
        <div className="text-5xl mb-2">🫶</div>
        <h1 className="text-2xl font-bold text-terracotta">You Are Safe Right Now</h1>
        <p className="text-gray-600 leading-relaxed">
          If you are overwhelmed, panicking, or in emotional distress — you are in the right place.
          This page will help you ground yourself and return to the present moment.
          Take one breath. You are safe.
        </p>
      </div>

      {/* Box Breathing */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-xl font-semibold text-terracotta mb-2">Box Breathing</h2>
        <p className="text-gray-500 text-sm mb-6">
          Box breathing activates your parasympathetic nervous system — the part of you that knows you are safe.
          Breathe in for 4, hold for 4, breathe out for 4, rest for 4.
        </p>

        <div className="flex flex-col items-center gap-6">
          {/* Tappable breathing circle */}
          <button
            onClick={breathActive ? stopBreath : startBreath}
            className="relative flex items-center justify-center focus:outline-none group"
            aria-label={breathActive ? "Stop breathing exercise" : "Start breathing exercise"}
          >
            {/* Outer pulse ring — only when active */}
            {breathActive && (
              <div className="absolute w-44 h-44 rounded-full bg-orange-100 opacity-50 animate-ping" style={{ animationDuration: "3s" }} />
            )}
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-br from-orange-300 to-amber-200 shadow-md transition-all duration-1000 ease-in-out ${breathActive ? phaseScale[breathPhase] : "scale-100 group-hover:scale-105"}`}
            />
            <div className="absolute text-center pointer-events-none">
              {breathActive ? (
                <>
                  <div className="text-white font-semibold text-sm drop-shadow">{phaseLabel[breathPhase]}</div>
                  <div className="text-3xl font-bold text-white drop-shadow">{breathCount}</div>
                </>
              ) : (
                <>
                  <div className="text-white font-semibold text-sm drop-shadow">Tap to</div>
                  <div className="text-white font-bold text-base drop-shadow">Start</div>
                </>
              )}
            </div>
          </button>

          {breathActive && (
            <button
              onClick={stopBreath}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Stop
            </button>
          )}
        </div>
      </section>

      {/* 5-4-3-2-1 Grounding */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-xl font-semibold text-terracotta mb-2">5-4-3-2-1 Grounding</h2>
        <p className="text-gray-500 text-sm mb-6">
          This technique pulls your mind out of the past or future and into the present moment through your senses.
          Work through each step at your own pace.
        </p>

        {!groundingStarted ? (
          <button
            onClick={() => setGroundingStarted(true)}
            className="w-full py-4 bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-xl font-medium hover:bg-amber-100 transition-colors"
          >
            Begin Grounding Exercise
          </button>
        ) : (
          <div className="space-y-4">
            {/* Step tabs */}
            <div className="flex gap-2 flex-wrap">
              {grounding554.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setGroundingStep(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    i === groundingStep
                      ? "bg-terracotta text-white"
                      : i < groundingStep
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step.count} {step.icon}
                </button>
              ))}
            </div>

            <div className={`${currentStep.bg} rounded-xl p-5`}>
              <div className="text-3xl mb-2">{currentStep.icon}</div>
              <h3 className={`text-lg font-semibold ${currentStep.color} mb-1`}>
                Name {currentStep.count} {currentStep.sense}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Look around you right now. Take your time. Name them out loud or in your mind.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {Array.from({ length: currentStep.count }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => toggleCheck(`${groundingStep}-${i}`)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors text-left ${
                      checkedItems[`${groundingStep}-${i}`]
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <span className="text-lg">{checkedItems[`${groundingStep}-${i}`] ? "✓" : `${i + 1}.`}</span>
                    <span>{checkedItems[`${groundingStep}-${i}`] ? "Named ✓" : `Tap when you have named ${i === 0 ? "one" : "another"}`}</span>
                  </button>
                ))}
              </div>
              {countForStep === currentStep.count && groundingStep < grounding554.length - 1 && (
                <button
                  onClick={() => setGroundingStep(groundingStep + 1)}
                  className="mt-4 w-full py-3 bg-terracotta text-white rounded-xl font-medium hover:bg-terracotta/90 transition-colors"
                >
                  Next Step →
                </button>
              )}
              {countForStep === currentStep.count && groundingStep === grounding554.length - 1 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <div className="text-2xl mb-1">🌿</div>
                  <p className="text-green-700 font-medium">Well done, Sister.</p>
                  <p className="text-green-600 text-sm">You are here. You are present. You are safe.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Crisis Affirmations */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-xl font-semibold text-terracotta mb-2">Words for This Moment</h2>
        <p className="text-gray-500 text-sm mb-6">
          Read this slowly. Say it out loud if you can. Let it reach you.
        </p>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center">
          <p className="text-xl font-medium text-gray-800 leading-relaxed mb-6 italic">
            "{crisisAffirmations[affirmIndex]}"
          </p>
          <button
            onClick={() => setAffirmIndex((prev) => (prev + 1) % crisisAffirmations.length)}
            className="px-5 py-2.5 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors text-sm"
          >
            Another Word for Me
          </button>
        </div>
      </section>

      {/* Support Resources */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-xl font-semibold text-terracotta mb-4">If You Need More Support</h2>
        <p className="text-gray-500 text-sm mb-4">
          If you are in immediate danger or need to speak to someone, please reach out.
        </p>
        <div className="space-y-3">
          {[
            { country: "South Africa", line: "GBV Command Centre: 0800 428 428 (24/7, free)" },
            { country: "Nigeria", line: "NAPTIP Hotline: 0800 NAPTIP 1 (0800 627 8471)" },
            { country: "Ghana", line: "DOVVSU: 0800 111 888 (Domestic Violence Victims Support)" },
            { country: "Kenya", line: "GBV Hotline: 1195 (free, 24/7)" },
            { country: "Zimbabwe", line: "Musasa Project: +263 4 333 1 83 / 250929" },
          ].map((r) => (
            <div key={r.country} className="flex gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="font-semibold text-terracotta text-sm w-28 shrink-0">{r.country}</span>
              <span className="text-gray-600 text-sm">{r.line}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          You are also always welcome to connect with your Sheltered Sisters community. You do not have to go through this alone.
        </p>
      </section>
    </div>
  );
}
