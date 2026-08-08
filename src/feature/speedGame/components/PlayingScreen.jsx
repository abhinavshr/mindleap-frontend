import Board from "../../../components/Board/Board";
import Keyboard from "../../../components/Keyboard/Keyboard";
import ColorLegend from "./ColorLegend";

export default function PlayingScreen({
  dark,
  timeLeft,
  timeLimit,
  guesses,
  currentGuess,
  maxGuesses,
  wordLength,
  keyStatuses,
  submitting,
  onKey,
}) {
  const timerColor = timeLeft > 20 ? "text-[#2FAF74]" : timeLeft > 10 ? "text-[#F2B84B]" : "text-[#C64B2A]";
  const timerBg = timeLeft > 20 ? "bg-[#2FAF74]" : timeLeft > 10 ? "bg-[#F2B84B]" : "bg-[#C64B2A]";

  return (
    <>
      <div className="w-full max-w-sm arcade-panel px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-semibold ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
            Time left
          </span>
          <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timeLeft}s</span>
        </div>
        <div className={`w-full h-1.5 rounded-full ${dark ? "bg-[#3A2A1C]" : "bg-[#F3DFC2]"}`}>
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${timerBg}`}
            style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="arcade-panel px-4 sm:px-6 py-5 sm:py-6 md:scale-[0.92] md:origin-top">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />
        </div>
      </div>

      <ColorLegend dark={dark} />

      <div className="w-full flex justify-center md:scale-[0.92] md:origin-top">
        <Keyboard onKey={onKey} keyStatuses={keyStatuses} disabled={submitting} />
      </div>
    </>
  );
}
