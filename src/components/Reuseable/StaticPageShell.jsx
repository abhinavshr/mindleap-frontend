import { motion as Motion } from "framer-motion";
import Navbar from "./Navbar";

const pageFade = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function StaticPageShell({ dark, onToggleDark, eyebrow, title, subtitle, children }) {
  return (
    <div
      className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
        dark ? "bg-[#0C0907] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 px-4 py-10 sm:py-14">
        <Motion.div
          variants={pageFade}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-4xl"
        >
          <div className={`arcade-panel px-5 py-7 sm:px-8 sm:py-10 ${dark ? "bg-[#15100B] border-[#3A2A1C] shadow-[0_10px_0_#3A2A1C]" : "bg-[#FFF9EE]"}`}>
            <p className={`text-xs uppercase tracking-[0.24em] ${dark ? "text-[#D7C4AC]" : "text-[#7A6D60]"}`}>
              {eyebrow}
            </p>
            <h1 className={`mt-3 text-3xl sm:text-4xl font-extrabold leading-tight ${dark ? "text-[#FFE9B0] drop-shadow-[0_1px_0_rgba(43,32,23,0.85)]" : "text-[#2B2017]"}`}>
              {title}
            </h1>
            {subtitle ? (
              <p className={`mt-3 text-sm sm:text-base ${dark ? "text-[#D0BFA8]" : "text-[#5A4636]"}`}>
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8 space-y-6">
              {children}
            </div>
          </div>
        </Motion.div>
      </main>
    </div>
  );
}
