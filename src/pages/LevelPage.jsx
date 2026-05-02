import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle, FaStar, FaLock } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getAllLevels, getMyLevel } from "../api/Level.js";

// Tier color config keyed by title prefix / landmark levels
const TIER_CONFIG = [
  { match: "MindLeap Master", color: "#FF6B35", glow: "#FF6B3540", icon: "👑" },
  { match: "Mythic",          color: "#E040FB", glow: "#E040FB30", icon: "🔮" },
  { match: "Champion",        color: "#FF4081", glow: "#FF408130", icon: "🏆" },
  { match: "Grandmaster",     color: "#FF8C00", glow: "#FF8C0030", icon: "🌟" },
  { match: "Legend",          color: "#FF8C00", glow: "#FF8C0030", icon: "🌟" },
  { match: "Master",          color: "#C9B458", glow: "#C9B45830", icon: "⭐" },
  { match: "Elite",           color: "#C9B458", glow: "#C9B45830", icon: "⭐" },
  { match: "Veteran",         color: "#5B8BDF", glow: "#5B8BDF30", icon: "🛡️" },
  { match: "Sharpshooter",    color: "#6AAA64", glow: "#6AAA6430", icon: "🎯" },
  { match: "Strategist",      color: "#6AAA64", glow: "#6AAA6430", icon: "🎯" },
  { match: "Wordsmith",       color: "#6AAA64", glow: "#6AAA6430", icon: "🎯" },
  { match: "default",         color: "#818384", glow: "#81838420", icon: "📖" },
];

function getTier(title) {
  const found = TIER_CONFIG.find(
    (t) => t.match !== "default" && title.startsWith(t.match)
  );
  return found ?? TIER_CONFIG[TIER_CONFIG.length - 1];
}

// Group levels into tiers for section headers
const TIER_BREAKS = [
  { from: 1,  label: "Beginner",     range: "1–9"   },
  { from: 10, label: "Veteran",      range: "10–19" },
  { from: 20, label: "Elite",        range: "20"    },
  { from: 21, label: "Master",       range: "21–29" },
  { from: 30, label: "Legend",       range: "30"    },
  { from: 31, label: "Grandmaster",  range: "31–39" },
  { from: 40, label: "Champion",     range: "40"    },
  { from: 41, label: "Mythic",       range: "41–49" },
  { from: 50, label: "MindLeap Master", range: "50" },
];

function getTierBreak(level) {
  return TIER_BREAKS.find((t) => t.from === level) ?? null;
}

