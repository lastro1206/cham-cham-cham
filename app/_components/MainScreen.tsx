"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import GlitchArrow from "./GlitchArrow";

type GameState =
  | "idle"
  | "countdown"
  | "reveal"
  | "result"
  | "stageComplete"
  | "gameComplete";
type Direction = "left" | "right";
type Outcome = "win" | "lose";

interface MainScreenProps {
  state: GameState;
  countdownNumber?: number;
  cpuDirection?: Direction;
  outcome?: Outcome;
  playerChoice?: Direction;
  currentStage?: number;
  winStreak?: number;
}

export default function MainScreen({
  state,
  countdownNumber,
  cpuDirection,
  outcome,
  playerChoice,
  currentStage = 1,
  winStreak = 0,
}: MainScreenProps) {
  return (
    <div className='main-screen scanline w-full max-w-3xl mx-auto aspect-[4/3] flex items-center justify-center relative overflow-hidden'>
      {/* Win Streak Display */}
      {winStreak > 0 && (
        <motion.div
          className='absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-10'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}>
          <motion.div
            className='text-lg md:text-2xl text-yellow-400 font-bold px-4 py-2'
            animate={{
              textShadow: [
                "0 0 5px #ffaa00",
                "0 0 10px #ffaa00, 0 0 15px #ffaa00",
                "0 0 5px #ffaa00",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              fontFamily: "var(--font-pixel), monospace",
              letterSpacing: "0.1em",
            }}>
            🔥 {winStreak}연승 🔥
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence mode='wait'>
        {state === "idle" && (
          <motion.div
            key='idle'
            className='flex flex-col items-center gap-4 md:gap-6'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className='relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center'
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}>
              <Image
                src='/jeongmeon.png'
                alt='Jungmeon Character'
                fill
                className='object-contain'
                priority
              />
            </motion.div>
            <motion.div
              className='text-2xl md:text-4xl text-white font-bold'
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                textShadow: "0 0 10px #ffffff, 0 0 20px #ffffff",
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
              }}>
              방향을 선택하세요!
            </motion.div>
          </motion.div>
        )}

        {state === "countdown" && countdownNumber !== undefined && (
          <motion.div
            key={`countdown-${countdownNumber}`}
            className='text-6xl md:text-8xl text-yellow-400 font-bold'
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.5, 1.2, 0.8],
              rotate: [0, 360, 0],
            }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.5,
              times: [0, 0.2, 0.7, 1],
            }}
            style={{
              fontFamily: 'var(--font-pixel), "Courier New", monospace',
              textShadow: "0 0 15px #ffaa00, 0 0 30px #ffaa00",
            }}>
            참
          </motion.div>
        )}

        {state === "reveal" && cpuDirection && (
          <motion.div
            key='reveal'
            className={`relative flex items-center justify-center ${
              cpuDirection === "left"
                ? "w-32 h-32 md:w-48 md:h-48"
                : "w-64 h-64 md:w-96 md:h-96"
            }`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {cpuDirection === "left" ? (
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
          </motion.div>
        )}

        {state === "result" && outcome && (
          <motion.div
            key='result'
            className='flex flex-col items-center gap-3'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            {outcome === "win" ? (
              <motion.div
                className='text-3xl md:text-5xl text-green-400 font-bold'
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.5, 1.2, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  letterSpacing: "0.1em",
                  textShadow: "0 0 15px #00ff00, 0 0 30px #00ff00",
                }}>
                ✨ SUCCESS! ✨
              </motion.div>
            ) : (
              <>
                <GlitchArrow
                  direction={cpuDirection || "left"}
                  show={true}
                />
                <motion.div
                  className='text-4xl md:text-6xl text-red-600 font-bold'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 15px #ff0000, 0 0 30px #ff0000",
                  }}>
                  LOSE
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {state === "stageComplete" && (
          <motion.div
            key='stageComplete'
            className='flex flex-col items-center gap-2'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className='text-3xl md:text-5xl text-green-400 font-bold'
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.5, 1.2, 1],
                rotate: [0, 360, 0],
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
                textShadow: "0 0 15px #00ff00, 0 0 30px #00ff00",
              }}>
              ✨ SUCCESS! ✨
            </motion.div>
            <motion.div
              className='text-sm md:text-base text-cyan-400'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
              }}>
              {currentStage}ROUND 성공!
            </motion.div>
          </motion.div>
        )}

        {state === "gameComplete" && (
          <motion.div
            key='gameComplete'
            className='flex flex-col items-center gap-2'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className='text-4xl md:text-6xl text-yellow-400 font-bold'
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.5, 1.3, 1],
                rotate: [0, 720, 0],
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
                textShadow: "0 0 20px #ffaa00, 0 0 40px #ffaa00",
              }}>
              🎉 PERFECT! 🎉
            </motion.div>
            <motion.div
              className='text-lg md:text-xl text-green-400 font-bold'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
              }}>
              3ROUND ALL SUCCESS!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
