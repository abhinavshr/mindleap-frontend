import { FaBolt, FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Board from "../../../components/Board/Board";

export default function ResultScreen({
  dark,
  gameState, // "won" | "lost" | "timeup"
  timeTaken,
  guesses,
  maxGuesses,
  wordLength,
  xpEarned,
  revealedWord,
  revealPending,
  onPlayAgain,
}) {
  const won = gameState === "won";

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 max-w-sm text-center w-full">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
          won
            ? dark
              ? "bg-[#1B120C] border-[#F2B84B]"
              : "bg-[#FFE9B0] border-[#2B2017]"
            : dark
            ? "bg-[#1B120C] border-[#3A2A1C]"
            : "bg-[#FFF3DA] border-[#2B2017]"
        }`}
      >
        {won ? (
          <FaTrophy className="text-[#F2B84B]" size={28} />
        ) : (
          <MdClose className="text-[#8A8A8A]" size={32} />
        )}
      </div>

      <div>
        <h2 className={`text-2xl font-arcade mb-1 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
          {gameState === "won" ? "You Won!" : gameState === "timeup" ? "Time's Up!" : "Better luck!"}
        </h2>
        <p className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
          {won ? (
            `Solved in ${timeTaken}s with ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}`
          ) : (
            <>
              {revealPending ? (
                <>Fetching the word… </>
              ) : revealedWord ? (
                <>
                  The word was{" "}
                  <span className={`font-bold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                    {revealedWord}
                  </span>
                  .{" "}
                </>
              ) : (
                <>Couldn't retrieve the word this time. </>
              )}
              Better luck next time!
            </>
          )}
        </p>
      </div>

      {won && (
        <div className="flex items-center gap-2 bg-[#FFE9B0] border-2 border-[#2B2017] rounded-xl px-5 py-3">
          <FaBolt className="text-[#C58B1D]" size={18} />
          <span className="text-lg font-bold text-[#2B2017]">+{xpEarned} XP</span>
        </div>
      )}

      <Board guesses={guesses} currentGuess="" maxGuesses={maxGuesses} wordLength={wordLength} />

      <button
        onClick={onPlayAgain}
        className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
          dark
            ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
            : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
        }`}
      >
        <FaBolt size={16} /> Play Again
      </button>
    </div>
  );
}
