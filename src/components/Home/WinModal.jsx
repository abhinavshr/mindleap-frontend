import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaStar, FaRedo } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  modalOverlayVariant,
  modalCardVariant,
  trophyBounceVariant,
  modalTextStagger,
  modalTextItem,
  starPopVariant,
} from "../../utils/animationVariants";
import { getWinStars, getWinPraise } from "../../utils/winHelpers";

export default function WinModal({
  show,
  onClose,
  dark,
  isAuth,
  winAttempts,
  maxGuesses,
  confettiPieces,
}) {
  const winStars = getWinStars(winAttempts || 1, maxGuesses);
  const winPraise = getWinPraise(winAttempts || 1);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="win-modal-overlay"
          variants={modalOverlayVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="win-modal-card"
            variants={modalCardVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-sm rounded-2xl px-6 py-8 flex flex-col items-center text-center overflow-hidden ${dark ? "bg-[#1B120C] border-2 border-[#F2B84B]" : "bg-[#FFF8EC] border-2 border-[#2B2017]"}`}
          >
            {/* confetti burst inside modal */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece) => (
                <motion.span
                  key={piece.id}
                  initial={{ opacity: 0, y: -30, x: piece.x * 0.4, rotate: 0, scale: 0.7 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: 320,
                    x: piece.x,
                    rotate: piece.rotate,
                    scale: 1,
                    transition: { duration: 2.6, delay: 0.2 + piece.delay, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{
                    backgroundColor: piece.color,
                    width: piece.size,
                    height: piece.size * 1.4,
                  }}
                  className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm shadow-sm"
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${dark ? "text-[#CBBEAC] hover:bg-[#3A2A1C]" : "text-[#7A5C3E] hover:bg-[#F3DFC2]"}`}
              aria-label="Close"
            >
              <MdClose size={18} />
            </button>

            <motion.div
              variants={trophyBounceVariant}
              initial="hidden"
              animate="visible"
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-3"
              style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                transition={{ duration: 1.4, delay: 0.7, ease: "easeInOut" }}
              >
                <FaTrophy size={36} style={{ color: "#F2B84B" }} />
              </motion.div>
            </motion.div>

            <motion.div
              variants={modalTextStagger}
              initial="hidden"
              animate="visible"
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <motion.h2 variants={modalTextItem} className={`text-2xl font-extrabold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                Congratulations!
              </motion.h2>

              <motion.div variants={modalTextItem} className="flex items-center gap-1.5 my-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={starPopVariant}
                    initial="hidden"
                    animate="visible"
                  >
                    <FaStar
                      size={22}
                      style={{ color: i < winStars ? "#F2B84B" : dark ? "#3A2A1C" : "#E7D5B4" }}
                    />
                  </motion.span>
                ))}
              </motion.div>

              <motion.p variants={modalTextItem} className={`text-sm font-semibold ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                {winPraise}
              </motion.p>

              <motion.p variants={modalTextItem} className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
                Solved in {winAttempts} / {maxGuesses} guesses
              </motion.p>

              <motion.div variants={modalTextItem} className="flex items-center gap-2 mt-5 w-full">
                <button
                  onClick={onClose}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-transform active:scale-95 ${dark ? "bg-[#F2B84B] text-[#2B2017]" : "bg-[#2B2017] text-[#FDFBF5]"}`}
                >
                  <FaTrophy size={12} />
                  Nice!
                </button>
                {!isAuth && (
                  <Link
                    to="/register"
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 transition-transform active:scale-95 ${dark ? "border-[#3A2A1C] text-[#F7EEDB]" : "border-[#2B2017] text-[#2B2017]"}`}
                  >
                    <FaRedo size={11} />
                    Save streak
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}