import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import SpeedGamePage from './pages/SpeedGamePage'
import AllLevelsPage from "./pages/LevelPage";
import HallOfFamePage from "./pages/HallOfFrame";

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleToggleDark = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1B',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            padding: '10px 16px',
          },
          success: {
            iconTheme: { primary: '#6AAA64', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#E24B4A', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/login" element={<LoginPage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/register" element={<RegisterPage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/leaderboard" element={<LeaderboardPage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/profile" element={<ProfilePage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/speed-game" element={<SpeedGamePage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/levels" element={<AllLevelsPage dark={dark} onToggleDark={handleToggleDark} />} />
        <Route path="/hall-of-fame" element={<HallOfFamePage dark={dark} onToggleDark={handleToggleDark} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App