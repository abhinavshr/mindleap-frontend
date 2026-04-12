import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Reuseable/Navbar";

export default function RegisterPage() {
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      // TODO: replace with real API call
      // await authStore.register(form);
      navigate("/game");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
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

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        dark ? "bg-[#121213]" : "bg-[#F9F9F9]"
      }`}
    >
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Heading */}
        <h1
          className={`text-4xl font-bold mb-8 tracking-tight ${
            dark ? "text-white" : "text-[#1A1A1B]"
          }`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Register
        </h1>

        {/* Card */}
        <div
          className={`w-full max-w-115 rounded-2xl border px-8 py-8 ${
            dark
              ? "bg-[#1A1A1B] border-[#3A3A3C]"
              : "bg-white border-[#D3D6DA]"
          }`}
        >
          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div>
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
            </div>

            {/* Email */}
            <div>
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
            </div>

            {/* Password */}
            <div>
              <label className={labelBase}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className={inputBase}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelBase}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputBase}
                autoComplete="new-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#6AAA64] hover:bg-[#538d4e] active:bg-[#4a7d45] text-white font-bold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Login link */}
          <p
            className={`text-center text-sm mt-5 ${
              dark ? "text-[#818384]" : "text-[#787C7E]"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#6AAA64] hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}