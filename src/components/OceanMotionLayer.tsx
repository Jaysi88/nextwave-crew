'use client';

import { useEffect, useRef } from 'react';

export default function OceanMotionLayer() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;

    let frame = 0;
    let x = window.innerWidth * .72;
    let y = window.innerHeight * .28;

    const paint = () => {
      glow.style.transform = `translate3d(${x - 210}px, ${y - 210}px, 0)`;
      frame = 0;
    };

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', move, { passive: true });
    paint();
    return () => {
      window.removeEventListener('pointermove', move);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={glowRef} className="oceanCursorGlow" aria-hidden="true" />;
}
