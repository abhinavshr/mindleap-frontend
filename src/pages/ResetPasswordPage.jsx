import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import toast from "react-hot-toast";
import Navbar from "../components/Reuseable/Navbar";
import { resetPassword } from "../api/auth";

export default function ResetPasswordPage({ dark, onToggleDark }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email ?? "";

  const inputBase = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors duration-150 ${
    dark
      ? "bg-[#141517] border-[#2B2F33] text-white placeholder-[#5B6166] focus:border-[#7DBE6A]"
      : "bg-white border-[#D9D1C6] text-[#1A1A1B] placeholder-[#8B8378] focus:border-[#6AAA64]"
  }`;

  const eyeIconClass = `absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xl ${
    dark ? "text-[#63696E] hover:text-[#B8BDC2]" : "text-[#8B8378] hover:text-[#5C5247]"
  } transition-colors duration-150`;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please start again.");
      navigate("/forgot-password");
      return;
    }
    if (!form.password || !form.confirmPassword) {
      toast.error("Both password fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, form.password, form.confirmPassword);
      toast.success("Password updated. Please log in.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      dark ? "bg-[#0E0F10]" : "bg-[#F6F4F0]"
    }`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="relative flex-1 px-4 py-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl opacity-50 ${
            dark ? "bg-[#24312A]" : "bg-[#CFE6D0]"
          }`} />
          <div className={`absolute -bottom-10 -right-32 h-112 w-md rounded-full blur-3xl opacity-40 ${
            dark ? "bg-[#182633]" : "bg-[#D8E1F0]"
          }`} />
          <div className={`absolute top-16 right-10 h-28 w-28 rotate-12 rounded-2xl border ${
            dark ? "border-[#2D3237]" : "border-[#DED7C7]"
          }`} />
          <div className={`absolute bottom-16 left-1/3 h-24 w-24 -rotate-6 rounded-3xl border ${
            dark ? "border-[#2D3237]" : "border-[#E8E0D2]"
          }`} />
          <div className={`absolute left-0 top-1/2 h-px w-2/3 ${
            dark ? "bg-[#1D2024]" : "bg-[#EFE7DA]"
          }`} />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:max-w-md"
          >
            <p className={`text-xs uppercase tracking-[0.25em] ${
              dark ? "text-[#9DA3A6]" : "text-[#7C6F62]"
            }`}>
              Final step
            </p>
            <h1 className={`mt-3 text-4xl leading-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
              Choose a new password
            </h1>
            <p className={`mt-4 text-base ${dark ? "text-[#B9BEC2]" : "text-[#5C5247]"}`}>
              Create a fresh secret phrase you will remember.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`rounded-2xl border px-5 py-4 ${
                dark ? "border-[#2E3236] bg-[#141517]" : "border-[#E4DCCD] bg-[#FFF9EF]"
              }`}>
                <p className={`text-xs uppercase tracking-[0.22em] ${
                  dark ? "text-[#9AA0A4]" : "text-[#806B57]"
                }`}>
                  Password tips
                </p>
                <p className={`mt-3 text-sm ${dark ? "text-[#C7CBD0]" : "text-[#5A4E43]"}`}>
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>
              <div className={`rounded-2xl border px-5 py-4 ${
                dark ? "border-[#2E3236] bg-[#141517]" : "border-[#E4DCCD] bg-[#FFF9EF]"
              }`}>
                <p className={`text-xs uppercase tracking-[0.22em] ${
                  dark ? "text-[#9AA0A4]" : "text-[#806B57]"
                }`}>
                  After reset
                </p>
                <p className={`mt-3 text-sm ${dark ? "text-[#C7CBD0]" : "text-[#5A4E43]"}`}>
                  You will be asked to sign in again.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`w-full max-w-115 rounded-[28px] border px-8 py-8 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.55)] ${
              dark ? "bg-[#161719] border-[#2E3236]" : "bg-white border-[#E4DCCD]"
            }`}
          >
            <div className="mb-6">
              <p className={`text-xs uppercase tracking-[0.24em] ${
                dark ? "text-[#8D9398]" : "text-[#7A6D60]"
              }`}>
                Reset password
              </p>
              <h2 className={`mt-2 text-2xl ${dark ? "text-white" : "text-[#1A1A1B]"}`}>
                Set your new secret
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${
                  dark ? "text-[#D7D7D7]" : "text-[#1A1A1B]"
                }`}>
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    autoComplete="new-password"
                  />
                  <span className={eyeIconClass} onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${
                  dark ? "text-[#D7D7D7]" : "text-[#1A1A1B]"
                }`}>
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    autoComplete="new-password"
                  />
                  <span className={eyeIconClass} onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#6AAA64] hover:bg-[#538d4e] active:bg-[#4a7d45] text-white font-bold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update password"}
              </motion.button>
            </form>

            <p className={`text-center text-sm mt-5 ${dark ? "text-[#818384]" : "text-[#6F665A]"}`}>
              Changed your mind?{" "}
              <Link to="/login" className="text-[#6AAA64] hover:underline font-medium">
                Return to login
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
