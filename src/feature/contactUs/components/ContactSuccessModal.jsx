import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaClock, FaCheckCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import {
  overlayVariant,
  cardVariant,
  boltFlashVariant,
  ribbonVariant,
} from "../constants/animations";
import QuestStreaks from "./QuestStreaks";

export default function ContactSuccessModal({ show, onClose, onSendAnother, dark }) {
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
              variants={ribbonVariant}
              initial="hidden"
              animate="visible"
              className="inline-block mb-4 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-[#2FAF74] text-[#0B1F16] shadow-sm"
            >
              QUEST SENT
            </motion.div>

            <div className="flex items-center gap-3 mb-5">
              <motion.div
                variants={boltFlashVariant}
                initial="hidden"
                animate="visible"
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: dark ? "#2B1A0E" : "#FFE9B0" }}
              >
                <FaCheckCircle size={26} style={{ color: "#F2B84B" }} />
              </motion.div>
              <div className="text-left">
                <h2 className={`text-xl font-extrabold leading-tight ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
                  Message Sent!
                </h2>
                <p className={`text-xs ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
                  Your message is in our queue.
                </p>
              </div>
            </div>

            <div className={`rounded-xl px-4 py-3.5 mb-5 ${dark ? "bg-[#241811]" : "bg-[#FFF3DA]"}`}>
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    dark ? "text-[#F2B84B]" : "text-[#C58B1D]"
                  }`}
                >
                  <FaClock size={12} /> Expected reply
                </span>
                <span className="text-sm font-extrabold text-[#F2B84B]">Within 24h</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 transition-transform active:scale-95 ${
                  dark ? "border-[#3A2A1C] text-[#F7EEDB]" : "border-[#2B2017] text-[#2B2017]"
                }`}
              >
                Close
              </button>
              <button
                onClick={onSendAnother}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-transform active:scale-95 ${
                  dark ? "bg-[#F2B84B] text-[#2B2017]" : "bg-[#2B2017] text-[#FDFBF5]"
                }`}
              >
                <FaPaperPlane size={12} /> Send Another
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
