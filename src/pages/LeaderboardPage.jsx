import { useState, useEffect, useMemo } from "react";
import { FaFire, FaTrophy, FaMedal, FaBolt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Reuseable/Navbar";
import { getLeaderboard, getMyRank } from "../api/leaderboard";
import { getSpeedLeaderboard, getMySpeedStats } from "../api/speedGame";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────
   Shared animation variants
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const slideIn = {
  hidden: { opacity: 0, y: -16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const popIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 22 },
  },
};

/* ─────────────────────────────────────────
   Rank icon
───────────────────────────────────────── */
const RankDisplay = ({ rank }) => {
  if (rank === 1)
    return (
      <motion.span variants={popIn} initial="hidden" animate="visible">
        <FaTrophy className="text-[#C9B458]" size={16} />
      </motion.span>
    );
  if (rank === 2)
    return (
      <motion.span variants={popIn} initial="hidden" animate="visible">
        <FaMedal className="text-[#9EA5A8]" size={16} />
      </motion.span>
    );
  if (rank === 3)
    return (
      <motion.span variants={popIn} initial="hidden" animate="visible">
        <FaMedal className="text-[#CD7F32]" size={16} />
      </motion.span>
    );
  return <span className="font-semibold">{rank}</span>;
};

/* ─────────────────────────────────────────
   Animated stat pill
───────────────────────────────────────── */
const StatPill = ({ label, value, icon, dark, delay }) => (
  <motion.div
    className="text-center"
    variants={fadeUp}
    custom={delay}
    whileHover={{ scale: 1.08 }}
  >
    <p className={`text-lg font-bold flex items-center gap-1 justify-center ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
      {icon}
      {value}
    </p>
    <p className={`text-xs ${dark ? "text-[#818384]" : "text-gray-400"}`}>{label}</p>
  </motion.div>
);

/* ─────────────────────────────────────────
   Spinner
───────────────────────────────────────── */
const Spinner = () => (
  <motion.div
    className="flex items-center justify-center py-16"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-7 h-7 border-4 border-[#2FAF74] border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  </motion.div>
);

/* ─────────────────────────────────────────
   Tab button
───────────────────────────────────────── */
const Tab = ({ active, onClick, children, dark }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-colors duration-150 ${
      active
        ? "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5]"
        : dark
        ? "text-[#CBBEAC] border-[#3A2A1C] hover:text-[#FFE9B0]"
        : "text-[#5A4636] border-[#2B2017] hover:text-[#C64B2A]"
    }`}
  >
    {children}
  </button>
);

