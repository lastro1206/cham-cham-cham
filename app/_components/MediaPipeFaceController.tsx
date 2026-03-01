"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FaRegHandPointLeft, FaRegHandPointRight } from "react-icons/fa";

interface MediaPipeFaceControllerProps {
  onDirectionDetected: (direction: "left" | "right") => void;
  enabled: boolean;
  fullscreen?: boolean;
}

type FaceLandmark = {
  x: number;
  y: number;
  z?: number;
};

interface FaceMeshResults {
  multiFaceLandmarks?: FaceLandmark[][];
}

interface FaceMeshInstance {
  setOptions: (options: {
    maxNumFaces: number;
    refineLandmarks: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }) => void;
  onResults: (callback: (results: FaceMeshResults) => void) => void;
  send: (data: { image: HTMLVideoElement }) => Promise<void>;
}

export default function MediaPipeFaceController({
  onDirectionDetected,
  enabled,
  fullscreen = false,
}: MediaPipeFaceControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceMeshInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<"left" | "right" | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stableDirectionRef = useRef<"left" | "right" | null>(null);
  const stableCountRef = useRef<number>(0);

  // 디버깅용 상태
  const [debugInfo, setDebugInfo] = useState<{
    yaw: number;
    detectedDirection: "left" | "right" | "center" | null;
    stableCount: number;
    threshold: number;
  }>({
    yaw: 0,
    detectedDirection: null,
    stableCount: 0,
    threshold: 0.05,
  });

  const calculateYaw = useCallback((landmarks: FaceLandmark[]) => {
    // 코 끝: 1, 왼쪽 눈: 33, 오른쪽 눈: 263
    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    if (!noseTip || !leftEye || !rightEye) {
      return 0;
    }

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const noseOffsetX = noseTip.x - eyeCenterX;

    return noseOffsetX;
  }, []);

  const onResults = useCallback(
    (results: FaceMeshResults) => {
      if (
        !enabled ||
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        stableCountRef.current = 0;
        stableDirectionRef.current = null;
        setDebugInfo({
          yaw: 0,
          detectedDirection: null,
          stableCount: 0,
          threshold: 0.05,
        });
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const yaw = calculateYaw(landmarks);

      const threshold = 0.08; // 정면 범위를 넓게 설정 (더 큰 값으로 정면 구분)

      // 비디오가 좌우 반전되어 있으므로 결과를 반대로 적용
      let detectedDirection: "left" | "right" | null = null;

      // 정면 범위를 명확히 정의: threshold 범위 내는 정면으로 간주
      if (yaw < -threshold) {
        detectedDirection = "right"; // 반대로
      } else if (yaw > threshold) {
        detectedDirection = "left"; // 반대로
      } else {
        // 정면일 때는 null로 설정
        detectedDirection = null;
        // 정면일 때는 감지하지 않음
        if (detectionTimeoutRef.current) {
          clearTimeout(detectionTimeoutRef.current);
          detectionTimeoutRef.current = null;
        }
        // 정면일 때는 카운트 리셋 (방향이 바뀌면 새로 시작)
        if (stableDirectionRef.current !== null) {
          stableDirectionRef.current = null;
          stableCountRef.current = 0;
        }
        // 디버깅 정보 업데이트
        setDebugInfo({
          yaw: yaw,
          detectedDirection: "center",
          stableCount: 0,
          threshold: threshold,
        });
        return; // 정면일 때는 더 이상 처리하지 않음
      }

      // 디버깅 정보 업데이트
      setDebugInfo({
        yaw: yaw,
        detectedDirection: detectedDirection,
        stableCount: stableCountRef.current,
        threshold: threshold,
      });

      // 같은 방향이 연속으로 들어올 때만 카운트
      if (
        detectedDirection &&
        detectedDirection === stableDirectionRef.current
      ) {
        stableCountRef.current += 1;
      } else if (detectedDirection) {
        // 방향이 바뀌었을 때 리셋하고 새로 시작
        stableDirectionRef.current = detectedDirection;
        stableCountRef.current = 1;
      }

      // 같은 방향을 충분히 유지하면(약 3프레임, 더 빠른 감지) 선택
      if (
        stableCountRef.current >= 3 &&
        detectedDirection &&
        detectedDirection !== lastDirectionRef.current
      ) {
        if (detectionTimeoutRef.current) {
          clearTimeout(detectionTimeoutRef.current);
        }

        detectionTimeoutRef.current = setTimeout(() => {
          onDirectionDetected(detectedDirection!);
          lastDirectionRef.current = detectedDirection;
          stableCountRef.current = 0;
          stableDirectionRef.current = null;
        }, 0);
      }
    },
    [enabled, calculateYaw, onDirectionDetected]
  );

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    let cancelled = false;

    const setup = async () => {
      if (!videoRef.current || cancelled) return;

      // enabled가 false일 때는 렌더 루프만 중단
      if (!enabled) {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // FaceMesh와 스트림은 유지하여 깜빡임 방지
        return;
      }

      try {
        // 스트림이 이미 있으면 재사용
        if (!streamRef.current) {
          // 1) 카메라 스트림 가져오기
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false,
          });

          if (cancelled || !videoRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;

          if (!videoRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          videoRef.current.srcObject = stream;

          try {
            await videoRef.current.play();
          } catch (playError) {
            // play() 에러는 무시 (이미 재생 중이거나 중단된 경우)
            console.warn("Video play error:", playError);
          }
        } else {
          // 기존 스트림 재사용
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            try {
              await videoRef.current.play();
            } catch (playError) {
              console.warn("Video play error:", playError);
            }
          }
        }

        if (cancelled || !videoRef.current) return;

        // FaceMesh가 이미 있으면 재사용
        if (!faceMeshRef.current) {
          // 2) FaceMesh 동적 import
          const FaceMeshModule = await import("@mediapipe/face_mesh");

          if (cancelled || !videoRef.current) return;

          const FaceMesh = FaceMeshModule.FaceMesh;

          const faceMesh = new FaceMesh({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          }) as FaceMeshInstance;

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          faceMesh.onResults(onResults);
          faceMeshRef.current = faceMesh;
        }

        // 3) 렌더 루프 (enabled가 true일 때만 시작)
        if (enabled && faceMeshRef.current) {
          const render = async () => {
            if (
              cancelled ||
              !videoRef.current ||
              !faceMeshRef.current ||
              !enabled
            ) {
              return;
            }

            try {
              await faceMeshRef.current.send({ image: videoRef.current });
              if (
                !cancelled &&
                videoRef.current &&
                faceMeshRef.current &&
                enabled
              ) {
                animationFrameRef.current = requestAnimationFrame(render);
              }
            } catch (error) {
              console.warn("FaceMesh send error:", error);
            }
          };

          // 기존 렌더 루프가 있으면 취소
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          render();
        }
      } catch (error) {
        console.error("MediaPipe setup error:", error);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      }
    };

    setup().catch((err) => {
      console.error("MediaPipe setup error:", err);
    });

    return () => {
      cancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // 스트림 정리는 컴포넌트 언마운트 시에만
      // cleanup은 컴포넌트가 완전히 언마운트될 때만 실행
    };
  }, [enabled, onResults]);

  // 컴포넌트 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      stableCountRef.current = 0;
      stableDirectionRef.current = null;
      lastDirectionRef.current = null;
      faceMeshRef.current = null;
    };
  }, []);

  // 풀스크린 모드 (큰 화면에 표시)
  if (fullscreen) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center relative bg-black/50 ${
          !enabled ? "opacity-0 pointer-events-none" : ""
        }`}>
        <video
          ref={videoRef}
          className='w-full h-full object-cover scale-x-[-1]'
          playsInline
          muted
          autoPlay
          style={{ display: enabled ? "block" : "none" }}
        />
        <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-lg md:text-xl text-cyan-400 text-center px-6 py-3 rounded-lg font-pixel border-2 border-cyan-400 z-30'>
          얼굴 방향을 보여주세요!
        </div>
        {/* 방향 표시 */}
        {debugInfo.detectedDirection &&
          debugInfo.detectedDirection !== "center" && (
            <motion.div
              className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-30'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontFamily: "var(--font-pixel), monospace",
              }}>
              {debugInfo.detectedDirection === "left" ? (
                <>
                  <FaRegHandPointLeft
                    className='text-4xl md:text-6xl'
                    style={{
                      color: "#3b82f6",
                      textShadow: "0 0 20px #3b82f6",
                    }}
                  />
                  <span
                    className='text-3xl md:text-5xl font-bold'
                    style={{
                      color: "#3b82f6",
                      filter: "drop-shadow(0 0 20px #3b82f6)",
                    }}>
                    LEFT
                  </span>
                </>
              ) : (
                <>
                  <span
                    className='text-3xl md:text-5xl font-bold'
                    style={{
                      color: "#3b82f6",
                      textShadow: "0 0 20px #3b82f6",
                    }}>
                    RIGHT
                  </span>
                  <FaRegHandPointRight
                    className='text-4xl md:text-6xl'
                    style={{
                      color: "#3b82f6",
                      filter: "drop-shadow(0 0 20px #3b82f6)",
                    }}
                  />
                </>
              )}
            </motion.div>
          )}
      </div>
    );
  }

  // 작은 디버깅 모드 (기존)
  const getDirectionColor = (direction: "left" | "right" | "center" | null) => {
    if (direction === "left") return "text-red-400";
    if (direction === "right") return "text-blue-400";
    return "text-gray-400";
  };

  const getDirectionIcon = (direction: "left" | "right" | "center" | null) => {
    if (direction === "left") return FaRegHandPointLeft;
    if (direction === "right") return FaRegHandPointRight;
    return null;
  };

  const getDirectionText = (direction: "left" | "right" | "center" | null) => {
    if (direction === "left") return "LEFT";
    if (direction === "right") return "RIGHT";
    return "CENTER";
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 ${
        !enabled ? "opacity-50" : ""
      }`}>
      {/* 비디오 프리뷰 */}
      <div className='w-40 h-30 rounded-lg overflow-hidden border-2 border-cyan-400 opacity-90 bg-black/50'>
        <video
          ref={videoRef}
          className='w-full h-full object-cover scale-x-[-1]'
          playsInline
          muted
          autoPlay
          style={{ display: enabled ? "block" : "none" }}
        />
        <div className='absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-cyan-400 text-center py-1 font-pixel'>
          얼굴 방향 감지 {enabled ? "ON" : "OFF"}
        </div>
      </div>

      {/* 디버깅 정보 패널 */}
      <div className='bg-black/90 border-2 border-cyan-400 rounded-lg p-3 text-xs font-pixel text-cyan-400 min-w-[200px]'>
        <div className='mb-2 font-bold text-sm text-center border-b border-cyan-400 pb-1'>
          디버깅 정보
        </div>

        <div className='space-y-1'>
          <div className='flex justify-between items-center'>
            <span>방향:</span>
            <span
              className={`flex items-center gap-1 ${getDirectionColor(
                debugInfo.detectedDirection
              )}`}>
              {getDirectionIcon(debugInfo.detectedDirection) && (
                <>
                  {debugInfo.detectedDirection === "left" ? (
                    <FaRegHandPointLeft className='text-sm' />
                  ) : (
                    <FaRegHandPointRight className='text-sm' />
                  )}
                </>
              )}
              {getDirectionText(debugInfo.detectedDirection)}
            </span>
          </div>

          <div className='flex justify-between'>
            <span>Yaw:</span>
            <span
              className={
                debugInfo.yaw < -debugInfo.threshold
                  ? "text-red-400"
                  : debugInfo.yaw > debugInfo.threshold
                  ? "text-blue-400"
                  : "text-gray-400"
              }>
              {debugInfo.yaw.toFixed(4)}
            </span>
          </div>

          <div className='flex justify-between'>
            <span>Threshold:</span>
            <span>{debugInfo.threshold.toFixed(4)}</span>
          </div>

          <div className='flex justify-between'>
            <span>안정 카운트:</span>
            <span
              className={
                debugInfo.stableCount >= 3
                  ? "text-green-400"
                  : "text-yellow-400"
              }>
              {debugInfo.stableCount}/3
            </span>
          </div>

          {/* 진행 바 */}
          <div className='mt-2'>
            <div className='w-full bg-gray-700 h-2 rounded overflow-hidden'>
              <div
                className={`h-full transition-all duration-100 ${
                  debugInfo.stableCount >= 3
                    ? "bg-green-400"
                    : debugInfo.stableCount > 0
                    ? "bg-yellow-400"
                    : "bg-gray-500"
                }`}
                style={{
                  width: `${Math.min((debugInfo.stableCount / 3) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
