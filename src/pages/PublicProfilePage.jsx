import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { FaArrowLeft, FaChartBar, FaClock, FaCheckCircle, FaLock } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getPublicProfile } from "../api/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const panelStyle = (dark) => ({
  background: dark ? "#1B120C" : "#FFF8EC",
  border: `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
  borderRadius: "16px",
});

const txt = (dark) => ({ color: dark ? "#F7EEDB" : "#2B2017" });
const sub = (dark) => ({ color: dark ? "#CBBEAC" : "#7A5C3E" });

const BADGE_EMOJIS = {
  first_game: "👣",
  first_win: "🏆",
  speed_demon: "⚡",
  big_brain: "🧠",
  on_fire: "🔥",
  unstoppable: "💥",
  level_10: "⭐",
  level_25: "🌟",
  level_50: "👑",
  century: "💯",
  perfectionist: "✨",
  speedster: "🚀",
};

const StatCard = ({ label, value, dark, index }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="px-4 py-5 flex flex-col items-center gap-1"
    style={panelStyle(dark)}
  >
    <span className={`text-2xl sm:text-3xl font-bold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
      {value}
    </span>
    <span className={`text-xs text-center ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
      {label}
    </span>
  </motion.div>
);

const DistBar = ({ guess, count, pct, dark, index }) => (
  <motion.div
    className="flex items-center gap-3"
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
  >
    <span className={`text-sm font-medium w-4 text-right ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
      {guess}
    </span>
    <div className="flex-1">
      <motion.div
        className="bg-[#2FAF74] rounded flex items-center justify-end pr-3 h-9"
        initial={{ width: "8%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, delay: 0.08 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="text-[#0B1F16] text-sm font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.05 }}
        >
          {count}
        </motion.span>
      </motion.div>
    </div>
  </motion.div>
);

const BadgeCard = ({ b, dark }) => {
  const [hovered, setHovered] = useState(false);
  const earnedDate = b.earned_at
    ? new Date(b.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default"
        style={{
          background: dark ? "#1B120C" : "#FFE9B0",
          border: `2px solid ${dark ? "#F2B84B" : "#2B2017"}`,
        }}
      >
        <span className="text-2xl">{BADGE_EMOJIS[b.key] ?? "🏅"}</span>
        <span style={txt(dark)} className="text-xs font-semibold text-center leading-tight">
          {b.name ?? b.key}
        </span>
        {earnedDate && (
          <span style={sub(dark)} className="text-[10px]">{earnedDate}</span>
        )}
      </motion.div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-50 bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-48 rounded-xl px-3 py-2.5 shadow-xl pointer-events-none"
            style={{
              background: dark ? "#1B120C" : "#FFF3DA",
              border: `1px solid ${dark ? "#3A2A1C" : "#2B2017"}`,
            }}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${dark ? "#3A2A1C" : "#2B2017"}`,
              }}
            />
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base leading-none">{BADGE_EMOJIS[b.key] ?? "🏅"}</span>
              <p style={txt(dark)} className="text-xs font-bold leading-tight truncate">
                {b.name ?? b.key}
              </p>
              <FaCheckCircle size={10} className="text-[#2FAF74] shrink-0 ml-auto" />
            </div>
            <p style={sub(dark)} className="text-[11px] leading-snug">
              ✅ Unlocked badge
            </p>
            {earnedDate && (
              <p style={sub(dark)} className="text-[10px] mt-1.5">Earned {earnedDate}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PublicProfilePage({ dark = false, onToggleDark }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPublicProfile(username);
        setProfileData(res.data);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load profile.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    if (username) load();
  }, [username]);

  const stats = profileData?.stats ?? {};
  const profile = profileData?.profile ?? {};
  const guessDistribution = profileData?.guess_distribution ?? {};
  const badges = profileData?.badges?.list ?? [];
  const totalBadges = profileData?.badges?.total_earned ?? badges.length;

  const totalGuesses = useMemo(() => {
    return Object.values(guessDistribution).reduce((sum, value) => sum + Number(value || 0), 0);
  }, [guessDistribution]);

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

  if (!profileData) {
    return (
      <div className={`min-h-screen flex flex-col ${dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"}`}>
        <Navbar dark={dark} onToggleDark={onToggleDark} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
          <p className="text-sm">Profile not available.</p>
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg border-2 font-semibold ${dark ? "border-[#3A2A1C] text-[#F7EEDB]" : "border-[#2B2017] text-[#2B2017]"}`}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: dark ? "#1B120C" : "#FFF3DA",
              border: `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
              color: dark ? "#CBBEAC" : "#5A4636",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft size={14} />
          </motion.button>
          <div>
            <p className={`text-xs uppercase tracking-[0.22em] ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
              Profile
            </p>
            <h1 className={`text-2xl sm:text-3xl font-arcade ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
              {profile.username}
            </h1>
          </div>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <StatCard label="Level" value={profile.level ?? 0} dark={dark} index={0} />
          <StatCard label="Total XP" value={profile.total_xp ?? 0} dark={dark} index={1} />
          <StatCard
            label="Joined"
            value={profile.joined_at ? new Date(profile.joined_at).toLocaleDateString("en-US") : "—"}
            dark={dark}
            index={2}
          />
        </motion.div>

        <motion.div
          className={`mt-6 grid gap-4 sm:grid-cols-3`}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <StatCard label="Total games" value={stats.total_games ?? 0} dark={dark} index={0} />
          <StatCard label="Wins" value={stats.total_wins ?? 0} dark={dark} index={1} />
          <StatCard label="Win rate" value={`${stats.win_rate ?? 0}%`} dark={dark} index={2} />
          <StatCard label="Current streak" value={stats.current_streak ?? 0} dark={dark} index={3} />
          <StatCard label="Max streak" value={stats.max_streak ?? 0} dark={dark} index={4} />
          <StatCard label="Avg attempts" value={stats.avg_attempts ?? 0} dark={dark} index={5} />
        </motion.div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-1">
            <h2 style={txt(dark)} className="text-lg font-bold">Badges</h2>
            <span style={sub(dark)} className="text-xs">
              {totalBadges} earned
            </span>
          </div>
          <p style={sub(dark)} className="text-xs mb-4">Hover a badge to see details</p>
          {badges.length === 0 ? (
            <div className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
              No badges earned yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <BadgeCard key={b.key} b={b} dark={dark} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FaChartBar className="text-[#2FAF74]" size={14} />
            <h2 className={`text-lg font-semibold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
              Guess distribution
            </h2>
            {stats.last_played && (
              <div className="ml-auto flex items-center gap-2 text-xs">
                <FaClock className={dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"} />
                <span className={dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}>
                  Last played {new Date(stats.last_played).toLocaleDateString("en-US")}
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {Array.from({ length: 6 }, (_, i) => {
              const key = String(i + 1);
              const count = Number(guessDistribution?.[key] ?? 0);
              const pct = totalGuesses ? Math.max(8, Math.round((count / totalGuesses) * 100)) : 8;
              return (
                <DistBar
                  key={key}
                  guess={key}
                  count={count}
                  pct={pct}
                  dark={dark}
                  index={i}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
