import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

// Key landmark indices for body measurement connections
const KEY_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [23, 24], // hips
  [11, 23], // left torso
  [12, 24], // right torso
  [11, 13], // left upper arm
  [12, 14], // right upper arm
  [13, 15], // left forearm
  [14, 16], // right forearm
];

const KEY_POINTS = [11, 12, 23, 24]; // shoulders + hips highlighted

interface PoseCanvasProps {
  file: File;
  landmarks: NormalizedLandmark[];
  maxWidth?: number;
}

export default function PoseCanvas({
  file,
  landmarks,
  maxWidth = 280,
}: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(maxWidth / img.naturalWidth, 1);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      if (landmarks.length === 0) return;

      // Draw connections
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(74, 222, 128, 0.85)"; // green-400
      for (const [a, b] of KEY_CONNECTIONS) {
        const lmA = landmarks[a];
        const lmB = landmarks[b];
        if (!lmA || !lmB) continue;
        if ((lmA.visibility ?? 0) < 0.3 || (lmB.visibility ?? 0) < 0.3) continue;
        ctx.beginPath();
        ctx.moveTo(lmA.x * w, lmA.y * h);
        ctx.lineTo(lmB.x * w, lmB.y * h);
        ctx.stroke();
      }

      // Draw all detected landmarks as small dots
      for (const lm of landmarks) {
        if ((lm.visibility ?? 0) < 0.3) continue;
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74, 222, 128, 0.7)";
        ctx.fill();
      }

      // Highlight key measurement points (shoulders + hips) larger
      for (const idx of KEY_POINTS) {
        const lm = landmarks[idx];
        if (!lm || (lm.visibility ?? 0) < 0.3) continue;
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 1)"; // green-500
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    img.src = url;
  }, [file, landmarks, maxWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border border-border shadow-sm"
      style={{ maxWidth }}
    />
  );
}
