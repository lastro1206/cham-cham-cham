"use client";

import { motion } from "framer-motion";

interface PixelButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}

export default function PixelButton({
  direction,
  onClick,
  disabled = false,
}: PixelButtonProps) {
  const label = direction === "left" ? "⬅️ 좌" : "우 ➡️";

  return (
    <motion.button
      className='pixel-button text-lg md:text-2xl px-6 md:px-8 py-4 md:py-5 min-w-[160px] md:min-w-[200px] font-bold'
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              scale: 1.15,
              boxShadow: "0 0 30px #00ffff, 0 0 60px #00ffff",
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.9 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: disabled
          ? "none"
          : "0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2)",
      }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily:
          'var(--font-pixel), "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace',
        textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
      }}>
      {label}
    </motion.button>
  );
}
