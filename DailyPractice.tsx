import { useState, useEffect, useRef } from "react";

const dailyPrompts = [
  "What is one thing I am grateful for today, no matter how small?",
  "What emotion is most present in my body right now, and where do I feel it?",
  "What is one kind thing I can do for myself today?",
  "What boundary do I need to hold more firmly this week?",
  "What is one thing I am proud of from the last 7 days?",
  "Who in my life makes me feel truly safe, and why?",
  "What part of my old self am I most excited to reclaim?",
  "What does peace feel like in my body? Where do I feel it?",
  "What is one thought about myself I am ready to release today?",
  "What would the wisest, most healed version of me tell me right now?",
  "What do I need more of in my life, and what small step can I take toward it?",
  "What story am I telling myself about my healing that might not be true?",
  "What does the little girl inside me most need to hear today?",
  "What am I learning about myself through this healing journey?",
  "If my body could speak right now, what would it say?",
  "What brings me genuine joy that has nothing to do with anyone else?",
  "What have I forgiven myself for recently, and what still needs forgiveness?",
  "What does thriving look like for me — specifically, concretely?",
  "What is one relationship in my life that feeds my spirit?",
  "What am I most looking forward to in my next chapter?",
  "Name three qualities you have that no one can take from you.",
  "What would you tell a friend who was going through exactly what you are going through?",
  "What did you manage today that felt difficult? Acknowledge that courage.",
  "How has your body been asking for rest, and have you listened?",
  "What does your healing look like today — not perfect, just honest?",
  "What is one thing you can let go of this week that has been weighing on you?",
  "What part of your journey do you wish someone would see and acknowledge?",
  "Who inspired you recently, and what did they show you about yourself?",
  "What does home feel like in your body? Can you find a moment of it today?",
  "What is something you believe about yourself now that you did not believe a year ago?",
];

const bodyPartCheckins = [
  { area: "Head & Mind", icon: "🧠", question: "How busy and loud is your mind right now? (1 = calm, 5 = very loud)" },
  { area: "Chest & Heart", icon: "💛", question: "What emotion is sitting in your chest right now?" },
  { area: "Stomach & Gut", icon: "🌿", question: "Does your gut feel settled or unsettled?" },
  { area: "Shoulders & Neck", icon: "💆", question: "Are you carrying tension here? Try to soften these now." },
  { area: "Hands", icon: "🤲", question: "Are your hands relaxed or gripping? Let them open." },
  { area: "Legs & Feet", icon: "🌱", question: "Feel your feet on the ground. You are here. You are rooted." },
];

const weeklyFocusTopics = [
  { day: 0, focus: "Stillness", description: "Sunday is for rest. Give yourself permission to do nothing today and let that be enough.", color: "from-blue-50 to-indigo-50", textColor: "text-indigo-700" },
  { day: 1, focus: "Intention", description: "Start this week with one clear intention for your healing. Write it down and return to it throughout the week.", color: "from-orange-50 to-amber-50", textColor: "text-amber-800" },
  { day: 2, focus: "Boundaries", description: "Focus on one boundary you want to practice or strengthen this week. Notice where it is tested.", color: "from-terracotta/5 to-orange-50", textColor: "text-terracotta" },
  { day: 3, focus: "Connection", description: "Reach out to one person today who feeds your soul. A message, a call, a moment of real connection.", color: "from-green-50 to-emerald-50", textColor: "text-emerald-700" },
  { day: 4, focus: "Gratitude", description: "Name five things in your healing journey you are grateful for — including things that are still hard but teaching you.", color: "from-yellow-50 to-amber-50", textColor: "text-amber-700" },
  { day: 5, focus: "Body Care", description: "Your body has carried a lot. Choose one thing today that honours it — movement, rest, nourishment, or touch.", color: "from-rose-50 to-pink-50", textColor: "text-rose-700" },
  { day: 6, focus: "Reflection", description: "Look back at this week. What grew? What shifted? What are you carrying into next week, and what can you leave behind?", color: "from-purple-50 to-violet-50", textColor: "text-violet-700" },
];

