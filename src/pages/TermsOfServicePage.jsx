import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function TermsOfServicePage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="Terms of Service"
      subtitle="Static placeholder terms for now until the final legal wording is added."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Use of the app</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Use Mindleap for personal, lawful gameplay and keep your account information accurate.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Account responsibility</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          You are responsible for activity on your account and for keeping your login details secure.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Future updates</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          These terms are static for now and can be expanded later with the final legal language.
        </p>
      </section>
    </StaticPageShell>
  );
}
