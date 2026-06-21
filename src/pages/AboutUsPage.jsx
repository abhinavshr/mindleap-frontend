import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function AboutUsPage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="About Us"
      subtitle="A static placeholder page describing the project until the final copy is ready."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>What Mindleap is</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Mindleap is a set of daily brain training games focused on memory, attention, and speed.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Why we built it</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          The goal is to make short, repeatable focus sessions feel easy to return to every day.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>What comes next</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          This page can later hold the full brand story, team details, and product mission.
        </p>
      </section>
    </StaticPageShell>
  );
}
