import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Navbar from "../components/Reuseable/Navbar";
import { registerUser } from "../api/auth";

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

  const inputBase = `w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors duration-150 ${
    dark
      ? "bg-[#1A1A1B] border-[#3A3A3C] text-white placeholder-[#565758] focus:border-[#6AAA64]"
      : "bg-white border-[#D3D6DA] text-[#1A1A1B] placeholder-[#878A8C] focus:border-[#6AAA64]"
  }`;

  const labelBase = `block text-sm font-semibold mb-1.5 ${
    dark ? "text-[#D7D7D7]" : "text-[#1A1A1B]"
  }`;

  const eyeIconClass = `absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xl ${dark ? "text-[#565758] hover:text-[#A0A0A0]" : "text-[#878A8C] hover:text-[#555]"} transition-colors duration-150`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`text-4xl font-bold mb-8 tracking-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Register
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
          className={`w-full max-w-115 rounded-2xl border px-8 py-8 ${dark ? "bg-[#1A1A1B] border-[#3A3A3C]" : "bg-white border-[#D3D6DA]"}`}
        >
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            className="flex flex-col gap-5"
          >
            <motion.div variants={itemVariants}>
              <label className={labelBase}>Username</label>
              <input type="text" name="username" placeholder="Choose a username"
                value={form.username} onChange={handleChange}
                className={inputBase} autoComplete="username" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelBase}>Email</label>
              <input type="email" name="email" placeholder="Enter your email"
                value={form.email} onChange={handleChange}
                className={inputBase} autoComplete="email" />
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
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-[#6AAA64] hover:bg-[#538d4e] active:bg-[#4a7d45] text-white font-bold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Registering..." : "Register"}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={`text-center text-sm mt-5 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-[#6AAA64] hover:underline font-medium">Login</Link>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}