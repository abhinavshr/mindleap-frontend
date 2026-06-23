import { Helmet } from "react-helmet-async";
import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function AboutUsPage({ dark, onToggleDark }) {
  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";
  const listClass = `mt-3 space-y-2 text-sm sm:text-base ${bodyClass}`;

  return (
    <>
      <Helmet>
        <title>About Mindleap - Our Mission & Values</title>
        <meta name="description" content="Learn about Mindleap's mission to provide daily brain training games that help build focus and memory skills." />
        <link rel="canonical" href="https://mindleap.live/about-us" />
        <meta property="og:title" content="About Mindleap" />
        <meta property="og:description" content="Learn about Mindleap's mission and how we help users build focus habits." />
        <meta property="og:url" content="https://mindleap.live/about-us" />
      </Helmet>
      <StaticPageShell
        dark={dark}
        onToggleDark={onToggleDark}
        eyebrow="Trust Page"
        title="About Us"
        subtitle="Learn what Mindleap is, why it exists, and how it helps people build focus habits."
      >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>What Mindleap is</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Mindleap is a brain training platform built around short daily games that help people practice memory,
          attention, and speed in a simple, repeatable way.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Why we built it</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          We wanted a product that feels light, quick, and rewarding so users can build a focus habit without
          needing long sessions or complicated dashboards.
        </p>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>What users get</h2>
        <ul className={listClass}>
          <li>Daily challenges that refresh regularly.</li>
          <li>Score tracking and streak support.</li>
          <li>A clean, game-first experience that works on mobile and desktop.</li>
        </ul>
      </section>
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Our goal</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          The goal is to make focus training feel approachable, consistent, and useful enough that people actually
          want to come back tomorrow.
        </p>
      </section>
    </StaticPageShell>
    </>
  );
}
