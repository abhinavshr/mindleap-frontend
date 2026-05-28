import { useState, useEffect, useRef, useCallback } from "react";
import { FaBolt, FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import { startSpeedGame, submitSpeedGuess, expireSpeedSession } from "../api/speedGame";
import toast from "react-hot-toast";
import { Howl, Howler } from "howler";

export default function SpeedGamePage({ dark = false, onToggleDark }) {
  const [gameState, setGameState]       = useState("idle");
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
  const timeUpHandledRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const winSoundRef = useRef(null);

  const initWinSound = () => {
    if (winSoundRef.current) return;
    winSoundRef.current = new Howl({
      src: ["/sounds/success.mp3"],
      volume: 0.7,
      preload: true,
    });
  };

  useEffect(() => {
    return () => {
      if (winSoundRef.current) {
        winSoundRef.current.unload();
        winSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      initWinSound();
      if (Howler.ctx && Howler.ctx.state !== "running") {
        await Howler.ctx.resume();
      }
      const sound = winSoundRef.current;
      if (!sound) return;
      const previousVolume = sound.volume();
      sound.volume(0);
      const id = sound.play();
      setTimeout(() => {
        sound.stop(id);
        sound.volume(previousVolume);
      }, 50);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const extractReveal = (data) => data?.secret || data?.word || data?.answer || "";

  const handleTimeUp = useCallback(async () => {
    if (timeUpHandledRef.current) return;
    timeUpHandledRef.current = true;
    try {
      if (!sessionId) return;
      const res  = await expireSpeedSession(sessionId);
      const data = res.data;
      const reveal = extractReveal(data);
      if (reveal) setRevealedWord(reveal.toUpperCase());
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to expire session.";
      toast.error(msg);
    }
  }, [sessionId]);

  useEffect(() => {
    if (gameState !== "playing") {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          setGameState("timeup");
          showMessage("Time's up!", "lose", 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, handleTimeUp]);

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

  const startGame = async () => {
    try {
      setGameState("loading");
      const res  = await startSpeedGame();
      const data = res.data;
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
      timeUpHandledRef.current = false;
      setGameState("playing");
      if (data.resumed) showMessage("Session resumed!", "info", 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to start the game.";
      toast.error(msg);
      setGameState("idle");
    }
  };

  const submitGuess = useCallback(async () => {
    if (gameState !== "playing" || submitting) return;
    if (currentGuess.length < wordLength) {
      showMessage("Not enough letters", "info");
      return;
    }
    const guessWord = currentGuess;
    try {
      setSubmitting(true);
      setGuesses((prev) => [
        ...prev,
        { word: guessWord, result: Array(wordLength).fill("pending") },
      ]);
      setCurrentGuess("");
      const attempts = guesses.length + 1;
      const res  = await submitSpeedGuess(sessionId, guessWord.toLowerCase(), attempts);
      const data = res.data;

      if (data.timeUp) {
        clearInterval(timerRef.current);
        timeUpHandledRef.current = true;
        const reveal = extractReveal(data);
        if (reveal) setRevealedWord(reveal.toUpperCase());
        setGuesses((prev) => prev.slice(0, -1));
        setGameState("timeup");
        showMessage("Time's up!", "lose", 0);
        return;
      }

      const newGuess = { word: guessWord, result: data.result };
      setGuesses((prev) => {
        const next = [...prev];
        next[next.length - 1] = newGuess;
        return next;
      });
      setKeyStatuses((prev) => buildKeyStatuses(prev, guessWord, data.result));

      if (data.won) {
        clearInterval(timerRef.current);
        setTimeTaken(data.timeTaken);
        setXpEarned(data.xpEarned);
        setGameState("won");
        initWinSound();
        if (Howler.ctx && Howler.ctx.state !== "running") {
          await Howler.ctx.resume();
        }
        if (winSoundRef.current) winSoundRef.current.play();
        showMessage("You won!", "win", 0);
        return;
      }

      if (data.lost) {
        clearInterval(timerRef.current);
        const reveal = extractReveal(data);
        if (reveal) setRevealedWord(reveal.toUpperCase());
        setGameState("lost");
        showMessage(`The word was ${reveal ? reveal.toUpperCase() : ""}`, "lose", 0);
        return;
      }

      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
    } catch (err) {
      setGuesses((prev) => prev.slice(0, -1));
      if (guessWord) setCurrentGuess(guessWord);
      const msg = err?.response?.data?.message || "";
      if (msg.includes("5 letters"))         showMessage("Word must be 5 letters", "info");
      else if (msg.includes("only letters")) showMessage("Letters only!", "info");
      else if (msg.includes("Session already ended")) {
        showMessage("Session expired.", "lose", 0);
        setGameState("timeup");
      } else toast.error(msg || "Failed to submit guess.");
    } finally {
      setSubmitting(false);
    }
  }, [currentGuess, guesses, gameState, submitting, wordLength, sessionId]);

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

  const timerColor = timeLeft > 20 ? "text-[#2FAF74]" : timeLeft > 10 ? "text-[#F2B84B]" : "text-[#C64B2A]";
  const timerBg    = timeLeft > 20 ? "bg-[#2FAF74]"   : timeLeft > 10 ? "bg-[#F2B84B]"   : "bg-[#C64B2A]";

  const toastStyles = {
    win:  "bg-[#2FAF74] text-[#0B1F16]",
    lose: "bg-[#8A8A8A] text-[#FDFBF5]",
    info: "bg-[#2B2017] text-[#FDFBF5]",
  };

  const infoPanelStyle = {
    backgroundColor: dark ? "#1B120C" : "#FFF8EC",
    border:          dark ? "2px solid #3A2A1C" : "2px solid #D4B896",
    color:           dark ? "#F7EEDB" : "#2B2017",
    borderRadius:    "12px",
    padding:         "16px 20px",
    display:         "flex",
    flexDirection:   "column",
    gap:             "10px",
    width:           "100%",
  };

  const infoLabelStyle  = { color: dark ? "#CBBEAC" : "#7A5C3E", fontSize: "14px" };
  const infoValueStyle  = { color: dark ? "#F7EEDB" : "#2B2017", fontSize: "14px", fontWeight: "600" };
  const infoXpStyle     = { color: dark ? "#F2B84B" : "#C58B1D", fontSize: "14px", fontWeight: "600" };

  return (
    <div className={`min-h-screen md:h-screen md:overflow-hidden [@media(max-height:760px)]:h-auto [@media(max-height:760px)]:overflow-y-auto flex flex-col font-copy transition-colors duration-300 ${
      dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
    }`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      {message && gameState !== "won" && gameState !== "lost" && gameState !== "timeup" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastStyles[messageType]}`}>
            <span>{message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center md:justify-center py-6 sm:py-7 md:py-4 px-4 sm:px-6 gap-4 sm:gap-5 md:gap-3 md:min-h-0 scale-[0.93] sm:scale-[0.96] md:scale-[0.94] lg:scale-100 origin-top [@media(max-height:760px)]:justify-start [@media(max-height:760px)]:py-5 [@media(max-height:760px)]:gap-3 [@media(max-height:760px)]:scale-100">

        {(gameState === "idle" || gameState === "loading") && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 max-w-sm text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
              dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
            }`}>
              <FaBolt className="text-[#F2B84B]" size={28} />
            </div>
            <div>
              <h1 className={`text-3xl sm:text-4xl font-arcade mb-2 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                Speed Game
              </h1>
              <p className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                Guess the word in <strong>60 seconds</strong>. Faster wins = more XP.
                You get <strong>6 guesses</strong>.
              </p>
            </div>

            <div style={infoPanelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={infoLabelStyle}>Time limit</span>
                <span style={infoValueStyle}>60 seconds</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={infoLabelStyle}>Max guesses</span>
                <span style={infoValueStyle}>6</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={infoLabelStyle}>XP reward</span>
                <span style={infoXpStyle}>Up to 100 XP</span>
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={gameState === "loading"}
              className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
                dark
                  ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
                  : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
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

        {gameState === "playing" && (
          <>
            <div className="w-full max-w-sm arcade-panel px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>Time left</span>
                <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timeLeft}s</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${dark ? "bg-[#3A2A1C]" : "bg-[#F3DFC2]"}`}>
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${timerBg}`}
                  style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="arcade-panel px-4 sm:px-6 py-5 sm:py-6 md:scale-[0.92] md:origin-top">
                <Board
                  guesses={guesses}
                  currentGuess={currentGuess}
                  maxGuesses={maxGuesses}
                  wordLength={wordLength}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#2FAF74] border border-[#1E7E52]" />
                <span className={dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}>Correct spot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#F2B84B] border border-[#C58B1D]" />
                <span className={dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}>In word, wrong spot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#8A8A8A] border border-[#5E5E5E]" />
                <span className={dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}>Not in word</span>
              </div>
            </div>

            <div className="w-full flex justify-center md:scale-[0.92] md:origin-top">
              <Keyboard onKey={handleKey} keyStatuses={keyStatuses} disabled={submitting} />
            </div>
          </>
        )}

        {(gameState === "won" || gameState === "lost" || gameState === "timeup") && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 max-w-sm text-center w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
              gameState === "won"
                ? (dark ? "bg-[#1B120C] border-[#F2B84B]" : "bg-[#FFE9B0] border-[#2B2017]")
                : (dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFF3DA] border-[#2B2017]")
            }`}>
              {gameState === "won"
                ? <FaTrophy className="text-[#F2B84B]" size={28} />
                : <MdClose  className="text-[#8A8A8A]"  size={32} />
              }
            </div>

            <div>
              <h2 className={`text-2xl font-arcade mb-1 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                {gameState === "won"    ? "You Won!"    :
                 gameState === "timeup" ? "Time's Up!"  : "Better luck!"}
              </h2>
              <p className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
                {gameState === "won" ? (
                  `Solved in ${timeTaken}s with ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}`
                ) : (
                  <>
                    {revealedWord && (
                      <>
                        The word was{" "}
                        <span className={`font-bold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                          {revealedWord}
                        </span>
                        .{" "}
                      </>
                    )}
                    Better luck next time!
                  </>
                )}
              </p>
            </div>

            {gameState === "won" && (
              <div className="flex items-center gap-2 bg-[#FFE9B0] border-2 border-[#2B2017] rounded-xl px-5 py-3">
                <FaBolt className="text-[#C58B1D]" size={18} />
                <span className="text-lg font-bold text-[#2B2017]">+{xpEarned} XP</span>
              </div>
            )}

            <Board
              guesses={guesses}
              currentGuess=""
              maxGuesses={maxGuesses}
              wordLength={wordLength}
            />

            <button
              onClick={startGame}
              className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
                dark
                  ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
                  : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
              }`}
            >
              <FaBolt size={16} /> Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}