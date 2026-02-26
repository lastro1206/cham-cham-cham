"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSound } from "../_hooks/useSound";
import MainScreen from "./MainScreen";
import PixelButton from "./PixelButton";
import StarBurst from "./StarBurst";
import DangerFlash from "./DangerFlash";

type GameState =
  | "idle"
  | "countdown"
  | "reveal"
  | "result"
  | "stageComplete"
  | "gameComplete";
type Direction = "left" | "right";
type Outcome = "win" | "lose";

export default function ChamGame() {
  const { playSound } = useSound({ volume: 0.5 });
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentStage, setCurrentStage] = useState<number>(1);
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
      if (gameState !== "idle") return;

      setPlayerChoice(direction);
      setGameState("countdown");
      setCountdownNumber(3);
    },
    [gameState]
  );

  useEffect(() => {
    if (gameState === "countdown" && countdownNumber !== undefined) {
      if (countdownNumber > 0) {
        playSound(`countdown-${countdownNumber}` as "countdown-3" | "countdown-2" | "countdown-1");
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        const cpuDirection: Direction = Math.random() < 0.5 ? "left" : "right";
        const timer = setTimeout(() => {
          setCpuChoice(cpuDirection);
          setGameState("reveal");

          setTimeout(() => {
            const isWin = playerChoice !== cpuDirection;
            setOutcome(isWin ? "win" : "lose");
            if (isWin) {
              if (currentStage >= 3) {
                setGameState("gameComplete");
              } else {
                setGameState("stageComplete");
              }
            } else {
              setGameState("result");
            }
          }, 500);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, countdownNumber, playerChoice, currentStage, playSound]);

  const handleReset = useCallback(() => {
    setGameState("idle");
    setCurrentStage(1);
    setCountdownNumber(undefined);
    setPlayerChoice(undefined);
    setCpuChoice(undefined);
    setOutcome(undefined);
  }, []);

  const handleNextStage = useCallback(() => {
    setCurrentStage((prev) => prev + 1);
    setGameState("idle");
    setCountdownNumber(undefined);
    setPlayerChoice(undefined);
    setCpuChoice(undefined);
    setOutcome(undefined);
  }, []);

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
    gameState === "gameComplete" ? 80 : gameState === "stageComplete" ? 50 : 30;

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative z-10'>
      <StarBurst
        trigger={showStarBurst}
        particleCount={particleCount}
      />
      <DangerFlash trigger={showDangerFlash} />

      <div className='w-full max-w-7xl flex flex-col items-center gap-4 md:gap-6'>
        <div className='text-xl md:text-2xl text-cyan-400 mb-2'>
          {currentStage <= 3 && `단계 ${currentStage}/3`}
        </div>

        <div className='w-full flex items-center justify-center gap-4 md:gap-6'>
          <div className='hidden md:block relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0'>
            <Image
              src='/alomLogo1.png'
              alt='Alom Logo'
              fill
              className='object-contain opacity-80'
              priority
            />
          </div>

          <MainScreen
            state={gameState}
            countdownNumber={countdownNumber}
            cpuDirection={cpuChoice}
            outcome={outcome}
            playerChoice={playerChoice}
            currentStage={currentStage}
          />

          <div className='hidden md:block relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0'>
            <Image
              src='/alomLogo1.png'
              alt='Alom Logo'
              fill
              className='object-contain opacity-80'
              priority
            />
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-4 md:gap-6 items-center'>
          <PixelButton
            direction='left'
            onClick={() => handleSelect("left")}
            disabled={gameState !== "idle"}
          />
          <PixelButton
            direction='right'
            onClick={() => handleSelect("right")}
            disabled={gameState !== "idle"}
          />
        </div>

        {(gameState === "result" || gameState === "gameComplete") && (
          <motion.button
            className='pixel-button text-lg md:text-xl px-5 md:px-6 py-3 md:py-4'
            onClick={handleReset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gameState === "result" ? 0.5 : 2 }}>
            다시하기
          </motion.button>
        )}

        {gameState === "stageComplete" && (
          <motion.button
            className='pixel-button text-lg md:text-xl px-5 md:px-6 py-3 md:py-4'
            onClick={handleNextStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}>
            다음 단계
          </motion.button>
        )}
      </div>
    </div>
  );
}
