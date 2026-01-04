'use client';

import { useState, useEffect, useRef } from 'react';

export default function EpsteinOverlay() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Use setTimeout to make the state updates async (avoids cascading render warning)
    setTimeout(() => {
      // Check for debug param: ?overlay=1 always shows it
      const params = new URLSearchParams(window.location.search);
      const forceShow = params.get('overlay') === '1';

      // 1 in 10 chance to show, or always if ?overlay=1
      const shouldShow = forceShow || Math.random() < 0.1;
      if (!shouldShow) return;

      setVisible(true);

      // Start fade out after 400ms
      setTimeout(() => {
        setFadeOut(true);
      }, 400);

      // Remove completely after fade animation (400ms + 300ms fade)
      setTimeout(() => {
        setVisible(false);
      }, 700);
    }, 0);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      <div className="text-center px-4">
        <p className="text-4xl md:text-6xl lg:text-8xl font-black text-white uppercase tracking-tight leading-tight">
          Epstein Didn&apos;t
          <br />
          Kill Himself
        </p>
      </div>
    </div>
  );
}
