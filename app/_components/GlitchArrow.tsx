"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface GlitchArrowProps {
  direction: "left" | "right";
  show: boolean;
}

export default function GlitchArrow({ direction, show }: GlitchArrowProps) {
  if (!show) return null;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${
        direction === "left"
          ? "w-20 h-20 md:w-32 md:h-32"
          : "w-40 h-40 md:w-64 md:h-64"
      }`}
      style={{
        filter: "drop-shadow(0 0 20px #ff0000)",
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
      <div className='relative w-full h-full'>
        {direction === "left" ? (
          <span
            className='emoji-text text-red-600 text-5xl md:text-7xl font-bold block'
            style={{
              fontFamily:
                '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif',
              lineHeight: 1,
            }}>
            ⬅️
          </span>
        ) : (
          <Image
            src='/right.png'
            alt='Right Arrow'
            width={192}
            height={192}
            className='w-full h-full object-contain'
            priority
          />
        )}
      </div>
    </motion.div>
  );
}
