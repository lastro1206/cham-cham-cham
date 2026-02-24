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
      className='pixel-button text-2xl md:text-4xl px-8 md:px-12 py-6 md:py-8 min-w-[200px] md:min-w-[300px]'
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily:
          'var(--font-pixel), "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace',
      }}>
      {label}
    </motion.button>
  );
}
