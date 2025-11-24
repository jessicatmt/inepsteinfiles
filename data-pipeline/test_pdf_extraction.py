#!/usr/bin/env python3
"""
Quick diagnostic to check text extraction from each PDF.
Tests if PDFs are readable, scanned, or have extraction issues.
"""

import fitz  # PyMuPDF
import os

SOURCE_DIR = "/Users/Me/ClaudeWorkspace/projects/inepsteinfiles/source-files/initial-dump"

# Test PDFs
test_files = [
    "3-emails_redacted.pdf",
    "EPSTEIN FLIGHT LOGS UNREDACTED.pdf",
    "contact-book.pdf",
    "Epstein-Estate-Document-01.pdf",
    "Epstein-Estate-Document-02.pdf",
    "Epstein-Estate-Document-04.pdf",
    "Epstein-Estate-Document-08.pdf"
]

print("=" * 80)
print("PDF TEXT EXTRACTION DIAGNOSTIC")
print("=" * 80)

for filename in test_files:
    filepath = os.path.join(SOURCE_DIR, filename)

    if not os.path.exists(filepath):
        print(f"\n❌ {filename}")
        print(f"   FILE NOT FOUND")
        continue

    try:
        doc = fitz.open(filepath)
        total_pages = len(doc)

        # Test first 3 pages
        pages_to_test = min(3, total_pages)
        total_chars = 0

        for page_num in range(pages_to_test):
            page = doc[page_num]
            text = page.get_text()
            total_chars += len(text.strip())

        avg_chars_per_page = total_chars / pages_to_test if pages_to_test > 0 else 0

        # Diagnose
        status = "✓"
        diagnosis = "Text extractable"

        if avg_chars_per_page < 50:
            status = "⚠️"
            diagnosis = "SCANNED - needs OCR (very low text)"
        elif avg_chars_per_page < 200:
            status = "⚠️"
            diagnosis = "POSSIBLE SCAN - low text density"

        print(f"\n{status} {filename}")
        print(f"   Pages: {total_pages}")
        print(f"   Avg chars/page (first {pages_to_test}): {avg_chars_per_page:.0f}")
        print(f"   Diagnosis: {diagnosis}")

        # Show sample from first page
        if total_chars > 0:
            first_page = doc[0].get_text()
            sample = first_page.strip()[:200].replace('\n', ' ')
            print(f"   Sample: {sample}...")
        else:
            print(f"   Sample: [NO TEXT FOUND - LIKELY SCANNED IMAGE]")

        doc.close()

    except Exception as e:
        print(f"\n❌ {filename}")
        print(f"   ERROR: {str(e)}")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