export default function AllLevelsPage({ dark, onToggleDark }) {
  const [levels, setLevels]       = useState([]);
  const [myLevel, setMyLevel]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();
  const currentRef                = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, myLevelRes] = await Promise.allSettled([
          getAllLevels(),
          getMyLevel(),
        ]);
        if (levelsRes.status === "fulfilled")  setLevels(levelsRes.value.data.levels ?? []);
        if (myLevelRes.status === "fulfilled") setMyLevel(myLevelRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to current level after render
  useEffect(() => {
    if (!loading && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [loading]);

  const currentLevel = myLevel?.currentLevel ?? 0;
  const totalXp      = myLevel?.totalXp ?? 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
        <motion.div
          className="w-8 h-8 border-4 border-[#6AAA64] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-8">
          <motion.button
            onClick={() => navigate("/profile")}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
              dark
                ? "bg-[#1A1A1B] border-[#3A3A3C] text-[#818384] hover:text-white hover:bg-[#2A2A2B]"
                : "bg-white border-[#E0E0E0] text-[#787C7E] hover:text-[#1A1A1B] hover:bg-[#F0F0F0]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <FaArrowLeft size={13} />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h1
              className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              All Levels
            </h1>
            <p className={`text-xs mt-0.5 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              {levels.length} levels · You are on Level {currentLevel}
            </p>
          </motion.div>
        </div>

        {/* Your progress summary */}
        {myLevel && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-5 py-4 mb-6 flex items-center gap-4 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: getTier(myLevel.currentTitle ?? "").glow }}
            >
              {getTier(myLevel.currentTitle ?? "").icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                Level {currentLevel} — {myLevel.currentTitle}
              </p>
              <p className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                {totalXp.toLocaleString()} XP earned
              </p>
              {!myLevel.isMaxLevel && (
                <div className={`mt-2 w-full h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#3A3A3C]" : "bg-[#E0E0E0]"}`}>
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: getTier(myLevel.currentTitle ?? "").color }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${myLevel.progressPercent ?? 0}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              )}
            </div>
            {myLevel.isMaxLevel ? (
              <span className="text-xs font-semibold text-[#C9B458] bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full shrink-0">
                Max
              </span>
            ) : (
              <div className="text-right shrink-0">
                <p className={`text-xs font-semibold ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                  {myLevel.xpToNextLevel?.toLocaleString()} XP
                </p>
                <p className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>to next</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Levels list */}
        <div className="flex flex-col gap-2">
          {levels.map((lvl, i) => {
            const tierBreak  = getTierBreak(lvl.level);
            const tier       = getTier(lvl.title);
            const isComplete = lvl.level < currentLevel;
            const isCurrent  = lvl.level === currentLevel;
            const isLocked   = lvl.level > currentLevel;

            const xpDisplay = lvl.totalXpNeeded === 0
              ? "Start"
              : `${lvl.totalXpNeeded.toLocaleString()} XP`;

            return (
              <div key={lvl.level} ref={isCurrent ? currentRef : null}>

                {/* Tier section header */}
                {tierBreak && (
                  <motion.div
                    className="flex items-center gap-2 mt-5 mb-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.015, 0.5) }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: tier.color }}
                    >
                      {tierBreak.label}
                    </span>
                    <div className={`flex-1 h-px ${dark ? "bg-[#2A2A2B]" : "bg-[#E8E8E8]"}`} />
                    <span className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#B0B0B0]"}`}>
                      Lv {tierBreak.range}
                    </span>
                  </motion.div>
                )}

                {/* Level row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.015, 0.6) }}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isCurrent
                      ? dark
                        ? "border-[#6AAA64] bg-[#1A2B1A]"
                        : "border-[#6AAA64] bg-[#EAF4E6]"
                      : isComplete
                      ? dark
                        ? "border-[#2A2A2B] bg-[#161617]"
                        : "border-[#E8E8E8] bg-white"
                      : dark
                      ? "border-[#1E1E1F] bg-[#141415] opacity-50"
                      : "border-[#F0F0F0] bg-[#FAFAFA] opacity-50"
                  }`}
                >
                  {/* Current level pulse ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-[#6AAA64]"
                      animate={{ opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Level number bubble */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{
                      backgroundColor: isCurrent || isComplete ? `${tier.color}22` : dark ? "#1A1A1B" : "#F0F0F0",
                      color: isCurrent || isComplete ? tier.color : dark ? "#3A3A3C" : "#B0B0B0",
                    }}
                  >
                    {lvl.level}
                  </div>

                  {/* Title & XP */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      isCurrent
                        ? "text-[#6AAA64]"
                        : isComplete
                        ? dark ? "text-white" : "text-[#1A1A1B]"
                        : dark ? "text-[#3A3A3C]" : "text-[#C0C0C0]"
                    }`}>
                      {lvl.title}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] font-semibold bg-[#6AAA64] text-white px-2 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      isComplete || isCurrent
                        ? dark ? "text-[#818384]" : "text-[#787C7E]"
                        : dark ? "text-[#2A2A2B]" : "text-[#D0D0D0]"
                    }`}>
                      {xpDisplay}
                    </p>
                  </div>

                  {/* Status icon */}
                  <div className="shrink-0">
                    {isComplete && <FaCheckCircle size={15} color={tier.color} />}
                    {isCurrent  && <FaStar size={15} color="#6AAA64" />}
                    {isLocked   && <FaLock size={12} color={dark ? "#2A2A2B" : "#D0D0D0"} />}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Bottom padding */}
        <div className="h-10" />
      </main>
    </div>
  );
}