"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaRedo } from "react-icons/fa";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { useSound } from "../_hooks/useSound";
import MainScreen from "./MainScreen";
import StarBurst from "./StarBurst";
import DangerFlash from "./DangerFlash";

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

export default function ChamGame() {
  const { playSound } = useSound({ volume: 0.5 });
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [inputMode, setInputMode] = useState<InputMode | undefined>(undefined);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [countdownNumber, setCountdownNumber] = useState<number | undefined>(
    undefined
  );
  const [playerChoice, setPlayerChoice] = useState<Direction | undefined>(
    undefined
  );
  const [cpuChoice, setCpuChoice] = useState<Direction | undefined>(undefined);
  const [outcome, setOutcome] = useState<Outcome | undefined>(undefined);

  const handleSelect = useCallback(
    (direction: Direction) => {
      if (gameState !== "idle" && gameState !== "countdown") return;

      // 클릭 모드일 때
      if (inputMode === "click") {
        if (gameState === "idle") {
          // 처음 시작할 때
          setPlayerChoice(direction);
          setGameState("countdown");
          setCountdownNumber(3);
        } else if (gameState === "countdown" && countdownNumber === 1) {
          // 마지막 "참"에서 방향 선택 시 바로 reveal로 넘어감
          setPlayerChoice(direction);
          // countdownNumber를 0으로 설정하여 reveal로 넘어가도록 함
          setCountdownNumber(0);
        }
      }
      // 얼굴 모드일 때는 3번째 "참"에서만 선택
      else if (
        inputMode === "face" &&
        gameState === "countdown" &&
        (countdownNumber === 1 || countdownNumber === 0)
      ) {
        setPlayerChoice(direction);
      }
    },
    [gameState, inputMode, countdownNumber]
  );

  const handleFaceDirection = useCallback(
    (direction: Direction) => {
      // 얼굴 모드일 때 카운트다운 중이거나 방향을 기다리는 중이면 얼굴 방향을 받음
      if (gameState === "countdown" && inputMode === "face") {
        // 마지막 "참" (countdownNumber === 1) 이후 방향이 확정되면 선택
        if (countdownNumber === 1 || countdownNumber === 0) {
          setPlayerChoice(direction);
        }
      }
    },
    [gameState, countdownNumber, inputMode]
  );

  useEffect(() => {
    if (gameState === "countdown" && countdownNumber !== undefined) {
      if (countdownNumber > 0) {
        playSound(
          `countdown-${countdownNumber}` as
            | "countdown-3"
            | "countdown-2"
            | "countdown-1"
        );

        // 클릭 모드에서 마지막 "참" (countdownNumber === 1)일 때는 카운트다운을 멈춤
        // 사용자가 버튼을 클릭할 때까지 기다림
        if (inputMode === "click" && countdownNumber === 1) {
          // 카운트다운을 멈추고 사용자 입력을 기다림
          return;
        }

        // 얼굴 모드에서 3번째 "참"일 때는 더 긴 시간을 줘서 얼굴 인식할 시간 확보
        const delay =
          countdownNumber === 1 && inputMode === "face" ? 2000 : 800;
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        // 카운트다운이 끝났을 때 (countdownNumber === 0)
        // 얼굴 모드에서만 방향이 확정될 때까지 countdown 상태 유지
        // 클릭 모드는 이미 countdownNumber === 1에서 멈춰있음
      }
    }
  }, [
    gameState,
    countdownNumber,
    playerChoice,
    currentStage,
    playSound,
    inputMode,
  ]);

  // 클릭 모드와 얼굴 모드에서 방향이 확정되면 reveal로 넘어감
  useEffect(() => {
    if (
      gameState === "countdown" &&
      countdownNumber === 0 &&
      playerChoice !== undefined
    ) {
      const cpuDirection: Direction = Math.random() < 0.5 ? "left" : "right";
      const timer = setTimeout(() => {
        setCountdownNumber(undefined);
        setCpuChoice(cpuDirection);
        setGameState("reveal");

        setTimeout(() => {
          const isWin = playerChoice !== cpuDirection;
          setOutcome(isWin ? "win" : "lose");
          if (isWin) {
            setWinStreak((prev) => prev + 1);
            if (currentStage >= 3) {
              setGameState("gameComplete");
            } else {
              setGameState("stageComplete");
            }
          } else {
            setGameState("result");
          }
        }, 2000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdownNumber, playerChoice, currentStage]);

  const handleInputModeSelect = useCallback((mode: InputMode) => {
    setInputMode(mode);
    if (mode === "click") {
      // 클릭 모드는 바로 idle로, 그 다음 자동으로 카운트다운 시작
      setGameState("idle");
    } else {
      // 얼굴 모드는 바로 카운트다운 시작
      setGameState("countdown");
      setCountdownNumber(3);
    }
  }, []);

  // 클릭 모드에서 idle 상태일 때 자동으로 카운트다운 시작
  useEffect(() => {
    if (gameState === "idle" && inputMode === "click") {
      const timer = setTimeout(() => {
        setGameState("countdown");
        setCountdownNumber(3);
      }, 1000); // 1초 후 자동으로 카운트다운 시작
      return () => clearTimeout(timer);
    }
  }, [gameState, inputMode]);

  const handleReset = useCallback(() => {
    setGameState("waiting");
    setInputMode(undefined);
    setCurrentStage(1);
    setWinStreak(0);
    setCountdownNumber(undefined);
    setPlayerChoice(undefined);
    setCpuChoice(undefined);
    setOutcome(undefined);
  }, []);

  const handleNextStage = useCallback(() => {
    setCurrentStage((prev) => prev + 1);
    setCountdownNumber(undefined);
    setPlayerChoice(undefined);
    setCpuChoice(undefined);
    setOutcome(undefined);

    // inputMode에 따라 다음 라운드 시작
    if (inputMode === "click") {
      setGameState("idle");
    } else if (inputMode === "face") {
      // 얼굴 모드는 바로 카운트다운 시작
      setGameState("countdown");
      setCountdownNumber(3);
    }
  }, [inputMode]);

  useEffect(() => {
    if (gameState === "reveal") {
      playSound("reveal");
    }
  }, [gameState, playSound]);

  useEffect(() => {
    if (gameState === "result" && outcome) {
      if (outcome === "win") {
        playSound("success");
      } else {
        playSound("fail");
      }
    }
  }, [gameState, outcome, playSound]);

  useEffect(() => {
    if (gameState === "stageComplete") {
      playSound("stage-complete");
    }
  }, [gameState, playSound]);

  useEffect(() => {
    if (gameState === "gameComplete") {
      playSound("game-complete");
    }
  }, [gameState, playSound]);

  const showStarBurst =
    (gameState === "result" && outcome === "win") ||
    gameState === "stageComplete" ||
    gameState === "gameComplete";
  const showDangerFlash = gameState === "result" && outcome === "lose";

  const particleCount =
    gameState === "gameComplete"
      ? 150
      : gameState === "stageComplete"
      ? 100
      : 60;

  return (
    <div className='h-screen flex flex-col items-center justify-center p-2 md:p-4 relative z-10'>
      <StarBurst
        trigger={showStarBurst}
        particleCount={particleCount}
      />
      <DangerFlash trigger={showDangerFlash} />

      <div className='w-full max-w-5xl flex flex-col items-center gap-2 md:gap-3'>
        <motion.div
          className='text-lg md:text-2xl text-cyan-400 mb-2 font-bold'
          animate={{
            textShadow: [
              "0 0 5px #00ffff",
              "0 0 10px #00ffff, 0 0 15px #00ffff",
              "0 0 5px #00ffff",
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
          {currentStage <= 3 &&
            gameState !== "waiting" &&
            gameState !== "inputModeSelection" &&
            gameState !== "ready" &&
            `🎯 ROUND ${currentStage}/3 🎯`}
        </motion.div>

        <div className='w-full flex items-center justify-center gap-4 md:gap-6 relative'>
          <MainScreen
            state={gameState}
            countdownNumber={countdownNumber}
            cpuDirection={cpuChoice}
            outcome={outcome}
            playerChoice={playerChoice}
            currentStage={currentStage}
            winStreak={winStreak}
            inputMode={inputMode}
            onFaceDirectionDetected={handleFaceDirection}
            onInputModeSelect={handleInputModeSelect}
            onSelect={handleSelect}
          />
        </div>

        {(gameState === "result" || gameState === "gameComplete") && (
          <motion.button
            className='pixel-button text-base md:text-lg px-5 md:px-6 py-3 md:py-4 font-bold flex items-center justify-center gap-2 rounded-lg'
            onClick={handleReset}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: "0 0 30px #00ffff, 0 0 60px #00ffff",
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 40px #00ffff, 0 0 80px #00ffff",
            }}
            transition={{ delay: gameState === "result" ? 0.5 : 2 }}>
            <FaRedo className='text-xl md:text-2xl' />
            <span>RESTART</span>
          </motion.button>
        )}

        {gameState === "stageComplete" && (
          <motion.button
            className='pixel-button text-lg md:text-xl px-6 md:px-8 py-4 md:py-5 font-bold flex items-center justify-center gap-2 rounded-2xl'
            onClick={handleNextStage}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: "0 0 30px #00ff00, 0 0 60px #00ff00",
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 40px #00ff00, 0 0 80px #00ff00",
            }}
            transition={{ delay: 1 }}>
            <span>NEXT ROUND</span>
            <MdKeyboardDoubleArrowRight className='text-2xl md:text-3xl' />
          </motion.button>
        )}
      </div>
    </div>
  );
}
