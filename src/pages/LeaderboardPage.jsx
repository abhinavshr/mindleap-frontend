import { useState } from "react";
import { FaFire } from "react-icons/fa";
import Navbar from "../components/Reuseable/Navbar";

const players = [
  { rank: 1, name: "WordMaster", wins: 234, streak: 12, isYou: false },
  { rank: 2, name: "PuzzlePro",  wins: 198, streak: 8,  isYou: false },
  { rank: 3, name: "You",        wins: 156, streak: 5,  isYou: true  },
  { rank: 4, name: "BrainGame",  wins: 142, streak: 3,  isYou: false },
  { rank: 5, name: "QuickThink", wins: 128, streak: 7,  isYou: false },
  { rank: 6, name: "SmartPlay",  wins: 115, streak: 2,  isYou: false },
  { rank: 7, name: "LogicKing",  wins: 98,  streak: 4,  isYou: false },
  { rank: 8, name: "MindBender", wins: 87,  streak: 1,  isYou: false },
];

export default function Leaderboard() {
  const [dark, setDark] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="flex flex-col items-center py-10 px-4">
        <h1 className={`text-2xl font-bold tracking-widest uppercase mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
          Leaderboard
        </h1>

        <div className={`w-full max-w-2xl border rounded-xl overflow-hidden ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
          {/* Header */}
          <div className={`grid grid-cols-[56px_1fr_80px_100px] px-5 py-3 border-b ${dark ? "border-[#3A3A3C]" : "border-gray-200"}`}>
            {["Rank", "Player", "Wins", "Streak"].map((h, i) => (
              <span
                key={h}
                className={`text-sm ${i >= 2 ? "text-right" : ""} ${dark ? "text-[#818384]" : "text-gray-400"}`}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {players.map((p) => (
            <div
              key={p.rank}
              className={`grid grid-cols-[56px_1fr_80px_100px] px-5 py-4 items-center border-b last:border-b-0 ${
                dark
                  ? `border-[#3A3A3C] ${p.isYou ? "bg-[#1a2e1a]" : "bg-[#121213]"}`
                  : `border-gray-100 ${p.isYou ? "bg-green-50" : "bg-white"}`
              }`}
            >
              <span className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{p.rank}</span>

              <span className={`font-semibold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
                {p.name}
                {p.isYou && (
                  <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </span>

              <span className={`text-right ${dark ? "text-white" : "text-gray-900"}`}>{p.wins}</span>

              <div className={`flex items-center justify-end gap-1.5 ${dark ? "text-white" : "text-gray-900"}`}>
                <FaFire className="text-orange-500" size={15} />
                {p.streak}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}