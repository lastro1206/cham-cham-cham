"use client";

import { useCallback, useRef } from "react";
import { SoundType, SOUND_PATHS } from "../_utils/soundPaths";

interface UseSoundOptions {
  volume?: number;
}

export function useSound(options: UseSoundOptions = {}) {
  const { volume = 0.5 } = options;
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const playSound = useCallback(
    (soundType: SoundType) => {
      try {
        let audio = audioCache.current.get(soundType);

        if (!audio) {
          const soundPath = SOUND_PATHS[soundType];
          audio = new Audio(soundPath);
          audio.volume = volume;
          audio.preload = "auto";
          audioCache.current.set(soundType, audio);
        }

        audio.currentTime = 0;
        audio.volume = volume;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(`Failed to play sound ${soundType}:`, error);
          });
        }
      } catch (error) {
        console.warn(`Error playing sound ${soundType}:`, error);
      }
    },
    [volume]
  );

  const stopSound = useCallback((soundType: SoundType) => {
    const audio = audioCache.current.get(soundType);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioCache.current.forEach((audio) => {
        audio.volume = clampedVolume;
      });
    },
    []
  );

  return {
    playSound,
    stopSound,
    setVolume,
  };
}

