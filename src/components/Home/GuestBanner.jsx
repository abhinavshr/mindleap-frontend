import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { bannerVariant } from "../../utils/animationVariants";

export default function GuestBanner({ isAuth, dark }) {
  return (
    <AnimatePresence>
      {!isAuth && (
        <motion.div
          key="guest-banner"
          variants={bannerVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`w-full overflow-hidden border-b ${dark ? "bg-[#1B120C] border-[#F7EEDB]" : "bg-[#FFE9B0] border-[#2B2017]"}`}
        >
          <div className={`px-4 py-2 text-center text-sm font-medium ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
            You have <strong>5 guesses</strong> as a guest.{" "}
            <Link
              to="/register"
              className={`font-bold underline ${dark ? "hover:text-[#FFE9B0]" : "hover:text-[#C64B2A]"}`}
            >
              Register
            </Link>{" "}
            to get 6 guesses, see the answer + leaderboard access.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}