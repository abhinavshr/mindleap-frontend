import { motion, AnimatePresence } from "framer-motion";

export default function Tile({ letter = "", status = "empty" }) {
  const statusStyles = {
    empty:   "bg-white border-[#D3D6DA] text-[#1A1A1B]",
    active:  "bg-white border-[#878A8C] text-[#1A1A1B]",
    correct: "bg-[#6AAA64] border-[#6AAA64] text-white",
    present: "bg-[#C9B458] border-[#C9B458] text-white",
    absent:  "bg-[#787C7E] border-[#787C7E] text-white",
  };

  return (
    <div
      className={`
        w-13 h-13 sm:w-15.5 sm:h-15.5
        border-2 flex items-center justify-center
        text-xl sm:text-2xl font-bold uppercase select-none
        transition-colors duration-300
        ${statusStyles[status]}
      `}
    >
      <AnimatePresence mode="wait">
        {letter ? (
          <motion.span
            key={letter + status}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            {letter}
          </motion.span>
        ) : (
          <span key="empty" />
        )}
      </AnimatePresence>
    </div>
  );
}