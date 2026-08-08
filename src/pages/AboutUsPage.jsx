import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function AboutUsPage({ dark, onToggleDark }) {
  const cardClass = `relative p-5 sm:p-6 ${dark ? "arcade-panel arcade-panel-dark" : "arcade-panel"}`;
  const bodyClass = `font-copy ${dark ? "text-[#D0BFA8]" : "text-[#5A4636]"}`;
  const listClass = `mt-3 space-y-2 text-sm sm:text-base ${bodyClass}`;
  const headingClass = `font-arcade tracking-wide text-lg sm:text-xl ${
    dark ? "text-[#FFF4E2]" : "text-[#2B2017]"
  }`;
  const badgeClass = `absolute -top-3 left-5 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-arcade tracking-wider border-2 arcade-key ${
    dark
      ? "bg-[#F2B84B] border-[#3A2A1C] text-[#2B2017]"
      : "bg-[#F2B84B] border-[#2B2017] text-[#2B2017]"
  }`;

  const sections = [
    {
      level: "LEVEL 1",
      title: "What Mindleap is",
      body: "Mindleap turns brain training into a game you actually want to play. Quick daily challenges level up your memory, attention, and speed — one round, one streak, one high score at a time.",
    },
    {
      level: "LEVEL 2",
      title: "Why we built it",
      body: "Building a focus habit shouldn't feel like homework. We wanted something fast, fun, and a little addictive — so every session feels like a quick match, not a chore, and showing up tomorrow feels like the obvious next move.",
    },
    {
      level: "LEVEL 3",
      title: "What users get",
      list: [
        "🎮 Fresh daily challenges to keep the game going.",
        "🔥 Streaks, scores, and leaderboard bragging rights.",
        "📱 A clean, game-first experience that works anywhere — mobile or desktop.",
      ],
    },
    {
      level: "LEVEL 4",
      title: "Our goal",
      body: "We're here to make focus training feel like a game worth winning — fun enough to start, rewarding enough to keep your streak alive, and simple enough that leveling up your mind becomes part of your daily routine.",
    },
  ];

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
        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.section
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
              className={cardClass}
            >
              <span className={badgeClass}>{s.level}</span>
              <h2 className={`${headingClass} mt-1`}>{s.title}</h2>
              {s.body && (
                <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>{s.body}</p>
              )}
              {s.list && (
                <ul className={listClass}>
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      </StaticPageShell>
    </>
  );
}