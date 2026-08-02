// Small pure helpers used to drive the win celebration UI.

export const createConfettiPieces = (count = 46) => {
  const colors = ["#2FAF74", "#F2B84B", "#C64B2A", "#6AAA64", "#FFE9B0"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() * 2 - 1) * 140,
    delay: Math.random() * 0.25,
    rotate: Math.random() * 720,
    size: 6 + Math.random() * 6,
    drift: (Math.random() * 2 - 1) * 30,
    color: colors[i % colors.length],
  }));
};

// Star rating based on how few guesses it took to win
export const getWinStars = (attempts, maxGuesses) => {
  const ratio = attempts / maxGuesses;
  if (ratio <= 0.4) return 3;
  if (ratio <= 0.7) return 2;
  return 1;
};

export const getWinPraise = (attempts) => {
  if (attempts === 1) return "Unbelievable! First try!";
  if (attempts === 2) return "Incredible guessing!";
  if (attempts === 3) return "Great job!";
  if (attempts === 4) return "Nicely done!";
  return "Phew, you got it!";
};