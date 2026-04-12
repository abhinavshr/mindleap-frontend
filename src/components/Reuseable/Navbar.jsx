import { useState } from "react";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar({ user = null }) {
  const [dark, setDark] = useState(false);

  return (
    <nav
      className={`w-full border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${
        dark
          ? "bg-[#121213] border-[#3A3A3C]"
          : "bg-[#F9F9F9] border-[#D3D6DA]"
      }`}
    >
      {/* Logo */}
      <a
        href="/"
        className={`text-lg font-bold tracking-tight select-none ${
          dark ? "text-white" : "text-[#1A1A1B]"
        }`}
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        MindLeap
      </a>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Nav links */}
        <a
          href="/leaderboard"
          className={`text-sm font-medium transition-colors duration-150 hover:text-[#6AAA64] ${
            dark ? "text-[#818384]" : "text-[#787C7E]"
          }`}
        >
          Leaderboard
        </a>

        {user ? (
          <>
            <a
              href="/profile"
              className={`text-sm font-medium transition-colors duration-150 hover:text-[#6AAA64] ${
                dark ? "text-[#818384]" : "text-[#787C7E]"
              }`}
            >
              Profile
            </a>
            <button
              className="text-sm font-medium text-white bg-[#6AAA64] hover:bg-[#538d4e] px-4 py-1.5 rounded-md transition-colors duration-150"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              className={`text-sm font-medium transition-colors duration-150 hover:text-[#6AAA64] ${
                dark ? "text-[#818384]" : "text-[#787C7E]"
              }`}
            >
              Login
            </a>
            <a
              href="/register"
              className="text-sm font-medium text-white bg-[#6AAA64] hover:bg-[#538d4e] px-4 py-1.5 rounded-md transition-colors duration-150"
            >
              Register
            </a>
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className={`p-1.5 rounded-md transition-colors duration-150 ${
            dark
              ? "text-[#C9B458] hover:bg-[#1A1A1B]"
              : "text-[#C9B458] hover:bg-[#EFEFEF]"
          }`}
          aria-label="Toggle dark mode"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}