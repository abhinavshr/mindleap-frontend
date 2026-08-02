// Shared framer-motion variants used across the HomePage component tree.

export const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

export const popIn = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 22 },
  },
};

export const bannerVariant = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

export const toastVariant = {
  hidden: { opacity: 0, y: -24, scale: 0.88 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
  exit: { opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } },
};

export const revealContainerVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
};

export const revealLetterVariant = {
  hidden: { opacity: 0, rotateX: -90, scale: 0.7 },
  visible: {
    opacity: 1, rotateX: 0, scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 16 },
  },
};

export const winPulseVariant = {
  idle: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  active: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 rgba(0,0,0,0)",
      "0 0 35px rgba(242,184,75,0.35)",
      "0 0 0 rgba(0,0,0,0)",
    ],
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

export const burstVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: [0.7, 1.08, 1],
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

// ── Win modal animation variants ──────────────────────────────────
export const modalOverlayVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalCardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.85, rotate: -2 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.05 },
  },
  exit: { opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.2 } },
};

export const trophyBounceVariant = {
  hidden: { scale: 0, rotate: -25, opacity: 0 },
  visible: {
    scale: [0, 1.25, 1],
    rotate: [-25, 8, 0],
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

export const modalTextStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

export const modalTextItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const starPopVariant = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i = 0) => ({
    scale: 1, opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 15, delay: 0.5 + i * 0.1 },
  }),
};