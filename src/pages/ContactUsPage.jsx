import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function ContactUsPage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";
  const inputBase = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-150 ${
    dark
      ? "border-[#3A2A1C] bg-[#120D09] text-[#F7EEDB] placeholder-[#7E6C58] focus:border-[#F2B84B]"
      : "border-[#DCC7A5] bg-[#FFFDF8] text-[#2B2017] placeholder-[#8A7661] focus:border-[#C64B2A]"
  }`;

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="Contact Us"
      subtitle="A static contact form and contact details for now."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Send a message</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          This form is static for now and does not submit anywhere yet.
        </p>

        <form className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Name</span>
              <input type="text" placeholder="Your name" className={inputBase} readOnly />
            </label>
            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Email</span>
              <input type="email" placeholder="you@example.com" className={inputBase} readOnly />
            </label>
          </div>

          <label className="grid gap-2">
            <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Subject</span>
            <input type="text" placeholder="How can we help?" className={inputBase} readOnly />
          </label>

          <label className="grid gap-2">
            <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Message</span>
            <textarea
              rows="5"
              placeholder="Write your message here..."
              className={`${inputBase} resize-none`}
              readOnly
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className={`text-xs sm:text-sm ${bodyClass}`}>
              Static demo form only. Use the email below for now.
            </p>
            <button
              type="button"
              className={`rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors ${
                dark
                  ? "border-[#F2B84B] bg-[#1B130C] text-[#FFF4E2] hover:bg-[#23170F]"
                  : "border-[#2B2017] bg-[#FFE9B0] text-[#2B2017] hover:bg-[#FFDFA0]"
              }`}
            >
              Send Message
            </button>
          </div>
        </form>
      </section>

      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Direct contact</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          infomindleap@gmail.com
        </p>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Monday to Friday, during business hours.
        </p>
      </section>
    </StaticPageShell>
  );
}
