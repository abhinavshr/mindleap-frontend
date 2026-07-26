import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, X, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { fetchAdminList, createAdmin, deleteAdmin } from "../../api/admin";

const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super admin" },
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
];

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

function formatDate(iso) {
    if (!iso) return "Never";
    return dateFormatter.format(new Date(iso));
}

function roleLabel(role) {
    return ROLE_LABELS[role] ?? role;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminListPage() {
    const navigate = useNavigate();
    // Read once; role doesn't change within a session.
    const [isSuperAdmin] = useState(() => localStorage.getItem("adminRole") === "super_admin");

    const [admins, setAdmins] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    const [loading, setLoading] = useState(true); // initial load only
    const [fetching, setFetching] = useState(false); // any load, incl. pagination
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate("/admin/users", { replace: true });
            return;
        }

        let cancelled = false;

        const loadAdmins = async () => {
            setFetching(true);
            setError("");
            try {
                const res = await fetchAdminList(page, limit);
                if (!cancelled) {
                    setAdmins(res.data.data);
                    setMeta(res.data.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load admin list.");
                }
            } finally {
                if (!cancelled) {
                    setFetching(false);
                    setLoading(false);
                }
            }
        };

        loadAdmins();
        return () => {
            cancelled = true;
        };
    }, [page, isSuperAdmin, navigate]);

    const handleAddAdmin = useCallback(async (newAdmin) => {
        const res = await createAdmin(newAdmin);
        setAdmins((prev) => [...prev, res.data.data]);
        toast.success(`${newAdmin.username} was added successfully.`);
        setShowModal(false);
    }, []);

    const handleDeleteAdmin = useCallback(async () => {
        if (!deleteTarget) return;
        setActionError("");
        setDeletingId(deleteTarget.id);
        try {
            await deleteAdmin(deleteTarget.id);
            setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
            toast.success(`${deleteTarget.username} was deleted successfully.`);
            setDeleteTarget(null);
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete admin.";
            setActionError(message);
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    }, [deleteTarget]);

    const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
    const goNext = useCallback(() => setPage((p) => p + 1), []);

    const rows = useMemo(() => admins, [admins]);

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">Admin list</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {meta ? `${meta.total} total admins` : "Loading…"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white transition shadow-lg shadow-blue-900/30"
                >
                    <Plus className="w-4 h-4" />
                    Add admin
                </button>
            </div>

            <ErrorBanner message={error} />
            <ErrorBanner message={actionError} />

            <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/8 text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Last login</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center">
                                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                                        No admins found.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((a) => (
                                    <AdminRow
                                        key={a.id}
                                        admin={a}
                                        onDeleteClick={() => setDeleteTarget(a)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* Subtle overlay while paginating, keeps old rows visible instead of a full blank/spinner flash */}
                    {fetching && !loading && (
                        <div className="h-0.5 bg-blue-500/40 animate-pulse" />
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8">
                    <p className="text-xs text-gray-600">
                        {meta ? `Page ${meta.page} of ${meta.totalPages}` : "—"}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!meta?.hasPrevPage || fetching}
                            onClick={goPrev}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition"
                        >
                            Previous
                        </button>
                        <button
                            disabled={!meta?.hasNextPage || fetching}
                            onClick={goNext}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <AddAdminModal onClose={() => setShowModal(false)} onSubmit={handleAddAdmin} />
            )}

            {deleteTarget && (
                <DeleteAdminModal
                    admin={deleteTarget}
                    deleting={deletingId === deleteTarget.id}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteAdmin}
                />
            )}
        </div>
    );
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-400">{message}</span>
        </div>
    );
}

// Memoized so unrelated state updates (e.g. typing in a modal) don't re-render every row.
function AdminRowBase({ admin, onDeleteClick }) {
    return (
        <tr className="border-b border-white/5 last:border-0 hover:bg-white/2 transition">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-xs font-semibold shrink-0">
                        {admin.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{admin.username}</p>
                        <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {roleLabel(admin.role)}
                </span>
            </td>
            <td className="px-5 py-4">
                {admin.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">
                        Inactive
                    </span>
                )}
            </td>
            <td className="px-5 py-4 text-sm text-gray-500">{formatDate(admin.last_login)}</td>
            <td className="px-5 py-4 text-sm text-gray-500">{formatDate(admin.created_at)}</td>
            <td className="px-5 py-4 text-right">
                <button
                    type="button"
                    onClick={onDeleteClick}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}

const AdminRow = memo(AdminRowBase, (prev, next) => prev.admin === next.admin);

// Shared modal chrome: backdrop + centered card. Escape closes.
function ModalShell({ onClose, maxWidth = "max-w-md", children }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${maxWidth} rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl`}>
                {children}
            </div>
        </div>
    );
}

function DeleteAdminModal({ admin, deleting, onClose, onConfirm }) {
    return (
        <ModalShell onClose={onClose} maxWidth="max-w-sm">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-red-400" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1.5">Delete admin</h3>
            <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="text-gray-300">{admin.username}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={deleting}
                    className="flex-1 h-11 rounded-xl border border-white/8 text-sm font-medium text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30"
                >
                    {deleting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deleting…
                        </>
                    ) : (
                        "Delete"
                    )}
                </button>
            </div>
        </ModalShell>
    );
}

function AddAdminModal({ onClose, onSubmit }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [role, setRole] = useState("admin");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (!trimmedUsername || !trimmedEmail || !password) {
            setError("All fields are required.");
            return;
        }
        if (!EMAIL_RE.test(trimmedEmail)) {
            setError("Enter a valid email address.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setError("");
        setSubmitting(true);
        try {
            await onSubmit({ username: trimmedUsername, email: trimmedEmail, password, role });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create admin.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-white">Add admin</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-300 transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <ErrorBanner message={error} />

            <div className="mb-4">
                <label className="block text-[13px] font-medium text-gray-400 mb-1.5">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="abhinav"
                    className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition"
                />
            </div>

            <div className="mb-4">
                <label className="block text-[13px] font-medium text-gray-400 mb-1.5">Email address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abhinavshr002@gmail.com"
                    className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition"
                />
            </div>

            <div className="mb-4">
                <label className="block text-[13px] font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                    <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a password"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-400 mb-1.5">Role</label>
                <div className="flex gap-2">
                    {ROLE_OPTIONS.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition
                ${role === r.value
                                    ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                    : "border-white/5 bg-white/3 text-gray-500 hover:border-white/10 hover:bg-white/5 hover:text-gray-400"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 h-11 rounded-xl border border-white/8 text-sm font-medium text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/30"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding…
                        </>
                    ) : (
                        "Add admin"
                    )}
                </button>
            </div>
        </ModalShell>
    );
}