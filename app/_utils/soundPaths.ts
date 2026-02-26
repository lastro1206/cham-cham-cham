export type SoundType =
  | "countdown-3"
  | "countdown-2"
  | "countdown-1"
  | "reveal"
  | "success"
  | "fail"
  | "stage-complete"
  | "game-complete";

export const SOUND_PATHS: Record<SoundType, string> = {
  "countdown-3": "/sounds/countdown-3.mp3",
  "countdown-2": "/sounds/countdown-2.mp3",
  "countdown-1": "/sounds/countdown-1.mp3",
  reveal: "/sounds/reveal.mp3",
  success: "/sounds/success.mp3",
  fail: "/sounds/fail.mp3",
  "stage-complete": "/sounds/stage-complete.mp3",
  "game-complete": "/sounds/game-complete.mp3",
};

