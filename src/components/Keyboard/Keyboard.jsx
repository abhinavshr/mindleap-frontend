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
        <div key={i} className="flex gap-1 sm:gap-1.5 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey?.(key)}
              className={`
                ${isWide(key) ? "px-3 sm:px-4 min-w-12 sm:min-w-16" : "w-8.5 sm:w-10.75"}
                h-12 sm:h-14.5 rounded-lg border text-xs sm:text-sm font-bold uppercase arcade-key
                flex items-center justify-center
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