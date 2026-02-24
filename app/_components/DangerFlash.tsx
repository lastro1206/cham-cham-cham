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
          className="fixed inset-0 bg-red-600 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0, 0.8, 0, 0.6, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
          }}
        />
      )}
    </AnimatePresence>
  );
}

