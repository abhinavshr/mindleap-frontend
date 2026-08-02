import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { FaBolt, FaStar, FaGift, FaChevronRight, FaChevronDown, FaChevronUp, FaTrophy, FaFire, FaLock, FaCheckCircle } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getMe } from "../api/auth";
import { getMyLevel, getMyBadges, getMyRewards } from "../api/Level";

let _profileCache = null;

const BADGES_INITIAL_COUNT = 12;

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

const txt  = (dark) => ({ color: dark ? "#F7EEDB" : "#2B2017" });
const sub  = (dark) => ({ color: dark ? "#CBBEAC" : "#7A5C3E" });
const gold = ()     => ({ color: "#F2B84B" });

const panelStyle = (dark) => ({
  background:   dark ? "#1B120C" : "#FFF8EC",
  border:       `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
  borderRadius: "16px",
});

const StatCard = ({ label, value, index, dark }) => {
  const isNumeric = typeof value === "number";
  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="px-4 py-5 flex flex-col items-center gap-1"
      style={panelStyle(dark)}
    >
      <span style={txt(dark)} className="text-2xl sm:text-3xl font-bold">
        {isNumeric ? <AnimatedNumber value={value} /> : value}
      </span>
      <span style={sub(dark)} className="text-xs text-center">{label}</span>
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
    <span style={sub(dark)} className="text-sm font-medium w-4 text-right">{guess}</span>
    <div className="flex-1">
      <motion.div
        className="bg-[#2FAF74] rounded flex items-center justify-end pr-3 h-9"
        initial={{ width: "8%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="text-[#0B1F16] text-sm font-bold"
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

const REWARD_TYPE_CONFIG = {
  xp_boost:    { emoji: "⚡", label: "XP Boost",   color: "#C9B458" },
  theme:       { emoji: "🎨", label: "Theme",       color: "#6AAA64" },
  avatar:      { emoji: "🖼️", label: "Avatar",      color: "#5B8BDF" },
  title:       { emoji: "📜", label: "Title",       color: "#B06AB3" },
  badge_frame: { emoji: "🖼️", label: "Badge Frame", color: "#E07B54" },
};

const RewardCard = ({ reward, dark, index }) => {
  const config = REWARD_TYPE_CONFIG[reward.reward_type] ?? {
    emoji: "🎁", label: reward.reward_type ?? "Reward", color: "#6AAA64",
  };
  const unlockedDate = reward.unlocked_at
    ? new Date(reward.unlocked_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={panelStyle(dark)}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xl"
        style={{ backgroundColor: `${config.color}22` }}>
        {config.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p style={txt(dark)} className="text-sm font-semibold truncate">
          {reward.name ?? reward.reward_key ?? "Reward"}
        </p>
        <p style={sub(dark)} className="text-xs truncate">
          {reward.description ?? config.label}
        </p>
      </div>
      {unlockedDate && (
        <span style={sub(dark)} className="text-xs shrink-0">{unlockedDate}</span>
      )}
    </motion.div>
  );
};

const BadgeCard = ({ b, dark, index }) => {
  const [hovered, setHovered] = useState(false);
  const earnedDate = b.earned && b.earned_at
    ? new Date(b.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <motion.div
      className="relative"
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default"
        style={{
          background:   b.earned ? (dark ? "#1B120C" : "#FFE9B0") : (dark ? "#1B120C" : "#FFF3DA"),
          border:       `2px solid ${b.earned ? (dark ? "#F2B84B" : "#2B2017") : (dark ? "#3A2A1C" : "#2B2017")}`,
          opacity:      b.earned ? 1 : 0.45,
        }}
      >
        <span className="text-2xl">{b.earned ? (BADGE_EMOJIS[b.key] ?? "🏅") : "🔒"}</span>
        <span style={{ color: b.earned ? (dark ? "#F7EEDB" : "#2B2017") : (dark ? "#CBBEAC" : "#5A4636") }}
          className="text-xs font-semibold text-center leading-tight">
          {b.name}
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
              background:   dark ? "#1B120C" : "#FFF3DA",
              border:       `1px solid ${dark ? "#3A2A1C" : "#2B2017"}`,
            }}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${dark ? "#3A2A1C" : "#2B2017"}`,
              }}
            />
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base leading-none">{BADGE_EMOJIS[b.key] ?? "🏅"}</span>
              <p style={txt(dark)} className="text-xs font-bold leading-tight truncate">{b.name}</p>
              {b.earned
                ? <FaCheckCircle size={10} className="text-[#2FAF74] shrink-0 ml-auto" />
                : <FaLock size={9} style={sub(dark)} className="shrink-0 ml-auto" />
              }
            </div>
            <p style={sub(dark)} className="text-[11px] leading-snug">
              {b.earned ? "✅ " : "🎯 "}{b.description}
            </p>
            {earnedDate && (
              <p style={sub(dark)} className="text-[10px] mt-1.5">Earned {earnedDate}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NavButton = ({ onClick, icon: Icon, iconColor, label, dark }) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150"
    style={{
      border:     `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
      color:      dark ? "#F7EEDB" : "#2B2017",
      background: dark ? "#1B120C" : "#FFF8EC",
    }}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    <span className="flex items-center gap-2">
      <Icon size={12} style={{ color: iconColor }} />
      {label}
    </span>
    <FaChevronRight size={11} style={sub(dark)} />
  </motion.button>
);

export default function ProfilePage({ dark, onToggleDark }) {
  const [loading, setLoading]         = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [levelData, setLevelData]     = useState(null);
  const [badges, setBadges]           = useState([]);
  const [rewards, setRewards]         = useState([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const navigate                      = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profilePromise = _profileCache
          ? Promise.resolve({ data: _profileCache })
          : getMe().then((res) => { _profileCache = res.data; return res; });
        const [profileRes, levelRes, badgesRes, rewardsRes] = await Promise.allSettled([
          profilePromise, getMyLevel(), getMyBadges(), getMyRewards(),
        ]);
        if (profileRes.status === "fulfilled") setProfileData(profileRes.value.data);
        if (levelRes.status   === "fulfilled") setLevelData(levelRes.value.data);
        if (badgesRes.status  === "fulfilled") setBadges(badgesRes.value.data.badges || []);
        if (rewardsRes.status === "fulfilled") setRewards(rewardsRes.value.data.rewards || []);
        if (profileRes.status === "rejected")  toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const joinDate = profileData?.profile?.joined_at
    ? new Date(profileData.profile.joined_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const stats = [
    { label: "Total Games",    value: profileData?.stats?.total_games    ?? 0 },
    { label: "Win Rate",       value: profileData?.stats ? `${Math.round(profileData.stats.win_rate)}%` : "0%" },
    { label: "Current Streak", value: profileData?.stats?.current_streak ?? 0 },
    { label: "Max Streak",     value: profileData?.stats?.max_streak     ?? 0 },
  ];

  const distribution = Object.entries(profileData?.guess_distribution ?? {})
    .map(([guess, count]) => ({ guess: parseInt(guess), count }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Only render a limited slice of badges until the user asks to see more.
  // This avoids mounting (and animating) all 45 badge cards + their hover
  // tooltip logic on first paint.
  const visibleBadges = showAllBadges ? badges : badges.slice(0, BADGES_INITIAL_COUNT);
  const hasMoreBadges  = badges.length > BADGES_INITIAL_COUNT;

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

  const divider = { borderTop: `1px solid ${dark ? "#3A2A1C" : "#D4B896"}` };

  return (
    <div className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
      dark ? "bg-[#0F0B08]" : "arcade-bg"
    }`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* User card */}
        <motion.div
          className="px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col gap-1"
          style={panelStyle(dark)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="flex flex-col gap-1"
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p style={txt(dark)} className="text-xl font-bold">
              {profileData?.profile?.username ?? "Guest"}
            </p>
            <p style={sub(dark)} className="text-sm">{profileData?.profile?.email ?? "—"}</p>
            <p style={sub(dark)} className="text-sm">Joined {joinDate}</p>
          </motion.div>


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
            className="px-4 sm:px-6 py-5 mb-5"
            style={panelStyle(dark)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}>
                  <FaStar style={gold()} size={14} />
                </div>
                <div>
                  <p style={txt(dark)} className="text-sm font-bold">
                    Level {levelData.currentLevel} — {levelData.currentTitle}
                  </p>
                  <p style={sub(dark)} className="text-xs">{levelData.totalXp} total XP</p>
                </div>
              </div>
              {levelData.isMaxLevel ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ color: "#2B2017", background: "#FFE9B0", border: "1px solid #2B2017" }}>
                  Max Level
                </span>
              ) : (
                <span style={sub(dark)} className="text-xs font-semibold">
                  {levelData.xpToNextLevel} XP to go
                </span>
              )}
            </div>

            {!levelData.isMaxLevel && (
              <>
                <div className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: dark ? "#3A2A1C" : "#F3DFC2" }}>
                  <motion.div
                    className="h-3 rounded-full"
                    style={{ background: "#F2B84B" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${levelData.progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span style={sub(dark)} className="text-xs">{levelData.currentLevelXp} XP</span>
                  <span style={sub(dark)} className="text-xs">{levelData.nextLevelXp} XP</span>
                </div>
              </>
            )}

            {levelData.recentXpLog?.length > 0 && (
              <div className="mt-4 pt-4" style={divider}>
                <p style={sub(dark)} className="text-xs font-semibold uppercase tracking-wide mb-2">Recent XP</p>
                <div className="flex flex-col gap-1.5">
                  {levelData.recentXpLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span style={sub(dark)} className="text-xs">
                        {log.description ?? log.reason ?? "Game"}
                      </span>
                      <span style={gold()} className="text-xs font-semibold flex items-center gap-1">
                        <FaBolt size={9} />+{log.xp_amount ?? log.xp_earned ?? log.amount ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`mt-4 flex flex-col gap-2 ${levelData.recentXpLog?.length > 0 ? "pt-4" : ""}`}
              style={levelData.recentXpLog?.length > 0 ? divider : {}}
            >
              <NavButton onClick={() => navigate("/missions")}     icon={FaFire}   iconColor="#E07B54" label="Missions"        dark={dark} />
              <NavButton onClick={() => navigate("/levels")}       icon={FaStar}   iconColor="#F2B84B" label="View All Levels" dark={dark} />
              <NavButton onClick={() => navigate("/hall-of-fame")} icon={FaTrophy} iconColor="#F2B84B" label="Hall of Fame"    dark={dark} />
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            className="px-4 sm:px-6 py-5 mb-5 overflow-visible"
            style={panelStyle(dark)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.40, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 style={txt(dark)} className="text-lg font-bold">Badges</h2>
              <span style={sub(dark)} className="text-xs">
                {badges.filter(b => b.earned).length} / {badges.length} earned
              </span>
            </div>
            <p style={sub(dark)} className="text-xs mb-4">Hover a badge to see how to earn it</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {visibleBadges.map((b, i) => <BadgeCard key={b.key} b={b} dark={dark} index={i} />)}
            </div>

            {hasMoreBadges && (
              <div className="flex justify-center mt-4 pt-4" style={divider}>
                <motion.button
                  onClick={() => setShowAllBadges((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{
                    border:     `2px solid ${dark ? "#3A2A1C" : "#D4B896"}`,
                    color:      dark ? "#F7EEDB" : "#2B2017",
                    background: dark ? "#1B120C" : "#FFF3DA",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {showAllBadges ? (
                    <>Show less <FaChevronUp size={10} /></>
                  ) : (
                    <>Show {badges.length - BADGES_INITIAL_COUNT} more <FaChevronDown size={10} /></>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Rewards */}
        {rewards.length > 0 && (
          <motion.div
            className="px-4 sm:px-6 py-5 mb-5"
            style={panelStyle(dark)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}>
                  <FaGift className="text-[#2FAF74]" size={14} />
                </div>
                <h2 style={txt(dark)} className="text-lg font-bold">Rewards</h2>
              </div>
              <span style={sub(dark)} className="text-xs">{rewards.length} unlocked</span>
            </div>
            <div className="flex flex-col gap-2">
              {rewards.map((reward, i) => (
                <RewardCard key={reward.id ?? i} reward={reward} dark={dark} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Guess distribution */}
        <motion.div
          className="px-4 sm:px-6 py-5 sm:py-6"
          style={panelStyle(dark)}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2
            style={txt(dark)}
            className="text-lg font-bold mb-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Guess Distribution
          </motion.h2>
          {distribution.length === 0 ? (
            <p style={sub(dark)} className="text-sm text-center py-4">No games played yet.</p>
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