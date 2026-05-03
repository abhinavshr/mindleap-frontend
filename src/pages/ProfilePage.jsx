import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { FaBolt, FaStar } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { logoutUser, getMe } from "../api/auth";
import { getMyLevel, getMyBadges, getMyRewards } from "../api/level";

// ── Simple in-memory cache — survives re-renders, clears on page refresh ──────
let _profileCache = null;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce || typeof value !== "number") return;
    let startTime = null;
    const duration = 600;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, shouldReduce]);

  if (shouldReduce || typeof value !== "number") return <>{value}</>;
  return <>{display}</>;
}

const StatCard = ({ label, value, index, dark }) => {
  const isNumeric = typeof value === "number";
  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`rounded-2xl border px-4 py-5 flex flex-col items-center gap-1 ${
        dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
      }`}
    >
      <span className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
        {isNumeric ? <AnimatedNumber value={value} /> : value}
      </span>
      <span className={`text-xs text-center ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
        {label}
      </span>
    </motion.div>
  );
};

const DistBar = ({ guess, count, pct, dark, index }) => (
  <motion.div
    className="flex items-center gap-3"
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
  >
    <span className={`text-sm font-medium w-4 text-right ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
      {guess}
    </span>
    <div className="flex-1">
      <motion.div
        className="bg-[#6AAA64] rounded flex items-center justify-end pr-3 h-9"
        initial={{ width: "8%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="text-white text-sm font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.06 }}
        >
          {count}
        </motion.span>
      </motion.div>
    </div>
  </motion.div>
);

const BADGE_EMOJIS = {
  first_game:    "👣",
  first_win:     "🏆",
  speed_demon:   "⚡",
  big_brain:     "🧠",
  on_fire:       "🔥",
  unstoppable:   "💥",
  level_10:      "⭐",
  level_25:      "🌟",
  level_50:      "👑",
  century:       "💯",
  perfectionist: "✨",
  speedster:     "🚀",
};

const REWARD_TYPE_LABEL = {
  theme:       "Theme",
  title:       "Title",
  badge_frame: "Badge Frame",
};

const REWARD_TYPE_EMOJI = {
  theme:       "🎨",
  title:       "🏷️",
  badge_frame: "🖼️",
};

