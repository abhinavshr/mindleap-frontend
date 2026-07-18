import { useEffect, useState } from "react";
import { fetchWords, addWord } from "../../api/admin";

export default function AdminWordsPage() {
    const [words, setWords] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(100);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadWords = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchWords(page, limit);
                if (!cancelled) {
                    setWords(res.data.data);
                    setMeta(res.data.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load words.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWords();
        return () => {
            cancelled = true;
        };
    }, [page, limit]);

    const handleAddWord = async (word) => {
        const res = await addWord(word);
        setWords((prev) => [res.data.data, ...prev]);
        setShowAddModal(false);
    };

    const handleEditWord = (id, newWord) => {
        setWords((prev) => prev.map((w) => (w.id === id ? { ...w, word: newWord.toUpperCase() } : w)));
        setEditTarget(null);
    };

    const handleDeleteWord = () => {
        setWords((prev) => prev.filter((w) => w.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <div className="w-full">

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">Word management</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {meta ? `${meta.total.toLocaleString()} total words` : "Loading…"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white transition shadow-lg shadow-blue-900/30"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add word
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                    <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 mb-5 min-h-[120px]">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <SpinnerIcon className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                ) : words.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                        No words found.
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-3">
                        {words.map((w) => (
                            <div
                                key={w.id}
                                className={`flex items-center justify-between gap-2 rounded-full border pl-5 pr-2 py-3 transition
                  ${w.is_used
                                        ? "border-white/10 bg-white/[0.03]"
                                        : "border-emerald-500/20 bg-emerald-500/[0.06]"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${w.is_used ? "bg-gray-500" : "bg-emerald-400"}`} />
                                    <span className="text-sm font-semibold uppercase tracking-wider text-white truncate">
                                        {w.word}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setEditTarget(w)}
                                        aria-label={`Edit ${w.word}`}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(w)}
                                        aria-label={`Delete ${w.word}`}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-600">
                    {meta ? `Page ${meta.page} of ${meta.totalPages} · ${meta.limit} per page` : "—"}
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

            {showAddModal && (
                <WordFormModal
                    title="Add word"
                    submitLabel="Add word"
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddWord}
                />
            )}

            {editTarget && (
                <WordFormModal
                    title="Edit word"
                    submitLabel="Save changes"
                    initialValue={editTarget.word}
                    onClose={() => setEditTarget(null)}
                    onSubmit={(word) => handleEditWord(editTarget.id, word)}
                />
            )}

            {deleteTarget && (
                <DeleteWordModal
                    word={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteWord}
                />
            )}
        </div>
    );
}

function WordFormModal({ title, submitLabel, initialValue = "", onClose, onSubmit }) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmed = value.trim();
        if (!/^[A-Za-z]{5}$/.test(trimmed)) {
            setError("Word must be exactly 5 letters (A-Z only).");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await onSubmit(trimmed);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                        <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-sm text-red-400">{error}</span>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-[13px] font-medium text-gray-400 mb-1.5">Word</label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="apple"
                        maxLength={5}
                        autoFocus
                        className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10 transition uppercase tracking-wider"
                    />
                    <p className="text-[11px] text-gray-600 mt-1.5">Must be exactly 5 letters.</p>
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
                                <SpinnerIcon className="w-4 h-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            submitLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteWordModal({ word, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <AlertCircleIcon className="w-5 h-5 text-red-400" />
                </div>

                <h3 className="text-base font-semibold text-white mb-1.5">Delete word</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="text-gray-300 font-semibold uppercase">{word.word}</span>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border border-white/8 text-sm font-medium text-gray-400 hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white text-sm font-semibold transition shadow-lg shadow-red-900/30"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5v4.875c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 014.5 18.375V6.125A1.125 1.125 0 015.625 5H10.5" />
        </svg>
    );
}
function TrashIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    );
}
function PlusIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
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
function SpinnerIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}