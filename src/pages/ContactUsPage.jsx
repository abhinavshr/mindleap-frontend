import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StaticPageShell from "../components/Reuseable/StaticPageShell";

export default function ContactUsPage({ dark, onToggleDark }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const cardClass = dark
    ? "rounded-2xl border border-[#3A2A1C] bg-[#1A130E] p-5 sm:p-6"
    : "rounded-2xl border border-[#E6D5B9] bg-[#FFFDF7] p-5 sm:p-6";
  const bodyClass = dark ? "text-[#D0BFA8]" : "text-[#5A4636]";
  const inputBase = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-150 ${
    dark
      ? "border-[#3A2A1C] bg-[#120D09] text-[#F7EEDB] placeholder-[#7E6C58] focus:border-[#F2B84B]"
      : "border-[#DCC7A5] bg-[#FFFDF8] text-[#2B2017] placeholder-[#8A7661] focus:border-[#C64B2A]"
  }`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("http://localhost:5000/api/contact", form);
      toast.success("Message sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaticPageShell
      dark={dark}
      onToggleDark={onToggleDark}
      eyebrow="Trust Page"
      title="Contact Us"
      subtitle="Need help or have a question? Send us a message and our team will get back to you."
    >
      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Send a message</h2>
        <p className={`mt-2 text-sm sm:text-base ${bodyClass}`}>
          Send us a note and we’ll get back to you as soon as possible.
        </p>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={inputBase}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={inputBase}
                autoComplete="email"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Subject</span>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Need help with my account"
              className={inputBase}
            />
          </label>

          <label className="grid gap-2">
            <span className={`text-sm font-semibold ${dark ? "text-[#FFF4E2]" : "text-[#2B2017]"}`}>Message</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Hi, I am having trouble logging in."
              className={`${inputBase} resize-none`}
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className={`text-xs sm:text-sm ${bodyClass}`}>
              We usually respond within one business day.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors ${
                dark
                  ? "border-[#F2B84B] bg-[#1B130C] text-[#FFF4E2] hover:bg-[#23170F]"
                  : "border-[#2B2017] bg-[#FFE9B0] text-[#2B2017] hover:bg-[#FFDFA0]"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {submitting ? "Sending..." : "Send Message"}
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
