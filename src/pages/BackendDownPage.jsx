import { motion } from "framer-motion";

const pulseOrbit = {
  idle: { opacity: 0.5, scale: 0.95 },
  active: {
    opacity: [0.4, 0.9, 0.4],
    scale: [0.95, 1.05, 0.95],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
};

const barWave = (delay = 0) => ({
  idle: { scaleY: 0.35 },
  active: {
    scaleY: [0.35, 1, 0.35],
    transition: { duration: 1.2, delay, repeat: Infinity, ease: "easeInOut" },
  },
});

export default function BackendDownPage({ dark, onToggleDark, status, onRetry }) {
  const isChecking = status === "checking";

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <div className="relative w-full max-w-3xl">
        <motion.div
          className={`absolute -top-12 -left-12 h-40 w-40 rounded-full blur-3xl opacity-40 ${
            dark ? "bg-[#2E1C10]" : "bg-[#FFD38C]"
          }`}
          variants={pulseOrbit}
          initial="idle"
          animate="active"
        />
        <motion.div
          className={`absolute -bottom-10 -right-8 h-48 w-48 rounded-full blur-3xl opacity-30 ${
            dark ? "bg-[#1C2E1B]" : "bg-[#CFE6D0]"
          }`}
          variants={pulseOrbit}
          initial="idle"
          animate="active"
        />

        <div
          className={`arcade-panel relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center ${
            dark ? "arcade-panel-dark" : ""
          }`}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className={`h-16 w-16 rounded-full border-2 ${
                dark ? "border-[#F2B84B]" : "border-[#2B2017]"
              } flex items-center justify-center`}
              variants={pulseOrbit}
              initial="idle"
              animate="active"
            >
              <div className="flex items-end gap-1 h-8">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className={`w-2 rounded-full origin-bottom ${dark ? "bg-[#F2B84B]" : "bg-[#2B2017]"}`}
                    style={{ height: "100%" }}
                    variants={barWave(i * 0.18)}
                    initial="idle"
                    animate="active"
                  />
                ))}
              </div>
            </motion.div>

            <div className="text-left">
              <p className={`text-xs uppercase tracking-[0.3em] ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
                System Status
              </p>
              <h1 className="font-arcade text-2xl sm:text-3xl">
                {isChecking ? "Checking servers" : "Backend offline"}
              </h1>
            </div>
          </div>

          <p className={`mt-4 text-sm sm:text-base ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
            {isChecking
              ? "Hang tight while we ping the API."
              : "We cannot reach the game servers right now. Try again in a moment."}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRetry}
              disabled={isChecking}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                dark
                  ? "bg-[#1B120C] border-[#F7EEDB] text-[#F7EEDB] hover:bg-[#2B2017]"
                  : "bg-[#FFE9B0] border-[#2B2017] text-[#2B2017] hover:bg-[#FFDFA0]"
              }`}
            >
              {isChecking ? "Checking" : "Retry"}
            </button>
            <button
              onClick={onToggleDark}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                dark
                  ? "border-[#CBBEAC] text-[#F7EEDB] hover:border-[#F7EEDB]"
                  : "border-[#5A4636] text-[#2B2017] hover:border-[#2B2017]"
              }`}
            >
              Toggle theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
