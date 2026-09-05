// Backend (speedGameController.js) always returns the answer under `secret`
// on both expireSpeedSession and submitSpeedGuess (timeUp/lost branches).
// Keep a couple of fallbacks in case that ever changes, but `secret` is
// the canonical key — don't remove it from the front of this list.
export const extractReveal = (data) =>
  data?.secret || data?.word || data?.answer || data?.correctWord || "";

// Backend also returns `meaning` alongside `secret` on the same branches.
export const extractMeaning = (data) =>
  data?.meaning || "";

export const getSpeedBadge = (timeTaken, timeLimit) => {
  const ratio = timeTaken / timeLimit;
  if (ratio <= 0.25) return "LIGHTNING FAST";
  if (ratio <= 0.5) return "QUICK WIN";
  if (ratio <= 0.8) return "SOLID FINISH";
  return "JUST IN TIME";
};

export const buildKeyStatuses = (prev, word, result) => {
  const priority = { correct: 3, present: 2, absent: 1 };
  const updated = { ...prev };
  word.split("").forEach((letter, i) => {
    const status = result[i];
    if (!updated[letter] || priority[status] > priority[updated[letter]]) {
      updated[letter] = status;
    }
  });
  return updated;
};