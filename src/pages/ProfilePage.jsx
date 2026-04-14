import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Reuseable/Navbar";
import { logoutUser } from "../api/auth";

const stats = [
  { label: "Total Games",    value: 156   },
  { label: "Win Rate",       value: "89%" },
  { label: "Current Streak", value: 5     },
  { label: "Max Streak",     value: 12    },
];

const distribution = [
  { guess: 1, count: 8  },
  { guess: 2, count: 32 },
  { guess: 3, count: 58 },
  { guess: 4, count: 34 },
  { guess: 5, count: 12 },
  { guess: 6, count: 4  },
];

export default function ProfilePage() {
  const [dark, setDark] = useState(false);
  const navigate        = useNavigate();

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "April 14, 2026";

  const maxCount = Math.max(...distribution.map((d) => d.count));

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Logged out successfully.");
      navigate("/login");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Page title */}
        <h1
          className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Profile
        </h1>

        {/* User card */}
        <div className={`rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${
          dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
        }`}>
          <div className="flex flex-col gap-1">
            <p className={`text-xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
              {user?.username ?? "Guest"}
            </p>
            <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              {user?.email ?? "—"}
            </p>
            <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              Joined {joinDate}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`text-sm font-medium px-5 py-2 rounded-lg border transition-colors duration-150 w-full sm:w-auto ${
              dark
                ? "border-[#3A3A3C] text-[#D7D7D7] hover:bg-[#2A2A2B]"
                : "border-[#D3D6DA] text-[#1A1A1B] hover:bg-[#F0F0F0]"
            }`}
          >
            Logout
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className={`rounded-2xl border px-4 py-5 flex flex-col items-center gap-1 ${
                dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
              }`}
            >
              <span className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                {value}
              </span>
              <span className={`text-xs text-center ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Guess distribution */}
        <div className={`rounded-2xl border px-4 sm:px-6 py-5 sm:py-6 ${
          dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#E0E0E0]"
        }`}>
          <h2 className={`text-lg font-bold mb-5 ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
            Guess Distribution
          </h2>
          <div className="flex flex-col gap-3">
            {distribution.map(({ guess, count }) => {
              const pct = Math.max((count / maxCount) * 100, 8);
              return (
                <div key={guess} className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-4 text-right ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                    {guess}
                  </span>
                  <div className="flex-1">
                    <div
                      className="bg-[#6AAA64] rounded flex items-center justify-end pr-3 h-9 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-white text-sm font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}