import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { sendContactMessage } from "@/api/contact";

const REQUIRED_FIELDS = ["name", "email", "subject", "message"];

/**
 * Owns the contact form's state, quest-progress calculation, and submit
 * flow. ContactUsPage just destructures this and renders — same split
 * as Speed Game's useSpeedGame controller hook.
 */
export default function useContactForm({ onSuccess } = {}) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const fieldsFilled = useMemo(
    () => REQUIRED_FIELDS.filter((key) => form[key].trim().length > 0).length,
    [form]
  );
  const questPercent = (fieldsFilled / REQUIRED_FIELDS.length) * 100;

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChipSelect = useCallback((label) => {
    setForm((prev) => ({ ...prev, subject: label }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (REQUIRED_FIELDS.some((key) => !form[key])) {
        toast.error("Please fill in all fields.");
        return;
      }

      try {
        setSubmitting(true);
        await sendContactMessage(form);
        setForm({ name: "", email: "", subject: "", message: "" });
        onSuccess?.();
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to send message. Please try again.";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [form, onSuccess]
  );

  return {
    form,
    submitting,
    fieldsFilled,
    questPercent,
    handleChange,
    handleChipSelect,
    handleSubmit,
  };
}
