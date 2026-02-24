"use client";

import { motion, AnimatePresence } from "framer-motion";
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
}

export default function MainScreen({
  state,
  countdownNumber,
  cpuDirection,
  outcome,
  playerChoice,
  currentStage = 1,
}: MainScreenProps) {
  return (
    <div className='main-screen scanline w-full max-w-2xl mx-auto aspect-[4/3] flex items-center justify-center relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        {state === "idle" && (
          <motion.div
            key='idle'
            className='text-2xl md:text-3xl text-cyan-400'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}>
            선택하세요
          </motion.div>
        )}

        {state === "countdown" && countdownNumber !== undefined && (
          <motion.div
            key={`countdown-${countdownNumber}`}
            className='number-text text-6xl md:text-[120px] text-yellow-400 font-bold'
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.2, 1, 0.8],
            }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.4,
              times: [0, 0.3, 0.7, 1],
            }}
            style={{
              fontFamily: 'var(--font-pixel), "Courier New", monospace',
            }}>
            {countdownNumber}
          </motion.div>
        )}

        {state === "reveal" && cpuDirection && (
          <motion.div
            key='reveal'
            className='emoji-text text-7xl md:text-[140px] text-cyan-400'
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily:
                '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif',
              lineHeight: 1,
            }}>
            {cpuDirection === "left" ? "⬅️" : "➡️"}
          </motion.div>
        )}

        {state === "result" && outcome && (
          <motion.div
            key='result'
            className='flex flex-col items-center gap-8'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            {outcome === "win" ? (
              <motion.div
                className='text-4xl md:text-5xl text-green-400 font-bold'
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  letterSpacing: "0.1em",
                }}>
                SUCCESS!
              </motion.div>
            ) : (
              <>
                <GlitchArrow
                  direction={cpuDirection || "left"}
                  show={true}
                />
                <motion.div
                  className='text-3xl md:text-4xl text-red-600 font-bold'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.1em",
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
            className='flex flex-col items-center gap-4'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className='text-4xl md:text-5xl text-green-400 font-bold'
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
              }}>
              SUCCESS!
            </motion.div>
            <motion.div
              className='text-xl md:text-2xl text-cyan-400'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
              }}>
              단계 {currentStage} 완료!
            </motion.div>
          </motion.div>
        )}

        {state === "gameComplete" && (
          <motion.div
            key='gameComplete'
            className='flex flex-col items-center gap-4'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className='text-5xl md:text-6xl text-yellow-400 font-bold'
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.3, 1],
                rotate: [0, 360, 0],
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
              }}>
              PERFECT!
            </motion.div>
            <motion.div
              className='text-2xl md:text-3xl text-green-400 font-bold'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
              }}>
              3단계 모두 성공!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
