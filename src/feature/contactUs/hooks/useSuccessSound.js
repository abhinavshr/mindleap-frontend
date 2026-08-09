import { useRef, useEffect } from "react";
import { Howl, Howler } from "howler";

const SUCCESS_SOUND_SRC = "/sounds/success.mp3";

/**
 * Plays the shared success chime on a successful send. Unlocks mobile
 * audio contexts on first tap/keypress, same pattern as Speed Game's
 * useWinSound.
 */
export default function useSuccessSound() {
  const soundRef = useRef(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unlock = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      soundRef.current = new Howl({ src: [SUCCESS_SOUND_SRC], volume: 0.6, preload: true });
      if (Howler.ctx && Howler.ctx.state !== "running") await Howler.ctx.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const play = async () => {
    if (!soundRef.current) {
      soundRef.current = new Howl({ src: [SUCCESS_SOUND_SRC], volume: 0.6, preload: true });
    }
    if (Howler.ctx && Howler.ctx.state !== "running") await Howler.ctx.resume();
    soundRef.current.play();
  };

  return { play };
}
