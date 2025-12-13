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
  const [loadError, setLoadError] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load html2canvas from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if (typeof window.html2canvas !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHtml2canvasLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="html2canvas"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setHtml2canvasLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    script.onload = () => {
      setHtml2canvasLoaded(true);
      setLoadError(false);
    };
    script.onerror = () => {
      setLoadError(true);
      console.error('Failed to load html2canvas');
    };
    document.head.appendChild(script);
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

  async function generateScreenshot(mode: 'square' | 'vertical') {
    // Load on demand if not ready
    if (!html2canvasLoaded || typeof window.html2canvas === 'undefined') {
      alert('Screenshot feature is still loading. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setShowOptions(false);

    try {
      // Find the main result area
      const resultElement = document.querySelector('.result-container') as HTMLElement;
      if (!resultElement) {
        alert('Could not find result to screenshot. Please refresh and try again.');
        setIsLoading(false);
        return;
      }

      // Capture the element
      const canvas = await window.html2canvas(resultElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
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
      ctx.font = '24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('inepsteinfiles.com', targetWidth / 2, targetHeight - 40);

      // Get data URL and show in modal
      const dataUrl = outputCanvas.toDataURL('image/png');
      setImageDataUrl(dataUrl);
      setIsLoading(false);
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Failed to generate screenshot. Please try again.');
      setIsLoading(false);
    }
  }

  function closeModal() {
    setImageDataUrl(null);
  }

  function downloadImage() {
    if (!imageDataUrl) return;

    const safeName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `${safeName}-epstein-files.png`;
    link.click();
  }

  // Determine button state
  const isDisabled = isLoading;
  const buttonText = loadError
    ? 'Screenshot (unavailable)'
    : isLoading
      ? 'Generating...'
      : 'Screenshot';

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => {
            if (loadError) {
              alert('Screenshot feature failed to load. Please refresh the page.');
              return;
            }
            setShowOptions(!showOptions);
          }}
          disabled={isDisabled}
          className={`inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors ${
            isDisabled ? 'opacity-50 cursor-wait' : ''
          } ${loadError ? 'opacity-50' : ''}`}
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
              {buttonText}
            </>
          )}
        </button>

        {showOptions && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 min-w-[180px]">
            <button
              onClick={() => generateScreenshot('square')}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="w-4 h-4 border border-current inline-block" />
              Square (1:1)
            </button>
            <button
              onClick={() => generateScreenshot('vertical')}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
            >
              <span className="w-3 h-5 border border-current inline-block" />
              Vertical (9:16)
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageDataUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Your Screenshot</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Screenshot preview"
                className="w-full rounded border border-gray-200"
              />
              <p className="text-sm text-gray-600 mt-3 text-center">
                Long-press or right-click to save
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={downloadImage}
                  className="flex-1 bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Extend Window interface for html2canvas
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
  }
}
