'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { DocumentScreenshot } from '@/types';
import { shareScreenshotToX, openXCompose, downloadImage, ShareResult } from '@/lib/shareScreenshot';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: DocumentScreenshot[];
  initialIndex: number;
  documentName: string;
  sourceUrl: string;
  personName: string;
}

export default function Lightbox({
  isOpen,
  onClose,
  screenshots,
  initialIndex,
  documentName,
  sourceUrl,
  personName
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInstructions, setShowInstructions] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');

  // Navigation functions - declared first so useEffects can reference them
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  // Reset state when lightbox opens - using key pattern instead of effect
  // The parent component should reset this by changing a key prop, but we also
  // track the previous isOpen state to reset when transitioning from closed to open
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen && !wasOpen) {
    setCurrentIndex(initialIndex);
    setShowInstructions(false);
    setShareStatus('idle');
    setWasOpen(true);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInstructions) {
          setShowInstructions(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showInstructions, onClose, goToPrevious, goToNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleShare = async () => {
    const currentScreenshot = screenshots[currentIndex];
    setShareStatus('copying');

    const result: ShareResult = await shareScreenshotToX(currentScreenshot.path);

    if (result.success) {
      setShareStatus('copied');
      setShowInstructions(true);
    } else {
      // Fallback to download
      setShareStatus('failed');
      downloadImage(currentScreenshot.path, `${personName}-${documentName}-page${currentScreenshot.pageNumber || currentIndex + 1}.png`);
      // Still show instructions but with download message
      setShowInstructions(true);
    }
  };

  const handleOpenX = () => {
    setShowInstructions(false);
    openXCompose();
  };

  if (!isOpen || screenshots.length === 0) return null;

  const currentScreenshot = screenshots[currentIndex];

  return (
    <>
      {/* Main Lightbox Overlay */}
      <div
        className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2"
          aria-label="Close lightbox"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous screenshot"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              aria-label="Next screenshot"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Container */}
        <div
          className="text-center max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Screenshot Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={currentScreenshot.path}
              alt={`${personName} - ${documentName} - Page ${currentScreenshot.pageNumber || currentIndex + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[70vh] object-contain"
              priority
            />
          </div>

          {/* Document Info */}
          <div className="mt-4 text-white">
            <p className="font-semibold">{documentName}</p>
            {currentScreenshot.pageNumber && (
              <p className="text-sm text-gray-400">
                Page {currentScreenshot.pageNumber}
                {screenshots.length > 1 && ` • ${currentIndex + 1} of ${screenshots.length}`}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={handleShare}
              disabled={shareStatus === 'copying'}
              className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {shareStatus === 'copying' ? 'Copying...' : 'Share on X'}
            </button>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm"
            >
              View Source PDF →
            </a>
          </div>
        </div>

        {/* Thumbnail Strip (when multiple screenshots) */}
        {screenshots.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
            <div className="bg-black/50 rounded-lg p-2 flex gap-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                  className={`w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={screenshot.path}
                    alt={`Page ${screenshot.pageNumber || index + 1}`}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                shareStatus === 'copied' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {shareStatus === 'copied' ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {shareStatus === 'copied' ? 'Screenshot Copied!' : 'Screenshot Downloaded!'}
              </h3>
              <p className="text-gray-600 mt-2">
                {shareStatus === 'copied'
                  ? 'Now paste it in your X post'
                  : 'Attach the downloaded image to your X post'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick steps:</p>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>X will open in a new tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>
                    {shareStatus === 'copied'
                      ? <>Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Cmd+V</kbd> (or <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd>) to paste</>
                      : 'Click the image icon and select the downloaded file'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>The screenshot will attach to your post</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOpenX}
                className="flex-1 bg-black text-white py-3 px-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Open X
              </button>
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
