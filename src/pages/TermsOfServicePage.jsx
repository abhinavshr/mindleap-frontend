import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function TermsOfServicePage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";
  const listClass = `mt-3 space-y-2 text-sm sm:text-base ${bodyClass}`;

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="Terms of Service"
      subtitle="These terms explain how Mindleap can be used and what users should expect."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Acceptable use</h2>
        <ul className={listClass}>
          <li>Use the app for lawful, personal gameplay only.</li>
          <li>Do not try to disrupt the service, scrape data, or misuse leaderboards.</li>
          <li>Keep your account details accurate and up to date.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Account responsibility</h2>
        <ul className={listClass}>
          <li>You are responsible for activity that happens under your account.</li>
          <li>Keep your password and login details secure.</li>
          <li>Let us know if you suspect unauthorized access.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Limitations</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Mindleap is provided "as is" for entertainment and self-improvement purposes. We may change features,
          scores, or game rules at any time as the product evolves.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Updates</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          We may update these terms from time to time. Continued use of the site means you accept the latest version.
        </p>
      </section>
    </StaticPageShell>
  );
}
