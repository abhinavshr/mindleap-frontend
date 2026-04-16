import { useState, useEffect, useMemo } from "react";
import { FaFire, FaTrophy, FaMedal } from "react-icons/fa";
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
   Rank icon with entrance pop
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
    <p
      className={`text-lg font-bold flex items-center gap-1 justify-center ${
        dark ? "text-white" : "text-[#1A1A1B]"
      }`}
    >
      {icon}
      {value}
    </p>
    <p className={`text-xs ${dark ? "text-[#818384]" : "text-gray-400"}`}>
      {label}
    </p>
  </motion.div>
);

/* ─────────────────────────────────────────
   Spinning loader
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
   Main page
───────────────────────────────────────── */
export default function LeaderboardPage({ dark, onToggleDark }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);
  const shouldReduceMotion = useReducedMotion();

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

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        dark ? "bg-[#121213]" : "bg-white"
      }`}
    >
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <div className="flex flex-col items-center py-10 px-4">
        {/* Title */}
        <motion.h1
          className={`text-2xl font-bold tracking-widest uppercase mb-6 ${
            dark ? "text-white" : "text-gray-900"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Leaderboard
        </motion.h1>

        {/* ── My rank card ── */}
        <AnimatePresence>
          {currentUser && myStats && (
            <motion.div
              className={`w-full max-w-2xl rounded-xl border px-6 py-4 mb-4 ${
                dark
                  ? "bg-[#1a2e1a] border-[#3A3A3C]"
                  : "bg-green-50 border-green-200"
              }`}
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              layout
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                  dark ? "text-[#818384]" : "text-gray-400"
                }`}
              >
                Your stats
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Rank + username */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <div
                    className={`text-2xl font-bold ${
                      dark ? "text-white" : "text-[#1A1A1B]"
                    }`}
                  >
                    #{myStats.rank ?? "—"}
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-sm ${
                        dark ? "text-white" : "text-[#1A1A1B]"
                      }`}
                    >
                      {currentUser.username}
                    </p>
                    <p
                      className={`text-xs ${
                        dark ? "text-[#818384]" : "text-gray-400"
                      }`}
                    >
                      Global rank
                    </p>
                  </div>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  className="flex gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                >
                  <StatPill
                    label="Wins"
                    value={myStats.total_wins ?? 0}
                    dark={dark}
                    delay={0}
                  />
                  <StatPill
                    label="Games"
                    value={myStats.total_games ?? 0}
                    dark={dark}
                    delay={1}
                  />
                  <StatPill
                    label="Win rate"
                    value={`${myStats.win_rate ?? 0}%`}
                    dark={dark}
                    delay={2}
                  />
                  <StatPill
                    label="Streak"
                    value={myStats.current_streak ?? 0}
                    icon={<FaFire className="text-orange-500" size={14} />}
                    dark={dark}
                    delay={3}
                  />
                  <StatPill
                    label="Avg"
                    value={myStats.avg_attempts ?? "—"}
                    dark={dark}
                    delay={4}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Leaderboard table ── */}
        <motion.div
          className={`w-full max-w-2xl border rounded-xl overflow-hidden ${
            dark ? "border-[#3A3A3C]" : "border-gray-200"
          }`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Column headers */}
          <div
            className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-3 border-b ${
              dark ? "border-[#3A3A3C]" : "border-gray-200"
            }`}
          >
            {["Rank", "Player", "Wins", "Streak", "Avg"].map((h, i) => (
              <span
                key={h}
                className={`text-sm ${i >= 2 ? "text-right" : ""} ${
                  dark ? "text-[#818384]" : "text-gray-400"
                }`}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          <AnimatePresence mode="wait">
            {loading && <Spinner key="spinner" />}
          </AnimatePresence>

          {/* Empty state */}
          <AnimatePresence>
            {!loading && leaderboard.length === 0 && (
              <motion.div
                key="empty"
                className={`text-center py-14 text-sm ${
                  dark ? "text-[#818384]" : "text-gray-400"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No players yet. Be the first!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rows */}
          <AnimatePresence>
            {!loading &&
              leaderboard.map((p, index) => {
                const isYou = p.username === currentUser?.username;
                return (
                  <motion.div
                    key={p.rank}
                    className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-4 items-center border-b last:border-b-0 ${
                      dark
                        ? `border-[#3A3A3C] ${
                            isYou ? "bg-[#1a2e1a]" : "bg-[#121213]"
                          }`
                        : `border-gray-100 ${isYou ? "bg-green-50" : "bg-white"}`
                    }`}
                    custom={index}
                    variants={shouldReduceMotion ? {} : fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    whileHover={{
                      x: 4,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {/* Rank */}
                    <span
                      className={`flex items-center ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <RankDisplay rank={p.rank} />
                    </span>

                    {/* Username */}
                    <span
                      className={`font-semibold flex items-center gap-2 ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {p.username}
                      <AnimatePresence>
                        {isYou && (
                          <motion.span
                            className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          >
                            You
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    {/* Wins */}
                    <span
                      className={`text-right ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {p.total_wins}
                    </span>

                    {/* Streak */}
                    <motion.div
                      className={`flex items-center justify-end gap-1.5 ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.span
                        animate={
                          p.current_streak > 0
                            ? { scale: [1, 1.3, 1] }
                            : {}
                        }
                        transition={{
                          repeat: Infinity,
                          repeatDelay: 2,
                          duration: 0.4,
                        }}
                      >
                        <FaFire className="text-orange-500" size={15} />
                      </motion.span>
                      {p.current_streak}
                    </motion.div>

                    {/* Avg */}
                    <span
                      className={`text-right text-sm ${
                        dark ? "text-[#818384]" : "text-gray-400"
                      }`}
                    >
                      {p.avg_attempts} avg
                    </span>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className={`text-xs mt-4 ${
            dark ? "text-[#565758]" : "text-gray-300"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Top 20 players · Updates daily
        </motion.p>
      </div>
    </div>
  );
}