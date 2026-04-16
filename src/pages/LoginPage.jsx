import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Reuseable/Navbar";
import { loginUser } from "../api/auth";

export default function LoginPage({ dark, onToggleDark }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified! You can now log in.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email: form.email, password: form.password });

      const { accessToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors duration-150 ${dark
    ? "bg-[#1A1A1B] border-[#3A3A3C] text-white placeholder-[#565758] focus:border-[#6AAA64]"
    : "bg-white border-[#D3D6DA] text-[#1A1A1B] placeholder-[#878A8C] focus:border-[#6AAA64]"
    }`;

  const labelBase = `block text-sm font-semibold mb-1.5 ${dark ? "text-[#D7D7D7]" : "text-[#1A1A1B]"
    }`;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? "bg-[#121213]" : "bg-[#F9F9F9]"}`}>
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`text-4xl font-bold mb-8 tracking-tight ${dark ? "text-white" : "text-[#1A1A1B]"}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Login
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-115 rounded-2xl border px-8 py-8 shadow-lg ${dark ? "bg-[#1A1A1B] border-[#3A3A3C] shadow-black/40" : "bg-white border-[#D3D6DA] shadow-gray-200/50"}`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email" name="email" placeholder="Enter your email"
                value={form.email} onChange={handleChange}
                className={inputBase} autoComplete="email" autoFocus
              />
            </div>
            <div>
              <label className={labelBase}>Password</label>
              <input
                type="password" name="password" placeholder="Enter password"
                value={form.password} onChange={handleChange}
                className={inputBase} autoComplete="current-password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-[#6AAA64] hover:bg-[#538d4e] active:bg-[#4a7d45] text-white font-bold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-md shadow-[#6AAA64]/20"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          <p className={`text-center text-sm mt-5 ${dark ? "text-[#818384]" : "text-[#787C7E]"}`}>
            Don't have an account?{" "}
            <Link to="/register" className="text-[#6AAA64] hover:underline font-medium">Register</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}