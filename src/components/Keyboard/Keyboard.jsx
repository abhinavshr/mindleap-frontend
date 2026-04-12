const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

export default function Keyboard({ onKey, keyStatuses = {} }) {
  const getKeyStyle = (key) => {
    const status = keyStatuses[key];
    if (status === "correct") return "bg-[#6AAA64] text-white border-[#6AAA64]";
    if (status === "present") return "bg-[#C9B458] text-white border-[#C9B458]";
    if (status === "absent")  return "bg-[#787C7E] text-white border-[#787C7E]";
    return "bg-[#D3D6DA] text-[#1A1A1B] border-[#D3D6DA] hover:bg-[#c0c3c7]";
  };

  const isWide = (key) => key === "ENTER" || key === "⌫";

  return (
    <div className="flex flex-col items-center gap-2 bg-[#F0F0F0] rounded-xl px-4 py-5 w-full max-w-125">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey?.(key)}
              className={`
                ${isWide(key) ? "px-4 min-w-16" : "w-10.75"}
                h-14.5 rounded-lg border text-sm font-bold uppercase
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