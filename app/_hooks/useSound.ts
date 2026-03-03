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
    (soundType: SoundType, options?: { loop?: boolean; restart?: boolean }) => {
      try {
        let audio = audioCache.current.get(soundType);

        if (!audio) {
          const soundPath = SOUND_PATHS[soundType];
          audio = new Audio(soundPath);
          audio.volume = volume;
          audio.preload = "auto";
          if (options?.loop) {
            audio.loop = true;
          }
          audioCache.current.set(soundType, audio);
        }

        audio.volume = volume;
        if (options?.loop !== undefined) {
          audio.loop = options.loop;
        }

        // restart 옵션이 있으면 처음부터 재생, 없으면 현재 위치에서 계속 재생
        if (options?.restart) {
          audio.currentTime = 0;
        }

        // 재생 중이 아니면 재생 시작
        if (audio.paused) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn(`Failed to play sound ${soundType}:`, error);
            });
          }
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

