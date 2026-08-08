const LEGEND_ITEMS = [
  { swatch: "bg-[#2FAF74] border-[#1E7E52]", label: "Correct spot" },
  { swatch: "bg-[#F2B84B] border-[#C58B1D]", label: "In word, wrong spot" },
  { swatch: "bg-[#8A8A8A] border-[#5E5E5E]", label: "Not in word" },
];

export default function ColorLegend({ dark }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-3.5 h-3.5 rounded-sm border ${item.swatch}`} />
          <span className={dark ? "text-[#CBBEAC]" : "text-[#5A4636]"}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
