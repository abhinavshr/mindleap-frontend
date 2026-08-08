import { FaBolt } from "react-icons/fa";

export default function IdleScreen({ dark, loading, onStart }) {
  const infoPanelStyle = {
    backgroundColor: dark ? "#1B120C" : "#FFF8EC",
    border: dark ? "2px solid #3A2A1C" : "2px solid #D4B896",
    color: dark ? "#F7EEDB" : "#2B2017",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  };
  const infoLabelStyle = { color: dark ? "#CBBEAC" : "#7A5C3E", fontSize: "14px" };
  const infoValueStyle = { color: dark ? "#F7EEDB" : "#2B2017", fontSize: "14px", fontWeight: "600" };
  const infoXpStyle = { color: dark ? "#F2B84B" : "#C58B1D", fontSize: "14px", fontWeight: "600" };

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 max-w-sm text-center">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
          dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
        }`}
      >
        <FaBolt className="text-[#F2B84B]" size={28} />
      </div>

      <div>
        <h1 className={`text-3xl sm:text-4xl font-arcade mb-2 ${dark ? "text-[#F7EEDB]" : "text-[#2B2017]"}`}>
          Speed Game
        </h1>
        <p className={`text-sm ${dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}`}>
          Guess the word in <strong>60 seconds</strong>. Faster wins = more XP.
          You get <strong>6 guesses</strong>.
        </p>
      </div>

      <div style={infoPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={infoLabelStyle}>Time limit</span>
          <span style={infoValueStyle}>60 seconds</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={infoLabelStyle}>Max guesses</span>
          <span style={infoValueStyle}>6</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={infoLabelStyle}>XP reward</span>
          <span style={infoXpStyle}>Up to 100 XP</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={loading}
        className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
          dark
            ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
            : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Starting…
          </>
        ) : (
          <>
            <FaBolt size={16} /> Start Game
          </>
        )}
      </button>
    </div>
  );
}
