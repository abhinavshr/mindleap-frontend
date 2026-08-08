import { useState, useEffect } from "react";

// Animated number that counts up on mount — used for the XP total.
export default function CountUp({ value, duration = 700 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
}
