import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { Howl, Howler } from "howler";
import { fetchDailyInfo, submitGuessApi, checkAlreadyPlayed } from "../api/game";
import { createConfettiPieces } from "../utils/winHelpers";

const GUEST_KEY = () => `guest_game_${new Date().toISOString().slice(0, 10)}`;

const saveGuestSession = (guessArray, isOver, revealed = "", meaning = "") => {
  localStorage.setItem(GUEST_KEY(), JSON.stringify({
    guesses: guessArray, gameOver: isOver, revealedWord: revealed, revealedMeaning: meaning,
  }));
};

const loadGuestSession = () => {
  try {
    const raw = localStorage.getItem(GUEST_KEY());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

/**
 * Encapsulates all state, effects, and handlers for the daily word game.
 * Keeping this separate from HomePage lets the page component stay focused
 * purely on layout/markup.
 */
export default function useWordleGame() {
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
  const [revealedMeaning, setRevealedMeaning] = useState("");
  const [shakeRow, setShakeRow] = useState(false);
  const [showWinFx, setShowWinFx] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winAttempts, setWinAttempts] = useState(0);

  const audioUnlockedRef = useRef(false);
  const winSoundRef = useRef(null);
  const winFxTimeoutRef = useRef(null);

  const confettiPieces = useMemo(() => createConfettiPieces(), []);
  const modalConfettiPieces = useMemo(() => createConfettiPieces(60), [showWinModal]);

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

  // ── Initial load ─────────────────────────────────────────────────
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
              if (session.revealedMeaning) setRevealedMeaning(session.revealedMeaning);
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
              if (playedData.meaning) setRevealedMeaning(playedData.meaning);
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

  // ── Submit guess ─────────────────────────────────────────────────
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
        saveGuestSession(newGuesses, false, "", "");
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
        setWinAttempts(data.attempts ?? guesses.length + 1);
        if (data.word) setRevealedWord(data.word.toUpperCase());
        if (data.meaning) setRevealedMeaning(data.meaning);
        // Slight delay so the last row's flip animation finishes before the modal appears
        setTimeout(() => setShowWinModal(true), 900);
        if (!data.isAuth) {
          const newGuesses = [...guesses, newGuess];
          saveGuestSession(newGuesses, true, data.word ? data.word.toUpperCase() : "", data.meaning || "");
        }
      } else if (data.gameOver) {
        if (data.word) {
          setRevealedWord(data.word.toUpperCase());
          showMessage(`The word was ${data.word.toUpperCase()}`, "lose", 6000);
        }
        if (data.meaning) setRevealedMeaning(data.meaning);
        setGameOver(true);
        if (!data.isAuth) {
          const newGuesses = [...guesses, newGuess];
          saveGuestSession(newGuesses, true, data.word ? data.word.toUpperCase() : "", data.meaning || "");
        }
      } else if (!data.isAuth && guesses.length + 1 >= maxGuesses) {
        showMessage("Game over! Login to track your stats.", "lose", 6000);
        setGameOver(true);
        const newGuesses = [...guesses, newGuess];
        saveGuestSession(newGuesses, true, "", "");
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

  // ── Keyboard input ───────────────────────────────────────────────
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

  return {
    // state
    currentGuess,
    guesses,
    gameOver,
    message,
    messageType,
    keyStatuses,
    maxGuesses,
    wordLength,
    isAuth,
    loading,
    submitting,
    revealedWord,
    revealedMeaning,
    shakeRow,
    showWinFx,
    showWinModal,
    winAttempts,
    confettiPieces,
    modalConfettiPieces,
    // actions
    handleKey,
    setShowWinModal,
  };
}