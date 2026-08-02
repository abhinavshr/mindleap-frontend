import { motion, AnimatePresence } from "framer-motion";
import { burstVariant } from "../../utils/animationVariants";

/**
 * The confetti + glow burst that plays directly over the game board
 * when the player wins (separate from the win modal's own confetti).
 */
export default function BoardConfetti({ show, pieces }) {
  return (
    <AnimatePresence>
      {show && (
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
          {pieces.map((piece) => (
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
          {pieces.map((piece) => (
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
  );
}