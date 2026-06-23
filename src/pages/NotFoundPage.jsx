import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Reuseable/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function NotFoundPage({ dark, onToggleDark }) {
  return (
    <div
      className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <Helmet>
        <title>Page Not Found - Mindleap</title>
        <meta name="description" content="The page you are looking for could not be found. Return to Mindleap home." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-3xl"
        >
          <div
            className={`absolute -top-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-40 ${
              dark ? "bg-[#2E1C10]" : "bg-[#FFD38C]"
            }`}
          />
          <div
            className={`absolute -bottom-8 -right-6 h-40 w-40 rounded-full blur-3xl opacity-40 ${
              dark ? "bg-[#1C2E1B]" : "bg-[#CFE6D0]"
            }`}
          />

          <div className="arcade-panel relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center">
            <div className="font-arcade text-6xl sm:text-7xl tracking-wide">404</div>
            <h1 className="mt-3 font-arcade text-2xl sm:text-3xl">Page Not Found</h1>
            <p className={`mt-3 text-sm sm:text-base ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
              The page you are trying to reach does not exist or has moved.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                  dark
                    ? "bg-[#1B120C] border-[#F7EEDB] text-[#F7EEDB] hover:bg-[#2B2017]"
                    : "bg-[#FFE9B0] border-[#2B2017] text-[#2B2017] hover:bg-[#FFDFA0]"
                }`}
              >
                Back Home
              </Link>
              <Link
                to="/login"
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                  dark
                    ? "border-[#CBBEAC] text-[#F7EEDB] hover:border-[#F7EEDB]"
                    : "border-[#5A4636] text-[#2B2017] hover:border-[#2B2017]"
                }`}
              >
                Log In
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
