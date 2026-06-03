import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

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

const EMOJI_POOL = [
  "🐶", "🐱", "🦊", "🐸", "🦄", "🐙", "🦋", "🦁",
  "🐯", "🐧", "🦖", "🐳", "🦚", "🌺", "🍄", "🎃",
  "🔮", "🌈", "🎸", "🍕",
];

const DIFFICULTIES = {
  easy:   { label: "Easy",   pairs: 6,  cols: 4 },
  medium: { label: "Medium", pairs: 8,  cols: 4 },
  hard:   { label: "Hard",   pairs: 10, cols: 5 },
};

const OFFLINE_MESSAGES = [
  { icon: "🐹", text: "Our hamsters are on strike. Union negotiations ongoing. ETA: unknown." },
  { icon: "☕", text: "The servers went for coffee and haven't come back. They do this sometimes." },
  { icon: "🧦", text: "Someone tripped over the server cable. We're not pointing fingers. (It was Dave.)" },
  { icon: "🛸", text: "Our backend was abducted by aliens. We've filed a report. Please hold." },
  { icon: "😴", text: "The server is napping. We tried yelling at it. Currently trying bribery." },
];

const LS_KEY = (diff) => `memoryFlip_best_${diff}`;

function getStoredBest(diff) {
  try {
    const v = localStorage.getItem(LS_KEY(diff));
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

function setStoredBest(diff, moves) {
  try {
    localStorage.setItem(LS_KEY(diff), String(moves));
  } catch {}
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs) {
  const pool = shuffle([...EMOJI_POOL]).slice(0, pairs);
  return shuffle([...pool, ...pool].map((emoji, id) => ({ id, emoji, key: emoji })));
}

function Card({ card, isFlipped, isMatched, onClick, dark }) {
  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: "600px", aspectRatio: "1/1", maxWidth: "64px", width: "100%" }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 ${
            dark ? "bg-[#1B120C] border-[#5A3E1E]" : "bg-[#FFE9B0] border-[#C9A86C]"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className={`font-arcade text-xs ${dark ? "text-[#8A7060]" : "text-[#C9A86C]"}`}>
            ?
          </span>
        </div>

        <motion.div
          className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 ${
            isMatched
              ? dark ? "border-[#F2B84B] bg-[#221508]" : "border-[#D4860A] bg-[#FFF8EC]"
              : dark ? "border-[#5A3E1E] bg-[#1A110A]" : "border-[#C9A86C] bg-[#FFF8EC]"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          animate={
            isMatched
              ? {
                  boxShadow: dark
                    ? ["0 0 0px #F2B84B00", "0 0 16px #F2B84B66", "0 0 8px #F2B84B33"]
                    : ["0 0 0px #D4860A00", "0 0 16px #FFD38C88", "0 0 8px #FFD38C44"],
                }
              : { boxShadow: "0 0 0px transparent" }
          }
          transition={{ duration: 0.6 }}
        >
          <span className="text-lg select-none">{card.emoji}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MemoryGame({ dark }) {
  const [diff, setDiff] = useState("easy");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("flip a card to start");
  const [won, setWon] = useState(false);
  const [winResult, setWinResult] = useState(null);
  const [bestScores, setBestScores] = useState(() => ({
    easy:   getStoredBest("easy"),
    medium: getStoredBest("medium"),
    hard:   getStoredBest("hard"),
  }));

  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      const match = e.key.match(/^memoryFlip_best_(.+)$/);
      if (match) {
        const d = match[1];
        const val = e.newValue ? parseInt(e.newValue, 10) : null;
        setBestScores((prev) => ({ ...prev, [d]: val }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const startGame = useCallback((d = diff) => {
    setDiff(d);
    setCards(buildDeck(DIFFICULTIES[d].pairs));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setMessage("flip a card to start");
    setWon(false);
    setWinResult(null);
  }, [diff]);

  useEffect(() => { startGame("easy"); }, []); // eslint-disable-line

  const handleFlip = (idx) => {
    if (locked || flipped.includes(idx) || matched.has(cards[idx].key)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      const [a, b] = next;
      const newMoves = moves + 1;
      setMoves(newMoves);

      if (cards[a].key === cards[b].key) {
        const newMatched = new Set([...matched, cards[a].key]);
        setMatched(newMatched);
        setFlipped([]);
        setMessage("nice match! ✓");

        if (newMatched.size === DIFFICULTIES[diff].pairs) {
          const prev = getStoredBest(diff);
          const isNew = prev === null || newMoves < prev;
          if (isNew) {
            setStoredBest(diff, newMoves);
            setBestScores((s) => ({ ...s, [diff]: newMoves }));
          }
          setWinResult({ isNew, prev, current: newMoves });
          setTimeout(() => setWon(true), 500);
        }
      } else {
        setLocked(true);
        setMessage("no match...");
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          setMessage("keep going!");
        }, 900);
      }
    } else {
      setMessage("pick another card");
    }
  };

  const { pairs, cols } = DIFFICULTIES[diff];
  const progress = Math.round((matched.size / pairs) * 100);

  return (
    <div className="w-full">
      <div className={`rounded-xl border mb-4 px-4 py-3 ${dark ? "bg-[#130D07] border-[#3A2810]" : "bg-[#FFF8EC] border-[#E8D5A8]"}`}>
        <p className={`font-arcade text-xs text-center mb-2 ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>
          ── high scores ──
        </p>
        <div className="flex justify-around gap-2">
          {Object.entries(DIFFICULTIES).map(([key, { label }]) => {
            const score = bestScores[key];
            const isActive = diff === key;
            return (
              <div
                key={key}
                className={`flex-1 text-center rounded-lg py-2 px-1 border transition-all ${
                  isActive
                    ? dark
                      ? "border-[#F2B84B] bg-[#221508]"
                      : "border-[#D4860A] bg-[#FFF3D6]"
                    : dark
                    ? "border-[#2B1A08] bg-transparent"
                    : "border-[#E8D5A8] bg-transparent"
                }`}
              >
                <div className={`text-xs mb-1 ${isActive ? (dark ? "text-[#F2B84B]" : "text-[#D4860A]") : (dark ? "text-[#6A5040]" : "text-[#C9A86C]")}`}>
                  {label}
                </div>
                <div className={`font-arcade text-sm ${score !== null ? (dark ? "text-[#F2B84B]" : "text-[#D4860A]") : (dark ? "text-[#3A2810]" : "text-[#DDD0B0]")}`}>
                  {score !== null ? score : "—"}
                </div>
                <div className={`text-xs mt-0.5 ${dark ? "text-[#5A4030]" : "text-[#C9B080]"}`}>
                  {score !== null ? "moves" : "unplayed"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => startGame(key)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors font-copy ${
              diff === key
                ? dark
                  ? "border-[#F2B84B] text-[#F2B84B] bg-[#221508]"
                  : "border-[#D4860A] text-[#D4860A] bg-[#FFF3D6]"
                : dark
                ? "border-[#5A3E1E] text-[#CBBEAC] hover:border-[#F2B84B]"
                : "border-[#C9A86C] text-[#7A5C3E] hover:border-[#D4860A]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-center ${dark ? "bg-[#1A110A] border-[#5A3E1E]" : "bg-[#FFF8EC] border-[#C9A86C]"}`}>
            <div className={`font-arcade text-sm ${dark ? "text-[#F2B84B]" : "text-[#D4860A]"}`}>{moves}</div>
            <div className={`text-xs mt-0.5 ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>moves</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-center ${dark ? "bg-[#1A110A] border-[#5A3E1E]" : "bg-[#FFF8EC] border-[#C9A86C]"}`}>
            <div className={`font-arcade text-sm ${dark ? "text-[#F2B84B]" : "text-[#D4860A]"}`}>{matched.size}/{pairs}</div>
            <div className={`text-xs mt-0.5 ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>pairs</div>
          </div>
        </div>

        <button
          onClick={() => startGame()}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-colors ${
            dark
              ? "bg-[#1B120C] border-[#F7EEDB] text-[#F7EEDB] hover:bg-[#2B2017]"
              : "bg-[#FFE9B0] border-[#2B2017] text-[#2B2017] hover:bg-[#FFDFA0]"
          }`}
        >
          New Game
        </button>
      </div>

      <div className={`h-1.5 rounded-full mb-4 overflow-hidden ${dark ? "bg-[#221508]" : "bg-[#E8D5A8]"}`}>
        <motion.div
          className={`h-full rounded-full ${dark ? "bg-[#F2B84B]" : "bg-[#D4860A]"}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div
        className="grid gap-1.5 relative"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 64px))`, justifyContent: "center" }}
      >
        {cards.map((card, idx) => (
          <Card
            key={card.id}
            card={card}
            isFlipped={flipped.includes(idx)}
            isMatched={matched.has(card.key)}
            onClick={() => handleFlip(idx)}
            dark={dark}
          />
        ))}
      </div>

      <div className={`text-center font-arcade text-xs mt-4 h-5 ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>
        {message}
      </div>

      <AnimatePresence>
        {won && winResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl z-20 ${
              dark ? "bg-[#1A110A]/95" : "bg-[#FFF8EC]/95"
            }`}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
              className="text-4xl mb-2"
            >
              {winResult.isNew ? "🏆" : "🎉"}
            </motion.div>

            <p className={`font-arcade text-xl mb-1 ${dark ? "text-[#F2B84B]" : "text-[#D4860A]"}`}>
              you win!
            </p>

            {winResult.isNew ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`text-xs font-arcade mb-1 px-3 py-1 rounded-lg border ${
                  dark
                    ? "text-[#F2B84B] border-[#F2B84B] bg-[#2B1A06]"
                    : "text-[#D4860A] border-[#D4860A] bg-[#FFF3D6]"
                }`}
              >
                ★ new high score!
              </motion.p>
            ) : (
              <p className={`text-xs mb-1 ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>
                best: {winResult.prev} moves
              </p>
            )}

            <p className={`text-sm mb-6 ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
              {winResult.current} moves · {pairs} pairs
              {!winResult.isNew && winResult.prev !== null && (
                <span className={`ml-2 text-xs ${dark ? "text-[#8A7060]" : "text-[#A08060]"}`}>
                  ({winResult.current - winResult.prev > 0 ? "+" : ""}{winResult.current - winResult.prev} vs best)
                </span>
              )}
            </p>

            <button
              onClick={() => startGame()}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold font-arcade border-2 transition-colors ${
                dark
                  ? "bg-[#1B120C] border-[#F7EEDB] text-[#F7EEDB] hover:bg-[#2B2017]"
                  : "bg-[#FFE9B0] border-[#2B2017] text-[#2B2017] hover:bg-[#FFDFA0]"
              }`}
            >
              play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BackendDownPage({ dark, onToggleDark, status, onRetry }) {
  const isChecking = status === "checking";
  const [showGame, setShowGame] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    if (isChecking) return;
    const timer = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % OFFLINE_MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, [isChecking]);

  const currentMsg = OFFLINE_MESSAGES[msgIdx];

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <div className="relative w-full max-w-lg">
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

        <div className={`arcade-panel relative z-10 px-6 py-8 sm:px-8 sm:py-10 ${dark ? "arcade-panel-dark" : ""}`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <motion.div
                className={`h-14 w-14 rounded-full border-2 flex-shrink-0 ${
                  dark ? "border-[#F2B84B]" : "border-[#2B2017]"
                } flex items-center justify-center`}
                variants={pulseOrbit}
                initial="idle"
                animate="active"
              >
                <div className="flex items-end gap-1 h-6">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className={`w-1.5 rounded-full origin-bottom ${dark ? "bg-[#F2B84B]" : "bg-[#2B2017]"}`}
                      style={{ height: "100%" }}
                      variants={barWave(i * 0.18)}
                      initial="idle"
                      animate="active"
                    />
                  ))}
                </div>
              </motion.div>

              <div>
                <p className={`text-xs uppercase tracking-[0.3em] ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
                  System Status
                </p>
                <h1 className="font-arcade text-xl sm:text-2xl leading-snug">
                  {isChecking ? "Checking servers" : "Backend offline"}
                </h1>
              </div>
            </div>

            <button
              onClick={onToggleDark}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                dark
                  ? "border-[#CBBEAC] text-[#F7EEDB] hover:border-[#F7EEDB]"
                  : "border-[#5A4636] text-[#2B2017] hover:border-[#2B2017]"
              }`}
            >
              {dark ? "☀ Light" : "☾ Dark"}
            </button>
          </div>

          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: msgVisible ? 1 : 0, y: msgVisible ? 0 : -4 }}
            transition={{ duration: 0.4 }}
            className={`text-sm mb-5 ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}
          >
            {isChecking
              ? "Hang tight while we ping the API."
              : `${currentMsg.icon}  ${currentMsg.text}`}
          </motion.p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={onRetry}
              disabled={isChecking}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                dark
                  ? "bg-[#1B120C] border-[#F7EEDB] text-[#F7EEDB] hover:bg-[#2B2017]"
                  : "bg-[#FFE9B0] border-[#2B2017] text-[#2B2017] hover:bg-[#FFDFA0]"
              }`}
            >
              {isChecking ? "Checking…" : "↺ Retry"}
            </button>

            <button
              onClick={() => setShowGame((v) => !v)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                showGame
                  ? dark
                    ? "bg-[#2B2017] border-[#F2B84B] text-[#F2B84B]"
                    : "bg-[#FFF3D6] border-[#D4860A] text-[#D4860A]"
                  : dark
                  ? "border-[#CBBEAC] text-[#F7EEDB] hover:border-[#F7EEDB]"
                  : "border-[#5A4636] text-[#2B2017] hover:border-[#2B2017]"
              }`}
            >
              {showGame ? "▲ Hide Game" : "▼ Play a Game"}
            </button>
          </div>

          <AnimatePresence>
            {showGame && (
              <motion.div
                key="game"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`border-t mb-5 ${dark ? "border-[#2B2017]" : "border-[#E8D5A8]"}`} />
                <p className={`font-arcade text-xs mb-4 ${dark ? "text-[#CBBEAC]" : "text-[#7A5C3E]"}`}>
                  Memory Flip
                </p>
                <div className="relative">
                  <MemoryGame dark={dark} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}