import { useState, useEffect, useMemo } from "react";
import { FaFire, FaTrophy, FaMedal, FaBolt } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
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
      className="w-7 h-7 border-4 border-[#6AAA64] border-t-transparent rounded-full"
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
    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
      active
        ? "bg-[#6AAA64] text-white"
        : dark
        ? "text-[#818384] hover:text-white"
        : "text-gray-400 hover:text-gray-700"
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
      className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <div className="flex flex-col items-center py-10 px-4">

        {/* Title */}
        <motion.h1
          className={`text-2xl font-bold tracking-widest uppercase mb-5 ${dark ? "text-white" : "text-gray-900"}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Leaderboard
        </motion.h1>

        {/* ── Tabs ── */}
        <motion.div
          className={`flex gap-2 p-1 rounded-xl mb-6 ${dark ? "bg-[#1A1A1B]" : "bg-gray-100"}`}
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
                    className={`w-full rounded-xl border px-6 py-4 mb-4 ${
                      dark ? "bg-[#1a2e1a] border-[#3A3A3C]" : "bg-green-50 border-green-200"
                    }`}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      Your stats
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        <div className={`text-2xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                          #{myStats.rank ?? "—"}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                            {currentUser.username}
                          </p>
                          <p className={`text-xs ${dark ? "text-[#818384]" : "text-gray-400"}`}>Global rank</p>
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
                className={`w-full border rounded-xl overflow-hidden ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
                  {["Rank", "Player", "Wins", "Streak", "Avg"].map((h, i) => (
                    <span key={h} className={`text-sm ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      {h}
                    </span>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {loadingClassic && <Spinner key="spinner" />}
                </AnimatePresence>

                <AnimatePresence>
                  {!loadingClassic && leaderboard.length === 0 && (
                    <motion.div
                      key="empty"
                      className={`text-center py-14 text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}
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
                        className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-4 items-center border-b last:border-b-0 ${
                          dark
                            ? `border-[#3A3A3C] ${isYou ? "bg-[#1a2e1a]" : "bg-[#121213]"}`
                            : `border-gray-100 ${isYou ? "bg-green-50" : "bg-white"}`
                        }`}
                        custom={index}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        initial="hidden" animate="visible" exit="exit"
                        layout
                        whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      >
                        <span className={`flex items-center ${dark ? "text-white" : "text-gray-900"}`}>
                          <RankDisplay rank={p.rank} />
                        </span>
                        <span className={`font-semibold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
                          {p.username}
                          {isYou && <YouBadge />}
                        </span>
                        <span className={`text-right ${dark ? "text-white" : "text-gray-900"}`}>{p.total_wins}</span>
                        <motion.div
                          className={`flex items-center justify-end gap-1.5 ${dark ? "text-white" : "text-gray-900"}`}
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
                        <span className={`text-right text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                          {p.avg_attempts} avg
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              <motion.p
                className={`text-xs mt-4 text-center ${dark ? "text-[#565758]" : "text-gray-300"}`}
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
                    className={`w-full rounded-xl border px-6 py-4 mb-4 ${
                      dark ? "bg-[#1a2e1a] border-[#3A3A3C]" : "bg-green-50 border-green-200"
                    }`}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      Your Speed Stats
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        <div className={`text-2xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                          #{mySpeedStats.rank ?? "—"}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                            {currentUser.username}
                          </p>
                          <p className={`text-xs ${dark ? "text-[#818384]" : "text-gray-400"}`}>Speed rank</p>
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
                          icon={<FaBolt className="text-[#C9B458]" size={14} />}
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
                className={`w-full border rounded-xl overflow-hidden ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Headers */}
                {/* Columns: Rank | Player | Best | Avg time | Wins | Win% | Streak | XP */}
                <div className={`grid grid-cols-[48px_1fr_70px_80px_60px_65px_70px_70px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
                  {["Rank", "Player", "Best", "Avg time", "Wins", "Win%", "Streak", "XP"].map((h, i) => (
                    <span key={h} className={`text-xs ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      {h}
                    </span>
                  ))}
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
                      className={`text-center py-14 text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}
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
                        className={`grid grid-cols-[48px_1fr_70px_80px_60px_65px_70px_70px] px-5 py-4 items-center border-b last:border-b-0 ${
                          dark
                            ? `border-[#3A3A3C] ${isYou ? "bg-[#1a2e1a]" : "bg-[#121213]"}`
                            : `border-gray-100 ${isYou ? "bg-green-50" : "bg-white"}`
                        }`}
                        custom={index}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        initial="hidden" animate="visible" exit="exit"
                        layout
                        whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      >
                        {/* Rank */}
                        <span className={`flex items-center ${dark ? "text-white" : "text-gray-900"}`}>
                          <RankDisplay rank={p.rank} />
                        </span>

                        {/* Username */}
                        <span className={`font-semibold flex items-center gap-2 text-sm ${dark ? "text-white" : "text-gray-900"}`}>
                          {p.username}
                          {isYou && <YouBadge />}
                        </span>

                        {/* Best time */}
                        <motion.div
                          className={`flex items-center justify-end gap-0.5 font-semibold text-sm ${dark ? "text-[#C9B458]" : "text-[#B59A00]"}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <FaBolt size={10} />
                          {p.best_time != null ? `${p.best_time}s` : "—"}
                        </motion.div>

                        {/* Avg time */}
                        <span className={`text-right text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                          {p.avg_time != null ? `${p.avg_time}s` : "—"}
                        </span>

                        {/* Wins */}
                        <span className={`text-right text-sm ${dark ? "text-white" : "text-gray-900"}`}>
                          {p.total_speed_wins}
                        </span>

                        {/* Win rate */}
                        <span className={`text-right text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                          {p.win_rate}%
                        </span>

                        {/* Streak */}
                        <motion.div
                          className={`flex items-center justify-end gap-1 ${dark ? "text-white" : "text-gray-900"}`}
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
                        <span className={`text-right text-sm font-semibold ${dark ? "text-[#6AAA64]" : "text-[#538d4e]"}`}>
                          {p.total_xp} XP
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              <motion.p
                className={`text-xs mt-4 text-center ${dark ? "text-[#565758]" : "text-gray-300"}`}
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