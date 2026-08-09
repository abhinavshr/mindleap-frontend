import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { FaBolt } from "react-icons/fa";
import Navbar from "../../components/Reuseable/Navbar";
import useContactForm from "./hooks/useContactForm";
import useSuccessSound from "./hooks/useSuccessSound";
import { fadeSlideUp } from "./constants/animations";
import ContactBackdrop from "./components/ContactBackdrop";
import ContactSuccessModal from "./components/ContactSuccessModal";
import ContactForm from "./components/ContactForm";
import ContactInfoCard from "./components/ContactInfoCard";

export default function ContactUsPage({ dark, onToggleDark }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { play: playSuccessSound } = useSuccessSound();

  const {
    form,
    submitting,
    fieldsFilled,
    questPercent,
    handleChange,
    handleChipSelect,
    handleSubmit,
  } = useContactForm({
    onSuccess: () => {
      setShowSuccess(true);
      playSuccessSound();
    },
  });

  const panelClass = `rounded-2xl border-2 arcade-panel px-5 py-6 sm:px-6 sm:py-7 ${
    dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFF8EC] border-[#2B2017]"
  }`;
  const bodyClass = dark ? "text-[#CBBEAC]" : "text-[#5A4636]";
  const headingClass = dark ? "text-[#F7EEDB]" : "text-[#2B2017]";

  return (
    <div
      className={`min-h-screen flex flex-col font-copy transition-colors duration-300 ${
        dark ? "bg-[#0F0B08] text-[#F7EEDB]" : "arcade-bg text-[#2B2017]"
      }`}
    >
      <Helmet>
        <title>Contact Mindleap - Get in Touch with Our Team</title>
        <meta name="description" content="Have questions or feedback? Contact Mindleap directly. Fill out the form and our team will respond promptly." />
        <link rel="canonical" href="https://mindleap.live/contact-us" />
        <meta property="og:title" content="Contact Mindleap" />
        <meta property="og:description" content="Contact Mindleap directly with questions or feedback." />
        <meta property="og:url" content="https://mindleap.live/contact-us" />
      </Helmet>

      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <ContactSuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        onSendAnother={() => setShowSuccess(false)}
        dark={dark}
      />

      <main className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 gap-8 overflow-hidden">
        <ContactBackdrop dark={dark} />

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="relative z-10 flex flex-col items-center text-center gap-4 max-w-lg"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
              dark ? "bg-[#1B120C] border-[#3A2A1C]" : "bg-[#FFE9B0] border-[#2B2017]"
            }`}
          >
            <FaBolt className="text-[#F2B84B]" size={28} />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-arcade ${headingClass}`}>Contact Us</h1>
          <p className={`text-sm sm:text-base ${bodyClass}`}>
            Got a question or a bug to report? Complete the quest below and send it our way.
          </p>
        </motion.div>

        <div className="relative z-10 w-full max-w-3xl grid gap-6 sm:grid-cols-5">
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className={`${panelClass} sm:col-span-3`}
          >
            <ContactForm
              dark={dark}
              form={form}
              submitting={submitting}
              fieldsFilled={fieldsFilled}
              questPercent={questPercent}
              onChange={handleChange}
              onChipSelect={handleChipSelect}
              onSubmit={handleSubmit}
            />
          </motion.section>

          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className={`${panelClass} sm:col-span-2 flex flex-col gap-5`}
          >
            <ContactInfoCard dark={dark} />
          </motion.section>
        </div>
      </main>
    </div>
  );
}
