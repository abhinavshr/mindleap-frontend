export const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export const overlayVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const cardVariant = {
  hidden: { opacity: 0, y: 120 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
  exit: { opacity: 0, y: 100, transition: { duration: 0.2 } },
};

export const boltFlashVariant = {
  hidden: { scale: 0.4, opacity: 0, rotate: -15 },
  visible: {
    scale: [0.4, 1.3, 1],
    opacity: 1,
    rotate: [-15, 5, 0],
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const ribbonVariant = {
  hidden: { opacity: 0, x: -30, rotate: -8 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: -6,
    transition: { type: "spring", stiffness: 300, damping: 18, delay: 0.15 },
  },
};
