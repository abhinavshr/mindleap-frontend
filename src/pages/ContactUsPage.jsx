import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import {
  FaBolt,
  FaPaperPlane,
  FaEnvelope,
  FaClock,
  FaBug,
  FaLightbulb,
  FaUserCog,
  FaCreditCard,
  FaCommentDots,
  FaCheckCircle,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Howl, Howler } from "howler";
import Navbar from "../components/Reuseable/Navbar";
import { sendContactMessage } from "@/api/contact";

const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const overlayVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 120 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
  exit: { opacity: 0, y: 100, transition: { duration: 0.2 } },
};

const boltFlashVariant = {
  hidden: { scale: 0.4, opacity: 0, rotate: -15 },
  visible: {
    scale: [0.4, 1.3, 1],
    opacity: 1,
    rotate: [-15, 5, 0],
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const ribbonVariant = {
  hidden: { opacity: 0, x: -30, rotate: -8 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: -6,
    transition: { type: "spring", stiffness: 300, damping: 18, delay: 0.15 },
  },
};

const STREAKS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  top: 10 + i * 14,
  delay: i * 0.05,
  width: 40 + Math.random() * 60,
}));

const QUEST_CHIPS = [
  { label: "Bug Report", icon: FaBug },
  { label: "Feature Idea", icon: FaLightbulb },
  { label: "Account Help", icon: FaUserCog },
  { label: "Billing", icon: FaCreditCard },
  { label: "Something Else", icon: FaCommentDots },
];

const FLOATING_ICONS = [
  { Icon: FaBolt, top: "12%", left: "8%", size: 20, delay: 0 },
  { Icon: FaEnvelope, top: "22%", left: "88%", size: 18, delay: 0.8 },
  { Icon: FaCommentDots, top: "68%", left: "6%", size: 22, delay: 1.6 },
  { Icon: FaCheckCircle, top: "78%", left: "90%", size: 18, delay: 0.4 },
  { Icon: FaBolt, top: "48%", left: "94%", size: 14, delay: 2.2 },
  { Icon: FaCommentDots, top: "6%", left: "62%", size: 16, delay: 1.2 },
];

function ContactBackdrop({ dark }) {
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

function QuestStreaks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      {STREAKS.map((s) => (
        <motion.span
          key={s.id}
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "220%", opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: s.delay, ease: "easeOut" }}
          style={{ top: `${s.top}%`, width: `${s.width}px` }}
          className="absolute h-[3px] -rotate-12 rounded-full bg-[#F2B84B]"
        />
      ))}
    </div>
  );
}

