const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

export default function Keyboard({ onKey, keyStatuses = {} }) {
  const getKeyStyle = (key) => {
    const status = keyStatuses[key];
    if (status === "correct") return "bg-[#2FAF74] text-[#FDFBF5] border-[#1E7E52]";
    if (status === "present") return "bg-[#F2B84B] text-[#2B2017] border-[#C58B1D]";
    if (status === "absent")  return "bg-[#8A8A8A] text-[#FDFBF5] border-[#5E5E5E]";
    return "bg-[#FFEFC7] text-[#2B2017] border-[#2B2017] hover:bg-[#FFE3A1]";
  };

  const isWide = (key) => key === "ENTER" || key === "⌫";

  return (
    <div className="flex flex-col items-center gap-2 arcade-panel px-2 sm:px-4 py-4 sm:py-5 w-full max-w-full sm:max-w-125">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-0.5 sm:gap-1.5 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey?.(key === "⌫" ? "BACKSPACE" : key)}
              className={`
                ${isWide(key)
                  ? "px-2 sm:px-4 min-w-[60px] sm:min-w-[88px]"
                  : i === 2 ? "w-[46px] sm:w-[48px]" : "w-[40px] sm:w-[46px]"}
                h-[58px] sm:h-[60px] rounded-lg border text-sm sm:text-base font-bold uppercase arcade-key
                flex items-center justify-center select-none touch-manipulation
                transition-colors duration-100 active:scale-95
                ${getKeyStyle(key)}
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}