export default function ColorLegend({ dark }) {
  const subColor = dark ? "text-[#CBBEAC]" : "text-[#5A4636]";
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-sm bg-[#2FAF74] border border-[#1E7E52]" />
        <span className={subColor}>Correct spot</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-sm bg-[#F2B84B] border border-[#C58B1D]" />
        <span className={subColor}>In word, wrong spot</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-sm bg-[#8A8A8A] border border-[#5E5E5E]" />
        <span className={subColor}>Not in word</span>
      </div>
    </div>
  );
}