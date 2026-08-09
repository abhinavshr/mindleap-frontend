import { motion } from "framer-motion";
import Navbar from "../../components/Reuseable/Navbar";
import Keyboard from "../../components/Keyboard/Keyboard";

import useWordleGame from "../../hooks/useWordleGame";
import { fadeSlideUp } from "../../utils/animationVariants";
import LoadingScreen from "./component/LoadingScreen";
import PageHead from "./component/PageHead";
import GuestBanner from "./component/GuestBanner";
import MessageToast from "./component/MessageToast";
import WinModal from "./component/WinModal";
import GameBoardPanel from "./component/GameBoardPanel";
import RevealedWord from "./component/RevealedWord";
import ColorLegend from "./component/ColorLegend";

export default function HomePage({ dark, onToggleDark }) {
  const {
    currentGuess,
    guesses,
    gameOver,
    message,
    messageType,
    keyStatuses,
    maxGuesses,
    wordLength,
    isAuth,
    loading,
    submitting,
    revealedWord,
    shakeRow,
    showWinFx,
    showWinModal,
    winAttempts,
    confettiPieces,
    modalConfettiPieces,
    handleKey,
    setShowWinModal,
  } = useWordleGame();

  if (loading) {
    return <LoadingScreen dark={dark} onToggleDark={onToggleDark} />;
  }

  return (
    <div
      className={`flex flex-col font-copy min-h-screen transition-colors duration-300 ${dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"}`}
    >
      <PageHead
        title="Mindleap — Daily Brain Training Games for Memory, Attention & Speed"
        description="Daily short games and exercises to improve memory, attention, and processing speed. Track progress, join leaderboards, and play on Mindleap."
      />
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <GuestBanner isAuth={isAuth} dark={dark} />

      <MessageToast message={message} messageType={messageType} />

      <WinModal
        show={showWinModal}
        onClose={() => setShowWinModal(false)}
        dark={dark}
        isAuth={isAuth}
        winAttempts={winAttempts}
        maxGuesses={maxGuesses}
        confettiPieces={modalConfettiPieces}
      />

      <main className="flex-1 min-h-0 flex flex-col items-center justify-start md:justify-center overflow-hidden px-4 sm:px-6 pb-3 md:pb-0">
        <div className="w-full flex flex-col items-center justify-start md:justify-center gap-6 sm:gap-5 md:gap-3 scale-[0.93] sm:scale-[0.96] md:scale-[0.94] lg:scale-100 origin-center">
          <GameBoardPanel
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
            shakeRow={shakeRow}
            showWinFx={showWinFx}
            confettiPieces={confettiPieces}
          />
        </div>

        <RevealedWord gameOver={gameOver} revealedWord={revealedWord} dark={dark} />

        {/* Bottom group: legend + keyboard, pushed together to the bottom */}
        <div className="w-full flex flex-col items-center mt-auto gap-2 md:gap-1 pb-4 md:pb-0">
          <ColorLegend dark={dark} />

          <motion.div
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="w-full flex justify-center px-1 md:px-2 mb-2 md:mb-0 md:scale-[0.92] md:origin-top"
          >
            <Keyboard
              onKey={handleKey}
              keyStatuses={keyStatuses}
              disabled={submitting || gameOver}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}