function ContactSuccessModal({ show, onClose, onSendAnother, dark }) {
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
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? "text-[#F2B84B]" : "text-[#C58B1D]"}`}>
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

function useSuccessSound() {
  const soundRef = useRef(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unlock = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      soundRef.current = new Howl({ src: ["/sounds/success.mp3"], volume: 0.6, preload: true });
      if (Howler.ctx && Howler.ctx.state !== "running") await Howler.ctx.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const play = async () => {
    if (!soundRef.current) {
      soundRef.current = new Howl({ src: ["/sounds/success.mp3"], volume: 0.6, preload: true });
    }
    if (Howler.ctx && Howler.ctx.state !== "running") await Howler.ctx.resume();
    soundRef.current.play();
  };

  return { play };
}

export default function ContactUsPage({ dark, onToggleDark }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { play: playSuccessSound } = useSuccessSound();

  const panelClass = `rounded-2xl border-2 arcade-panel px-5 py-6 sm:px-6 sm:py-7 ${
    dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFF8EC] border-[#2B2017]"
  }`;

  const bodyClass = dark ? "text-[#CBBEAC]" : "text-[#5A4636]";
  const headingClass = dark ? "text-[#F7EEDB]" : "text-[#2B2017]";

  const inputBase = `w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-colors duration-150 ${
    dark
      ? "border-[#3A2A1C] bg-[#120D09] text-[#F7EEDB] placeholder-[#7E6C58] focus:border-[#F2B84B]"
      : "border-[#D4B896] bg-[#FFFDF8] text-[#2B2017] placeholder-[#8A7661] focus:border-[#C64B2A]"
  }`;

  const labelClass = `text-sm font-semibold ${headingClass}`;

  const fieldsFilled = useMemo(
    () => [form.name, form.email, form.subject, form.message].filter((v) => v.trim().length > 0).length,
    [form]
  );
  const questPercent = (fieldsFilled / 4) * 100;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChipSelect = (label) => {
    setForm((prev) => ({ ...prev, subject: label }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await sendContactMessage(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      setShowSuccess(true);
      playSuccessSound();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <Helmet>
        <title>Contact Mindleap - Get in Touch with Our Team</title>
        <meta name="description" content="Have questions or feedback? Contact Mindleap directly. Fill out the form and our team will respond promptly." />
        <link rel="canonical" href="https://mindleap.live/contact-us" />
        <meta property="og:title" content="Contact Mindleap" />
        <meta property="og:description" content="Contact Mindleap directly with questions or feedback." />
        <meta property="og:url" content="https://mindleap.live/contact-us" />
      </Helmet>

      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <ContactSuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        onSendAnother={() => setShowSuccess(false)}
        dark={dark}
      />

      <main className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 gap-8 overflow-hidden">
        <ContactBackdrop dark={dark} />

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="relative z-10 flex flex-col items-center text-center gap-4 max-w-lg"
        >
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
              }`}
            >
              <FaBolt className="text-[#F2B84B]" size={28} />
            </div>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-arcade ${headingClass}`}>Contact Us</h1>
          <p className={`text-sm sm:text-base ${bodyClass}`}>
            Got a question or a bug to report? Complete the quest below and send it our way.
          </p>
        </motion.div>

        <div className="relative z-10 w-full max-w-3xl grid gap-6 sm:grid-cols-5">
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className={`${panelClass} sm:col-span-3`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className={`text-xl font-arcade ${headingClass}`}>Send a message</h2>
              <span className={`text-xs font-bold tabular-nums ${dark ? "text-[#F2B84B]" : "text-[#C58B1D]"}`}>
                {fieldsFilled}/4
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full mb-5 ${dark ? "bg-[#3A2A1C]" : "bg-[#F3DFC2]"}`}>
              <motion.div
                className="h-1.5 rounded-full bg-[#2FAF74]"
                animate={{ width: `${questPercent}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className={labelClass}>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputBase}
                    autoComplete="name"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={inputBase}
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="grid gap-2">
                <span className={labelClass}>What's this about?</span>
                <div className="flex flex-wrap gap-2">
                  {QUEST_CHIPS.map(({ label, icon: Icon }) => {
                    const selected = form.subject === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleChipSelect(label)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border-2 transition-colors duration-150 ${
                          selected
                            ? dark
                              ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017]"
                              : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5]"
                            : dark
                            ? "border-[#3A2A1C] text-[#CBBEAC] hover:border-[#F2B84B]"
                            : "border-[#D4B896] text-[#5A4636] hover:border-[#C64B2A]"
                        }`}
                      >
                        <Icon size={11} /> {label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Or type your own subject"
                  className={inputBase}
                />
              </div>

              <label className="grid gap-2">
                <span className={labelClass}>Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Hi, I am having trouble logging in."
                  className={`${inputBase} resize-none`}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
                  dark
                    ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
                    : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={14} /> Send Message
                  </>
                )}
              </button>
            </form>
          </motion.section>

          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className={`${panelClass} sm:col-span-2 flex flex-col gap-5`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                  dark ? "bg-[#241811] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
                }`}
              >
                <FaBolt className="text-[#F2B84B]" size={18} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${headingClass}`}>Mindleap Support</p>
                <p className={`text-xs ${bodyClass}`}>Direct contact</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${bodyClass}`}>
                  <FaEnvelope size={12} /> Email
                </span>
                <span className={`text-sm font-bold ${headingClass}`}>infomindleap@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${bodyClass}`}>
                  <FaClock size={12} /> Hours
                </span>
                <span className={`text-sm font-bold ${headingClass}`}>Mon – Fri</span>
              </div>
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: dark ? "#3A2A1C" : "#E7D5B4" }}
              >
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? "text-[#F2B84B]" : "text-[#C58B1D]"}`}>
                  <FaBolt size={12} /> Response time
                </span>
                <span className="text-sm font-extrabold text-[#F2B84B]">Within 24h</span>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}