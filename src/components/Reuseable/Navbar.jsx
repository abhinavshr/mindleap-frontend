import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { logoutUser } from "../../api/auth";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar({ dark = false, onToggleDark }) {
  const navigate        = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Logged out successfully.");
      setMenuOpen(false);
      navigate("/login");
    }
  };

  const navLink = `text-sm font-semibold transition-colors duration-150 ${
    dark
      ? "text-[#CBBEAC] hover:text-[#FFE9B0]"
      : "text-[#5A4636] hover:text-[#C64B2A]"
  }`;

  return (
    <nav className={`w-full border-b transition-colors duration-300 relative z-50 ${
      dark
        ? "bg-[#0F0B08] border-[#3A2A1C] shadow-[0_6px_0_#2B2017]"
        : "bg-[#FFF3DA] border-[#2B2017] shadow-[0_6px_0_#2B2017]"
    }`}>
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className={`text-lg sm:text-xl font-arcade tracking-wide select-none ${
            dark ? "text-[#F7EEDB]" : "text-[#2B2017]"
          }`}
        >
          MindLeap
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/"            className={navLink}>Home</Link>
          <Link to="/leaderboard" className={navLink}>Leaderboard</Link>

          {user ? (
            <>
              <Link to="/speed-game" className={navLink}>Speed Game</Link>
              <Link to="/profile"    className={navLink}>Profile</Link>
              <button
                onClick={handleLogout}
                className={`text-sm font-semibold px-4 py-1.5 rounded-md border-2 transition-colors duration-150 ${
                  dark
                    ? "text-[#F7EEDB] border-[#F7EEDB] hover:bg-[#1B120C]"
                    : "text-[#2B2017] border-[#2B2017] hover:bg-[#FFE9B0]"
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={navLink}>Login</Link>
              <Link
                to="/register"
                className={`text-sm font-semibold px-4 py-1.5 rounded-md border-2 transition-colors duration-150 ${
                  dark
                    ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
                    : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
                }`}
              >
                Register
              </Link>
            </>
          )}

          <button
            onClick={onToggleDark}
            className={`p-1.5 rounded-md border-2 transition-colors duration-150 ${
              dark
                ? "text-[#F2B84B] border-[#3A2A1C] hover:bg-[#1B120C]"
                : "text-[#C64B2A] border-[#2B2017] hover:bg-[#FFE9B0]"
            }`}
            aria-label="Toggle dark mode"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onToggleDark}
            className={`p-1.5 rounded-md border-2 transition-colors duration-150 ${
              dark
                ? "text-[#F2B84B] border-[#3A2A1C] hover:bg-[#1B120C]"
                : "text-[#C64B2A] border-[#2B2017] hover:bg-[#FFE9B0]"
            }`}
            aria-label="Toggle dark mode"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-1.5 rounded-md border-2 transition-colors duration-150 ${
              dark
                ? "text-[#F7EEDB] border-[#3A2A1C] hover:bg-[#1B120C]"
                : "text-[#2B2017] border-[#2B2017] hover:bg-[#FFE9B0]"
            }`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={`md:hidden border-t px-6 py-4 flex flex-col gap-4 ${
          dark ? "bg-[#0F0B08] border-[#3A2A1C]" : "bg-[#FFF3DA] border-[#2B2017]"
        }`}>
          <Link to="/"            className={navLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/leaderboard" className={navLink} onClick={() => setMenuOpen(false)}>Leaderboard</Link>

          {user ? (
            <>
              <Link to="/speed-game" className={navLink} onClick={() => setMenuOpen(false)}>Speed Game</Link>
              <Link to="/profile"    className={navLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              <button
                onClick={handleLogout}
                className={`text-sm font-semibold px-4 py-2 rounded-md border-2 transition-colors duration-150 text-left ${
                  dark
                    ? "text-[#F7EEDB] border-[#F7EEDB] hover:bg-[#1B120C]"
                    : "text-[#2B2017] border-[#2B2017] hover:bg-[#FFE9B0]"
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={navLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link
                to="/register"
                className={`text-sm font-semibold px-4 py-2 rounded-md border-2 transition-colors duration-150 text-center ${
                  dark
                    ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
                    : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}