export default function ProfilePage({ dark, onToggleDark }) {
  const [loading, setLoading]         = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [levelData, setLevelData]     = useState(null);
  const [badges, setBadges]           = useState([]);
  const [rewards, setRewards]           = useState([]);
  const navigate                      = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Use cache for getMe — avoids re-hitting rate limit on revisit
        const profilePromise = _profileCache
          ? Promise.resolve({ data: _profileCache })
          : getMe().then((res) => { _profileCache = res.data; return res; });

        const [profileRes, levelRes, badgesRes, rewardsRes] = await Promise.allSettled([
          profilePromise,
          getMyLevel(),
          getMyBadges(),
          getMyRewards(),
        ]);

        if (profileRes.status  === "fulfilled") setProfileData(profileRes.value.data);
        if (levelRes.status    === "fulfilled") setLevelData(levelRes.value.data);
        if (badgesRes.status   === "fulfilled") setBadges(badgesRes.value.data.badges || []);
        if (rewardsRes.status  === "fulfilled") setRewards(rewardsRes.value.data.rewards || []);
        if (profileRes.status  === "rejected")  toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const joinDate = profileData?.profile?.joined_at
    ? new Date(profileData.profile.joined_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  const stats = [
    { label: "Total Games",    value: profileData?.stats?.total_games    ?? 0    },
    { label: "Win Rate",       value: profileData?.stats ? `${Math.round(profileData.stats.win_rate)}%` : "0%" },
    { label: "Current Streak", value: profileData?.stats?.current_streak ?? 0    },
    { label: "Max Streak",     value: profileData?.stats?.max_streak     ?? 0    },
  ];

  const distribution = Object.entries(profileData?.guess_distribution ?? {})
    .map(([guess, count]) => ({ guess: parseInt(guess), count }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    finally {
      _profileCache = null; // clear cache on logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Logged out successfully.");
      navigate("/login");
    }
  };

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

        {/* Title */}
        <motion.h1
          className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Profile
        </motion.h1>

        {/* User card */}
        <motion.div
          className={`rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${
            dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex flex-col gap-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className={`text-xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
              {profileData?.profile?.username ?? "Guest"}
            </p>
            <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              {profileData?.profile?.email ?? "—"}
            </p>
            <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              Joined {joinDate}
            </p>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            className={`text-sm font-medium px-5 py-2 rounded-lg border transition-colors duration-150 w-full sm:w-auto ${
              dark
                ? "border-[#3A3A3C] text-[#D7D7D7] hover:bg-[#2A2A2B]"
                : "border-[#D3D6DA] text-[#1A1A1B] hover:bg-[#F0F0F0]"
            }`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {stats.map(({ label, value }, i) => (
            <StatCard key={label} label={label} value={value} index={i} dark={dark} />
          ))}
        </div>

        {/* Level card */}
        {levelData && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-6 py-5 mb-5 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-[#2A2A2B]" : "bg-[#EAF4E6]"}`}>
                  <FaStar className="text-[#C9B458]" size={14} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                    Level {levelData.currentLevel} — {levelData.currentTitle}
                  </p>
                  <p className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                    {levelData.totalXp} total XP
                  </p>
                </div>
              </div>
              {levelData.isMaxLevel ? (
                <span className="text-xs font-semibold text-[#C9B458] bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                  Max Level
                </span>
              ) : (
                <span className={`text-xs font-semibold ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                  {levelData.xpToNextLevel} XP to go
                </span>
              )}
            </div>

            {!levelData.isMaxLevel && (
              <>
                <div className={`w-full h-3 rounded-full overflow-hidden ${dark ? "bg-[#3A3A3C]" : "bg-[#E0E0E0]"}`}>
                  <motion.div
                    className="h-3 rounded-full bg-[#C9B458]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${levelData.progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>{levelData.currentLevelXp} XP</span>
                  <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>{levelData.nextLevelXp} XP</span>
                </div>
              </>
            )}

            {levelData.recentXpLog?.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${dark ? "border-[#3A3A3C]" : "border-[#F0F0F0]"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                  Recent XP
                </p>
                <div className="flex flex-col gap-1.5">
                  {levelData.recentXpLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                        {log.description ?? log.reason ?? "Game"}
                      </span>
                      <span className="text-xs font-semibold text-[#C9B458] flex items-center gap-1">
                        <FaBolt size={9} />+{log.xp_amount ?? log.xp_earned ?? log.amount ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-6 py-5 mb-5 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.40, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>Badges</h2>
              <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                {badges.filter(b => b.earned).length} / {badges.length} earned
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <motion.div
                  key={b.key}
                  whileHover={{ scale: 1.05 }}
                  title={b.description}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                    b.earned
                      ? dark ? "bg-[#1E2D1E] border-[#3A3A3C]" : "bg-[#EAF4E6] border-[#6AAA64]"
                      : dark ? "bg-[#1A1A1B] border-[#2A2A2B] opacity-40" : "bg-[#F9F9F9] border-[#E0E0E0] opacity-40"
                  }`}
                >
                  <span className="text-2xl">{b.earned ? (BADGE_EMOJIS[b.key] ?? "🏅") : "🔒"}</span>
                  <span className={`text-xs font-semibold text-center leading-tight ${
                    b.earned ? dark ? "text-white" : "text-[#1A1A1B]" : dark ? "text-[#818384]" : "text-[#787C7E]"
                  }`}>
                    {b.name}
                  </span>
                  {b.earned && b.earned_at && (
                    <span className={`text-[10px] ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                      {new Date(b.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rewards */}
        {rewards.length > 0 && (
          <motion.div
            className={`rounded-2xl border px-4 sm:px-6 py-5 mb-5 ${
              dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                Rewards
              </h2>
              <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                {rewards.length} unlocked
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {rewards.map((r, i) => (
                <motion.div
                  key={r.id ?? i}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    dark ? "bg-[#1E2D1E] border-[#3A3A3C]" : "bg-[#EAF4E6] border-[#6AAA64]"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {REWARD_TYPE_EMOJI[r.reward_type] ?? "🎁"}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                        {r.reward_value}
                      </p>
                      <p className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                        {REWARD_TYPE_LABEL[r.reward_type] ?? r.reward_type}
                      </p>
                    </div>
                  </div>
                  {r.unlocked_at && (
                    <span className={`text-xs ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                      {new Date(r.unlocked_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Guess distribution */}
        <motion.div
          className={`rounded-2xl border px-4 sm:px-6 py-5 sm:py-6 ${
            dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2
            className={`text-lg font-bold mb-5 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Guess Distribution
          </motion.h2>
          {distribution.length === 0 ? (
            <p className={`text-sm text-center py-4 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              No games played yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {distribution.map(({ guess, count }, i) => {
                  const pct = Math.max((count / maxCount) * 100, 8);
                  return <DistBar key={guess} guess={guess} count={count} pct={pct} dark={dark} index={i} />;
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}