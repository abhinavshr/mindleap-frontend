import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import { fetchDailyInfo, submitGuessApi, checkAlreadyPlayed } from "../api/game";

export default function HomePage({ dark, onToggleDark }) {
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [keyStatuses, setKeyStatuses] = useState({});
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [wordLength, setWordLength] = useState(5);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revealedWord, setRevealedWord] = useState("");

  const showMessage = (msg, type = "info", duration = 2500) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), duration);
  };

  const GUEST_KEY = `guest_game_${new Date().toISOString().slice(0, 10)}`;

  const saveGuestSession = (guessArray, isOver, revealed = "") => {
    localStorage.setItem(GUEST_KEY, JSON.stringify({
      guesses: guessArray,
      gameOver: isOver,
      revealedWord: revealed,
    }));
  };

  const loadGuestSession = () => {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

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

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        const res = await fetchDailyInfo();
        const data = res.data;

        setMaxGuesses(data.maxGuesses);
        setWordLength(data.wordLength);
        setIsAuth(data.isAuth);

        if (!data.isAuth) {
          const session = loadGuestSession();
          if (session) {
            setGuesses(session.guesses || []);
            setKeyStatuses(buildKeyStatuses(session.guesses || []));
            if (session.gameOver) {
              setGameOver(true);
              if (session.revealedWord) setRevealedWord(session.revealedWord);
            }
            setLoading(false);
            return;
          }
        }

        if (data.isAuth && data.guesses?.length) {
          const restored = data.guesses.map((g) => ({
            word: g.guess.toUpperCase(),
            result: g.result,
          }));
          setGuesses(restored);
          setKeyStatuses(buildKeyStatuses(restored));
        }

        if (data.alreadyPlayed) {
          setGameOver(true);
          if (data.won) {
            showMessage("You already won today!", "win", 5000);
          } else {
            try {
              const playedRes = await checkAlreadyPlayed();
              const playedData = playedRes.data;
              if (playedData.word) {
                setRevealedWord(playedData.word.toUpperCase());
              }
            } catch {
              // Ignore reveal errors
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitGuess = useCallback(async () => {
    if (gameOver || submitting) return;
    if (currentGuess.length < wordLength) {
      showMessage("Not enough letters", "info");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitGuessApi(currentGuess.toLowerCase());
      const data = res.data;

      const newGuess = {
        word: currentGuess,
        result: data.result,
      };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (!data.isAuth) {
        saveGuestSession(newGuesses, false, "");
      }

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
        if (!data.isAuth) saveGuestSession(newGuesses, true, "");
      } else if (data.gameOver) {
        if (data.word) {
          setRevealedWord(data.word.toUpperCase());
          showMessage(`The word was ${data.word.toUpperCase()}`, "lose", 6000);
        }
        setGameOver(true);
      } else if (!data.isAuth && newGuesses.length >= maxGuesses) {
        showMessage("Game over! Login to track your stats.", "lose", 6000);
        setGameOver(true);
        saveGuestSession(newGuesses, true, "");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit guess.";
      if (msg.includes("5 letters")) showMessage("Word must be 5 letters", "info");
      else if (msg.includes("only letters")) showMessage("Letters only!", "info");
      else if (msg.includes("already won")) showMessage("You already won today!", "win");
      else if (msg.includes("all your guesses")) showMessage("No guesses left!", "lose");
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, guesses, gameOver, submitting, wordLength]);

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
    win: "bg-[#6AAA64] text-white",
    lose: "bg-[#787C7E] text-white",
    info: "bg-[#1A1A1B] text-white",
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${dark ? "bg-[#121213]" : "bg-white"}`}>
        <Navbar dark={dark} onToggleDark={onToggleDark} />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-[#6AAA64] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <AnimatePresence>
        {!isAuth && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#EAF4E6] border-b border-[#6AAA64] overflow-hidden"
          >
            <div className="px-4 py-2 text-center text-sm text-[#3B6D11]">
              You have <strong>5 guesses</strong> as a guest.{" "}
              <a href="/register" className="font-bold underline hover:text-[#6AAA64]">
                Register
              </a>{" "}
              to get 6 guesses, see the answer + leaderboard access.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastStyles[messageType]}`}>
              {messageType === "win" && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <FaTrophy size={14} />
                </motion.div>
              )}
              {messageType === "lose" && (
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <MdClose size={16} />
                </motion.div>
              )}
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-between py-8 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center"
        >
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />
        </motion.div>

        <AnimatePresence>
          {gameOver && revealedWord && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-sm font-medium ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}
              >
                The word was
              </motion.span>
              <div className="flex gap-1.5">
                {revealedWord.split("").map((letter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotateX: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="w-10 h-10 bg-[#787C7E] text-white flex items-center justify-center text-base font-bold rounded"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full flex justify-center px-2"
        >
          <Keyboard
            onKey={handleKey}
            keyStatuses={keyStatuses}
            disabled={submitting || gameOver}
          />
        </motion.div>
      </main>
    </div>
  );
}