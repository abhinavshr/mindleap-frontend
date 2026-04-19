import { useState, useEffect, useMemo } from "react";
import { FaFire, FaTrophy, FaMedal, FaBolt } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import Navbar from "../components/Reuseable/Navbar";
import { getLeaderboard, getMyRank } from "../api/leaderboard";
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
   Static speed leaderboard data
───────────────────────────────────────── */
const STATIC_SPEED_LEADERBOARD = [
  { rank: 1, username: "flashword",  best_time: 8,  total_wins: 42, avg_attempts: 2.1, xp: 980 },
  { rank: 2, username: "speedking",  best_time: 11, total_wins: 38, avg_attempts: 2.4, xp: 870 },
  { rank: 3, username: "quiksolve",  best_time: 14, total_wins: 35, avg_attempts: 2.7, xp: 760 },
  { rank: 4, username: "letterblitz",best_time: 17, total_wins: 31, avg_attempts: 3.0, xp: 640 },
  { rank: 5, username: "wordracer",  best_time: 21, total_wins: 28, avg_attempts: 3.2, xp: 590 },
  { rank: 6, username: "typestrike", best_time: 24, total_wins: 24, avg_attempts: 3.5, xp: 510 },
  { rank: 7, username: "swiftlex",   best_time: 27, total_wins: 20, avg_attempts: 3.8, xp: 430 },
  { rank: 8, username: "neonword",   best_time: 31, total_wins: 17, avg_attempts: 4.0, xp: 360 },
  { rank: 9, username: "fastglyph",  best_time: 35, total_wins: 14, avg_attempts: 4.2, xp: 290 },
  { rank: 10,username: "zaptile",    best_time: 40, total_wins: 11, avg_attempts: 4.5, xp: 210 },
];

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
   Main page
───────────────────────────────────────── */
export default function LeaderboardPage({ dark, onToggleDark }) {
  const [activeTab, setActiveTab]     = useState("classic"); // "classic" | "speed"
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [myStats, setMyStats]         = useState(null);
  const shouldReduceMotion            = useReducedMotion();

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speedData = STATIC_SPEED_LEADERBOARD;

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
                        <StatPill label="Wins"     value={myStats.total_wins ?? 0}       dark={dark} delay={0} />
                        <StatPill label="Games"    value={myStats.total_games ?? 0}      dark={dark} delay={1} />
                        <StatPill label="Win rate" value={`${myStats.win_rate ?? 0}%`}   dark={dark} delay={2} />
                        <StatPill label="Streak"   value={myStats.current_streak ?? 0}   dark={dark} delay={3}
                          icon={<FaFire className="text-orange-500" size={14} />} />
                        <StatPill label="Avg"      value={myStats.avg_attempts ?? "—"}   dark={dark} delay={4} />
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
                {/* Headers */}
                <div className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
                  {["Rank", "Player", "Wins", "Streak", "Avg"].map((h, i) => (
                    <span key={h} className={`text-sm ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      {h}
                    </span>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {loading && <Spinner key="spinner" />}
                </AnimatePresence>

                <AnimatePresence>
                  {!loading && leaderboard.length === 0 && (
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
                  {!loading && leaderboard.map((p, index) => {
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
                          <AnimatePresence>
                            {isYou && (
                              <motion.span
                                className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                You
                              </motion.span>
                            )}
                          </AnimatePresence>
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
              {/* Speed table */}
              <motion.div
                className={`w-full border rounded-xl overflow-hidden ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Headers */}
                <div className={`grid grid-cols-[56px_1fr_90px_90px_90px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
                  {["Rank", "Player", "Best", "Wins", "XP"].map((h, i) => (
                    <span key={h} className={`text-sm ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                <AnimatePresence>
                  {speedData.map((p, index) => {
                    const isYou = p.username === currentUser?.username;
                    return (
                      <motion.div
                        key={p.rank}
                        className={`grid grid-cols-[56px_1fr_90px_90px_90px] px-5 py-4 items-center border-b last:border-b-0 ${
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
                        <span className={`font-semibold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
                          {p.username}
                          <AnimatePresence>
                            {isYou && (
                              <motion.span
                                className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                You
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>

                        {/* Best time */}
                        <motion.div
                          className={`flex items-center justify-end gap-1 ${dark ? "text-[#C9B458]" : "text-[#B59A00]"}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <FaBolt size={11} />
                          <span className="font-semibold text-sm">{p.best_time}s</span>
                        </motion.div>

                        {/* Wins */}
                        <span className={`text-right ${dark ? "text-white" : "text-gray-900"}`}>
                          {p.total_wins}
                        </span>

                        {/* XP */}
                        <span className={`text-right text-sm font-semibold ${dark ? "text-[#6AAA64]" : "text-[#538d4e]"}`}>
                          {p.xp} XP
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Static badge */}
              <motion.p
                className={`text-xs mt-3 text-center ${dark ? "text-[#565758]" : "text-gray-300"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ⚡ Speed rankings coming soon · Static preview
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer note */}
        {activeTab === "classic" && (
          <motion.p
            className={`text-xs mt-4 ${dark ? "text-[#565758]" : "text-gray-300"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Top 20 players · Updates daily
          </motion.p>
        )}
      </div>
    </div>
  );
}