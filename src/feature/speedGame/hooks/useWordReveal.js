import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { expireSpeedSession } from "../../../api/speedGame";
import { extractReveal, extractMeaning } from "../utils/speedGameUtils";


export default function useWordReveal() {
  const [revealedWord, setRevealedWord] = useState("");
  const [revealedMeaning, setRevealedMeaning] = useState("");
  const [revealPending, setRevealPending] = useState(false);

  const MAX_ATTEMPTS = 4;
  const ERROR_RETRY_WAIT_MS = 400;

  const fetchRevealWithRetry = useCallback(async (sessionId) => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const res = await expireSpeedSession(sessionId);
        const data = res.data;
        const reveal = extractReveal(data);

        if (reveal) {
          setRevealedWord(reveal.toUpperCase());
          setRevealedMeaning(extractMeaning(data));
          return true;
        }

        if (data?.timeUp === false && attempt < MAX_ATTEMPTS) {
          const waitMs = Math.max((data.timeLeft ?? 1) * 1000, 500) + 200; 
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        return false;
      } catch (err) {
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, ERROR_RETRY_WAIT_MS));
          continue;
        }
        const msg = err?.response?.data?.message || "Failed to expire session.";
        toast.error(msg);
        return false;
      }
    }
    return false;
  }, []);

  const requestReveal = useCallback(
    async (sessionId) => {
      setRevealPending(true);
      await fetchRevealWithRetry(sessionId);
      setRevealPending(false);
    },
    [fetchRevealWithRetry]
  );

  const setRevealDirectly = useCallback((word, meaning = "") => {
    if (word) setRevealedWord(word.toUpperCase());
    setRevealedMeaning(meaning || "");
  }, []);

  const resetReveal = useCallback(() => {
    setRevealedWord("");
    setRevealedMeaning("");
    setRevealPending(false);
  }, []);

  return {
    revealedWord,
    revealedMeaning,
    revealPending,
    requestReveal,
    setRevealDirectly,
    resetReveal,
  };
}