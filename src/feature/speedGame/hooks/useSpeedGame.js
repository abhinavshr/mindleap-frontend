import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { startSpeedGame, submitSpeedGuess } from "../../../api/speedGame";
import { extractReveal, extractMeaning, buildKeyStatuses } from "../utils/speedGameUtils";
import useWordReveal from "./useWordReveal";
import useWinSound from "./useWinSound";
import useSpeedTimer from "./useSpeedTimer";

/**
 * Owns every piece of state for the Speed Game screen: session lifecycle,
 * guesses, timer, win/lose transitions, and word reveal. SpeedGamePage.jsx
 * only needs to destructure this hook's return value and render.
 */
export default function useSpeedGame() {
  const [gameState, setGameState] = useState("idle"); // idle | loading | playing | won | lost | timeup
  const [sessionId, setSessionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeLimit, setTimeLimit] = useState(60);
  const [wordLength, setWordLength] = useState(5);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [keyStatuses, setKeyStatuses] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [xpEarned, setXpEarned] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);

  // Speed-win meaning is tracked separately from the loss/timeup reveal
  // (which comes from useWordReveal), since a win response arrives inline
  // via submitSpeedGuess rather than through a reveal request.
  const [winMeaning, setWinMeaning] = useState("");

  const timeUpHandledRef = useRef(false);

  const {
    revealedWord,
    revealedMeaning,
    revealPending,
    requestReveal,
    setRevealDirectly,
    resetReveal,
  } = useWordReveal();
  const { playWinSound } = useWinSound();

  const showMessage = useCallback((msg, type = "info", duration = 2500) => {
    setMessage(msg);
    setMessageType(type);
    if (duration > 0) setTimeout(() => setMessage(""), duration);
  }, []);

  const handleTimeUp = useCallback(async () => {
    if (timeUpHandledRef.current) return;
    timeUpHandledRef.current = true;
    setGameState("timeup");
    showMessage("Time's up!", "lose", 0);
    if (sessionId) await requestReveal(sessionId);
  }, [sessionId, requestReveal, showMessage]);

  useSpeedTimer({
    active: gameState === "playing",
    onTimeUp: handleTimeUp,
    setTimeLeft,
  });

  const startGame = useCallback(async () => {
    try {
      setGameState("loading");
      setShowWinModal(false);
      const res = await startSpeedGame();
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
      setWinMeaning("");
      resetReveal();
      timeUpHandledRef.current = false;
      setGameState("playing");

      if (data.resumed) showMessage("Session resumed!", "info", 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to start the game.";
      toast.error(msg);
      setGameState("idle");
    }
  }, [resetReveal, showMessage]);

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
      const res = await submitSpeedGuess(sessionId, guessWord.toLowerCase(), attempts);
      const data = res.data;

      if (data.timeUp) {
        timeUpHandledRef.current = true;
        setRevealDirectly(extractReveal(data), extractMeaning(data));
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
        setTimeTaken(data.timeTaken);
        setXpEarned(data.xpEarned);
        setWinMeaning(extractMeaning(data));
        setGameState("won");
        await playWinSound();
        showMessage("You won!", "win", 0);
        // brief pause so the final tile flip lands before the popup appears
        setTimeout(() => setShowWinModal(true), 500);
        return;
      }

      if (data.lost) {
        const reveal = extractReveal(data);
        setRevealDirectly(reveal, extractMeaning(data));
        setGameState("lost");
        showMessage(`The word was ${reveal ? reveal.toUpperCase() : ""}`, "lose", 0);
        return;
      }

      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
    } catch (err) {
      setGuesses((prev) => prev.slice(0, -1));
      if (guessWord) setCurrentGuess(guessWord);

      const msg = err?.response?.data?.message || "";
      if (msg.includes("5 letters")) {
        showMessage("Word must be 5 letters", "info");
      } else if (msg.includes("only letters")) {
        showMessage("Letters only!", "info");
      } else if (msg.includes("Session already ended")) {
        // Session flipped to expired/won/lost server-side (e.g. the expire
        // timer fired first). Recover the word instead of leaving a blank
        // result screen.
        showMessage("Session expired.", "lose", 0);
        setGameState("timeup");
        if (sessionId && !revealedWord) await requestReveal(sessionId);
      } else {
        toast.error(msg || "Failed to submit guess.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    currentGuess,
    guesses,
    gameState,
    submitting,
    wordLength,
    sessionId,
    revealedWord,
    showMessage,
    setRevealDirectly,
    requestReveal,
    playWinSound,
  ]);

  const handleKey = useCallback(
    (key) => {
      if (gameState !== "playing" || submitting) return;
      if (key === "ENTER") {
        submitGuess();
        return;
      }
      if (key === "BACKSPACE" || key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameState, submitting, wordLength, submitGuess]
  );

  useEffect(() => {
    const handler = (e) => handleKey(e.key === "Backspace" ? "Backspace" : e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  return {
    gameState,
    timeLeft,
    timeLimit,
    wordLength,
    maxGuesses,
    currentGuess,
    guesses,
    keyStatuses,
    message,
    messageType,
    xpEarned,
    timeTaken,
    revealedWord,
    // for wins, meaning comes inline from submitSpeedGuess (winMeaning);
    // for loss/timeup, it comes from the reveal flow (revealedMeaning)
    revealedMeaning: gameState === "won" ? winMeaning : revealedMeaning,
    revealPending,
    submitting,
    showWinModal,
    setShowWinModal,
    startGame,
    handleKey,
  };
}