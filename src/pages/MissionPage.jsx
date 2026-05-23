import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaCheckCircle, FaClock, FaFire } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getMyMissions } from "../api/Level.js";
import toast from "react-hot-toast";

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const txt  = (dark) => ({ color: dark ? "#F7EEDB" : "#2B2017" });
const sub  = (dark) => ({ color: dark ? "#CBBEAC" : "#7A5C3E" });
const gold = ()     => ({ color: "#F2B84B" });

const panelStyle = (dark) => ({
  background:   dark ? "#1B120C" : "#FFF8EC",
  border:       `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
  borderRadius: "16px",
});

const MissionProgressBar = ({ progress, target, completed, dark }) => {
  const pct = Math.min((progress / target) * 100, 100);
  return (
    <div className="w-full h-2 rounded-full overflow-hidden"
      style={{ background: dark ? "#3A2A1C" : "#F3DFC2" }}>
      <motion.div
        className="h-2 rounded-full"
        style={{ background: completed ? "#2FAF74" : "#F2B84B" }}
        initial={{ width: "0%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

const MissionCard = ({ mission, index, dark }) => {
  const { mission_name, description, xp_reward, progress, target, completed, completed_at } = mission;
  const pct = Math.min(Math.round((progress / target) * 100), 100);

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className="rounded-xl px-4 py-4 flex flex-col gap-3"
      style={{
        background: completed
          ? (dark ? "#1B120C" : "#FFE9B0")
          : (dark ? "#0F0B08" : "#FFF7E8"),
        border: `2px solid ${completed
          ? (dark ? "#F2B84B" : "#2B2017")
          : (dark ? "#3A2A1C" : "#2B2017")}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-base"
            style={{ background: dark ? "#1B120C" : (completed ? "#FFE9B0" : "#FFF3DA") }}>
            {completed
              ? <FaCheckCircle style={{ color: "#2FAF74" }} size={15} />
              : <FaBolt style={gold()} size={13} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p style={txt(dark)} className="text-sm font-semibold leading-tight">{mission_name}</p>
            <p style={sub(dark)} className="text-xs mt-0.5 leading-snug">{description}</p>
          </div>
        </div>

        <span
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
          style={completed
            ? { background: "#2FAF74", color: "#0B1F16", border: "1px solid #1E7E52" }
            : { background: dark ? "#1B120C" : "#FFF3DA", color: dark ? "#F2B84B" : "#C58B1D", border: `1px solid ${dark ? "#3A2A1C" : "#2B2017"}` }
          }
        >
          <FaBolt size={8} />+{xp_reward} XP
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <MissionProgressBar progress={progress} target={target} completed={completed} dark={dark} />
        <div className="flex items-center justify-between">
          <span style={sub(dark)} className="text-xs">
            {progress} / {target}
            {target > 1 && <span className="ml-1">({pct}%)</span>}
          </span>
          {completed && completed_at && (
            <span style={sub(dark)} className="text-[10px]">
              Done {new Date(completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ icon: Icon, iconColor, title, completed, total, xpEarned, xpAvailable, dark, sub: subLabel }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}>
        <Icon size={13} style={{ color: iconColor }} />
      </div>
      <div>
        <p style={txt(dark)} className="text-sm font-bold leading-tight">{title}</p>
        {subLabel && <p style={sub(dark)} className="text-[10px]">{subLabel}</p>}
      </div>
    </div>
    <div className="text-right">
      <p style={txt(dark)} className="text-xs font-semibold">{completed}/{total} done</p>
      <p style={sub(dark)} className="text-[10px]">{xpEarned}/{xpAvailable} XP</p>
    </div>
  </div>
);

const XPSummaryBar = ({ data, dark }) => {
  const totalEarned    = (data?.daily?.xpEarned    ?? 0) + (data?.weekly?.xpEarned    ?? 0);
  const totalAvailable = (data?.daily?.xpAvailable ?? 0) + (data?.weekly?.xpAvailable ?? 0);
  const pct = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

  return (
    <motion.div
      className="px-4 sm:px-6 py-4 mb-5"
      style={panelStyle(dark)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <p style={txt(dark)} className="text-sm font-bold">Today's XP Progress</p>
        <span style={gold()} className="text-xs font-semibold flex items-center gap-1">
          <FaBolt size={9} />{totalEarned} / {totalAvailable} XP
        </span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden"
        style={{ background: dark ? "#3A2A1C" : "#F3DFC2" }}>
        <motion.div
          className="h-3 rounded-full"
          style={{ background: "#F2B84B" }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p style={sub(dark)} className="text-xs mt-1.5 text-right">{pct}% of available XP earned</p>
    </motion.div>
  );
};

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
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0F0B08]" : "arcade-bg"}`}>
        <motion.div
          className="w-8 h-8 border-4 border-[#2FAF74] border-t-transparent rounded-full"
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
    <div className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
      dark ? "bg-[#0F0B08]" : "arcade-bg"
    }`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">

        <motion.h1
          style={txt(dark)}
          className="text-2xl sm:text-3xl font-arcade text-center mb-8"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Missions
        </motion.h1>

        {data && <XPSummaryBar data={data} dark={dark} />}

        {daily && (
          <motion.div
            className="px-4 sm:px-6 py-5 mb-5"
            style={panelStyle(dark)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              icon={FaClock}
              iconColor="#2FAF74"
              title="Daily Missions"
              subLabel={`Resets at midnight · ${new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
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

        {weekly && (
          <motion.div
            className="px-4 sm:px-6 py-5"
            style={panelStyle(dark)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              icon={FaFire}
              iconColor="#E07B54"
              title="Weekly Missions"
              subLabel={weekResetLabel}
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

        {!daily && !weekly && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <p style={sub(dark)} className="text-sm font-medium">No missions available right now.</p>
            <p style={sub(dark)} className="text-xs mt-1">Check back soon!</p>
          </div>
        )}

      </main>
    </div>
  );
}