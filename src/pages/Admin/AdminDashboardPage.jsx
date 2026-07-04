const DASHBOARD_RESPONSE = {
    success: true,
    message: "Dashboard stats fetched successfully.",
    data: {
        totalUsers: 4,
        verifiedUsers: 4,
        unverifiedUsers: 0,
        newUsersToday: 0,
        totalClassicGames: 24,
        totalSpeedGames: 33,
        totalGames: 57,
        gamesPlayedToday: 0,
        totalWords: 2546,
    },
};

export default function AdminDashboardPage() {
    const stats = DASHBOARD_RESPONSE.data;

    const verifiedPct = stats.totalUsers
        ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
        : 0;
    const classicPct = stats.totalGames
        ? Math.round((stats.totalClassicGames / stats.totalGames) * 100)
        : 0;
    const speedPct = 100 - classicPct;

    const kpis = [
        { label: "Total users", value: stats.totalUsers, icon: UsersIcon, sub: `${stats.newUsersToday} new today` },
        { label: "Total games", value: stats.totalGames, icon: GameIcon, sub: `${stats.gamesPlayedToday} played today` },
        { label: "Total words", value: stats.totalWords.toLocaleString(), icon: WordIcon, sub: "In word bank" },
        { label: "Verified users", value: stats.verifiedUsers, icon: ShieldCheckIcon, sub: `${verifiedPct}% of total` },
    ];

    return (
        <div className="max-w-6xl">

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((k) => {
                    const Icon = k.icon;
                    return (
                        <div key={k.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{k.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
                            <div className="text-[11px] text-gray-600 mt-2">{k.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Breakdown row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

                {/* User verification breakdown */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-white">User verification</h2>
                        <span className="text-xs text-gray-500">{stats.totalUsers} total</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden mb-4">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${verifiedPct}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-300">Verified</span>
                        </div>
                        <span className="text-gray-400">{stats.verifiedUsers}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white/15" />
                            <span className="text-gray-300">Unverified</span>
                        </div>
                        <span className="text-gray-400">{stats.unverifiedUsers}</span>
                    </div>
                </div>

                {/* Game type breakdown */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-white">Games by type</h2>
                        <span className="text-xs text-gray-500">{stats.totalGames} total</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden flex mb-4">
                        <div className="h-full bg-blue-500" style={{ width: `${classicPct}%` }} />
                        <div className="h-full bg-indigo-400" style={{ width: `${speedPct}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-300">Classic</span>
                        </div>
                        <span className="text-gray-400">{stats.totalClassicGames}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-gray-300">Speed</span>
                        </div>
                        <span className="text-gray-400">{stats.totalSpeedGames}</span>
                    </div>
                </div>
            </div>

            {/* Today snapshot */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
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
function ShieldCheckIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}