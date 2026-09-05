import { revealContainerVariant, revealLetterVariant } from "@/utils/animationVariants";
import { motion, AnimatePresence } from "framer-motion";

export default function RevealedWord({ gameOver, revealedWord, revealedMeaning, dark }) {
  return (
    <AnimatePresence>
      {gameOver && revealedWord && (
        <motion.div
          key="revealed"
          variants={revealContainerVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
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
          </div>

          {revealedMeaning && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.35 }}
              className={`text-xs max-w-xs text-center px-2 ${dark ? "text-[#A99A85]" : "text-[#7A5C3E]"}`}
            >
              {revealedMeaning}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}