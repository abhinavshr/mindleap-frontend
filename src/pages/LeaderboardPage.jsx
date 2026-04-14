import { useState, useEffect } from "react";
import { FaFire, FaTrophy, FaMedal } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";
import { getLeaderboard } from "../api/leaderboard";
import toast from "react-hot-toast";

const RankDisplay = ({ rank }) => {
  if (rank === 1) return <FaTrophy className="text-[#C9B458]" size={16} />;
  if (rank === 2) return <FaMedal  className="text-[#9EA5A8]" size={16} />;
  if (rank === 3) return <FaMedal  className="text-[#CD7F32]" size={16} />;
  return <span className="font-semibold">{rank}</span>;
};

export default function LeaderboardPage() {
  const [dark, setDark]               = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getLeaderboard();
        setLeaderboard(res.data.leaderboard || []);
      } catch {
        toast.error("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="flex flex-col items-center py-10 px-4">
        <h1 className={`text-2xl font-bold tracking-widest uppercase mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
          Leaderboard
        </h1>

        <div className={`w-full max-w-2xl border rounded-xl overflow-hidden ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
          {/* Header */}
          <div className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
            {["Rank", "Player", "Wins", "Streak", "Avg"].map((h, i) => (
              <span
                key={h}
                className={`text-sm ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-[#6AAA64] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && leaderboard.length === 0 && (
            <div className={`text-center py-14 text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}>
              No players yet. Be the first!
            </div>
          )}

          {/* Rows */}
          {!loading && leaderboard.map((p) => {
            const isYou = p.username === currentUser?.username;
            return (
              <div
                key={p.rank}
                className={`grid grid-cols-[56px_1fr_80px_100px_110px] px-5 py-4 items-center border-b last:border-b-0 ${
                  dark
                    ? `border-[#3A3A3C] ${isYou ? "bg-[#1a2e1a]" : "bg-[#121213]"}`
                    : `border-gray-100 ${isYou ? "bg-green-50" : "bg-white"}`
                }`}
              >
                {/* Rank */}
                <span className={`flex items-center ${dark ? "text-white" : "text-gray-900"}`}>
                  <RankDisplay rank={p.rank} />
                </span>

                {/* Player */}
                <span className={`font-semibold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
                  {p.username}
                  {isYou && (
                    <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </span>

                {/* Wins */}
                <span className={`text-right ${dark ? "text-white" : "text-gray-900"}`}>
                  {p.total_wins}
                </span>

                {/* Streak */}
                <div className={`flex items-center justify-end gap-1.5 ${dark ? "text-white" : "text-gray-900"}`}>
                  <FaFire className="text-orange-500" size={15} />
                  {p.current_streak}
                </div>

                {/* Avg attempts */}
                <span className={`text-right text-sm ${dark ? "text-[#818384]" : "text-gray-400"}`}>
                  {p.avg_attempts} avg
                </span>
              </div>
            );
          })}
        </div>

        <p className={`text-xs mt-4 ${dark ? "text-[#565758]" : "text-gray-300"}`}>
          Top 20 players · Updates daily
        </p>
      </div>
    </div>
  );
}