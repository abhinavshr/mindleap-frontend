import Navbar from "../../components/Reuseable/Navbar";
import useSpeedGame from "./hooks/useSpeedGame";
import SpeedWinModal from "./components/SpeedWinModal";
import IdleScreen from "./components/IdleScreen";
import PlayingScreen from "./components/PlayingScreen";
import ResultScreen from "./components/ResultScreen";

const TOAST_STYLES = {
  win: "bg-[#2FAF74] text-[#0B1F16]",
  lose: "bg-[#8A8A8A] text-[#FDFBF5]",
  info: "bg-[#2B2017] text-[#FDFBF5]",
};

const RESULT_STATES = ["won", "lost", "timeup"];

export default function SpeedGamePage({ dark = false, onToggleDark }) {
  const {
    gameState,
    timeLeft,
    timeLimit,
    wordLength,
    maxGuesses,
    currentGuess,
    guesses,
    keyStatuses,
    message,
    messageType,
    xpEarned,
    timeTaken,
    revealedWord,
    revealPending,
    submitting,
    showWinModal,
    setShowWinModal,
    startGame,
    handleKey,
  } = useSpeedGame();

  const showToast = message && !RESULT_STATES.includes(gameState);

  return (
    <div
      className={`min-h-screen md:h-screen md:overflow-hidden [@media(max-height:760px)]:h-auto [@media(max-height:760px)]:overflow-y-auto flex flex-col font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${TOAST_STYLES[messageType]}`}
          >
            <span>{message}</span>
          </div>
        </div>
      )}

      <SpeedWinModal
        show={showWinModal}
        onClose={() => setShowWinModal(false)}
        onPlayAgain={startGame}
        dark={dark}
        timeTaken={timeTaken}
        timeLimit={timeLimit}
        guessCount={guesses.length}
        xpEarned={xpEarned}
      />

      <main className="flex-1 flex flex-col items-center md:justify-center py-6 sm:py-7 md:py-4 px-4 sm:px-6 gap-4 sm:gap-5 md:gap-3 md:min-h-0 scale-[0.93] sm:scale-[0.96] md:scale-[0.94] lg:scale-100 origin-top [@media(max-height:760px)]:justify-start [@media(max-height:760px)]:py-5 [@media(max-height:760px)]:gap-3 [@media(max-height:760px)]:scale-100">
        {(gameState === "idle" || gameState === "loading") && (
          <IdleScreen dark={dark} loading={gameState === "loading"} onStart={startGame} />
        )}

        {gameState === "playing" && (
          <PlayingScreen
            dark={dark}
            timeLeft={timeLeft}
            timeLimit={timeLimit}
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
            keyStatuses={keyStatuses}
            submitting={submitting}
            onKey={handleKey}
          />
        )}

        {RESULT_STATES.includes(gameState) && (
          <ResultScreen
            dark={dark}
            gameState={gameState}
            timeTaken={timeTaken}
            guesses={guesses}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
            xpEarned={xpEarned}
            revealedWord={revealedWord}
            revealPending={revealPending}
            onPlayAgain={startGame}
          />
        )}
      </main>
    </div>
  );
}
