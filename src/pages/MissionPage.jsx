import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaCheckCircle, FaClock, FaCalendarAlt, FaFire } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getMyMissions } from "../api/Level.js";
import toast from "react-hot-toast";

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Progress bar for a mission ────────────────────────────────────────────────
const MissionProgressBar = ({ progress, target, completed, dark }) => {
  const pct = Math.min((progress / target) * 100, 100);
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-[#3A3A3C]" : "bg-[#E0E0E0]"}`}>
      <motion.div
        className={`h-2 rounded-full ${completed ? "bg-[#6AAA64]" : "bg-[#C9B458]"}`}
        initial={{ width: "0%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

// ── Single mission card ───────────────────────────────────────────────────────
const MissionCard = ({ mission, index, dark }) => {
  const { mission_name, description, xp_reward, progress, target, completed, completed_at } = mission;
  const pct = Math.min(Math.round((progress / target) * 100), 100);

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className={`rounded-xl border px-4 py-4 flex flex-col gap-3 transition-colors ${
        completed
          ? dark
            ? "bg-[#1E2D1E] border-[#3A5C3A]"
            : "bg-[#EAF4E6] border-[#6AAA64]"
          : dark
          ? "bg-[#1A1A1B] border-[#3A3A3C]"
          : "bg-white border-[#E0E0E0]"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-base ${
              completed
                ? dark ? "bg-[#2D4A2D]" : "bg-[#D4EDD4]"
                : dark ? "bg-[#2A2A2B]" : "bg-[#F3F3F3]"
            }`}
          >
            {completed ? (
              <FaCheckCircle className="text-[#6AAA64]" size={15} />
            ) : (
              <FaBolt className="text-[#C9B458]" size={13} />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
              {mission_name}
            </p>
            <p className={`text-xs mt-0.5 leading-snug ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              {description}
            </p>
          </div>
        </div>

        {/* XP badge */}
        <span
          className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            completed
              ? "bg-[#6AAA64] text-white"
              : dark
              ? "bg-[#2A2A2B] text-[#C9B458]"
              : "bg-[#FFF8DC] text-[#B8940A]"
          }`}
        >
          <FaBolt size={8} />
          +{xp_reward} XP
        </span>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <MissionProgressBar progress={progress} target={target} completed={completed} dark={dark} />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
            {progress} / {target}
            {target > 1 && <span className="ml-1">({pct}%)</span>}
          </span>
          {completed && completed_at && (
            <span className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              Done {new Date(completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Section header (Daily / Weekly) ──────────────────────────────────────────
const SectionHeader = ({ icon: Icon, iconColor, title, completed, total, xpEarned, xpAvailable, dark, sub }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-[#2A2A2B]" : "bg-[#F3F3F3]"}`}
      >
        <Icon size={13} style={{ color: iconColor }} />
      </div>
      <div>
        <p className={`text-sm font-bold leading-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
          {title}
        </p>
        {sub && (
          <p className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>{sub}</p>
        )}
      </div>
    </div>
    <div className="text-right">
      <p className={`text-xs font-semibold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
        {completed}/{total} done
      </p>
      <p className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
        {xpEarned}/{xpAvailable} XP
      </p>
    </div>
  </div>
);

// ── Overall XP summary bar ────────────────────────────────────────────────────
const XPSummaryBar = ({ data, dark }) => {
  const totalEarned    = (data?.daily?.xpEarned    ?? 0) + (data?.weekly?.xpEarned    ?? 0);
  const totalAvailable = (data?.daily?.xpAvailable ?? 0) + (data?.weekly?.xpAvailable ?? 0);
  const pct = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

  return (
    <motion.div
      className={`rounded-2xl border px-4 sm:px-6 py-4 mb-5 ${
        dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>Today's XP Progress</p>
        <span className="text-xs font-semibold text-[#C9B458] flex items-center gap-1">
          <FaBolt size={9} />{totalEarned} / {totalAvailable} XP
        </span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${dark ? "bg-[#3A3A3C]" : "bg-[#E0E0E0]"}`}>
        <motion.div
          className="h-3 rounded-full bg-[#C9B458]"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className={`text-xs mt-1.5 text-right ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
        {pct}% of available XP earned
      </p>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MissionsPage({ dark, onToggleDark }) {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyMissions();
        setData(res.data);
      } catch {
        toast.error("Failed to load missions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  const daily  = data?.daily;
  const weekly = data?.weekly;

  const weekResetLabel = weekly?.weekResetsOn
    ? `Resets ${new Date(weekly.weekResetsOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${weekly.daysUntilReset}d left`
    : null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Title */}
        <motion.h1
          className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Missions
        </motion.h1>

        {/* XP summary */}
        {data && <XPSummaryBar data={data} dark={dark} />}

        {/* Daily missions */}
        {daily && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-6 py-5 mb-5 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              icon={FaClock}
              iconColor="#6AAA64"
              title="Daily Missions"
              sub={`Resets at midnight · ${new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              completed={daily.completed}
              total={daily.total}
              xpEarned={daily.xpEarned}
              xpAvailable={daily.xpAvailable}
              dark={dark}
            />
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {daily.missions.map((m, i) => (
                  <MissionCard key={m.mission_key} mission={m} index={i} dark={dark} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Weekly missions */}
        {weekly && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-6 py-5 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              icon={FaFire}
              iconColor="#E07B54"
              title="Weekly Missions"
              sub={weekResetLabel}
              completed={weekly.completed}
              total={weekly.total}
              xpEarned={weekly.xpEarned}
              xpAvailable={weekly.xpAvailable}
              dark={dark}
            />
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {weekly.missions.map((m, i) => (
                  <MissionCard key={m.mission_key} mission={m} index={i + (daily?.missions?.length ?? 0)} dark={dark} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!daily && !weekly && (
          <div className={`text-center py-16 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-sm font-medium">No missions available right now.</p>
            <p className="text-xs mt-1">Check back soon!</p>
          </div>
        )}

      </main>
    </div>
  );
}