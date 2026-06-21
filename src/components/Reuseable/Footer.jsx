import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Terms of Service", to: "/terms-of-service" },
];

export default function Footer({ dark = false }) {
  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        dark ? "bg-[#0C0907] border-[#3A2A1C]" : "bg-[#FFF3DA] border-[#2B2017]"
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`font-arcade text-sm sm:text-base ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>
            Mindleap
          </p>
          <p className={`mt-1 text-xs sm:text-sm ${dark ? "text-[#D0BFA8]" : "text-[#5A4636]"}`}>
            Daily brain training, built to stay simple.
          </p>
        </div>

        <div>
          <p className={`text-[11px] uppercase tracking-[0.22em] ${dark ? "text-[#D0BFA8]" : "text-[#7A6D60]"}`}>
            Trust Pages
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-colors duration-150 ${
                  dark ? "text-[#FFF4E2] hover:text-[#FFE9B0]" : "text-[#2B2017] hover:text-[#C64B2A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
