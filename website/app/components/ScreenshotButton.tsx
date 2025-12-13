'use client';

import { useState, useRef, useEffect } from 'react';

interface ScreenshotButtonProps {
  displayName: string;
  found: boolean;
}

export default function ScreenshotButton({ displayName }: ScreenshotButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load html2canvas from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.async = true;
      script.onload = () => setHtml2canvasLoaded(true);
      document.body.appendChild(script);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHtml2canvasLoaded(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function downloadScreenshot(mode: 'square' | 'vertical') {
    if (!html2canvasLoaded || !window.html2canvas) {
      alert('Screenshot feature is loading, please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setShowOptions(false);

    try {
      // Find the main result area (YES/NO + subtitle)
      const resultElement = document.querySelector('.result-container') as HTMLElement;
      if (!resultElement) {
        alert('Could not find result to screenshot');
        setIsLoading(false);
        return;
      }

      // Capture the element
      const canvas = await window.html2canvas(resultElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Target dimensions
      const targetWidth = 1080;
      const targetHeight = mode === 'square' ? 1080 : 1920;

      // Create output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) {
        alert('Could not create canvas');
        setIsLoading(false);
        return;
      }

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scaling to fit content
      const scale = Math.min(
        (targetWidth * 0.9) / canvas.width,
        (targetHeight * 0.8) / canvas.height
      );
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      // Center the content
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);

      // Add watermark at bottom
      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('inepsteinfiles.com', targetWidth / 2, targetHeight - 40);

      // Download
      outputCanvas.toBlob((blob) => {
        if (!blob) {
          alert('Could not generate image');
          setIsLoading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `${safeName}-epstein-${mode === 'square' ? 'square' : 'story'}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setIsLoading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Failed to generate screenshot. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading || !html2canvasLoaded}
        className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            Screenshot
          </>
        )}
      </button>

      {showOptions && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10 min-w-[180px]">
          <button
            onClick={() => downloadScreenshot('square')}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="w-4 h-4 border border-current inline-block" />
            Square (1:1)
          </button>
          <button
            onClick={() => downloadScreenshot('vertical')}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
          >
            <span className="w-3 h-5 border border-current inline-block" />
            Vertical (9:16)
          </button>
        </div>
      )}
    </div>
  );
}

// Extend Window interface for html2canvas
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
  }
}
