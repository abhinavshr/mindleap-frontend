import { motion } from "framer-motion";
import Tile from "./Tile";

const shakeVariant = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  idle: { x: 0 },
};

export default function Board({
  guesses = [],
  currentGuess = "",
  maxGuesses = 6,
  wordLength = 5,
  shakeRow = false,
}) {
  const rows = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    const submittedGuess = guesses[rowIndex];
    const isCurrentRow   = rowIndex === guesses.length;

    return {
      isCurrentRow,
      tiles: Array.from({ length: wordLength }, (_, colIndex) => {
        if (submittedGuess) {
          return {
            letter: submittedGuess.word[colIndex] || "",
            status: submittedGuess.result[colIndex] || "absent",
          };
        }
        if (isCurrentRow) {
          return {
            letter: currentGuess[colIndex] || "",
            status: currentGuess[colIndex] ? "active" : "empty",
          };
        }
        return { letter: "", status: "empty" };
      }),
    };
  });

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.25">
      {rows.map(({ isCurrentRow, tiles }, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex gap-1 sm:gap-1.25"
          variants={shakeVariant}
          animate={isCurrentRow && shakeRow ? "shake" : "idle"}
        >
          {tiles.map((tile, colIndex) => (
            <Tile key={colIndex} letter={tile.letter} status={tile.status} />
          ))}
        </motion.div>
      ))}
    </div>
  );
}