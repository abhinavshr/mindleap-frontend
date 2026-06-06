import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Link } from "react-router-dom";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import AdComponent from "../components/Ads/AdComponent";
import { fetchDailyInfo, submitGuessApi, checkAlreadyPlayed } from "../api/game";
import { Howl, Howler } from "howler";

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const popIn = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 22 },
  },
};

const bannerVariant = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

const toastVariant = {
  hidden: { opacity: 0, y: -24, scale: 0.88 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
  exit: { opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } },
};

const revealContainerVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
};

const revealLetterVariant = {
  hidden: { opacity: 0, rotateX: -90, scale: 0.7 },
  visible: {
    opacity: 1, rotateX: 0, scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 16 },
  },
};

const winPulseVariant = {
  idle: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  active: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 rgba(0,0,0,0)",
      "0 0 35px rgba(242,184,75,0.35)",
      "0 0 0 rgba(0,0,0,0)",
    ],
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

const burstVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: [0.7, 1.08, 1],
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const createConfettiPieces = () => {
  const colors = ["#2FAF74", "#F2B84B", "#C64B2A", "#6AAA64", "#FFE9B0"];
  return Array.from({ length: 46 }, (_, i) => ({
    id: i,
    x: (Math.random() * 2 - 1) * 140,
    delay: Math.random() * 0.25,
    rotate: Math.random() * 720,
    size: 6 + Math.random() * 6,
    drift: (Math.random() * 2 - 1) * 30,
    color: colors[i % colors.length],
  }));
};

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
  const [shakeRow, setShakeRow] = useState(false);
  const [showWinFx, setShowWinFx] = useState(false);
  const audioUnlockedRef = useRef(false);
  const winSoundRef = useRef(null);
  const winFxTimeoutRef = useRef(null);
  const confettiPieces = useMemo(() => createConfettiPieces(), []);

  const initWinSound = () => {
    if (winSoundRef.current) return;
    winSoundRef.current = new Howl({
      src: ["/sounds/success.mp3"],
      volume: 0.7,
      preload: true,
    });
  };

  useEffect(() => {
    initWinSound();

    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      if (Howler.ctx?.state !== "running") {
        await Howler.ctx.resume();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (winSoundRef.current) {
        winSoundRef.current.unload();
        winSoundRef.current = null;
      }
      if (winFxTimeoutRef.current) {
        clearTimeout(winFxTimeoutRef.current);
        winFxTimeoutRef.current = null;
      }
    };
  }, []);

  const showMessage = (msg, type = "info", duration = 2500) => {
    setMessage(msg);
    setMessageType(type);
    if (duration > 0) setTimeout(() => setMessage(""), duration);
  };

  const triggerWinFx = useCallback(() => {
    setShowWinFx(true);
    if (winFxTimeoutRef.current) clearTimeout(winFxTimeoutRef.current);
    winFxTimeoutRef.current = setTimeout(() => setShowWinFx(false), 3000);
  }, []);

  const GUEST_KEY = `guest_game_${new Date().toISOString().slice(0, 10)}`;

  const saveGuestSession = (guessArray, isOver, revealed = "") => {
    localStorage.setItem(GUEST_KEY, JSON.stringify({
      guesses: guessArray, gameOver: isOver, revealedWord: revealed,
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
              if (playedData.word) setRevealedWord(playedData.word.toUpperCase());
            } catch { }
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
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 600);
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

      const res = await submitGuessApi(guessWord.toLowerCase());
      const data = res.data;
      const isLocalWin = Array.isArray(data.result) && data.result.every((s) => s === "correct");

      const newGuess = { word: guessWord, result: data.result };
      setGuesses((prev) => {
        const next = [...prev];
        next[next.length - 1] = newGuess;
        return next;
      });

      if (!data.isAuth) {
        const newGuesses = [...guesses, newGuess];
        saveGuestSession(newGuesses, false, "");
      }

      const priority = { correct: 3, present: 2, absent: 1 };
      setKeyStatuses((prev) => {
        const updated = { ...prev };
        guessWord.split("").forEach((letter, i) => {
          const s = data.result[i];
          if (!updated[letter] || priority[s] > priority[updated[letter]]) updated[letter] = s;
        });
        return updated;
      });

      if (data.won || isLocalWin) {
        triggerWinFx();
        if (Howler.ctx?.state !== "running") {
          await Howler.ctx.resume();
        }
        winSoundRef.current?.play();
        showMessage("You won!", "win", 4000);
        setGameOver(true);
        if (!data.isAuth) {
          const newGuesses = [...guesses, newGuess];
          saveGuestSession(newGuesses, true, "");
        }
      } else if (data.gameOver) {
        if (data.word) {
          setRevealedWord(data.word.toUpperCase());
          showMessage(`The word was ${data.word.toUpperCase()}`, "lose", 6000);
        }
        setGameOver(true);
      } else if (!data.isAuth && guesses.length + 1 >= maxGuesses) {
        showMessage("Game over! Login to track your stats.", "lose", 6000);
        setGameOver(true);
        const newGuesses = [...guesses, newGuess];
        saveGuestSession(newGuesses, true, "");
      }
    } catch (err) {
      setGuesses((prev) => prev.slice(0, -1));
      if (guessWord) setCurrentGuess(guessWord);
      const msg = err?.response?.data?.message || "Failed to submit guess.";
      if (msg.includes("5 letters")) { showMessage("Word must be 5 letters", "info"); setShakeRow(true); setTimeout(() => setShakeRow(false), 600); }
      else if (msg.includes("only letters")) { showMessage("Letters only!", "info"); setShakeRow(true); setTimeout(() => setShakeRow(false), 600); }
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

  const toastBg = {
    win: "bg-[#2FAF74] text-[#0B1F16]",
    lose: "bg-[#8A8A8A] text-[#FDFBF5]",
    info: "bg-[#2B2017] text-[#FDFBF5]",
  };

  if (loading) {
    return (
      <div
        className={`flex flex-col font-copy ${dark ? "bg-[#121213]" : "bg-white"}`}
        style={{ height: "100dvh", overflow: "hidden" }}
      >
        <Helmet>
          <title>Mindleap — Brain Training Games</title>
          <meta name="description" content="Play daily brain training games to boost memory, attention and cognitive speed." />
          <link rel="canonical" href="https://mindleap.live/" />
          <meta property="og:title" content="Mindleap — Brain Training Games" />
          <meta property="og:description" content="Play daily brain training games to boost memory, attention and cognitive speed." />
          <meta property="og:url" content="https://mindleap.live/" />
          <meta property="og:image" content="https://mindleap.live/assets/images/logo.png" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <Navbar dark={dark} onToggleDark={onToggleDark} />
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-[#6AAA64] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col font-copy transition-colors duration-300 ${dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"}`}
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <Helmet>
        <title>Mindleap — Brain Training Games</title>
        <meta name="description" content="Play daily brain training games to boost memory, attention and cognitive speed. Join Mindleap for short, fun exercises." />
        <link rel="canonical" href="https://mindleap.live/" />
        <meta property="og:title" content="Mindleap — Brain Training Games" />
        <meta property="og:description" content="Play daily brain training games to boost memory, attention and cognitive speed." />
        <meta property="og:url" content="https://mindleap.live/" />
        <meta property="og:image" content="https://mindleap.live/assets/images/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <AnimatePresence>
        {!isAuth && (
          <motion.div
            key="guest-banner"
            variants={bannerVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full overflow-hidden border-b ${dark ? "bg-[#1B120C] border-[#F7EEDB]" : "bg-[#FFE9B0] border-[#2B2017]"}`}
          >
            <div className={`px-4 py-2 text-center text-sm font-medium ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
              You have <strong>5 guesses</strong> as a guest.{" "}
              <Link
                to="/register"
                className={`font-bold underline ${dark ? "hover:text-[#FFE9B0]" : "hover:text-[#C64B2A]"}`}
              >
                Register
              </Link>{" "}
              to get 6 guesses, see the answer + leaderboard access.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            variants={toastVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastBg[messageType]}`}>
              <AnimatePresence mode="wait">
                {messageType === "win" && (
                  <motion.div key="trophy" variants={popIn} initial="hidden" animate="visible">
                    <FaTrophy size={14} />
                  </motion.div>
                )}
                {messageType === "lose" && (
                  <motion.div key="close" variants={popIn} initial="hidden" animate="visible">
                    <MdClose size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        <div className="w-full flex flex-col items-center justify-center gap-6 sm:gap-5 md:gap-3 scale-[0.93] sm:scale-[0.96] md:scale-[0.94] lg:scale-100 origin-center">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center justify-center gap-6">
            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="flex items-center justify-center w-full md:col-start-2 md:col-end-3"
            >
              <div className="relative">
                <motion.div
                  variants={winPulseVariant}
                  initial="idle"
                  animate={showWinFx ? "active" : "idle"}
                  className="arcade-panel px-4 sm:px-6 py-5 sm:py-6 md:scale-[0.92] md:origin-top"
                >
                  <Board
                    guesses={guesses}
                    currentGuess={currentGuess}
                    maxGuesses={maxGuesses}
                    wordLength={wordLength}
                    shakeRow={shakeRow}
                  />
                </motion.div>
                <AnimatePresence>
                  {showWinFx && (
                    <motion.div
                      key="win-confetti"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                      <motion.div
                        variants={burstVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute left-1/2 top-1/2 w-[140%] h-[140%] -translate-x-1/2 -translate-y-1/2"
                        style={{
                          background:
                            "radial-gradient(circle at center, rgba(255,233,176,0.45) 0%, rgba(242,184,75,0.2) 32%, rgba(198,75,42,0.08) 55%, rgba(0,0,0,0) 70%)",
                          filter: "blur(2px)",
                        }}
                      />
                      <motion.div
                        variants={burstVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute left-1/2 top-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FFE9B0]/70"
                      />
                      {confettiPieces.map((piece) => (
                        <motion.span
                          key={piece.id}
                          initial={{ opacity: 0, y: -20, x: 0, rotate: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            y: 175,
                            x: piece.x,
                            rotate: piece.rotate,
                            scale: 1,
                            transition: {
                              duration: 2.8,
                              delay: piece.delay,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          }}
                          exit={{ opacity: 0 }}
                          style={{
                            backgroundColor: piece.color,
                            width: piece.size,
                            height: piece.size * 1.4,
                          }}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-sm"
                        />
                      ))}
                      {confettiPieces.map((piece) => (
                        <motion.span
                          key={`spark-${piece.id}`}
                          initial={{ opacity: 0, y: -10, x: 0, rotate: 0, scale: 0.6 }}
                          animate={{
                            opacity: 1,
                            y: 120,
                            x: piece.x + piece.drift,
                            rotate: piece.rotate,
                            scale: [0.6, 1, 0.9],
                            transition: {
                              duration: 2.2,
                              delay: piece.delay + 0.05,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          }}
                          exit={{ opacity: 0 }}
                          style={{
                            backgroundColor: "#FDFBF5",
                            width: 4,
                            height: 4,
                          }}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="hidden md:flex md:col-start-3 md:col-end-4 md:w-64 lg:w-80 justify-center">
              <AdComponent className="w-full" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {gameOver && revealedWord && (
            <motion.div
              key="revealed"
              variants={revealContainerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className={`text-sm font-medium ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}
              >
                The word was
              </motion.span>
              <div className="flex gap-1.5">
                {revealedWord.split("").map((letter, i) => (
                  <motion.div
                    key={i}
                    variants={revealLetterVariant}
                    className="w-10 h-10 bg-[#2B2017] text-[#FDFBF5] flex items-center justify-center text-base font-bold rounded"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-0 sm:-mt-1 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
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

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="w-full flex justify-center px-1 md:px-2 md:scale-[0.92] md:origin-top"
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