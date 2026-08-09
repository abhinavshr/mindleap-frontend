import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { overlayVariant, cardVariant, boltFlashVariant } from "../constants/animations";
import QuestStreaks from "./QuestStreaks";

export default function ContactSuccessModal({ show, onClose, dark }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="contact-success-overlay"
          variants={overlayVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/55"
          onClick={onClose}
        >
          <motion.div
            key="contact-success-card"
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl px-6 pt-7 pb-6 overflow-hidden ${
              dark
                ? "bg-[#1B120C] border-2 border-b-0 sm:border-b-2 border-[#F2B84B]"
                : "bg-[#FFF8EC] border-2 border-b-0 sm:border-b-2 border-[#2B2017]"
            }`}
          >
            <QuestStreaks />

            <button
              onClick={onClose}
              className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10 ${
                dark ? "text-[#CBBEAC] hover:bg-[#3A2A1C]" : "text-[#7A5C3E] hover:bg-[#F3DFC2]"
              }`}
              aria-label="Close"
            >
              <MdClose size={18} />
            </button>

            <motion.div
              variants={boltFlashVariant}
              initial="hidden"
              animate="visible"
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-4"
              style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}
            >
              <FaCheckCircle size={26} style={{ color: "#F2B84B" }} />
            </motion.div>

            <h2 className={`text-xl font-extrabold leading-tight mb-1 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
              Thank you for your message!
            </h2>
            <p className={`text-sm mb-5 ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
              We've got it, and we'll reply soon.
            </p>

            <button
              onClick={onClose}
              className={`w-full text-sm font-semibold px-4 py-2.5 rounded-xl border-2 transition-transform active:scale-95 ${
                dark
                  ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017]"
                  : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5]"
              }`}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}