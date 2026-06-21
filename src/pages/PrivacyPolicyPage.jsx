import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function PrivacyPolicyPage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="Privacy Policy"
      subtitle="This is a static placeholder for now. It can be replaced with your final legal copy later."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>What we collect</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          We may collect basic account details, gameplay progress, and usage data needed to run the app.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>How we use it</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Data is used to authenticate users, save scores, improve gameplay, and keep the experience functioning.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Your choice</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          You can request updates or deletion of your account information once the final policy is published.
        </p>
      </section>
    </StaticPageShell>
  );
}
