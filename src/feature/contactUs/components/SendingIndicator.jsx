import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";

/**
 * A little paper plane that flies left-to-right along a dashed runway,
 * fading in/out at each end so the loop reset is invisible. Uses
 * currentColor for both the plane and the runway line, so it always
 * matches the button's text color in both light and dark mode without
 * needing a `dark` prop.
 */
export default function SendingIndicator({ label = "Sending…" }) {
  return (
    <span className="flex items-center gap-2">
      <span className="relative w-9 h-4 shrink-0 overflow-hidden">
        <span className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t border-dashed border-current opacity-30" />
        <motion.span
          className="absolute top-1/2 -translate-y-1/2 left-0"
          initial={{ x: "-10%", opacity: 0 }}
          animate={{
            x: ["-10%", "10%", "60%", "130%"],
            y: [0, -3, 2, -1],
            rotate: [-8, 4, -6, 2],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaPaperPlane size={13} />
        </motion.span>
      </span>
      {label}
    </span>
  );
}
