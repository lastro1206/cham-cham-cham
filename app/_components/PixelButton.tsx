"use client";

import { motion } from "framer-motion";
import { FaRegHandPointLeft, FaRegHandPointRight } from "react-icons/fa";

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
  const Icon = direction === "left" ? FaRegHandPointLeft : FaRegHandPointRight;
  const label = direction === "left" ? "좌" : "우";

  return (
    <motion.button
      className='pixel-button text-lg md:text-2xl px-6 md:px-8 py-4 md:py-5 min-w-[160px] md:min-w-[200px] font-bold flex items-center justify-center rounded-xl'
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
        fontFamily: "var(--font-pixel), monospace",
        textShadow: "0 0 5px rgba(0, 255, 255, 0.8)",
      }}>
      <span className='flex items-center justify-center gap-2'>
        {direction === "left" ? (
          <>
            <Icon className='text-xl md:text-2xl' />
            <span>{label}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <Icon className='text-xl md:text-2xl' />
          </>
        )}
      </span>
    </motion.button>
  );
}
