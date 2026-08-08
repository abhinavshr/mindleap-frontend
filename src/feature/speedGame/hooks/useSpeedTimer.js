import { useEffect, useRef } from "react";

/**
 * Runs a 1-second interval while `active` is true, decrementing timeLeft
 * via the provided setter. Calls onTimeUp exactly once when it hits zero.
 * Automatically clears the interval when `active` becomes false (e.g. the
 * game state moves off "playing"), so callers don't need to clearInterval
 * manually on win/lose.
 */
export default function useSpeedTimer({ active, onTimeUp, setTimeLeft }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [active, onTimeUp, setTimeLeft]);
}
