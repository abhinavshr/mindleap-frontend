import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../api/admin";

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const isSuperAdmin = localStorage.getItem("adminRole") === "super_admin";

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate("/admin/users", { replace: true });
            return;
        }

        const controller = new AbortController();

        const loadStats = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchDashboardStats({ signal: controller.signal });
                setStats(res.data.data);
            } catch (err) {
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    setError(err.response?.data?.message || "Failed to load dashboard stats.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadStats();
        return () => controller.abort();
    }, [isSuperAdmin, navigate]);

    // ── Derived data — only recomputed when stats actually change ──────────
    const derived = useMemo(() => {
        if (!stats) return null;

        const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

        const verifiedPct  = pct(stats.verifiedUsers, stats.totalUsers);
        const bannedPct    = pct(stats.bannedUsers, stats.totalUsers);
        const classicPct   = pct(stats.totalClassicGames, stats.totalGames);
        const speedPct     = 100 - classicPct;
        const usedWordsPct = pct(stats.usedWords, stats.totalWords);

        const kpis = [
            { label: "Total users", value: stats.totalUsers, icon: UsersIcon, sub: `${stats.newUsersToday} new today` },
            { label: "Total games", value: stats.totalGames, icon: GameIcon, sub: `${stats.gamesPlayedToday} played today` },
            { label: "Total words", value: stats.totalWords.toLocaleString(), icon: WordIcon, sub: `${stats.unusedWords.toLocaleString()} unused` },
            { label: "Banned users", value: stats.bannedUsers, icon: BanIcon, sub: `${bannedPct}% of total` },
        ];

        const breakdowns = [
            {
                title: "User verification",
                total: `${stats.totalUsers} total`,
                barPct: verifiedPct,
                barColor: "bg-blue-500",
                rows: [
                    { label: "Verified", value: stats.verifiedUsers, dot: "bg-blue-500" },
                    { label: "Unverified", value: stats.unverifiedUsers, dot: "bg-white/15" },
                    { label: "Banned", value: stats.bannedUsers, dot: "bg-red-500", divider: true },
                ],
            },
            {
                title: "Games by type",
                total: `${stats.totalGames} total`,
                splitBar: [
                    { pct: classicPct, color: "bg-blue-500" },
                    { pct: speedPct, color: "bg-indigo-400" },
                ],
                rows: [
                    { label: "Classic", value: stats.totalClassicGames, dot: "bg-blue-500" },
                    { label: "Speed", value: stats.totalSpeedGames, dot: "bg-indigo-400" },
                ],
            },
            {
                title: "Word usage",
                total: `${stats.totalWords.toLocaleString()} total`,
                barPct: usedWordsPct,
                barColor: "bg-emerald-500",
                rows: [
                    { label: "Used", value: stats.usedWords.toLocaleString(), dot: "bg-emerald-500" },
                    { label: "Unused", value: stats.unusedWords.toLocaleString(), dot: "bg-white/15" },
                ],
            },
        ];

        return { kpis, breakdowns };
    }, [stats]);

    if (!isSuperAdmin) return null;

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

    if (!derived) return null;

    return (
        <div className="w-full">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {derived.kpis.map((k) => (
                    <KpiCard key={k.label} {...k} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {derived.breakdowns.map((b) => (
                    <BreakdownCard key={b.title} {...b} />
                ))}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                <div>
                    <h2 className="text-sm font-semibold text-white mb-1">Today</h2>
                    <p className="text-xs text-gray-500">Live activity since midnight</p>
                </div>
                <div className="flex gap-10">
                    <div>
                        <div className="text-xl font-bold text-white">{stats.newUsersToday}</div>
                        <div className="text-xs text-gray-500 mt-0.5">New users</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{stats.gamesPlayedToday}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Games played</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Reusable pieces ─────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, sub }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-400" />
                </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
            <div className="text-[11px] text-gray-600 mt-2">{sub}</div>
        </div>
    );
}

function BreakdownCard({ title, total, barPct, barColor, splitBar, rows }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <span className="text-xs text-gray-500">{total}</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden mb-4 flex">
                {splitBar
                    ? splitBar.map((seg, i) => (
                          <div key={i} className={`h-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                      ))
                    : <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${barPct}%` }} />}
            </div>

            {rows.map((row) => (
                <div
                    key={row.label}
                    className={`flex items-center justify-between text-sm mt-2 first:mt-0 ${
                        row.divider ? "pt-2 border-t border-white/5" : ""
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                        <span className="text-gray-300">{row.label}</span>
                    </div>
                    <span className="text-gray-400">{row.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Icons ─────────────────────────────────────────────────────────────────
function UsersIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    );
}
function GameIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m18 0A2.25 2.25 0 0018.75 5.25H5.25A2.25 2.25 0 003 7.5m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.07 9.66A2.25 2.25 0 013 7.5" />
        </svg>
    );
}
function WordIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    );
}
function BanIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 105.636 5.636a9 9 0 0012.728 12.728zM5.636 5.636l12.728 12.728" />
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