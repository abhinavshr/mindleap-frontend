import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Gamepad2, BookOpen, Ban, AlertCircle, Loader2 } from "lucide-react";
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
            { label: "Total users", value: stats.totalUsers, icon: Users, sub: `${stats.newUsersToday} new today` },
            { label: "Total games", value: stats.totalGames, icon: Gamepad2, sub: `${stats.gamesPlayedToday} played today` },
            { label: "Total words", value: stats.totalWords.toLocaleString(), icon: BookOpen, sub: `${stats.unusedWords.toLocaleString()} unused` },
            { label: "Banned users", value: stats.bannedUsers, icon: Ban, sub: `${bannedPct}% of total` },
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
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
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