/* ─────────────────────────────────────────
   You badge
───────────────────────────────────────── */
const YouBadge = () => (
  <AnimatePresence>
    <motion.span
      className="text-xs font-normal text-[#2B2017] bg-[#FFE9B0] px-2 py-0.5 rounded-full border border-[#2B2017]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      You
    </motion.span>
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function LeaderboardPage({ dark, onToggleDark }) {
  const [activeTab, setActiveTab]         = useState("classic"); // "classic" | "speed"
  const [leaderboard, setLeaderboard]     = useState([]);
  const [speedBoard, setSpeedBoard]       = useState([]);
  const [loadingClassic, setLoadingClassic] = useState(true);
  const [loadingSpeed, setLoadingSpeed]   = useState(false);
  const [speedLoaded, setSpeedLoaded]     = useState(false); // fetch once
  const [myStats, setMyStats]             = useState(null);
  const [mySpeedStats, setMySpeedStats]   = useState(null);
  const [speedStatsLoaded, setSpeedStatsLoaded] = useState(false);
  const shouldReduceMotion                = useReducedMotion();

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // ── Load classic leaderboard on mount ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingClassic(true);
        const [boardRes, meRes] = await Promise.allSettled([
          getLeaderboard(),
          currentUser ? getMyRank() : Promise.reject(),
        ]);
        if (boardRes.status === "fulfilled") {
          setLeaderboard(boardRes.value.data.leaderboard || []);
        } else {
          toast.error("Failed to load leaderboard.");
        }
        if (meRes.status === "fulfilled") {
          setMyStats(meRes.value.data);
        }
      } finally {
        setLoadingClassic(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load speed leaderboard on first tab switch ────────────────────────────
  useEffect(() => {
    if (activeTab !== "speed" || speedLoaded) return;
    const load = async () => {
      try {
        setLoadingSpeed(true);
        const res = await getSpeedLeaderboard();
        // res.data shape: { success: true, data: [...] }
        setSpeedBoard(res.data.data || []);
        setSpeedLoaded(true);
      } catch {
        toast.error("Failed to load speed leaderboard.");
      } finally {
        setLoadingSpeed(false);
      }
    };
    load();
  }, [activeTab, speedLoaded]);

  // ── Load speed stats on first speed tab switch ────────────────────────────
  useEffect(() => {
    if (activeTab !== "speed" || speedStatsLoaded || !currentUser) return;
    const load = async () => {
      try {
        const res = await getMySpeedStats();
        // res.data shape: { rank, stats, recentGames }
        setMySpeedStats(res.data);
        setSpeedStatsLoaded(true);
      } catch (err) {
        // Silently fail - user may not have played speed mode yet
        console.log("Speed stats not available:", err);
        setSpeedStatsLoaded(true);
      }
    };
    load();
  }, [activeTab, speedStatsLoaded, currentUser]);

  return (
    <div className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
      dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
    }`}>
      <Helmet>
        <title>Mindleap Leaderboard - Compete & Track Rankings</title>
        <meta name="description" content="View the Mindleap leaderboard and compete with players worldwide. Track your ranking and compare statistics." />
        <link rel="canonical" href="https://mindleap.live/leaderboard" />
        <meta property="og:title" content="Mindleap Leaderboard" />
        <meta property="og:description" content="Compete with players worldwide and track your ranking on the Mindleap leaderboard." />
        <meta property="og:url" content="https://mindleap.live/leaderboard" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <div className="flex flex-col items-center py-10 px-4 sm:px-6">

        {/* Title */}
        <motion.h1
          className={`text-2xl sm:text-3xl font-arcade tracking-wide uppercase mb-5 ${
            dark ? "text-[#F7EEDB]" : "text-[#2B2017]"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Leaderboard
        </motion.h1>

        {/* ── Tabs ── */}
        <motion.div
          className={`flex gap-2 p-1 rounded-xl mb-6 border-2 ${
            dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFF3DA] border-[#2B2017]"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tab active={activeTab === "classic"} onClick={() => setActiveTab("classic")} dark={dark}>
            <FaTrophy size={13} /> Classic
          </Tab>
          <Tab active={activeTab === "speed"} onClick={() => setActiveTab("speed")} dark={dark}>
            <FaBolt size={13} /> Speed
          </Tab>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════
              CLASSIC TAB
          ══════════════════════════════════════ */}
          {activeTab === "classic" && (
            <motion.div
              key="classic"
              className="w-full max-w-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* My rank card */}
              <AnimatePresence>
                {currentUser && myStats && (
                  <motion.div
                    className={`w-full arcade-panel px-6 py-4 mb-4 ${
                      dark ? "arcade-panel-dark text-[#F7EEDB]" : ""
                    }`}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                      dark ? "text-[#CBBEAC]" : "text-[#5A4636]"
                    }`}>
                      Your stats
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        <div className={`text-2xl font-bold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          #{myStats.rank ?? "—"}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                            {currentUser.username}
                          </p>
                          <p className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Global rank</p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                      >
                        <StatPill label="Wins"     value={myStats.total_wins ?? 0}      dark={dark} delay={0} />
                        <StatPill label="Games"    value={myStats.total_games ?? 0}     dark={dark} delay={1} />
                        <StatPill label="Win rate" value={`${myStats.win_rate ?? 0}%`}  dark={dark} delay={2} />
                        <StatPill label="Streak"   value={myStats.current_streak ?? 0}  dark={dark} delay={3}
                          icon={<FaFire className="text-orange-500" size={14} />} />
                        <StatPill label="Avg"      value={myStats.avg_attempts ?? "—"}  dark={dark} delay={4} />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Classic table */}
              <motion.div
                className={`w-full arcade-panel overflow-hidden ${
                  dark ? "arcade-panel-dark text-[#F7EEDB]" : ""
                }`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid grid-cols-[52px_1fr_70px] sm:grid-cols-[56px_1fr_80px_100px_110px] px-5 py-3 border-b border-[#2B2017]">
                  <span className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Rank</span>
                  <span className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Player</span>
                  <span className={`text-sm text-right ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Wins</span>
                  <span className={`text-sm text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Streak</span>
                  <span className={`text-sm text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Avg</span>
                </div>

                <AnimatePresence mode="wait">
                  {loadingClassic && <Spinner key="spinner" />}
                </AnimatePresence>

                <AnimatePresence>
                  {!loadingClassic && leaderboard.length === 0 && (
                    <motion.div
                      key="empty"
                      className={`text-center py-14 text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      No players yet. Be the first!
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!loadingClassic && leaderboard.map((p, index) => {
                    const isYou = p.username === currentUser?.username;
                    return (
                      <motion.div
                        key={p.rank}
                        className={`grid grid-cols-[52px_1fr_70px] sm:grid-cols-[56px_1fr_80px_100px_110px] px-5 py-4 items-center border-b last:border-b-0 border-[#2B2017] ${
                          isYou
                            ? (dark ? "bg-[#1B120C]" : "bg-[#FFE9B0]")
                            : (dark ? "bg-[#0F0B08]" : "bg-[#FFF7E8]")
                        }`}
                        custom={index}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        initial="hidden" animate="visible" exit="exit"
                        layout
                        whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      >
                        <span className={`flex items-center ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          <RankDisplay rank={p.rank} />
                        </span>
                        <div className={`min-w-0 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          <div className="flex items-center gap-2 font-semibold">
                            {isYou ? (
                              <span className="truncate">{p.username}</span>
                            ) : (
                              <Link
                                to={`/profile/${encodeURIComponent(p.username)}`}
                                className={`truncate hover:underline ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}
                              >
                                {p.username}
                              </Link>
                            )}
                            {isYou && <YouBadge />}
                          </div>
                          <div className={`sm:hidden text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                            Streak {p.current_streak} · Avg {p.avg_attempts}
                          </div>
                        </div>
                        <span className={`text-right ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>{p.total_wins}</span>
                        <motion.div
                          className={`hidden sm:flex items-center justify-end gap-1.5 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.span
                            animate={p.current_streak > 0 ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.4 }}
                          >
                            <FaFire className="text-orange-500" size={15} />
                          </motion.span>
                          {p.current_streak}
                        </motion.div>
                        <span className={`hidden sm:block text-right text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                          {p.avg_attempts} avg
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              <motion.p
                className={`text-xs mt-4 text-center ${dark ? "text-[#8B7A67]" : "text-[#6B5645]"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Top 20 players · Updates daily
              </motion.p>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              SPEED TAB
          ══════════════════════════════════════ */}
          {activeTab === "speed" && (
            <motion.div
              key="speed"
              className="w-full max-w-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* My Speed Stats Card */}
              <AnimatePresence>
                {currentUser && mySpeedStats && mySpeedStats.stats && (
                  <motion.div
                    className={`w-full arcade-panel px-6 py-4 mb-4 ${
                      dark ? "arcade-panel-dark text-[#F7EEDB]" : ""
                    }`}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                      dark ? "text-[#CBBEAC]" : "text-[#5A4636]"
                    }`}>
                      Your Speed Stats
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        <div className={`text-2xl font-bold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          #{mySpeedStats.rank ?? "—"}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                            {currentUser.username}
                          </p>
                          <p className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Speed rank</p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                      >
                        <StatPill 
                          label="Best time" 
                          value={mySpeedStats.stats.best_time ? `${mySpeedStats.stats.best_time}s` : "—"}
                          dark={dark} 
                          delay={0}
                          icon={<FaBolt className="text-[#F2B84B]" size={14} />}
                        />
                        <StatPill 
                          label="Avg time" 
                          value={mySpeedStats.stats.avg_time ? `${parseFloat(mySpeedStats.stats.avg_time).toFixed(1)}s` : "—"}
                          dark={dark} 
                          delay={1}
                        />
                        <StatPill 
                          label="Wins" 
                          value={mySpeedStats.stats.total_speed_wins ?? 0}
                          dark={dark} 
                          delay={2}
                        />
                        <StatPill 
                          label="Streak" 
                          value={mySpeedStats.stats.current_streak ?? 0}
                          dark={dark} 
                          delay={3}
                          icon={<FaFire className="text-orange-500" size={14} />}
                        />
                        <StatPill 
                          label="XP" 
                          value={mySpeedStats.stats.total_xp ?? 0}
                          dark={dark} 
                          delay={4}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className={`w-full arcade-panel overflow-hidden ${
                  dark ? "arcade-panel-dark text-[#F7EEDB]" : ""
                }`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Headers */}
                {/* Columns: Rank | Player | Best | Avg time | Wins | Win% | Streak | XP */}
                <div className="grid grid-cols-[44px_1fr_70px_60px] sm:grid-cols-[48px_1fr_70px_80px_60px_65px_70px_70px] px-5 py-3 border-b border-[#2B2017]">
                  <span className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Rank</span>
                  <span className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Player</span>
                  <span className={`text-xs text-right ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Best</span>
                  <span className={`text-xs text-right ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Wins</span>
                  <span className={`text-xs text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Avg time</span>
                  <span className={`text-xs text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Win%</span>
                  <span className={`text-xs text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Streak</span>
                  <span className={`text-xs text-right hidden sm:block ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>XP</span>
                </div>

                {/* Loading */}
                <AnimatePresence mode="wait">
                  {loadingSpeed && <Spinner key="speed-spinner" />}
                </AnimatePresence>

                {/* Empty */}
                <AnimatePresence>
                  {!loadingSpeed && speedBoard.length === 0 && (
                    <motion.div
                      key="speed-empty"
                      className={`text-center py-14 text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      No speed games yet. Be the first!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rows */}
                <AnimatePresence>
                  {!loadingSpeed && speedBoard.map((p, index) => {
                    const isYou = p.username === currentUser?.username;
                    return (
                      <motion.div
                        key={p.rank}
                        className={`grid grid-cols-[44px_1fr_70px_60px] sm:grid-cols-[48px_1fr_70px_80px_60px_65px_70px_70px] px-5 py-4 items-center border-b last:border-b-0 border-[#2B2017] ${
                          isYou
                            ? (dark ? "bg-[#1B120C]" : "bg-[#FFE9B0]")
                            : (dark ? "bg-[#0F0B08]" : "bg-[#FFF7E8]")
                        }`}
                        custom={index}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        initial="hidden" animate="visible" exit="exit"
                        layout
                        whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      >
                        {/* Rank */}
                        <span className={`flex items-center ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          <RankDisplay rank={p.rank} />
                        </span>

                        {/* Username */}
                        <div className={`min-w-0 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            {isYou ? (
                              <span className="truncate">{p.username}</span>
                            ) : (
                              <Link
                                to={`/profile/${encodeURIComponent(p.username)}`}
                                className={`truncate hover:underline ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}
                              >
                                {p.username}
                              </Link>
                            )}
                            {isYou && <YouBadge />}
                          </div>
                          <div className={`sm:hidden text-xs ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                            Best {p.best_time != null ? `${p.best_time}s` : "—"} · Win {p.win_rate}%
                          </div>
                        </div>

                        {/* Best time */}
                        <motion.div
                          className={`flex items-center justify-end gap-0.5 font-semibold text-sm ${dark ? "text-[#F2B84B]" : "text-[#C58B1D]"}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <FaBolt size={10} />
                          {p.best_time != null ? `${p.best_time}s` : "—"}
                        </motion.div>

                        {/* Wins */}
                        <span className={`text-right text-sm ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          {p.total_speed_wins}
                        </span>

                        {/* Avg time */}
                        <span className={`hidden sm:block text-right text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                          {p.avg_time != null ? `${p.avg_time}s` : "—"}
                        </span>

                        {/* Win rate */}
                        <span className={`hidden sm:block text-right text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                          {p.win_rate}%
                        </span>

                        {/* Streak */}
                        <motion.div
                          className={`hidden sm:flex items-center justify-end gap-1 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.span
                            animate={p.current_streak > 0 ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.4 }}
                          >
                            <FaFire className="text-orange-500" size={13} />
                          </motion.span>
                          <span className="text-sm">{p.current_streak}</span>
                        </motion.div>

                        {/* XP */}
                        <span className={`hidden sm:block text-right text-sm font-semibold ${dark ? "text-[#2FAF74]" : "text-[#1E7E52]"}`}>
                          {p.total_xp} XP
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              <motion.p
                className={`text-xs mt-4 text-center ${dark ? "text-[#8B7A67]" : "text-[#6B5645]"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Top 20 speed players · Updates after each game
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}