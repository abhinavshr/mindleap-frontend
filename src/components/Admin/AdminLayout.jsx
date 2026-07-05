import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
    { path: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "users", label: "Users", icon: UsersIcon },
    { path: "admin-list", label: "Admin List", icon: AdminListIcon },
    { path: "contact", label: "Contact", icon: ContactIcon },
    { path: "settings", label: "Settings", icon: SettingsIcon },
];

const ROLE_LABELS = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator",
};

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const adminRole = localStorage.getItem("adminRole");
    const adminEmail = localStorage.getItem("adminEmail") || "admin@mindleap.com";
    const adminUsername = localStorage.getItem("adminUsername");
    const roleDisplay = ROLE_LABELS[adminRole] || "Admin";
    const initials = (adminUsername || adminEmail).slice(0, 2).toUpperCase();

    const navItems = NAV_ITEMS.filter(
        (item) => (item.path !== "admin-list" && item.path !== "dashboard") || adminRole === "super_admin"
    );
    const defaultPath = adminRole === "super_admin" ? "dashboard" : "users";

    useEffect(() => {
        if (location.pathname === "/admin" || location.pathname === "/admin/") {
            navigate(`/admin/${defaultPath}`, { replace: true });
        }
    }, [location.pathname, defaultPath, navigate]);

    const activeLabel =
        NAV_ITEMS.find((n) => location.pathname.startsWith(`/admin/${n.path}`))?.label ?? "Dashboard";

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex bg-gray-950">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside
                className={`hidden md:flex flex-col ${collapsed ? "w-[76px]" : "w-[264px]"
                    } shrink-0 relative bg-gradient-to-b from-gray-900 via-gray-900 to-blue-950 border-r border-white/5 transition-all duration-200`}
            >
                {/* Subtle grid overlay, matches login */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-blue-600 opacity-[0.08] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">

                    {/* Brand */}
                    <div className={`flex items-center gap-3 px-5 h-16 border-b border-white/5 ${collapsed ? "justify-center px-0" : ""}`}>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
                            <ShieldCheckIcon className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col leading-none">
                                <span className="text-[15px] font-semibold text-white tracking-tight">MindLeap</span>
                                <span className="text-[11px] text-blue-400 mt-0.5">Admin Panel</span>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
                        {!collapsed && (
                            <p className="px-3 mb-2 text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
                                Menu
                            </p>
                        )}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={`/admin/${item.path}`}
                                    title={collapsed ? item.label : undefined}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition relative
                    ${collapsed ? "justify-center" : ""}
                    ${isActive
                                            ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                            : "text-gray-400 border border-transparent hover:bg-white/5 hover:text-gray-200"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-blue-400" />
                                            )}
                                            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Collapse toggle + footer */}
                    <div className="px-3 pb-5 border-t border-white/5 pt-4">
                        <button
                            type="button"
                            onClick={() => setCollapsed((c) => !c)}
                            className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300 transition ${collapsed ? "justify-center" : ""}`}
                        >
                            <ChevronLeftIcon className={`w-[18px] h-[18px] transition-transform ${collapsed ? "rotate-180" : ""}`} />
                            {!collapsed && <span>Collapse</span>}
                        </button>

                        <div className={`flex items-center gap-3 mt-3 px-3 ${collapsed ? "justify-center px-0" : ""}`}>
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-semibold shrink-0">
                                {initials}
                            </div>
                            {!collapsed && (
                                <div className="leading-none">
                                    <p className="text-xs font-medium text-gray-300">{roleDisplay}</p>
                                    <p className="text-[11px] text-gray-600 mt-1">{adminEmail}</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 mt-1 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition ${collapsed ? "justify-center" : ""}`}
                        >
                            <LogoutIcon className="w-[18px] h-[18px] shrink-0" />
                            {!collapsed && <span>Log out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main ─────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-gray-950/80 backdrop-blur">
                    <div>
                        <p className="text-xs text-gray-600">MindLeap / Admin</p>
                        <h1 className="text-sm font-semibold text-white">{activeLabel}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-9 h-9 rounded-xl border border-white/8 bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-white/[0.08] transition">
                            <BellIcon className="w-4 h-4" />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-semibold">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content — each nav item's page renders here via nested routes */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export function RequireSuperAdmin({ children }) {
    const adminRole = localStorage.getItem("adminRole");
    if (adminRole !== "super_admin") {
        return <Navigate to="/admin/users" replace />;
    }
    return children;
}

export function DashboardPage() {
    const cards = [
        { label: "Total users", value: "12,480", change: "+4.2%", icon: UsersIcon },
        { label: "Active admins", value: "18", change: "+1", icon: AdminListIcon },
        { label: "Open reports", value: "6", change: "-2", icon: ContactIcon },
        { label: "Uptime", value: "99.98%", change: "24h", icon: ShieldCheckIcon },
    ];
    return (
        <div className="max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((c) => {
                    const Icon = c.icon;
                    return (
                        <div key={c.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xs text-gray-500">{c.change}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{c.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h2 className="text-sm font-semibold text-white mb-1">Welcome back, Super Admin</h2>
                <p className="text-sm text-gray-500">
                    This is your MindLeap control center. Use the sidebar to manage users, review the admin list,
                    handle contact requests, or update platform settings.
                </p>
            </div>
        </div>
    );
}

export function PlaceholderPage({ title, description }) {
    return (
        <div className="max-w-3xl rounded-2xl border border-white/8 bg-white/[0.03] p-8 flex flex-col items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}

// ── Icons ─────────────────────────────────────────────────────────────────
function ShieldCheckIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}
function DashboardIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
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
function AdminListIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    );
}
function ContactIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    );
}
function SettingsIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
function BellIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    );
}
function ChevronLeftIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    );
}
function LogoutIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
        </svg>
    );
}
function FolderIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6m-19.5 0h19.5M4.5 9.75V6a2.25 2.25 0 012.25-2.25h4.5a2.25 2.25 0 011.591.659l1.409 1.409A2.25 2.25 0 0015.841 6.5H19.5A2.25 2.25 0 0121.75 8.75v.25" />
        </svg>
    );
}