"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StarBurstProps {
  trigger: boolean;
  particleCount?: number;
}

export default function StarBurst({
  trigger,
  particleCount = 30,
}: StarBurstProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      angle: number;
    }>
  >([]);

  useEffect(() => {
    if (trigger) {
      const count = particleCount;
      const timer = setTimeout(() => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          angle: Math.random() * Math.PI * 2,
        }));
        setParticles(newParticles);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!trigger || particles.length === 0) return null;

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className='absolute w-2 h-2 bg-yellow-300 rounded-full'
          style={{
            left: particle.x,
            top: particle.y,
          }}
          initial={{
            scale: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
            x: Math.cos(particle.angle) * 200,
            y: Math.sin(particle.angle) * 200,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}
