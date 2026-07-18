import { useState } from "react";

const WORDS_RESPONSE = {
    success: true,
    message: "Words fetched successfully.",
    data: [
        { id: 2546, word: "write", date: null, is_used: 0 },
        { id: 2545, word: "wreck", date: null, is_used: 0 },
        { id: 2544, word: "works", date: null, is_used: 0 },
        { id: 2543, word: "words", date: null, is_used: 0 },
        { id: 2542, word: "woods", date: null, is_used: 0 },
        { id: 2541, word: "women", date: null, is_used: 0 },
        { id: 2540, word: "wives", date: null, is_used: 0 },
        { id: 2539, word: "wings", date: null, is_used: 0 },
        { id: 2538, word: "winds", date: null, is_used: 0 },
        { id: 2537, word: "width", date: null, is_used: 0 },
    ],
    meta: {
        total: 2546,
        page: 1,
        limit: 10,
        totalPages: 255,
        hasNextPage: true,
        hasPrevPage: false,
    },
};

function formatDate(iso) {
    if (!iso) return "Not scheduled";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function AdminWordsPage() {
    const [words, setWords] = useState(WORDS_RESPONSE.data);
    const meta = WORDS_RESPONSE.meta;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleAddWord = (word) => {
        setWords((prev) => [
            { id: prev.length ? Math.max(...prev.map((w) => w.id)) + 1 : 1, word: word.toUpperCase(), date: null, is_used: 0 },
            ...prev,
        ]);
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
                    <p className="text-xs text-gray-500 mt-0.5">{meta.total.toLocaleString()} total words</p>
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

            <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/8 text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Word</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled date</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {words.map((w) => (
                                <tr key={w.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 text-xs font-bold tracking-wider shrink-0">
                                                {w.word.slice(0, 2).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold text-white tracking-wide uppercase">{w.word}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {w.is_used ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">
                                                Used
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Unused
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(w.date)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditTarget(w)}
                                                className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-white/8 bg-white/3 text-gray-400 hover:bg-white/5 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(w)}
                                                className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!/^[A-Za-z]{5}$/.test(trimmed)) {
            setError("Word must be exactly 5 letters (A-Z only).");
            return;
        }
        setError("");
        onSubmit(trimmed);
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
                        className="flex-1 h-11 rounded-xl border border-white/8 text-sm font-medium text-gray-400 hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-semibold transition shadow-lg shadow-blue-900/30"
                    >
                        {submitLabel}
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