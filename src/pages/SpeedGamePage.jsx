import { useState, useEffect, useRef, useCallback } from "react";
import { FaBolt, FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import { startSpeedGame, submitSpeedGuess } from "../api/speedGame";
import toast from "react-hot-toast";

export default function SpeedGamePage({ dark = false, onToggleDark }) {
  const [gameState, setGameState]       = useState("idle");   // idle | loading | playing | won | lost | timeup
  const [sessionId, setSessionId]       = useState(null);
  const [timeLeft, setTimeLeft]         = useState(60);
  const [timeLimit, setTimeLimit]       = useState(60);
  const [wordLength, setWordLength]     = useState(5);
  const [maxGuesses, setMaxGuesses]     = useState(6);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses]           = useState([]);
  const [keyStatuses, setKeyStatuses]   = useState({});
  const [message, setMessage]           = useState("");
  const [messageType, setMessageType]   = useState("info");
  const [xpEarned, setXpEarned]         = useState(0);
  const [timeTaken, setTimeTaken]       = useState(0);
  const [revealedWord, setRevealedWord] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const timerRef = useRef(null);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState("timeup");
          showMessage("Time's up!", "lose", 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const showMessage = (msg, type = "info", duration = 2500) => {
    setMessage(msg);
    setMessageType(type);
    if (duration > 0) setTimeout(() => setMessage(""), duration);
  };

  const buildKeyStatuses = (prev, word, result) => {
    const priority = { correct: 3, present: 2, absent: 1 };
    const updated  = { ...prev };
    word.split("").forEach((letter, i) => {
      const s = result[i];
      if (!updated[letter] || priority[s] > priority[updated[letter]]) {
        updated[letter] = s;
      }
    });
    return updated;
  };

  // ── Start game ────────────────────────────────────────────────────────────
  const startGame = async () => {
    try {
      setGameState("loading");
      const res  = await startSpeedGame();
      const data = res.data;
      // data shape: { sessionId, timeLeft, wordLength, maxGuesses, resumed }

      setSessionId(data.sessionId);
      setTimeLeft(data.timeLeft);
      setTimeLimit(data.timeLeft);
      setWordLength(data.wordLength);
      setMaxGuesses(data.maxGuesses);
      setCurrentGuess("");
      setGuesses([]);
      setKeyStatuses({});
      setMessage("");
      setXpEarned(0);
      setTimeTaken(0);
      setRevealedWord("");
      setGameState("playing");

      if (data.resumed) {
        showMessage("Session resumed!", "info", 2000);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to start the game.";
      toast.error(msg);
      setGameState("idle");
    }
  };

  // ── Submit guess ──────────────────────────────────────────────────────────
  const submitGuess = useCallback(async () => {
    if (gameState !== "playing" || submitting) return;
    if (currentGuess.length < wordLength) {
      showMessage("Not enough letters", "info");
      return;
    }

    try {
      setSubmitting(true);
      const attempts = guesses.length + 1; // this guess is attempt #N
      const res  = await submitSpeedGuess(sessionId, currentGuess.toLowerCase(), attempts);
      const data = res.data;

      // ── Time expired on the server side ──────────────────────────
      if (data.timeUp) {
        clearInterval(timerRef.current);
        if (data.secret) setRevealedWord(data.secret.toUpperCase());
        setGameState("timeup");
        showMessage("Time's up!", "lose", 0);
        return;
      }

      // ── Append guess to board ─────────────────────────────────────
      const newGuess   = { word: currentGuess, result: data.result };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      setKeyStatuses((prev) => buildKeyStatuses(prev, currentGuess, data.result));

      // ── Won ───────────────────────────────────────────────────────
      if (data.won) {
        clearInterval(timerRef.current);
        setTimeTaken(data.timeTaken);
        setXpEarned(data.xpEarned);
        setGameState("won");
        showMessage("You won!", "win", 0);
        return;
      }

      // ── Lost — used all guesses ───────────────────────────────────
      if (data.lost) {
        clearInterval(timerRef.current);
        if (data.secret) setRevealedWord(data.secret.toUpperCase());
        setGameState("lost");
        showMessage(`The word was ${data.secret?.toUpperCase()}`, "lose", 0);
        return;
      }

      // ── Still playing — sync server timeLeft ──────────────────────
      if (data.timeLeft !== undefined) {
        setTimeLeft(data.timeLeft);
      }

    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.includes("5 letters"))         showMessage("Word must be 5 letters", "info");
      else if (msg.includes("only letters")) showMessage("Letters only!", "info");
      else if (msg.includes("Session already ended")) {
        showMessage("Session expired.", "lose", 0);
        setGameState("timeup");
      }
      else toast.error(msg || "Failed to submit guess.");
    } finally {
      setSubmitting(false);
    }
  }, [currentGuess, guesses, gameState, submitting, wordLength, sessionId]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKey = useCallback((key) => {
    if (gameState !== "playing" || submitting) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "BACKSPACE" || key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameState, submitting, wordLength, submitGuess]);

  useEffect(() => {
    const handler = (e) =>
      handleKey(e.key === "Backspace" ? "Backspace" : e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  // ── Timer color ───────────────────────────────────────────────────────────
  const timerColor = timeLeft > 20 ? "text-[#6AAA64]" : timeLeft > 10 ? "text-[#C9B458]" : "text-red-500";
  const timerBg    = timeLeft > 20 ? "bg-[#6AAA64]"   : timeLeft > 10 ? "bg-[#C9B458]"   : "bg-red-500";

  const toastStyles = {
    win:  "bg-[#6AAA64] text-white",
    lose: "bg-[#787C7E] text-white",
    info: "bg-[#1A1A1B] text-white",
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      {/* Toast */}
      {message && gameState !== "won" && gameState !== "lost" && gameState !== "timeup" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastStyles[messageType]}`}>
            <span>{message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center py-6 px-4 gap-5">

        {/* ── IDLE / LOADING ─────────────────────────────────────────── */}
        {(gameState === "idle" || gameState === "loading") && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 max-w-sm text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dark ? "bg-[#1A1A1B]" : "bg-[#EAF4E6]"}`}>
              <FaBolt className="text-[#C9B458]" size={28} />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold mb-2 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Speed Game
              </h1>
              <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                Guess the word in <strong>60 seconds</strong>. Faster wins = more XP.
                You get <strong>6 guesses</strong>.
              </p>
            </div>
            <div className={`w-full rounded-xl border px-5 py-4 flex flex-col gap-2 text-sm ${dark ? "bg-[#1A1A1B] border-[#3A3A3C] text-[#818384]" : "bg-[#F9F9F9] border-[#E0E0E0] text-[#787C7E]"}`}>
              <div className="flex justify-between"><span>Time limit</span><span className="font-semibold">60 seconds</span></div>
              <div className="flex justify-between"><span>Max guesses</span><span className="font-semibold">6</span></div>
              <div className="flex justify-between"><span>XP reward</span><span className="font-semibold text-[#C9B458]">Up to 100 XP</span></div>
            </div>
            <button
              onClick={startGame}
              disabled={gameState === "loading"}
              className="w-full py-3 rounded-xl bg-[#6AAA64] hover:bg-[#538d4e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {gameState === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting…
                </>
              ) : (
                <><FaBolt size={16} /> Start Game</>
              )}
            </button>
          </div>
        )}

        {/* ── PLAYING ───────────────────────────────────────────────── */}
        {gameState === "playing" && (
          <>
            {/* Timer bar */}
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>Time left</span>
                <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timeLeft}s</span>
              </div>
              <div className={`w-full h-2 rounded-full ${dark ? "bg-[#3A3A3C]" : "bg-[#E0E0E0]"}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${timerBg}`}
                  style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Board */}
            <div className="flex-1 flex items-center justify-center">
              <Board
                guesses={guesses}
                currentGuess={currentGuess}
                maxGuesses={maxGuesses}
                wordLength={wordLength}
              />
            </div>

            {/* Keyboard */}
            <div className="w-full flex justify-center">
              <Keyboard onKey={handleKey} keyStatuses={keyStatuses} disabled={submitting} />
            </div>
          </>
        )}

        {/* ── END SCREEN (won / lost / timeup) ──────────────────────── */}
        {(gameState === "won" || gameState === "lost" || gameState === "timeup") && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 max-w-sm text-center w-full">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              gameState === "won" ? "bg-[#EAF4E6]" : dark ? "bg-[#2A2A2B]" : "bg-[#F3F3F3]"
            }`}>
              {gameState === "won"
                ? <FaTrophy className="text-[#C9B458]" size={28} />
                : <MdClose  className="text-[#787C7E]"  size={32} />
              }
            </div>

            {/* Title + subtitle */}
            <div>
              <h2
                className={`text-2xl font-bold mb-1 ${dark ? "text-white" : "text-[#1A1A1B]"}`}
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {gameState === "won"    ? "You Won!"    :
                 gameState === "timeup" ? "Time's Up!"  : "Better luck!"}
              </h2>
              <p className={`text-sm ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
                {gameState === "won"
                  ? `Solved in ${timeTaken}s with ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}`
                  : revealedWord
                    ? <>The word was <span className={`font-bold ${dark ? "text-white" : "text-[#1A1A1B]"}`}>{revealedWord}</span></>
                    : "Better luck next time!"
                }
              </p>
            </div>

            {/* XP badge — only on win */}
            {gameState === "won" && (
              <div className="flex items-center gap-2 bg-[#EAF4E6] border border-[#6AAA64] rounded-xl px-5 py-3">
                <FaBolt className="text-[#C9B458]" size={18} />
                <span className="text-lg font-bold text-[#538d4e]">+{xpEarned} XP</span>
              </div>
            )}

            {/* Board (frozen) */}
            <Board
              guesses={guesses}
              currentGuess=""
              maxGuesses={maxGuesses}
              wordLength={wordLength}
            />

            {/* Play again */}
            <button
              onClick={startGame}
              className="w-full py-3 rounded-xl bg-[#6AAA64] hover:bg-[#538d4e] text-white font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <FaBolt size={16} /> Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}   