/**
 * Utility to copy a screenshot image to clipboard and open X compose
 *
 * Flow:
 * 1. Fetch image from path
 * 2. Convert to Blob
 * 3. Copy to clipboard using Clipboard API
 * 4. Return success/failure so UI can show appropriate feedback
 */

export interface ShareResult {
  success: boolean;
  method: 'clipboard' | 'download' | 'failed';
  error?: string;
}

/**
 * Copy an image to clipboard
 * Returns true if successful, false if clipboard API not supported
 */
export async function copyImageToClipboard(imagePath: string): Promise<ShareResult> {
  try {
    // Fetch the image
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();

    // Check if Clipboard API supports writing images
    if (!navigator.clipboard || !navigator.clipboard.write) {
      return { success: false, method: 'failed', error: 'Clipboard API not supported' };
    }

    // Create a ClipboardItem with the image blob
    // Note: Safari requires the blob type to match exactly
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob
    });

    await navigator.clipboard.write([clipboardItem]);

    return { success: true, method: 'clipboard' };
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return {
      success: false,
      method: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Download an image as a fallback when clipboard doesn't work
 */
export function downloadImage(imagePath: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = imagePath;
  link.download = filename || imagePath.split('/').pop() || 'screenshot.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Open X compose in a new window
 */
export function openXCompose(): void {
  window.open('https://twitter.com/compose/tweet', '_blank', 'width=550,height=500');
}

/**
 * Full share flow: copy image, then let caller handle UI feedback
 */
export async function shareScreenshotToX(imagePath: string): Promise<ShareResult> {
  const result = await copyImageToClipboard(imagePath);
  return result;
}
