import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const LOGO_SRC = "/assets/images/logo.png";

const HOLD_MS = 450; 
const EXIT_MS = 300; 

export default function PageTransitionLoader() {
    const location = useLocation();
    const [rendered, setRendered] = useState(false);
    const [active, setActive] = useState(false);
    const hasMounted = useRef(false);
    const timers = useRef([]);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        timers.current.forEach(clearTimeout);
        timers.current = [];

        setRendered(true);
        const raf = requestAnimationFrame(() => setActive(true));

        const holdTimer = setTimeout(() => {
            setActive(false);
            const unmountTimer = setTimeout(() => setRendered(false), EXIT_MS);
            timers.current.push(unmountTimer);
        }, HOLD_MS);
        timers.current.push(holdTimer);

        return () => {
            cancelAnimationFrame(raf);
            timers.current.forEach(clearTimeout);
        };
    }, [location.pathname]);

    if (!rendered) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gray-950/85 backdrop-blur-sm transition-opacity duration-300 ${
                active ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* top progress bar */}
            <div className="absolute top-0 left-0 h-0.5 w-full bg-white/5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 ease-linear motion-reduce:transition-none"
                    style={{
                        transformOrigin: "left",
                        transform: active ? "scaleX(1)" : "scaleX(0)",
                        transition: active
                            ? `transform ${HOLD_MS}ms linear`
                            : `transform ${EXIT_MS}ms ease-in`,
                    }}
                />
            </div>

            {/* ambient glow blobs, consistent with the login page background */}
            <div className="absolute w-[420px] h-[420px] bg-blue-600 opacity-[0.08] rounded-full blur-3xl motion-reduce:animate-none animate-pulse [animation-duration:2.4s]" />
            <div className="absolute w-[280px] h-[280px] bg-indigo-500 opacity-[0.06] rounded-full blur-3xl translate-x-24 translate-y-16 motion-reduce:animate-none animate-pulse [animation-duration:3.2s]" />

            <div
                className={`relative flex flex-col items-center gap-5 transition-all duration-300 ${
                    active ? "scale-100 opacity-100" : "scale-90 opacity-0"
                }`}
            >
                <div className="relative w-24 h-24">
                    {/* static track */}
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/10" />

                    {/* outer ring — slow clockwise */}
                    <div
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin motion-reduce:animate-none"
                        style={{ animationDuration: "1.4s" }}
                    />

                    {/* middle ring — faster, counter-clockwise */}
                    <div
                        className="absolute inset-3 rounded-full border-2 border-transparent border-b-indigo-400 animate-spin motion-reduce:animate-none"
                        style={{ animationDuration: "0.9s", animationDirection: "reverse" }}
                    />

                    {/* pulsing halo behind the logo */}
                    <div
                        className="absolute inset-5 rounded-full bg-blue-500/25 animate-ping motion-reduce:animate-none"
                        style={{ animationDuration: "1.8s" }}
                    />

                    {/* orbiting dots, opposing directions */}
                    <div
                        className="absolute inset-0 animate-spin motion-reduce:animate-none"
                        style={{ animationDuration: "2.6s" }}
                    >
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_1px_rgba(96,165,250,0.6)]" />
                    </div>
                    <div
                        className="absolute inset-0 animate-spin motion-reduce:animate-none"
                        style={{ animationDuration: "3.4s", animationDirection: "reverse" }}
                    >
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-300 shadow-[0_0_5px_1px_rgba(129,140,248,0.6)]" />
                    </div>

                    {/* logo: bounces in once, then breathes gently */}
                    <img
                        src={LOGO_SRC}
                        alt=""
                        className="absolute inset-0 m-auto w-10 h-10 object-contain motion-reduce:animate-none"
                        style={{ animation: "loader-bounce-in 0.5s ease-out, loader-breathe 2s ease-in-out 0.5s infinite" }}
                    />
                </div>

                <p className="text-xs font-medium tracking-wide text-gray-400 motion-reduce:animate-none animate-pulse">
                    Loading…
                </p>
            </div>

            <style>{`
                @keyframes loader-bounce-in {
                    0% { transform: scale(0.4); opacity: 0; }
                    60% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes loader-breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
                @media (prefers-reduced-motion: reduce) {
                    img[alt=""] { animation: none !important; }
                }
            `}</style>
        </div>
    );
}