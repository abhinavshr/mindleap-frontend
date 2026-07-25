import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const HOLD_MS = 650; // time the loader stays fully visible
const EXIT_MS = 350; // fade/scale-out duration before unmount

const STATUS_STEPS = [
    { at: 0, label: "Verifying session" },
    { at: 35, label: "Loading module" },
    { at: 75, label: "Rendering view" },
];

export default function AdminPageTransitionLoader() {
    const location = useLocation();
    const [rendered, setRendered] = useState(false);
    const [active, setActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const hasMounted = useRef(false);
    const timers = useRef([]);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        timers.current.forEach(clearTimeout);
        timers.current = [];
        cancelAnimationFrame(rafRef.current);

        setRendered(true);
        setProgress(0);

        const enterRaf = requestAnimationFrame(() => setActive(true));

        const start = performance.now();
        const tick = (now) => {
            const elapsed = now - start;
            setProgress(Math.min(100, Math.round((elapsed / HOLD_MS) * 100)));
            if (elapsed < HOLD_MS) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        const holdTimer = setTimeout(() => {
            setActive(false);
            const unmountTimer = setTimeout(() => setRendered(false), EXIT_MS);
            timers.current.push(unmountTimer);
        }, HOLD_MS);
        timers.current.push(holdTimer);

        return () => {
            cancelAnimationFrame(enterRaf);
            cancelAnimationFrame(rafRef.current);
            timers.current.forEach(clearTimeout);
        };
    }, [location.pathname]);

    if (!rendered) return null;

    const status = [...STATUS_STEPS].reverse().find((s) => progress >= s.at)?.label ?? STATUS_STEPS[0].label;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading admin panel"
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gray-950 transition-opacity duration-300 ${
                active ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* grid background, matches the admin login hero */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600 opacity-[0.08] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl motion-reduce:animate-none animate-pulse [animation-duration:2.6s]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500 opacity-[0.06] rounded-full translate-x-1/4 translate-y-1/4 blur-3xl motion-reduce:animate-none animate-pulse [animation-duration:3.4s]" />

            <div
                className={`relative flex flex-col items-center gap-6 transition-all duration-300 ${
                    active ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                {/* scan frame */}
                <div className="relative w-32 h-32">
                    <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-blue-500/60 rounded-tl-md" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-blue-500/60 rounded-tr-md" />
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-blue-500/60 rounded-bl-md" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-blue-500/60 rounded-br-md" />

                    <div className="absolute inset-0 rounded-xl border border-blue-500/15 bg-blue-500/[0.03]" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheckIcon className="w-12 h-12 text-blue-400/90" />
                    </div>

                    {/* scanning sweep line */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl motion-reduce:hidden">
                        <div className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-blue-400/25 to-transparent admin-scan-line" />
                    </div>
                </div>

                {/* progress bar + status */}
                <div className="w-56">
                    <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 motion-reduce:transition-none"
                            style={{ width: `${progress}%`, transition: "width 80ms linear" }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono tracking-wide text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 motion-reduce:animate-none animate-pulse" />
                            {status}
                        </span>
                        <span className="text-gray-600 tabular-nums">{progress}%</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes admin-scan-sweep {
                    0% { transform: translateY(-2.5rem); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(8rem); opacity: 0; }
                }
                .admin-scan-line {
                    animation: admin-scan-sweep 1.3s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .admin-scan-line { animation: none; display: none; }
                }
            `}</style>
        </div>
    );
}

function ShieldCheckIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
        </svg>
    );
}