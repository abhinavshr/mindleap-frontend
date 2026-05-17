import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTrophy, FaMedal } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getLeaderboard } from "../api/Level.js";

const RANK_CONFIG = {
  1: { color: "#F2B84B", bg: "#F2B84B1A", label: "🥇", size: "text-2xl" },
  2: { color: "#B5B5B5", bg: "#B5B5B51A", label: "🥈", size: "text-xl"  },
  3: { color: "#C58B1D", bg: "#C58B1D1A", label: "🥉", size: "text-xl"  },
};

const defaultRank = { color: "#5A4636", bg: "transparent", label: null, size: "text-base" };

function getRank(rank) {
  return RANK_CONFIG[rank] ?? defaultRank;
}

export default function HallOfFamePage({ dark, onToggleDark }) {
  const [entries, setEntries] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLeaderboard();
        setEntries(res.data.leaderboard ?? []);
        setTotal(res.data.total ?? 0);
      } catch {
        // silently fail — empty state handles it
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find current user from localStorage to highlight their row
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.username ?? null; }
    catch { return null; }
  })();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0F0B08]" : "arcade-bg"}`}>
        <motion.div
          className="w-8 h-8 border-4 border-[#F2B84B] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);

  return (
    <div className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
      dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
    }`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.button
            onClick={() => navigate("/profile")}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shrink-0 ${
              dark
                ? "bg-[#1B120C] border-[#3A2A1C] text-[#CBBEAC] hover:text-[#F7EEDB] hover:bg-[#2A1B12]"
                : "bg-[#FFF3DA] border-[#2B2017] text-[#5A4636] hover:text-[#2B2017] hover:bg-[#FFE9B0]"
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
              className={`text-2xl sm:text-3xl font-arcade ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}
            >
              Hall of Fame
            </h1>
            <p className={`text-xs mt-0.5 ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
              {total} player{total !== 1 ? "s" : ""} ranked
            </p>
          </motion.div>
        </div>

        {entries.length === 0 ? (
          <motion.div
            className="rounded-2xl border px-6 py-16 text-center arcade-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaTrophy className="mx-auto mb-3 text-[#F2B84B] opacity-60" size={36} />
            <p className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
              No players ranked yet. Be the first!
            </p>
          </motion.div>
        ) : (
          <>
            {/* ── Top 3 podium cards ── */}
            {top3.length > 0 && (
              <motion.div
                className="grid grid-cols-3 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                {/* Reorder visually: 2nd | 1st | 3rd */}
                {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
                  if (!entry) return <div key={visualIdx} />;
                  const cfg        = getRank(entry.rank);
                  const isFirst    = entry.rank === 1;
                  const isMe       = currentUser && entry.username === currentUser;

                  return (
                    <motion.div
                      key={entry.rank}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 ${
                        isFirst
                          ? dark ? "border-[#F2B84B] bg-[#1B120C]" : "border-[#2B2017] bg-[#FFE9B0]"
                          : dark ? "border-[#3A2A1C] bg-[#0F0B08]" : "border-[#2B2017] bg-[#FFF7E8]"
                      } ${isFirst ? "col-span-1 mt-0 sm:-mt-3" : ""}`}
                      initial={{ opacity: 0, y: isFirst ? 30 : 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: isFirst ? 0.15 : 0.2 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                      {/* Medal emoji */}
                      <span className={`${cfg.size} leading-none`}>{cfg.label}</span>

                      {/* Avatar circle */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `2px solid ${cfg.color}40` }}
                      >
                        {entry.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Username */}
                      <div className="text-center">
                        <p
                          className={`text-xs font-bold truncate max-w-20 ${
                            isMe
                              ? "text-[#2FAF74]"
                              : dark ? "text-[#F7EEDB]" : "text-[#2B2017]"
                          }`}
                        >
                          {entry.username}
                          {isMe && <span className="ml-1 text-[9px]">(you)</span>}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                          #{entry.rank}
                        </p>
                      </div>

                      {/* Badge count */}
                      {entry.badge_count > 0 && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                        >
                          {entry.badge_count} badge{entry.badge_count !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* Glow ring for #1 */}
                      {isFirst && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-[#F2B84B]"
                          animate={{ opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── Rest of the list ── */}
            {rest.length > 0 && (
              <motion.div
                className="rounded-2xl border overflow-hidden arcade-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
              >
                {rest.map((entry, i) => {
                  const isMe  = currentUser && entry.username === currentUser;
                  const isLast = i === rest.length - 1;

                  return (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.3 + i * 0.04 }}
                      className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                        isMe
                          ? dark ? "bg-[#1B120C]" : "bg-[#FFE9B0]"
                          : dark ? "hover:bg-[#1B120C]" : "hover:bg-[#FFF3DA]"
                      } ${!isLast ? "border-b border-[#2B2017]" : ""}`}
                    >
                      {/* Rank number */}
                      <span
                        className={`text-sm font-bold w-7 text-right shrink-0 ${
                          dark ? "text-[#CBBEAC]" : "text-[#5A4636]"
                        }`}
                      >
                        {entry.rank}
                      </span>

                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          dark ? "bg-[#1B120C] text-[#CBBEAC]" : "bg-[#FFF3DA] text-[#5A4636]"
                        }`}
                      >
                        {entry.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Username */}
                      <p className={`flex-1 text-sm font-semibold truncate ${
                        isMe
                          ? "text-[#2FAF74]"
                          : dark ? "text-[#F7EEDB]" : "text-[#2B2017]"
                      }`}>
                        {entry.username}
                        {isMe && (
                          <span className={`ml-2 text-[10px] font-semibold ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                            (you)
                          </span>
                        )}
                      </p>

                      {/* Badge count */}
                      {entry.badge_count > 0 && (
                        <span className={`text-xs shrink-0 ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                          {entry.badge_count} 🏅
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}

        <div className="h-10" />
      </main>
    </div>
  );
}