import { useEffect, useState } from "react";
import { fetchUsers, banUser, unbanUser } from "../../api/admin";

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [banningId, setBanningId] = useState(null);
    const [banError, setBanError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchUsers(page, limit);
                if (!cancelled) {
                    setUsers(res.data.data);
                    setMeta(res.data.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load users.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadUsers();
        return () => {
            cancelled = true;
        };
    }, [page, limit]);

    const toggleBan = async (u) => {
        setBanError("");
        setBanningId(u.id);
        try {
            const res = u.is_banned ? await unbanUser(u.id) : await banUser(u.id);
            const updated = res.data.data;
            setUsers((prev) =>
                prev.map((usr) => (usr.id === updated.id ? { ...usr, is_banned: updated.is_banned } : usr))
            );
        } catch (err) {
            setBanError(err.response?.data?.message || "Failed to update user status.");
        } finally {
            setBanningId(null);
        }
    };

    return (
        <div className="w-full">

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">All users</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {meta ? `${meta.total} total users` : "Loading…"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {banError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{banError}</span>
                </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/8 text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Level</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">XP</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Verified</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center">
                                        <SpinnerIcon className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-xs font-semibold shrink-0">
                                                    {u.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{u.username}</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-300">Lvl {u.current_level}</span>
                                            <p className="text-xs text-gray-600 mt-0.5">{u.current_title}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-300">{u.total_xp.toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            {u.is_verified ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-blue-300">
                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-600">Unverified</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                                        <td className="px-5 py-4">
                                            {u.is_banned ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleBan(u)}
                                                disabled={banningId === u.id}
                                                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed
                          ${u.is_banned
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                        : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                    }`}
                                            >
                                                {banningId === u.id ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                                        {u.is_banned ? "Unbanning…" : "Banning…"}
                                                    </span>
                                                ) : u.is_banned ? (
                                                    "Unban"
                                                ) : (
                                                    "Ban"
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8">
                    <p className="text-xs text-gray-600">
                        {meta ? `Page ${meta.page} of ${meta.totalPages}` : "—"}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!meta?.hasPrevPage || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition"
                        >
                            Previous
                        </button>
                        <button
                            disabled={!meta?.hasNextPage || loading}
                            onClick={() => setPage((p) => p + 1)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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