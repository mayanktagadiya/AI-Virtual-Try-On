import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { useCallback, useRef, useState } from "react";

export type PoseStatus =
  | "idle"
  | "loading"
  | "detected"
  | "no_person"
  | "multiple_people"
  | "side_angle"
  | "low_confidence"
  | "error";

export interface BodyRatios {
  shoulder_width: number;
  hip_width: number;
  torso_length: number;
}

export interface PoseResult {
  status: PoseStatus;
  landmarks: NormalizedLandmark[];
  ratios: BodyRatios | null;
  message: string | null;
}

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Module-level singleton so the model loads only once per page session.
let landmarkerPromise: Promise<PoseLandmarker> | null = null;

function getLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "IMAGE",
        numPoses: 2,
        minPoseDetectionConfidence: 0.5,
      });
    })();
  }
  return landmarkerPromise;
}

function imageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

const IDLE: PoseResult = {
  status: "idle",
  landmarks: [],
  ratios: null,
  message: null,
};

export function usePoseLandmarker() {
  const [result, setResult] = useState<PoseResult>(IDLE);
  const runningRef = useRef(false);

  const detect = useCallback(async (file: File) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setResult({ status: "loading", landmarks: [], ratios: null, message: null });

    try {
      const [landmarker, img] = await Promise.all([
        getLandmarker(),
        imageFromFile(file),
      ]);

      const { landmarks: detected } = landmarker.detect(img);

      if (detected.length === 0) {
        setResult({
          status: "no_person",
          landmarks: [],
          ratios: null,
          message:
            "No person detected. Use a clear front-facing photo with your full upper body visible.",
        });
        return;
      }

      if (detected.length > 1) {
        setResult({
          status: "multiple_people",
          landmarks: detected[0],
          ratios: null,
          message:
            "Multiple people detected. Please use a solo photo.",
        });
        return;
      }

      const lms = detected[0];
      const ls = lms[11]; // left shoulder
      const rs = lms[12]; // right shoulder
      const lh = lms[23]; // left hip
      const rh = lms[24]; // right hip

      const minVis = Math.min(
        ls.visibility ?? 0,
        rs.visibility ?? 0,
        lh.visibility ?? 0,
        rh.visibility ?? 0
      );

      if (minVis < 0.45) {
        // Low depth-symmetry → side angle
        const depthDiff = Math.abs((ls.z ?? 0) - (rs.z ?? 0));
        if (depthDiff > 0.08) {
          setResult({
            status: "side_angle",
            landmarks: lms,
            ratios: null,
            message:
              "Side angle detected. Please face the camera directly for accurate measurements.",
          });
        } else {
          setResult({
            status: "low_confidence",
            landmarks: lms,
            ratios: null,
            message:
              "Low confidence detection. Try better lighting or a plainer background.",
          });
        }
        return;
      }

      const shoulder_width = Math.abs(rs.x - ls.x);
      const hip_width = Math.abs(rh.x - lh.x);
      const torso_length = Math.abs(
        (ls.y + rs.y) / 2 - (lh.y + rh.y) / 2
      );

      setResult({
        status: "detected",
        landmarks: lms,
        ratios: { shoulder_width, hip_width, torso_length },
        message: null,
      });
    } catch {
      setResult({
        status: "error",
        landmarks: [],
        ratios: null,
        message: "Pose detection failed. You can still continue without it.",
      });
    } finally {
      runningRef.current = false;
    }
  }, []);

  const reset = useCallback(() => setResult(IDLE), []);

  return { ...result, detect, reset };
}
