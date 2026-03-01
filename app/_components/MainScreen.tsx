"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import GlitchArrow from "./GlitchArrow";
import MediaPipeFaceController from "./MediaPipeFaceController";

type GameState =
  | "waiting"
  | "inputModeSelection"
  | "ready"
  | "idle"
  | "countdown"
  | "reveal"
  | "result"
  | "stageComplete"
  | "gameComplete";
type Direction = "left" | "right";
type Outcome = "win" | "lose";
type InputMode = "face" | "click";

interface MainScreenProps {
  state: GameState;
  countdownNumber?: number;
  cpuDirection?: Direction;
  outcome?: Outcome;
  playerChoice?: Direction;
  currentStage?: number;
  winStreak?: number;
  inputMode?: InputMode;
  onFaceDirectionDetected?: (direction: Direction) => void;
  onInputModeSelect?: (mode: InputMode) => void;
}

export default function MainScreen({
  state,
  countdownNumber,
  cpuDirection,
  outcome,
  playerChoice,
  currentStage = 1,
  winStreak = 0,
  inputMode,
  onFaceDirectionDetected,
  onInputModeSelect,
}: MainScreenProps) {
  // 얼굴 모드일 때 마지막 "참"일 때만 얼굴 인식 활성화
  const isFaceDetectionActive =
    state === "countdown" &&
    countdownNumber !== undefined &&
    (countdownNumber === 1 || countdownNumber === 0) &&
    inputMode === "face" &&
    onFaceDirectionDetected !== undefined;

  // 마지막 "참"일 때만 큰 화면에 표시 (countdownNumber === 1 또는 0)
  const isFullscreenFaceDetection =
    state === "countdown" &&
    countdownNumber !== undefined &&
    (countdownNumber === 1 || countdownNumber === 0) &&
    inputMode === "face" &&
    onFaceDirectionDetected !== undefined;

  // 얼굴 모드일 때 항상 디버깅 화면 표시 (큰 화면이 표시될 때도 함께 표시)
  const showFaceDebug =
    inputMode === "face" && onFaceDirectionDetected !== undefined;
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
            className='text-lg md:text-2xl text-yellow-400 font-normal px-4 py-2'
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

      {/* 얼굴 인식 화면 (카운트다운 전체 기간 동안 큰 화면에 표시) */}
      {isFullscreenFaceDetection && onFaceDirectionDetected && (
        <div className='absolute inset-0 z-20 flex items-center justify-center'>
          <MediaPipeFaceController
            onDirectionDetected={onFaceDirectionDetected}
            enabled={isFaceDetectionActive}
            fullscreen={true}
          />
        </div>
      )}

      {/* 디버깅 화면 (얼굴 모드일 때 항상 표시, 큰 화면이 아닐 때) */}
      {showFaceDebug && onFaceDirectionDetected && (
        <div className='fixed top-4 right-4 z-50'>
          <MediaPipeFaceController
            onDirectionDetected={onFaceDirectionDetected}
            enabled={isFaceDetectionActive}
            fullscreen={false}
          />
        </div>
      )}

      <AnimatePresence mode='wait'>
        {state === "waiting" && (
          <motion.div
            key='waiting'
            className='flex flex-col items-center justify-center w-full h-full'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mb-6 md:mb-8'>
              <Image
                src='/jeongmeon.png'
                alt='정면'
                width={200}
                height={200}
                className='w-64 h-64 md:w-80 md:h-80 object-contain'
                style={{ imageRendering: "pixelated" }}
              />
            </motion.div>
            <motion.div
              className='text-2xl md:text-3xl text-white font-normal mb-4 md:mb-6'
              style={{
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.1em",
                textShadow: "0 0 2px #ffffff, 0 0 2px #ffffff",
              }}>
              어떻게 할까요?
            </motion.div>
            <div className='flex flex-col md:flex-row gap-3 md:gap-4 w-full px-4 justify-center'>
              <motion.button
                className='pixel-button text-base md:text-lg px-4 md:px-6 py-3 md:py-4 font-normal flex flex-col items-center justify-center gap-2 rounded-xl border-cyan-500 bg-cyan-900/30 text-cyan-400 flex-1 max-w-[200px]'
                onClick={() => onInputModeSelect?.("face")}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px #00ffff, 0 0 60px #00ffff",
                }}
                transition={{ duration: 0.3 }}>
                <span className='text-3xl md:text-4xl'>👤</span>
                <span>얼굴로 할래요!</span>
              </motion.button>
              <motion.button
                className='pixel-button text-base md:text-lg px-4 md:px-6 py-3 md:py-4 font-normal flex flex-col items-center justify-center gap-2 rounded-xl border-cyan-500 bg-cyan-900/30 text-cyan-400 flex-1 max-w-[200px]'
                onClick={() => onInputModeSelect?.("click")}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px #00ffff, 0 0 60px #00ffff",
                }}
                transition={{ duration: 0.3 }}>
                <span className='text-3xl md:text-4xl'>🖱️</span>
                <span>클릭으로 할래요!</span>
              </motion.button>
            </div>
          </motion.div>
        )}

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
              className='text-2xl md:text-4xl text-white font-normal'
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

        {state === "countdown" &&
          countdownNumber !== undefined &&
          countdownNumber > 0 && (
            <motion.div
              key={`countdown-${countdownNumber}`}
              className='text-6xl md:text-8xl text-yellow-400 font-normal relative z-10'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: 'var(--font-pixel), "Courier New", monospace',
                textShadow: "0 0 15px #ffaa00, 0 0 30px #ffaa00",
              }}>
              참
              {countdownNumber === 1 && inputMode === "face" && (
                <motion.div
                  className='absolute -bottom-16 left-1/2 -translate-x-1/2 text-base md:text-lg text-cyan-400 whitespace-nowrap'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "var(--font-pixel), monospace",
                  }}>
                  얼굴 방향을 보여주세요!
                </motion.div>
              )}
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
            className='flex flex-col items-center gap-6'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            {outcome === "win" ? (
              <>
                {/* CPU 선택 이미지 표시 (승리 시) */}
                {cpuDirection && (
                  <motion.div
                    className={`relative flex items-center justify-center ${
                      cpuDirection === "left"
                        ? "w-32 h-32 md:w-48 md:h-48"
                        : "w-64 h-64 md:w-96 md:h-96"
                    }`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                <motion.div
                  className='text-3xl md:text-5xl text-green-400 font-normal'
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
              </>
            ) : (
              <>
                <GlitchArrow
                  direction={cpuDirection || "left"}
                  show={true}
                />
                <motion.div
                  className='text-4xl md:text-6xl text-red-600 font-normal'
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
            className='flex flex-col items-center gap-6'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            {/* CPU 선택 이미지 표시 */}
            {cpuDirection && (
              <motion.div
                className={`relative flex items-center justify-center ${
                  cpuDirection === "left"
                    ? "w-32 h-32 md:w-48 md:h-48"
                    : "w-64 h-64 md:w-96 md:h-96"
                }`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
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
            className='flex flex-col items-center gap-4'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}>
            {/* 3연승 완료 이미지 */}
            <motion.div
              className='relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96'
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}>
              <Image
                src='/3StrokeWin.png'
                alt='3연승 완료'
                width={384}
                height={384}
                className='w-full h-full object-contain'
                priority
                style={{ imageRendering: "pixelated" }}
              />
            </motion.div>
            <motion.div
              className='text-4xl md:text-6xl text-yellow-400 font-normal'
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
              className='text-lg md:text-xl text-green-400 font-normal'
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
