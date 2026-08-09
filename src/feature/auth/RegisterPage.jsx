import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { registerUser } from "@/api/auth";
import Navbar from "@/components/Reuseable/Navbar";

export default function RegisterPage({ dark, onToggleDark }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ username: form.username, email: form.email, password: form.password });
      toast.success("Registered! Please check your email to verify your account.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors duration-150 ${
    dark
      ? "bg-[#141517] border-[#2B2F33] text-white placeholder-[#5B6166] focus:border-[#7DBE6A]"
      : "bg-white border-[#D9D1C6] text-[#1A1A1B] placeholder-[#8B8378] focus:border-[#6AAA64]"
  }`;

  const labelBase = `block text-sm font-semibold mb-1.5 ${
    dark ? "text-[#D7D7D7]" : "text-[#1A1A1B]"
  }`;

  const eyeIconClass = `absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xl ${
    dark ? "text-[#63696E] hover:text-[#B8BDC2]" : "text-[#8B8378] hover:text-[#5C5247]"
  } transition-colors duration-150`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        dark ? "bg-[#0E0F10]" : "bg-[#F6F4F0]"
      }`}
    >
      <Helmet>
        <title>Create Your Mindleap Account - Free Brain Training</title>
        <meta name="description" content="Sign up for Mindleap and start playing daily brain training games to boost memory, attention, and speed." />
        <link rel="canonical" href="https://mindleap.live/register" />
        <meta property="og:title" content="Create Your Mindleap Account" />
        <meta property="og:description" content="Sign up for Mindleap and start playing daily brain training games." />
        <meta property="og:url" content="https://mindleap.live/register" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="relative flex-1 px-4 py-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl opacity-50 ${
              dark ? "bg-[#24312A]" : "bg-[#CFE6D0]"
            }`}
          />
          <div
            className={`absolute -bottom-10 -right-32 h-112 w-md rounded-full blur-3xl opacity-40 ${
              dark ? "bg-[#182633]" : "bg-[#D8E1F0]"
            }`}
          />
          <div
            className={`absolute top-16 right-10 h-28 w-28 rotate-12 rounded-2xl border ${
              dark ? "border-[#2D3237]" : "border-[#DED7C7]"
            }`}
          />
          <div
            className={`absolute bottom-16 left-1/3 h-24 w-24 -rotate-6 rounded-3xl border ${
              dark ? "border-[#2D3237]" : "border-[#E8E0D2]"
            }`}
          />
          <div
            className={`absolute left-0 top-1/2 h-px w-2/3 ${
              dark ? "bg-[#1D2024]" : "bg-[#EFE7DA]"
            }`}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:max-w-md"
          >
            <p
              className={`text-xs uppercase tracking-[0.25em] ${
                dark ? "text-[#9DA3A6]" : "text-[#7C6F62]"
              }`}
              style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
            >
              Mindleap Access
            </p>
            <h1
              className={`mt-3 text-4xl leading-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}
              style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}
            >
              Create your quiet corner
            </h1>
            <p
              className={`mt-4 text-base ${dark ? "text-[#B9BEC2]" : "text-[#5C5247]"}`}
              style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
            >
              Track streaks, lock in rituals, and level up at a pace that feels human.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-2xl border px-5 py-4 ${
                  dark ? "border-[#2E3236] bg-[#141517]" : "border-[#E4DCCD] bg-[#FFF9EF]"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.22em] ${
                    dark ? "text-[#9AA0A4]" : "text-[#806B57]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
                >
                  What you get
                </p>
                <ul
                  className={`mt-3 space-y-2 text-sm ${
                    dark ? "text-[#C7CBD0]" : "text-[#5A4E43]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
                >
                  <li>Daily focus prompts that feel personal</li>
                  <li>Progress boards built for momentum</li>
                  <li>Gentle reminders when the streak dips</li>
                </ul>
              </div>
              <div
                className={`rounded-2xl border px-5 py-4 ${
                  dark ? "border-[#2E3236] bg-[#141517]" : "border-[#E4DCCD] bg-[#FFF9EF]"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.22em] ${
                    dark ? "text-[#9AA0A4]" : "text-[#806B57]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
                >
                  Ritual starter
                </p>
                <p
                  className={`mt-3 text-sm ${dark ? "text-[#C7CBD0]" : "text-[#5A4E43]"}`}
                  style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
                >
                  Get a custom 7-day focus plan right after signup.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={formVariants}
            className={`w-full max-w-115 rounded-[28px] border px-8 py-8 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.55)] ${
              dark ? "bg-[#161719] border-[#2E3236]" : "bg-white border-[#E4DCCD]"
            }`}
          >
            <div className="mb-6">
              <p
                className={`text-xs uppercase tracking-[0.24em] ${
                  dark ? "text-[#8D9398]" : "text-[#7A6D60]"
                }`}
                style={{ fontFamily: "'Space Grotesk', 'Trebuchet MS', sans-serif" }}
              >
                Create account
              </p>
              <h2
                className={`mt-2 text-2xl ${dark ? "text-white" : "text-[#1A1A1B]"}`}
                style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}
              >
                Start fresh, keep momentum
              </h2>
            </div>
            <motion.form
              onSubmit={handleSubmit}
              variants={containerVariants}
              className="flex flex-col gap-5"
            >
              <motion.div variants={itemVariants}>
                <label className={labelBase}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  className={inputBase}
                  autoComplete="username"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className={labelBase}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                  autoComplete="email"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className={labelBase}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    autoComplete="new-password"
                  />
                  <span className={eyeIconClass} onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className={labelBase}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    autoComplete="new-password"
                  />
                  <span className={eyeIconClass} onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#6AAA64] hover:bg-[#538d4e] active:bg-[#4a7d45] text-white font-bold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Registering..." : "Register"}
              </motion.button>
            </motion.form>
            <div
              className={`mt-5 flex items-center justify-between text-xs ${
                dark ? "text-[#8C9196]" : "text-[#7B7066]"
              }`}
            >
              <span>By continuing you agree to mindful streaks.</span>
              <span className={dark ? "text-[#A2A7AC]" : "text-[#6AAA64]"}>v2.1</span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className={`text-center text-sm mt-5 ${dark ? "text-[#818384]" : "text-[#6F665A]"}`}
            >
              Already have an account?{" "}
              <Link to="/login" className="text-[#6AAA64] hover:underline font-medium">
                Login
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}