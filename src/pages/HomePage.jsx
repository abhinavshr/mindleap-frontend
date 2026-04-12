import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Reuseable/Navbar";
import Board from "../components/Board/Board";
import Keyboard from "../components/Keyboard/Keyboard";
import { FaTrophy } from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [keyStatuses, setKeyStatuses] = useState({});

  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;
  const SECRET_WORD = "CRANE";

  const showMessage = (msg, type = "info", duration = 2000) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), duration);
  };

  const submitGuess = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length < WORD_LENGTH) {
      showMessage("Not enough letters", "info");
      return;
    }

    const result = currentGuess.split("").map((letter, i) => {
      if (SECRET_WORD[i] === letter) return "correct";
      if (SECRET_WORD.includes(letter)) return "present";
      return "absent";
    });

    const newGuess = { word: currentGuess, result };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const priority = { correct: 3, present: 2, absent: 1 };
    setKeyStatuses((prev) => {
      const updated = { ...prev };
      currentGuess.split("").forEach((letter, i) => {
        const newStatus = result[i];
        if (!updated[letter] || priority[newStatus] > priority[updated[letter]]) {
          updated[letter] = newStatus;
        }
      });
      return updated;
    });

    if (currentGuess === SECRET_WORD) {
      showMessage("You won!", "win", 4000);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      showMessage(`The word was ${SECRET_WORD}`, "lose", 4000);
      setGameOver(true);
    }
  }, [currentGuess, guesses, gameOver]);

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "BACKSPACE" || key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameOver, submitGuess]);

  useEffect(() => {
    const handler = (e) =>
      handleKey(e.key === "Backspace" ? "Backspace" : e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const toastStyles = {
    win:  "bg-[#6AAA64] text-white",
    lose: "bg-[#787C7E] text-white",
    info: "bg-[#1A1A1B] text-white",
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        dark ? "bg-[#121213]" : "bg-white"
      }`}
    >
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      {/* Toast */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          message
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg ${toastStyles[messageType]}`}
        >
          {messageType === "win"  && <FaTrophy size={14} />}
          {messageType === "lose" && <MdClose  size={16} />}
          <span>{message}</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-between py-8 gap-6">
        <div className="flex-1 flex items-center justify-center">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={MAX_GUESSES}
            wordLength={WORD_LENGTH}
          />
        </div>
        <div className="w-full flex justify-center px-2">
          <Keyboard onKey={handleKey} keyStatuses={keyStatuses} />
        </div>
      </main>
    </div>
  );
}