export default function DailyPractice() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = today.getDay();
  const todayPrompt = dailyPrompts[dayOfYear % dailyPrompts.length];
  const todayFocus = weeklyFocusTopics[dayOfWeek];

  const [timerSeconds, setTimerSeconds] = useState(5 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
  const [journalText, setJournalText] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startTimer = () => {
    setTimerRunning(true);
    setTimerFinished(false);
  };

  const pauseTimer = () => setTimerRunning(false);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerFinished(false);
    setTimerSeconds(5 * 60);
  };

  useEffect(() => {
    if (!timerRunning) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setTimerFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const moods = [
    { id: "peaceful", label: "Peaceful", icon: "🕊️" },
    { id: "hopeful", label: "Hopeful", icon: "🌱" },
    { id: "healing", label: "Healing", icon: "💛" },
    { id: "strong", label: "Strong", icon: "✊" },
    { id: "struggling", label: "Struggling", icon: "🌧️" },
    { id: "uncertain", label: "Uncertain", icon: "🌫️" },
  ];

  const dateLabel = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-sm text-amber-600 font-medium uppercase tracking-wide">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-terracotta">Daily Practice</h1>
        <p className="text-gray-500 text-sm">A few minutes each day with yourself is the most powerful investment in your healing.</p>
      </div>

      {/* Check In Mood */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-terracotta mb-1">How Are You Today?</h2>
        <p className="text-gray-400 text-sm mb-4">Be honest. This is just for you.</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-sm ${
                mood === m.id
                  ? "border-terracotta bg-orange-50 text-terracotta font-semibold"
                  : "border-gray-100 text-gray-500 hover:border-orange-200 hover:bg-orange-50"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="mt-3 text-sm text-gray-500 text-center">
            {mood === "peaceful" && "Carry that peace with you today. "}
            {mood === "hopeful" && "Hope is powerful medicine. Nurture it. "}
            {mood === "healing" && "Healing is happening, even when it is hard to see. "}
            {mood === "strong" && "You have earned this strength. "}
            {mood === "struggling" && "It is okay to struggle. You are still here, and that is enough. "}
            {mood === "uncertain" && "Uncertainty is part of the path. You are still walking forward. "}
            Whatever you are feeling right now is valid.
          </p>
        )}
      </section>

      {/* Today's Focus */}
      <section className={`rounded-2xl p-6 bg-gradient-to-br ${todayFocus.color} border border-orange-100`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Today's Focus</span>
        </div>
        <h2 className={`text-xl font-bold mb-2 ${todayFocus.textColor}`}>{todayFocus.focus}</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{todayFocus.description}</p>
      </section>

      {/* Today's Prompt */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-terracotta mb-1">Today's Reflection Prompt</h2>
        <p className="text-gray-400 text-sm mb-4">A new prompt every day. Sit with it. Write if you can.</p>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5">
          <p className="text-gray-700 text-base leading-relaxed italic font-medium">"{todayPrompt}"</p>
        </div>

        {/* Quick Journal */}
        <div className="mt-4">
          <label className="text-sm text-gray-500 block mb-2">Write your thoughts here (private, just for you):</label>
          <textarea
            value={journalText}
            onChange={(e) => { setJournalText(e.target.value); setJournalSaved(false); }}
            placeholder="Start writing... let it flow without judgment."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-terracotta transition-colors"
            rows={4}
          />
          {journalText.trim().length > 0 && !journalSaved && (
            <button
              onClick={() => setJournalSaved(true)}
              className="mt-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm hover:bg-terracotta/90 transition-colors"
            >
              Save My Reflection
            </button>
          )}
          {journalSaved && (
            <p className="text-green-600 text-sm mt-2">✓ Saved. Well done for showing up today.</p>
          )}
        </div>
      </section>

      {/* Body Scan */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-terracotta mb-1">Body Check-In</h2>
        <p className="text-gray-400 text-sm mb-4">
          Trauma lives in the body. Checking in with each part of yourself is a gentle act of healing. Tap each area to connect with it.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bodyPartCheckins.map((bp, i) => (
            <button
              key={i}
              onClick={() => setSelectedBodyPart(selectedBodyPart === i ? null : i)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedBodyPart === i
                  ? "border-terracotta bg-orange-50"
                  : "border-gray-100 hover:border-orange-200 hover:bg-orange-50"
              }`}
            >
              <div className="text-2xl mb-1">{bp.icon}</div>
              <div className="text-sm font-medium text-gray-700">{bp.area}</div>
            </button>
          ))}
        </div>
        {selectedBodyPart !== null && (
          <div className="mt-4 p-4 bg-orange-50 rounded-xl">
            <p className="text-sm font-medium text-terracotta mb-1">{bodyPartCheckins[selectedBodyPart].area}</p>
            <p className="text-gray-600 text-sm">{bodyPartCheckins[selectedBodyPart].question}</p>
          </div>
        )}
      </section>

      {/* Meditation Timer */}
      <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-terracotta mb-1">5-Minute Stillness</h2>
        <p className="text-gray-400 text-sm mb-5">
          Sit comfortably. Close your eyes. Focus only on your breath. Five minutes of stillness can shift the entire day.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl font-mono text-terracotta font-bold">
            {formatTime(timerSeconds)}
          </div>
          {timerFinished && (
            <p className="text-green-600 text-sm font-medium">🌿 Five minutes. Well done, Sister.</p>
          )}
          <div className="flex gap-3">
            {!timerRunning ? (
              <button
                onClick={startTimer}
                disabled={timerFinished}
                className="px-5 py-2.5 bg-terracotta text-white rounded-xl font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50"
              >
                {timerFinished ? "Complete" : timerSeconds < 300 ? "Resume" : "Begin Stillness"}
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="text-center py-6">
        <p className="text-gray-500 text-sm leading-relaxed">
          You showed up for yourself today. That is not small. That is everything.
        </p>
        <p className="text-terracotta font-semibold mt-1">Keep going, Sheltered Sister. 🌿</p>
      </section>
    </div>
  );
}
