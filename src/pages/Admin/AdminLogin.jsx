import { useCallback, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/auth";

const ROLES = [
    { key: "super_admin", label: "Super admin", icon: "👑" },
    { key: "admin", label: "Admin", icon: "🛡️" },
    { key: "moderator", label: "Moderator", icon: "👁️" },
];

const STATS = [
    { value: "3", label: "Role levels" },
    { value: "100%", label: "Secure access" },
    { value: "24/7", label: "Monitoring" },
];

const FEATURES = [
    { Icon: UsersIcon, text: "User management & ban controls" },
    { Icon: ChartIcon, text: "Analytics & leaderboard oversight" },
    { Icon: FlagIcon, text: "Content moderation tools" },
    { Icon: LockIcon, text: "Role-based access control" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin() {
    const navigate = useNavigate();
    const emailId = useId();
    const passwordId = useId();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [role, setRole] = useState("super_admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = useCallback(
        async (e) => {
            e?.preventDefault();
            setError("");

            const trimmedEmail = email.trim();
            if (!trimmedEmail || !password) {
                setError("Email and password are required.");
                return;
            }
            if (!EMAIL_RE.test(trimmedEmail)) {
                setError("Enter a valid email address.");
                return;
            }

            setLoading(true);
            try {
                const res = await loginAdmin({ email: trimmedEmail, password, role });
                const admin = res.data?.data;
                const resolvedRole = admin?.role || role;

                localStorage.setItem("adminToken", res.data.token);
                localStorage.setItem("adminRole", resolvedRole);
                localStorage.setItem("adminEmail", admin?.email || trimmedEmail);
                localStorage.setItem("adminUsername", admin?.username || "");

                navigate(resolvedRole === "super_admin" ? "/admin/dashboard" : "/admin/users", {
                    replace: true,
                });
            } catch (err) {
                setError(err.response?.data?.message || "Invalid email or password.");
            } finally {
                setLoading(false);
            }
        },
        [email, password, role, navigate]
    );

    return (
        <div className="min-h-screen flex bg-gray-950">
            <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-900 to-blue-950">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="absolute top-0 left-0 w-125 h-125 bg-blue-600 opacity-[0.08] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-100 h-100 bg-indigo-500 opacity-[0.06] rounded-full translate-x-1/4 translate-y-1/4 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full px-14 py-12">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <ShieldCheckIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[15px] font-semibold text-white tracking-tight">MindLeap</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Admin Panel
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-16">
                        <p className="text-[11px] font-semibold tracking-widest text-blue-400 uppercase mb-4">
                            Control Center
                        </p>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Manage your
                            <br />
                            <span className="text-blue-400">platform</span> with
                            <br />
                            confidence
                        </h1>
                        <p className="text-sm text-gray-400 leading-relaxed mb-10 max-w-sm">
                            One place for user management, analytics, moderation, and system controls
                            across all of MindLeap.
                        </p>

                        <div className="flex flex-col gap-3 mb-12">
                            {FEATURES.map(({ Icon, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                                    </div>
                                    <span className="text-sm text-gray-300">{text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-8 pt-8 border-t border-white/5">
                            {STATS.map((s) => (
                                <div key={s.label}>
                                    <div className="text-2xl font-bold text-white">{s.value}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-gray-600">
                        © 2025 MindLeap &nbsp;·&nbsp;
                        <a href="#" className="text-gray-500 hover:text-gray-400 transition">
                            Privacy
                        </a>
                        &nbsp;·&nbsp;
                        <a href="#" className="text-gray-500 hover:text-gray-400 transition">
                            Terms
                        </a>
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-gray-950">
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">MindLeap Admin</span>
                </div>

                <div className="w-full max-w-95">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1.5">Sign in</h2>
                        <p className="text-sm text-gray-500">Access the MindLeap admin panel</p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6"
                        >
                            <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-sm text-red-400">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} noValidate>
                        <div className="mb-4">
                            <label
                                htmlFor={emailId}
                                className="block text-[13px] font-medium text-gray-400 mb-1.5"
                            >
                                Email address
                            </label>
                            <input
                                id={emailId}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@mindleap.com"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                                className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition disabled:opacity-60"
                            />
                        </div>

                        <div className="mb-7">
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor={passwordId}
                                    className="text-[13px] font-medium text-gray-400"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id={passwordId}
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="w-full h-11 px-4 pr-11 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                >
                                    {showPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/30"
                        >
                            {loading ? (
                                <>
                                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-xs text-gray-600">access level</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="flex gap-2" role="radiogroup" aria-label="Requested access level">
                        {ROLES.map((r) => (
                            <button
                                key={r.key}
                                type="button"
                                role="radio"
                                aria-checked={role === r.key}
                                onClick={() => setRole(r.key)}
                                disabled={loading}
                                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition disabled:opacity-60
                  ${
                                        role === r.key
                                            ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                            : "border-white/5 bg-white/3 text-gray-500 hover:border-white/10 hover:bg-white/5 hover:text-gray-400"
                                    }`}
                            >
                                <span className="text-base leading-none">{r.icon}</span>
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-700">
                        All access is logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}
function EyeIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
function EyeOffIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}
function AlertCircleIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    );
}
function SpinnerIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
function UsersIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    );
}
function ChartIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    );
}
function FlagIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
    );
}
function LockIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}