"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FaRegHandPointLeft, FaRegHandPointRight } from "react-icons/fa";
// 새로운 라이브러리 임포트
import {
  FaceLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

interface MediaPipeFaceControllerProps {
  onDirectionDetected: (direction: "left" | "right") => void;
  enabled: boolean;
  fullscreen?: boolean;
}

export default function MediaPipeFaceController({
  onDirectionDetected,
  enabled,
  fullscreen = false,
}: MediaPipeFaceControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<"left" | "right" | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stableDirectionRef = useRef<"left" | "right" | null>(null);
  const stableCountRef = useRef<number>(0);
  const isInitializingRef = useRef<boolean>(false);

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

  const calculateYaw = useCallback((landmarks: NormalizedLandmark[]) => {
    // MediaPipe Tasks Vision 랜드마크: 코 끝 1, 왼쪽 눈 33, 오른쪽 눈 263
    if (!landmarks || landmarks.length < 264) return 0;

    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    if (!noseTip || !leftEye || !rightEye) return 0;

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    // x 좌표 차이로 좌우 각도(Yaw)를 근사
    return noseTip.x - eyeCenterX;
  }, []);

  const processLandmarks = useCallback(
    (landmarks: NormalizedLandmark[]) => {
      if (!enabled || !landmarks || landmarks.length === 0) {
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

      const yaw = calculateYaw(landmarks);
      const threshold = 0.05;

      let detectedDirection: "left" | "right" | null = null;
      // 카메라 좌우 반전에 따른 방향 설정
      if (yaw < -threshold) detectedDirection = "right";
      else if (yaw > threshold) detectedDirection = "left";
      else {
        detectedDirection = null;
        if (detectionTimeoutRef.current) {
          clearTimeout(detectionTimeoutRef.current);
          detectionTimeoutRef.current = null;
        }
        if (stableDirectionRef.current !== null) {
          stableDirectionRef.current = null;
          stableCountRef.current = 0;
        }
        setDebugInfo({
          yaw,
          detectedDirection: "center",
          stableCount: 0,
          threshold,
        });
        return;
      }

      setDebugInfo({
        yaw,
        detectedDirection,
        stableCount: stableCountRef.current,
        threshold,
      });

      if (
        detectedDirection &&
        detectedDirection === stableDirectionRef.current
      ) {
        stableCountRef.current += 1;
      } else if (detectedDirection) {
        stableDirectionRef.current = detectedDirection;
        stableCountRef.current = 1;
      }

      if (
        stableCountRef.current >= 3 &&
        detectedDirection &&
        detectedDirection !== lastDirectionRef.current
      ) {
        if (detectionTimeoutRef.current)
          clearTimeout(detectionTimeoutRef.current);
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
    if (!videoRef.current) return;

    let cancelled = false;

    const setup = async () => {
      if (cancelled || !videoRef.current) return;

      try {
        // 1. 카메라 설정 (스트림이 없을 때만)
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false,
          });

          if (cancelled || !videoRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } else {
          // 기존 스트림 재사용
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            await videoRef.current.play().catch(() => {});
          }
        }

        if (cancelled || !videoRef.current) return;

        // enabled가 false일 때는 렌더 루프만 중단
        if (!enabled) {
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        // 2. FaceLandmarker 초기화 (없을 때만)
        if (!faceLandmarkerRef.current && !isInitializingRef.current) {
          isInitializingRef.current = true;
          try {
            const vision = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            const faceLandmarker = await FaceLandmarker.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                  delegate: "GPU",
                },
                outputFaceBlendshapes: false,
                runningMode: "VIDEO",
                numFaces: 1,
              }
            );

            faceLandmarkerRef.current = faceLandmarker;
          } catch (error) {
            console.error("FaceLandmarker initialization error:", error);
          } finally {
            isInitializingRef.current = false;
          }
        }

        if (cancelled || !videoRef.current || !faceLandmarkerRef.current)
          return;

        // 3. Canvas 초기화 (비디오 프레임 캡처용)
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) {
          console.error("Failed to get canvas context");
          return;
        }

        // 4. 렌더 루프 (enabled가 true일 때만)
        let lastVideoTime = -1;
        const render = async () => {
          if (
            cancelled ||
            !videoRef.current ||
            !faceLandmarkerRef.current ||
            !enabled ||
            !canvasCtx
          )
            return;

          try {
            const video = videoRef.current;
            if (video.readyState >= 2 && video.videoWidth > 0) {
              const startTimeMs = performance.now();
              if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;

                // Canvas 크기를 비디오 크기에 맞춤
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // 비디오 프레임을 canvas에 그리기
                canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Canvas를 사용하여 얼굴 인식
                const results = faceLandmarkerRef.current.detectForVideo(
                  canvas,
                  startTimeMs
                );

                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                  processLandmarks(results.faceLandmarks[0]);
                } else {
                  processLandmarks([]);
                }
              }
            }
          } catch (error) {
            console.warn("FaceLandmarker detection error:", error);
          }

          if (!cancelled && enabled && faceLandmarkerRef.current) {
            animationFrameRef.current = requestAnimationFrame(render);
          }
        };

        // 기존 렌더 루프 취소
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        render();
      } catch (error) {
        console.error("MediaPipe setup error:", error);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, processLandmarks]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      isInitializingRef.current = false;
    };
  }, []);

  // UI 렌더링 (기존과 동일)
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
        />
        <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-lg md:text-xl text-cyan-400 text-center px-6 py-3 rounded-lg font-pixel border-2 border-cyan-400 z-30'>
          얼굴 방향을 보여주세요!
        </div>
        {debugInfo.detectedDirection &&
          debugInfo.detectedDirection !== "center" && (
            <motion.div
              className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-30'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: "var(--font-pixel), monospace" }}>
              {debugInfo.detectedDirection === "left" ? (
                <>
                  <FaRegHandPointLeft className='text-4xl md:text-6xl text-blue-500' />
                  <span className='text-3xl md:text-5xl font-bold text-blue-500'>
                    LEFT
                  </span>
                </>
              ) : (
                <>
                  <span className='text-3xl md:text-5xl font-bold text-blue-500'>
                    RIGHT
                  </span>
                  <FaRegHandPointRight className='text-4xl md:text-6xl text-blue-500' />
                </>
              )}
            </motion.div>
          )}
      </div>
    );
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 ${
        !enabled ? "opacity-50" : ""
      }`}>
      <div className='w-40 h-30 rounded-lg overflow-hidden border-2 border-cyan-400 opacity-90 bg-black/50'>
        <video
          ref={videoRef}
          className='w-full h-full object-cover scale-x-[-1]'
          playsInline
          muted
          autoPlay
        />
      </div>
      <div className='bg-black/90 border-2 border-cyan-400 rounded-lg p-3 text-xs font-pixel text-cyan-400 min-w-[200px]'>
        <div className='mb-2 font-bold text-sm text-center border-b border-cyan-400 pb-1'>
          디버깅 정보
        </div>
        <div className='space-y-1'>
          <div className='flex justify-between items-center'>
            <span>방향:</span>
            <span
              className={`flex items-center gap-1 ${
                debugInfo.detectedDirection === "left"
                  ? "text-red-400"
                  : debugInfo.detectedDirection === "right"
                  ? "text-blue-400"
                  : "text-gray-400"
              }`}>
              {debugInfo.detectedDirection === "left" ? (
                <>
                  <FaRegHandPointLeft className='text-sm' />
                  <span>LEFT</span>
                </>
              ) : debugInfo.detectedDirection === "right" ? (
                <>
                  <FaRegHandPointRight className='text-sm' />
                  <span>RIGHT</span>
                </>
              ) : (
                <span>CENTER</span>
              )}
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
