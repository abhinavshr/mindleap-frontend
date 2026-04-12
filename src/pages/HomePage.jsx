import { useState, useEffect, useCallback } from "react";

import toast from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import { fetchDailyInfo, submitGuessApi, checkAlreadyPlayed } from "../api/game";

export default function HomePage() {
  const [dark, setDark]               = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses]         = useState([]);
  const [gameOver, setGameOver]       = useState(false);
  const [message, setMessage]         = useState("");
  const [messageType, setMessageType] = useState("info");
  const [keyStatuses, setKeyStatuses] = useState({});
  const [maxGuesses, setMaxGuesses]   = useState(5);   // 5 guest / 6 auth
  const [wordLength, setWordLength]   = useState(5);
  const [isAuth, setIsAuth]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [revealedWord, setRevealedWord] = useState("");


  const showMessage = (msg, type = "info", duration = 2500) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), duration);
  };

  // ── Build keyStatuses from existing guesses ───────────────────────────────
  const buildKeyStatuses = (guessArray) => {
    const priority = { correct: 3, present: 2, absent: 1 };
    const statuses = {};
    guessArray.forEach(({ word, result }) => {
      word.toUpperCase().split("").forEach((letter, i) => {
        const s = result[i];
        if (!statuses[letter] || priority[s] > priority[statuses[letter]]) {
          statuses[letter] = s;
        }
      });
    });
    return statuses;
  };

  // ── Fetch daily info on mount ─────────────────────────────────────────────
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        const res  = await fetchDailyInfo();
        const data = res.data;

        setMaxGuesses(data.maxGuesses);
        setWordLength(data.wordLength);
        setIsAuth(data.isAuth);

        // Restore in-progress guesses for auth users
        if (data.isAuth && data.guesses?.length) {
          const restored = data.guesses.map((g) => ({
            word:   g.guess.toUpperCase(),
            result: g.result,
          }));
          setGuesses(restored);
          setKeyStatuses(buildKeyStatuses(restored));
        }

        // Game already finished today
        if (data.alreadyPlayed) {
          setGameOver(true);
          if (data.won) {
            showMessage("You already won today!", "win", 5000);
          } else {
            // Fetch the revealed word from already-played endpoint
            try {
              const playedRes = await checkAlreadyPlayed();
              const playedData = playedRes.data;
              if (playedData.word) {
                setRevealedWord(playedData.word.toUpperCase());
              }
            } catch {
              // ignore
            }
            showMessage("You've used all your guesses today.", "lose", 5000);
          }
        }
      } catch {
        toast.error("Failed to load today's game. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, []);

  // ── Submit a guess ────────────────────────────────────────────────────────
  const submitGuess = useCallback(async () => {
    if (gameOver || submitting) return;
    if (currentGuess.length < wordLength) {
      showMessage("Not enough letters", "info");
      return;
    }

    try {
      setSubmitting(true);
      const res  = await submitGuessApi(currentGuess.toLowerCase());
      const data = res.data;

      console.log("API response:", data);
      console.log("result array:", data.result);

      const newGuess = {
        word:   currentGuess,
        result: data.result,
      };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      // Update key colors
      const priority = { correct: 3, present: 2, absent: 1 };
      setKeyStatuses((prev) => {
        const updated = { ...prev };
        currentGuess.split("").forEach((letter, i) => {
          const s = data.result[i];
          if (!updated[letter] || priority[s] > priority[updated[letter]]) {
            updated[letter] = s;
          }
        });
        return updated;
      });

      if (data.won) {
        showMessage("You won!", "win", 4000);
        setGameOver(true);
      } else if (data.gameOver) {
        // Auth user — server explicitly says game over
        if (data.word) {
          setRevealedWord(data.word.toUpperCase());
          showMessage(`The word was ${data.word.toUpperCase()}`, "lose", 6000);
        }
        setGameOver(true);
      } else if (!data.isAuth && newGuesses.length >= maxGuesses) {
        // Guest — track locally since API doesn't send gameOver
        showMessage("Login to see the answer!", "lose", 6000);
        setGameOver(true);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit guess.";
      // Map known API errors to friendly messages
      if (msg.includes("5 letters"))       showMessage("Word must be 5 letters", "info");
      else if (msg.includes("only letters")) showMessage("Letters only!", "info");
      else if (msg.includes("already won")) showMessage("You already won today!", "win");
      else if (msg.includes("all your guesses")) showMessage("No guesses left!", "lose");
      else                                  toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [gameOver, submitting, currentGuess, wordLength, guesses, maxGuesses]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKey = useCallback((key) => {
    if (gameOver || submitting) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "BACKSPACE" || key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameOver, submitting, wordLength, submitGuess]);

  useEffect(() => {
    const handler = (e) =>
      handleKey(e.key === "Backspace" ? "Backspace" : e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const toastStyles = {
    win:  "bg-[#6AAA64] text-white",
    lose: "bg-[#787C7E] text-white",
    info: "bg-[#1A1A1B] text-white",
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${dark ? "bg-[#121213]" : "bg-white"}`}>
        <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#6AAA64] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      {/* Guest banner */}
      {!isAuth && (
        <div className="w-full bg-[#EAF4E6] border-b border-[#6AAA64] px-4 py-2 text-center text-sm text-[#3B6D11]">
          You have <strong>5 guesses</strong> as a guest.{" "}
          <a href="/register" className="font-bold underline hover:text-[#6AAA64]">
            Register
          </a>{" "}
          to get 6 guesses + leaderboard access.
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          message ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastStyles[messageType]}`}>
          {messageType === "win"  && <FaTrophy size={14} />}
          {messageType === "lose" && <MdClose  size={16} />}
          <span>{message}</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-between py-8 gap-6">
        <div className="flex-1 flex items-center justify-center">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />
        </div>
        {/* Revealed word after losing */}
        {gameOver && revealedWord && (
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
              The word was
            </span>
            <div className="flex gap-1.5">
              {revealedWord.split("").map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-[#787C7E] text-white flex items-center justify-center text-base font-bold rounded"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full flex justify-center px-2">
          <Keyboard
            onKey={handleKey}
            keyStatuses={keyStatuses}
            disabled={submitting || gameOver}
          />
        </div>
      </main>
    </div>
  );
}