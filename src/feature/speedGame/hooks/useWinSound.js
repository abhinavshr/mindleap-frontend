import { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

const WIN_SOUND_SRC = "/sounds/success.mp3";

/**
 * Manages the win sound effect:
 *  - lazily creates the Howl instance
 *  - unlocks mobile audio contexts on the user's first tap/keypress
 *    (silently plays + stops the sound once, which is required by
 *    iOS/Android before audio can play programmatically later)
 *  - exposes playWinSound() for the caller to trigger on a win
 */
export default function useWinSound() {
  const audioUnlockedRef = useRef(false);
  const winSoundRef = useRef(null);

  const initWinSound = () => {
    if (winSoundRef.current) return;
    winSoundRef.current = new Howl({
      src: [WIN_SOUND_SRC],
      volume: 0.7,
      preload: true,
    });
  };

  useEffect(() => {
    return () => {
      if (winSoundRef.current) {
        winSoundRef.current.unload();
        winSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      initWinSound();
      if (Howler.ctx && Howler.ctx.state !== "running") {
        await Howler.ctx.resume();
      }
      const sound = winSoundRef.current;
      if (!sound) return;
      const previousVolume = sound.volume();
      sound.volume(0);
      const id = sound.play();
      setTimeout(() => {
        sound.stop(id);
        sound.volume(previousVolume);
      }, 50);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const playWinSound = async () => {
    initWinSound();
    if (Howler.ctx && Howler.ctx.state !== "running") {
      await Howler.ctx.resume();
    }
    if (winSoundRef.current) winSoundRef.current.play();
  };

  return { playWinSound };
}
