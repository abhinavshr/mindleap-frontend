import { Helmet } from "react-helmet-async";
import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function PrivacyPolicyPage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";
  const listClass = `mt-3 space-y-2 text-sm sm:text-base ${bodyClass}`;

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Mindleap</title>
        <meta name="description" content="Learn how Mindleap collects, uses, and protects your personal information and game data." />
        <link rel="canonical" href="https://mindleap.live/privacy-policy" />
        <meta property="og:title" content="Privacy Policy - Mindleap" />
        <meta property="og:description" content="Learn how Mindleap collects, uses, and protects your personal information." />
        <meta property="og:url" content="https://mindleap.live/privacy-policy" />
      </Helmet>
      <StaticPageShell
        dark={dark}
        onToggleDark={onToggleDark}
        eyebrow="Trust Page"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information while you use Mindleap."
      >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Information we collect</h2>
        <ul className={listClass}>
          <li>Account details such as name, email address, and username.</li>
          <li>Game activity such as guesses, scores, streaks, and leaderboard progress.</li>
          <li>Basic device and usage information to help keep the app stable and improve performance.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>How we use information</h2>
        <ul className={listClass}>
          <li>To create and manage your account.</li>
          <li>To save your game progress, scores, and daily activity.</li>
          <li>To provide leaderboards, reminders, and support messages.</li>
          <li>To improve the product, monitor errors, and keep the app secure.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Sharing and retention</h2>
        <ul className={listClass}>
          <li>We do not sell your personal data.</li>
          <li>We may share data with trusted service providers only when needed to run the app.</li>
          <li>We keep your data only as long as necessary for gameplay, account access, and support.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Your choices</h2>
        <ul className={listClass}>
          <li>You can update your profile information when logged in.</li>
          <li>You can request account help or deletion by contacting us.</li>
          <li>You may disable cookies in your browser, but some features may not work as expected.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Contact</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          If you have any questions about privacy, contact us at infomindleap@gmail.com.
        </p>
      </section>
    </StaticPageShell>
    </>
  );
}
