import { useCallback, useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchContacts, fetchContactById, markContactAsRead, markContactAsUnread, deleteContact } from "../../api/admin";

function formatDateTime(iso) {
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function initialsFor(c) {
    const source = c.name || c.email || "?";
    return source.slice(0, 2).toUpperCase();
}

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Locks background scroll, closes on Escape, and traps Tab focus while a dialog is mounted. */
function useDialogA11y(dialogRef, onClose, { closeOnEscape = true } = {}) {
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const node = dialogRef.current;
        const focusable = node?.querySelectorAll(FOCUSABLE_SELECTOR);
        (focusable?.[0] || node)?.focus();

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && closeOnEscape) {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !node) return;
            const items = node.querySelectorAll(FOCUSABLE_SELECTOR);
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
            previouslyFocused?.focus?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closeOnEscape]);
}

export default function AdminContactPage() {
    const [contacts, setContacts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [openingId, setOpeningId] = useState(null);
    const [detailError, setDetailError] = useState("");
    const [togglingId, setTogglingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadContacts = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchContacts(page, limit);
                if (!cancelled) {
                    setContacts(res.data.data);
                    setMeta(res.data.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load contact submissions.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadContacts();
        return () => {
            cancelled = true;
        };
    }, [page, limit]);

    // Scoped to the currently loaded page — see note below on wiring a real total if the API provides one.
    const unreadCountOnPage = contacts.filter((c) => !c.is_read).length;

    const openContact = useCallback(async (contact) => {
        setDetailError("");
        setOpeningId(contact.id);
        try {
            const res = await fetchContactById(contact.id);
            const full = res.data.data;
            setSelected(full);
            setContacts((prev) =>
                prev.map((c) => (c.id === full.id ? { ...c, is_read: full.is_read } : c))
            );
        } catch (err) {
            setDetailError(err.response?.data?.message || "Failed to load contact submission.");
        } finally {
            setOpeningId(null);
        }
    }, []);

    const toggleReadStatus = useCallback(async (contact) => {
        setTogglingId(contact.id);
        try {
            const res = contact.is_read
                ? await markContactAsUnread(contact.id)
                : await markContactAsRead(contact.id);
            const updated = res.data.data;
            setContacts((prev) =>
                prev.map((c) => (c.id === updated.id ? { ...c, is_read: updated.is_read } : c))
            );
            setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, is_read: updated.is_read } : prev));
            toast.success(updated.is_read ? "Marked as read." : "Marked as unread.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update read status.");
        } finally {
            setTogglingId(null);
        }
    }, []);

    const handleDeleteContact = useCallback(async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        try {
            await deleteContact(deleteTarget.id);
            setContacts((prev) => {
                const next = prev.filter((c) => c.id !== deleteTarget.id);
                // Deleted the last item on a page beyond the first — step back rather than
                // leaving the admin staring at an empty table with no forward context.
                if (next.length === 0 && page > 1) {
                    setPage((p) => Math.max(1, p - 1));
                }
                return next;
            });
            if (selected?.id === deleteTarget.id) setSelected(null);
            toast.success("Contact submission deleted.");
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete contact submission.");
        } finally {
            setDeletingId(null);
        }
    }, [deleteTarget, page, selected]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">Contact submissions</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {meta ? `${meta.total} total · ${unreadCountOnPage} unread on this page` : "Loading…"}
                    </p>
                </div>
            </div>

            {error && (
                <div role="alert" aria-live="assertive" className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {detailError && (
                <div role="alert" aria-live="assertive" className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{detailError}</span>
                </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <caption className="sr-only">Contact form submissions with read status and actions</caption>
                        <thead>
                            <tr className="border-b border-white/8 text-left">
                                <th scope="col" className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">From</th>
                                <th scope="col" className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                                <th scope="col" className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th scope="col" className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Received</th>
                                <th scope="col" className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center">
                                        <SpinnerIcon className="w-5 h-5 text-blue-400 animate-spin mx-auto" role="status" aria-label="Loading contacts" />
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                                        No contact submissions found.
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((c) => (
                                    <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-xs font-semibold shrink-0">
                                                    {initialsFor(c)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{c.name || "—"}</p>
                                                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className={`text-sm truncate ${c.is_read ? "text-gray-400" : "text-white font-medium"}`}>
                                                {c.subject}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate">{c.message}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {c.is_read ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">
                                                    Read
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                    Unread
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{formatDateTime(c.created_at)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleReadStatus(c)}
                                                    disabled={togglingId === c.id}
                                                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-white/8 bg-white/3 text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {togglingId === c.id ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                                            Updating…
                                                        </span>
                                                    ) : c.is_read ? (
                                                        "Mark unread"
                                                    ) : (
                                                        "Mark read"
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openContact(c)}
                                                    disabled={openingId === c.id}
                                                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {openingId === c.id ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                                            Loading…
                                                        </span>
                                                    ) : (
                                                        "View"
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

            {selected && (
                <ContactDetailModal
                    contact={selected}
                    onClose={() => setSelected(null)}
                    onToggleRead={() => toggleReadStatus(selected)}
                    toggling={togglingId === selected.id}
                />
            )}

            {deleteTarget && (
                <DeleteContactModal
                    contact={deleteTarget}
                    deleting={deletingId === deleteTarget.id}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteContact}
                />
            )}
        </div>
    );
}

function ContactDetailModal({ contact, onClose, onToggleRead, toggling }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    useDialogA11y(dialogRef, onClose);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl outline-none"
            >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-sm font-semibold shrink-0">
                            {initialsFor(contact)}
                        </div>
                        <div>
                            <p id={titleId} className="text-sm font-medium text-white">{contact.name || "—"}</p>
                            <p className="text-xs text-gray-500">{contact.email}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-500 hover:text-gray-300 transition"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase mb-1.5">Subject</p>
                    <p className="text-sm font-medium text-white">{contact.subject}</p>
                </div>

                <div className="mb-6">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase mb-1.5">Message</p>
                    <p className="text-sm text-gray-300 leading-relaxed rounded-xl border border-white/8 bg-white/3 p-4 whitespace-pre-wrap">
                        {contact.message}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Received {formatDateTime(contact.created_at)}</span>
                    <button
                        type="button"
                        onClick={onToggleRead}
                        disabled={toggling}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed
              ${contact.is_read
                                ? "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                            }`}
                    >
                        {toggling ? (
                            <span className="inline-flex items-center gap-1.5">
                                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                Updating…
                            </span>
                        ) : contact.is_read ? (
                            "Read · Mark unread"
                        ) : (
                            "Unread · Mark read"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteContactModal({ contact, deleting, onClose, onConfirm }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    const safeClose = useCallback(() => {
        if (!deleting) onClose();
    }, [deleting, onClose]);
    useDialogA11y(dialogRef, safeClose, { closeOnEscape: !deleting });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={safeClose} />

            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl outline-none"
            >
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <AlertCircleIcon className="w-5 h-5 text-red-400" />
                </div>

                <h3 id={titleId} className="text-base font-semibold text-white mb-1.5">Delete submission</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete the message from{" "}
                    <span className="text-gray-300">{contact.name || "this contact"}</span>? This action cannot be undone.
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
                                <SpinnerIcon className="w-4 h-4 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function XIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
function SpinnerIcon({ className, role, "aria-label": ariaLabel }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" role={role} aria-label={ariaLabel}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}