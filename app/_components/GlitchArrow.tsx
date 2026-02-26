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
          ? "w-48 h-48 md:w-64 md:h-64"
          : "w-64 h-64 md:w-96 md:h-96"
      }`}
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
          <Image
            src='/left.png'
            alt='Left Arrow'
            width={192}
            height={192}
            className='w-full h-full object-contain'
            priority
          />
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
