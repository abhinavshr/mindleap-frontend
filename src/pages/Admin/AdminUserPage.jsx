import { useState } from "react";

const USERS_RESPONSE = {
    success: true,
    message: "Users fetched successfully.",
    data: [
        {
            id: 10,
            username: "abhinav007",
            email: "abhinavstha007@gmail.com",
            is_verified: 1,
            total_xp: 320,
            current_level: 3,
            current_title: "Learner",
            is_banned: true,
            created_at: "2026-05-02T08:16:54.000Z",
        },
        {
            id: 9,
            username: "abhinav1",
            email: "abhinavshr002@gmail.com",
            is_verified: 1,
            total_xp: 5020,
            current_level: 10,
            current_title: "Sharpshooter",
            is_banned: false,
            created_at: "2026-04-12T09:33:22.000Z",
        },
        {
            id: 8,
            username: "abhinav2",
            email: "abhinavshr015@gmail.com",
            is_verified: 1,
            total_xp: 320,
            current_level: 3,
            current_title: "Learner",
            is_banned: false,
            created_at: "2026-04-11T08:54:41.000Z",
        },
        {
            id: 1,
            username: "abhinav",
            email: "abhinav@example.com",
            is_verified: 1,
            total_xp: 0,
            current_level: 1,
            current_title: "Beginner",
            is_banned: false,
            created_at: "2026-04-11T08:10:42.000Z",
        },
    ],
    meta: {
        total: 4,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    },
};

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState(USERS_RESPONSE.data);
    const meta = USERS_RESPONSE.meta;

    const toggleBan = (id) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, is_banned: !u.is_banned } : u))
        );
    };

    return (
        <div className="w-full">

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">All users</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{meta.total} total users</p>
                </div>
            </div>

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
                            {users.map((u) => (
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
                                            onClick={() => toggleBan(u.id)}
                                            className={`text-xs font-medium px-3.5 py-1.5 rounded-lg border transition
                        ${u.is_banned
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                    : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                }`}
                                        >
                                            {u.is_banned ? "Unban" : "Ban"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8">
                    <p className="text-xs text-gray-600">
                        Page {meta.page} of {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!meta.hasPrevPage}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition"
                        >
                            Previous
                        </button>
                        <button
                            disabled={!meta.hasNextPage}
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