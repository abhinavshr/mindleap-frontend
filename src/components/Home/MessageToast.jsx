import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { toastVariant, popIn } from "../../utils/animationVariants";

const toastBg = {
  win: "bg-[#2FAF74] text-[#0B1F16]",
  lose: "bg-[#8A8A8A] text-[#FDFBF5]",
  info: "bg-[#2B2017] text-[#FDFBF5]",
};

export default function MessageToast({ message, messageType }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          variants={toastVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastBg[messageType]}`}>
            <AnimatePresence mode="wait">
              {messageType === "win" && (
                <motion.div key="trophy" variants={popIn} initial="hidden" animate="visible">
                  <FaTrophy size={14} />
                </motion.div>
              )}
              {messageType === "lose" && (
                <motion.div key="close" variants={popIn} initial="hidden" animate="visible">
                  <MdClose size={16} />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}