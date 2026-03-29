'use client';

import { useCallback, useEffect, useRef } from 'react';

type RippleCursorProps = {
  className?: string;
};

export function RippleCursor({ className }: RippleCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const setupRipple = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let width = 0;
    let height = 0;
    // Downscale for performance
    const scale = 4;
    let cols = 0;
    let rows = 0;
    let buffer1: Float32Array;
    let buffer2: Float32Array;
    const damping = 0.96;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width;
      canvas!.height = height;
      cols = Math.ceil(width / scale);
      rows = Math.ceil(height / scale);
      buffer1 = new Float32Array(cols * rows);
      buffer2 = new Float32Array(cols * rows);
    }

    resize();

    function drop(x: number, y: number) {
      const col = Math.floor(x / scale);
      const row = Math.floor(y / scale);
      const radius = 3;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const c = col + dx;
          const r = row + dy;
          if (c >= 0 && c < cols && r >= 0 && r < rows) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
              buffer1[r * cols + c] = 255 * (1 - dist / radius);
            }
          }
        }
      }
    }

    function step() {
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const i = r * cols + c;
          buffer2[i] =
            (buffer1[i - 1] + buffer1[i + 1] + buffer1[i - cols] + buffer1[i + cols]) / 2 -
            buffer2[i];
          buffer2[i] *= damping;
        }
      }
      // Swap buffers
      const tmp = buffer1;
      buffer1 = buffer2;
      buffer2 = tmp;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      const imageData = ctx!.createImageData(width, height);
      const data = imageData.data;

      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const val = buffer1[r * cols + c];
          if (Math.abs(val) < 0.5) continue;

          // Render as semi-transparent white/dark based on ripple height
          const intensity = Math.min(Math.abs(val) * 0.8, 80);

          for (let py = 0; py < scale && r * scale + py < height; py++) {
            for (let px = 0; px < scale && c * scale + px < width; px++) {
              const idx = ((r * scale + py) * width + c * scale + px) * 4;
              if (val > 0) {
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = intensity;
              } else {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = intensity * 0.5;
              }
            }
          }
        }
      }

      ctx!.putImageData(imageData, 0, 0);
    }

    function animate() {
      step();
      draw();
      rafRef.current = requestAnimationFrame(animate);
    }

    // Listen on the parent element instead of the canvas itself, since
    // pointer-events: none prevents mousemove from firing on the canvas.
    const parent = canvas.parentElement;

    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      drop(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onResize = () => resize();

    if (parent) {
      parent.addEventListener('mousemove', onMove);
    }
    window.addEventListener('resize', onResize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (parent) {
        parent.removeEventListener('mousemove', onMove);
      }
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    return setupRipple();
  }, [setupRipple]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}
    />
  );
}
