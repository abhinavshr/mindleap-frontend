import { FaBug, FaLightbulb, FaUserCog, FaCreditCard, FaCommentDots } from "react-icons/fa";

const QUEST_CHIPS = [
  { label: "Bug Report", icon: FaBug },
  { label: "Feature Idea", icon: FaLightbulb },
  { label: "Account Help", icon: FaUserCog },
  { label: "Billing", icon: FaCreditCard },
  { label: "Something Else", icon: FaCommentDots },
];

export default function QuestChips({ selectedLabel, onSelect, dark }) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUEST_CHIPS.map(({ label, icon: Icon }) => {
        const selected = selectedLabel === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border-2 transition-colors duration-150 ${
              selected
                ? dark
                  ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017]"
                  : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5]"
                : dark
                ? "border-[#3A2A1C] text-[#CBBEAC] hover:border-[#F2B84B]"
                : "border-[#D4B896] text-[#5A4636] hover:border-[#C64B2A]"
            }`}
          >
            <Icon size={11} /> {label}
          </button>
        );
      })}
    </div>
  );
}
