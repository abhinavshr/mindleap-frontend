import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import QuestChips from "./QuestChips";
import SendingIndicator from "./SendingIndicator";

export default function ContactForm({
  dark,
  form,
  submitting,
  fieldsFilled,
  questPercent,
  onChange,
  onChipSelect,
  onSubmit,
}) {
  const headingClass = dark ? "text-[#F7EEDB]" : "text-[#2B2017]";
  const labelClass = `text-sm font-semibold ${headingClass}`;

  const inputBase = `w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-colors duration-150 ${
    dark
      ? "border-[#3A2A1C] bg-[#120D09] text-[#F7EEDB] placeholder-[#7E6C58] focus:border-[#F2B84B]"
      : "border-[#D4B896] bg-[#FFFDF8] text-[#2B2017] placeholder-[#8A7661] focus:border-[#C64B2A]"
  }`;

  return (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <h2 className={`text-xl font-arcade ${headingClass}`}>Send a message</h2>
        <span className={`text-xs font-bold tabular-nums ${dark ? "text-[#F2B84B]" : "text-[#C58B1D]"}`}>
          {fieldsFilled}/4
        </span>
      </div>
      <div className={`w-full h-1.5 rounded-full mb-5 ${dark ? "bg-[#3A2A1C]" : "bg-[#F3DFC2]"}`}>
        <motion.div
          className="h-1.5 rounded-full bg-[#2FAF74]"
          animate={{ width: `${questPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className={labelClass}>Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="John Doe"
              className={inputBase}
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="john@example.com"
              className={inputBase}
              autoComplete="email"
            />
          </label>
        </div>

        <div className="grid gap-2">
          <span className={labelClass}>What's this about?</span>
          <QuestChips selectedLabel={form.subject} onSelect={onChipSelect} dark={dark} />
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={onChange}
            placeholder="Or type your own subject"
            className={inputBase}
          />
        </div>

        <label className="grid gap-2">
          <span className={labelClass}>Message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            rows="5"
            placeholder="Hi, I am having trouble logging in."
            className={`${inputBase} resize-none`}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-xl border-2 font-bold text-base transition-colors duration-150 flex items-center justify-center gap-2 ${
            dark
              ? "bg-[#F2B84B] border-[#F2B84B] text-[#2B2017] hover:bg-[#FFD271]"
              : "bg-[#2B2017] border-[#2B2017] text-[#FDFBF5] hover:bg-[#C64B2A]"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {submitting ? (
            <SendingIndicator />
          ) : (
            <>
              <FaPaperPlane size={14} /> Send Message
            </>
          )}
        </button>
      </form>
    </>
  );
}
