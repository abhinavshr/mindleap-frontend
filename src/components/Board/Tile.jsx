export default function Tile({ letter = "", status = "empty" }) {
  const statusStyles = {
    empty:   "bg-[#FFF3DA] border-[#2B2017] text-[#2B2017]",
    active:  "bg-[#FFF7E8] border-[#2B2017] text-[#2B2017]",
    pending: "bg-[#FFF7E8] border-[#2B2017] text-[#2B2017]",
    correct: "bg-[#2FAF74] border-[#1E7E52] text-[#FDFBF5]",
    present: "bg-[#F2B84B] border-[#C58B1D] text-[#2B2017]",
    absent:  "bg-[#8A8A8A] border-[#5E5E5E] text-[#FDFBF5]",
  };

  return (
    <div
      className={`
        w-13 h-13 sm:w-15.5 sm:h-15.5
        border-2 rounded-lg arcade-tile
        flex items-center justify-center
        text-xl sm:text-2xl font-bold uppercase select-none
        transition-colors duration-300
        ${statusStyles[status]}
      `}
    >
      {letter ? <span>{letter}</span> : <span />}
    </div>
  );
}