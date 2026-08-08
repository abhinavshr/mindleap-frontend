import { motion } from "framer-motion";

// A handful of diagonal "speed lines" that streak across the win-modal
// card once on mount.
const SPEED_STREAKS = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  top: 8 + i * 12,
  delay: i * 0.05,
  width: 40 + Math.random() * 60,
}));

export default function SpeedStreaks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      {SPEED_STREAKS.map((s) => (
        <motion.span
          key={s.id}
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "220%", opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: s.delay, ease: "easeOut" }}
          style={{ top: `${s.top}%`, width: `${s.width}px` }}
          className="absolute h-[3px] -rotate-12 rounded-full bg-[#F2B84B]"
        />
      ))}
    </div>
  );
}
