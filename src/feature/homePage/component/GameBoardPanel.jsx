import { motion } from "framer-motion";
import { fadeSlideUp, winPulseVariant } from "@/utils/animationVariants";
import Board from "@/components/Board/Board";
import BoardConfetti from "./BoardConfetti";
import AdComponent from "@/components/Ads/AdComponent";

export default function GameBoardPanel({
  guesses,
  currentGuess,
  maxGuesses,
  wordLength,
  shakeRow,
  showWinFx,
  confettiPieces,
}) {
  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center justify-center gap-6">
      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex items-center justify-center w-full max-md:flex-col max-md:gap-4 md:col-start-2 md:col-end-3 mt-10 md:mt-20"
      >
        <div className="w-full flex items-center justify-center mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center leading-tight">
            Daily Brain Training — Boost Memory, Attention & Speed
          </h1>
        </div>
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
          <BoardConfetti show={showWinFx} pieces={confettiPieces} />
        </div>
      </motion.div>

      <div className="hidden md:flex md:col-start-3 md:col-end-4 md:w-64 lg:w-80 justify-center">
        <AdComponent className="w-full" />
      </div>
    </div>
  );
}