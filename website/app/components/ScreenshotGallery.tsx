'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DocumentScreenshot } from '@/types';
import Lightbox from './Lightbox';

interface ScreenshotGalleryProps {
  screenshots: DocumentScreenshot[];
  documentName: string;
  sourceUrl: string;
  personName: string;
}

export default function ScreenshotGallery({
  screenshots,
  documentName,
  sourceUrl,
  personName
}: ScreenshotGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) return null;

  // Show the first screenshot as the preview
  const previewScreenshot = screenshots[0];

  const openLightbox = (index: number = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Inline Preview */}
      <div className="mt-4 pt-4 border-t border-red-100">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <span>📸</span> Screenshot Preview
        </p>

        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <button
            onClick={() => openLightbox(0)}
            className="flex-shrink-0 rounded overflow-hidden border border-gray-300 hover:border-red-400 transition-all hover:scale-102 hover:shadow-md cursor-pointer"
            aria-label="View screenshot in full size"
          >
            <Image
              src={previewScreenshot.path}
              alt={`${personName} - ${documentName}`}
              width={80}
              height={64}
              className="w-20 h-16 object-cover"
            />
          </button>

          {/* Quote and Actions */}
          <div className="flex-1 min-w-0">
            {previewScreenshot.highlightQuote && (
              <p className="text-sm text-gray-700 italic mb-2 line-clamp-3">
                &ldquo;{previewScreenshot.highlightQuote}&rdquo;
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openLightbox(0)}
                className="text-xs text-blue-600 hover:underline"
              >
                Expand
              </button>
              <button
                onClick={() => openLightbox(0)}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        screenshots={screenshots}
        initialIndex={lightboxIndex}
        documentName={documentName}
        sourceUrl={sourceUrl}
        personName={personName}
      />
    </>
  );
}
