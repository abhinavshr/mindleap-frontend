import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { expireSpeedSession } from "../../../api/speedGame";
import { extractReveal } from "../utils/speedGameUtils";

/**
 * Handles revealing the secret word once a session ends without a win
 * (time-up, or "session already ended" race). Retries the expire call
 * once on failure so a single flaky request doesn't leave the result
 * screen with a blank "Better luck next time!".
 */
export default function useWordReveal() {
  const [revealedWord, setRevealedWord] = useState("");
  const [revealPending, setRevealPending] = useState(false);

  const fetchRevealWithRetry = useCallback(async (sessionId, attempt = 1) => {
    try {
      const res = await expireSpeedSession(sessionId);
      const reveal = extractReveal(res.data);
      if (reveal) {
        setRevealedWord(reveal.toUpperCase());
        return true;
      }
      // Request succeeded but the response had no recognizable word field —
      // don't retry, the response shape itself is the problem.
      return false;
    } catch (err) {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return fetchRevealWithRetry(sessionId, attempt + 1);
      }
      const msg = err?.response?.data?.message || "Failed to expire session.";
      toast.error(msg);
      return false;
    }
  }, []);

  const requestReveal = useCallback(
    async (sessionId) => {
      setRevealPending(true);
      await fetchRevealWithRetry(sessionId);
      setRevealPending(false);
    },
    [fetchRevealWithRetry]
  );

  // Use when the word is already present in an API response (e.g. the
  // submitGuess timeUp/lost branches already return `secret` inline).
  const setRevealDirectly = useCallback((word) => {
    if (word) setRevealedWord(word.toUpperCase());
  }, []);

  const resetReveal = useCallback(() => {
    setRevealedWord("");
    setRevealPending(false);
  }, []);

  return { revealedWord, revealPending, requestReveal, setRevealDirectly, resetReveal };
}
