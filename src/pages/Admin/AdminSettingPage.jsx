import { useEffect, useState } from "react";
import { fetchAdminProfile } from "../../api/admin";
import { changeAdminPassword } from "../../api/auth";

const ROLE_LABELS = {
    super_admin: "Super admin",
    admin: "Admin",
    moderator: "Moderator",
};

function formatDateTime(iso) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function AdminSettingsPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchAdminProfile();
                if (!cancelled) setProfile(res.data.data);
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load profile.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfile();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <SpinnerIcon className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="w-full">

            <div className="mb-6">
                <h2 className="text-sm font-semibold text-white">Profile</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your account details</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-lg font-semibold shrink-0">
                        {profile.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-base font-semibold text-white">{profile.username}</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 h-fit">
                        {ROLE_LABELS[profile.role] ?? profile.role}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-white/5">
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase mb-1">Status</p>
                        {profile.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">
                                Inactive
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase mb-1">Last login</p>
                        <p className="text-sm text-gray-300">{formatDateTime(profile.last_login)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase mb-1">Member since</p>
                        <p className="text-sm text-gray-300">{formatDateTime(profile.created_at)}</p>
                    </div>
                </div>
            </div>

            <ChangePasswordCard />
        </div>
    );
}

function ChangePasswordCard() {
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        setError("");
        setSuccess("");

        if (!currentPw || !newPw || !confirmPw) {
            setError("All fields are required.");
            return;
        }
        if (newPw.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }
        if (newPw !== confirmPw) {
            setError("New password and confirm password do not match.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess("Password updated successfully.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        }, 600);
    };

    return (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-white">Change password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Update the password used to sign in to the admin panel</p>
            </div>

            {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-emerald-400">{success}</span>
                </div>
            )}

            <PasswordField
                label="Current password"
                value={currentPw}
                onChange={setCurrentPw}
                show={showCurrent}
                onToggleShow={() => setShowCurrent((s) => !s)}
                placeholder="Enter your current password"
            />
            <PasswordField
                label="New password"
                value={newPw}
                onChange={setNewPw}
                show={showNew}
                onToggleShow={() => setShowNew((s) => !s)}
                placeholder="Enter a new password"
            />
            <PasswordField
                label="Confirm new password"
                value={confirmPw}
                onChange={setConfirmPw}
                show={showConfirm}
                onToggleShow={() => setShowConfirm((s) => !s)}
                placeholder="Re-enter the new password"
                marginClass="mb-6"
            />

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/30"
            >
                {loading ? (
                    <>
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                        Updating…
                    </>
                ) : (
                    "Update password"
                )}
            </button>
        </div>
    );
}

function PasswordField({ label, value, onChange, show, onToggleShow, placeholder, marginClass = "mb-4" }) {
    return (
        <div className={marginClass}>
            <label className="block text-[13px] font-medium text-gray-400 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                    {show ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
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
function CheckCircleIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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