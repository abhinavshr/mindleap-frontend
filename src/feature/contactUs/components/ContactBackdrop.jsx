import { motion } from "framer-motion";
import { FaBolt, FaEnvelope, FaCommentDots, FaCheckCircle } from "react-icons/fa";

const FLOATING_ICONS = [
  { Icon: FaBolt, top: "12%", left: "8%", size: 20, delay: 0 },
  { Icon: FaEnvelope, top: "22%", left: "88%", size: 18, delay: 0.8 },
  { Icon: FaCommentDots, top: "68%", left: "6%", size: 22, delay: 1.6 },
  { Icon: FaCheckCircle, top: "78%", left: "90%", size: 18, delay: 0.4 },
  { Icon: FaBolt, top: "48%", left: "94%", size: 14, delay: 2.2 },
  { Icon: FaCommentDots, top: "6%", left: "62%", size: 16, delay: 1.2 },
];

export default function ContactBackdrop({ dark }) {
  const dotColor = dark ? "rgba(242,184,75,0.10)" : "rgba(43,32,23,0.08)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: "26px 26px",
        }}
      />

      <div
        className={`absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 ${
          dark ? "bg-[#3A2A1C]" : "bg-[#FFE9B0]"
        }`}
      />
      <div
        className={`absolute -bottom-16 -right-24 h-96 w-96 rounded-full blur-3xl opacity-30 ${
          dark ? "bg-[#1E3A2C]" : "bg-[#CFE6D0]"
        }`}
      />
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl opacity-20 ${
          dark ? "bg-[#2B1A0E]" : "bg-[#F3DFC2]"
        }`}
      />

      <div
        className={`absolute top-20 right-10 h-24 w-24 rotate-12 rounded-2xl border-2 ${
          dark ? "border-[#3A2A1C]" : "border-[#E6D5B9]"
        }`}
      />
      <div
        className={`absolute bottom-24 left-10 h-20 w-20 -rotate-6 rounded-3xl border-2 ${
          dark ? "border-[#3A2A1C]" : "border-[#E6D5B9]"
        }`}
      />
      <div
        className={`absolute top-1/2 left-6 h-14 w-14 rotate-45 rounded-xl border-2 ${
          dark ? "border-[#3A2A1C]" : "border-[#EFE2C6]"
        }`}
      />

      {FLOATING_ICONS.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top, left }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.4, 0.4, 0], y: [-8, 8, -8] }}
          transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={size} className={dark ? "text-[#F2B84B]" : "text-[#C58B1D]"} />
        </motion.div>
      ))}
    </div>
  );
}
