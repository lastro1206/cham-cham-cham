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
      color: string;
      size: number;
      distance: number;
    }>
  >([]);

  useEffect(() => {
    if (trigger) {
      const count = particleCount;
      const timer = setTimeout(() => {
        const colors = ["#ffaa00", "#00ff00", "#00ffff", "#ff00ff", "#ffff00"];
        const newParticles = Array.from({ length: count }, (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          angle: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          distance: 300 + Math.random() * 200,
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
  }, [trigger, particleCount]);

  if (!trigger || particles.length === 0) return null;

  return (
    <>
      {particles.map((particle) => {
        return (
          <motion.div
            key={particle.id}
            className='absolute rounded-full'
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, ${particle.color}, transparent)`,
              boxShadow: `0 0 10px ${particle.color}, 0 0 20px ${particle.color}`,
            }}
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 2, 0],
              opacity: [1, 1, 0],
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance,
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          />
        );
      })}
    </>
  );
}
