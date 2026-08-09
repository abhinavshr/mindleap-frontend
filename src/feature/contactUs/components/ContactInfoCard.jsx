import { FaBolt, FaEnvelope, FaClock } from "react-icons/fa";

export default function ContactInfoCard({ dark }) {
  const bodyClass = dark ? "text-[#CBBEAC]" : "text-[#5A4636]";
  const headingClass = dark ? "text-[#F7EEDB]" : "text-[#2B2017]";

  return (
    <>
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 shrink-0 ${
            dark ? "bg-[#241811] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
          }`}
        >
          <FaBolt className="text-[#F2B84B]" size={18} />
        </div>
        <div className="text-left">
          <p className={`text-sm font-bold ${headingClass}`}>Mindleap Support</p>
          <p className={`text-xs ${bodyClass}`}>Direct contact</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${bodyClass}`}>
            <FaEnvelope size={12} /> Email
          </span>
          <span className={`text-sm font-bold ${headingClass}`}>infomindleap@gmail.com</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${bodyClass}`}>
            <FaClock size={12} /> Hours
          </span>
          <span className={`text-sm font-bold ${headingClass}`}>Mon – Fri</span>
        </div>
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: dark ? "#3A2A1C" : "#E7D5B4" }}
        >
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              dark ? "text-[#F2B84B]" : "text-[#C58B1D]"
            }`}
          >
            <FaBolt size={12} /> Response time
          </span>
          <span className="text-sm font-extrabold text-[#F2B84B]">Within 24h</span>
        </div>
      </div>
    </>
  );
}
