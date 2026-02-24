"use client";

import { motion } from "framer-motion";

interface GlitchArrowProps {
  direction: "left" | "right";
  show: boolean;
}

export default function GlitchArrow({ direction, show }: GlitchArrowProps) {
  if (!show) return null;

  const arrow = direction === "left" ? "⬅️" : "➡️";

  return (
    <motion.div
      className='emoji-text text-red-600 text-7xl md:text-[140px] font-bold relative'
      style={{
        filter: "drop-shadow(0 0 20px #ff0000)",
        fontFamily:
          '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif',
        lineHeight: 1,
      }}
      animate={{
        x: [0, -5, 5, -5, 5, 0],
        opacity: [1, 0.8, 1, 0.8, 1],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse",
      }}>
      <div className='relative'>
        {arrow}
        <motion.div
          className='absolute inset-0 bg-red-600 opacity-20'
          style={{
            clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
          }}
          animate={{
            x: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
          }}
        />
        <motion.div
          className='absolute inset-0 bg-red-600 opacity-20'
          style={{
            clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
          }}
          animate={{
            x: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            delay: 0.05,
          }}
        />
      </div>
    </motion.div>
  );
}
