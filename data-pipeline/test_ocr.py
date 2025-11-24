#!/usr/bin/env python3
"""Quick OCR test on first page of emails PDF."""

import fitz
from PIL import Image
import pytesseract
import io

pdf_path = "/Users/Me/ClaudeWorkspace/projects/inepsteinfiles/source-files/initial-dump/3-emails_redacted.pdf"

print("Testing OCR on 3-emails_redacted.pdf (page 1)...")

doc = fitz.open(pdf_path)
page = doc[0]

# Render at 2x resolution
pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
img_data = pix.tobytes("png")
img = Image.open(io.BytesIO(img_data))

print(f"Image size: {img.size}")
print("Running OCR...")

text = pytesseract.image_to_string(img)

print(f"\nOCR Result ({len(text)} chars):")
print("=" * 80)
print(text[:500])  # First 500 chars
print("=" * 80)

doc.close()

# Check for "Trump" or "Donald"
if "trump" in text.lower() or "donald" in text.lower():
    print("\n✓ Found Trump/Donald in OCR text!")
else:
    print("\n✗ No Trump/Donald found in OCR text")
