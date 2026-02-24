"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DangerFlashProps {
  trigger: boolean;
}

export default function DangerFlash({ trigger }: DangerFlashProps) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className='fixed inset-0 bg-red-600 pointer-events-none z-50'
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0.1, 0.5, 0.15, 0.6, 0.2, 0.4, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.2,
            times: [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.8, 1],
            ease: "easeInOut",
          }}
        />
      )}
    </AnimatePresence>
  );
}
