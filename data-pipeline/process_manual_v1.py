#!/usr/bin/env python3
"""
Manual V1 Processing Script for InEpsteinFiles.com
Processes 5 priority PDFs with 35 curated names for 24-48hr MVP launch.

Input:
  - source_manifest.json (7 P0 priority PDFs)
  - curated_names.json (35 high-priority names)

Output:
  - output/people_index.json (search index for Next.js website)
  - Computed SHA-256 hashes for each file
"""

import json
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Any
import fitz  # PyMuPDF

# Configuration
SNIPPET_CHARS = 150  # ±150 chars around match
MIN_NAME_LENGTH = 3  # Skip very short name variants to reduce false positives


def load_json(filepath: Path) -> Dict[str, Any]:
    """Load JSON file and return parsed data."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def compute_sha256(filepath: Path) -> str:
    """Compute SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def extract_text_from_pdf(pdf_path: Path) -> Dict[int, str]:
    """
    Extract text from PDF using PyMuPDF.
    Returns dict mapping page_number (1-indexed) to text content.
    """
    page_texts = {}

    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            page_texts[page_num + 1] = text  # 1-indexed for human readability
        doc.close()
    except Exception as e:
        print(f"Error extracting text from {pdf_path.name}: {e}")
        return {}

    return page_texts


def find_name_matches(text: str, search_variants: List[str]) -> List[Dict[str, Any]]:
    """
    Find all matches of search variants in text (case-insensitive).
    Returns list of match dicts with position and matched variant.
    """
    matches = []

    for variant in search_variants:
        # Skip very short variants to reduce false positives
        if len(variant) < MIN_NAME_LENGTH:
            continue

        # Create regex pattern with word boundaries for exact name matching
        # Use re.IGNORECASE for case-insensitive matching
        pattern = r'\b' + re.escape(variant) + r'\b'

        for match in re.finditer(pattern, text, re.IGNORECASE):
            matches.append({
                'variant': variant,
                'start': match.start(),
                'end': match.end(),
                'matched_text': match.group()
            })

    return matches


def extract_snippet(text: str, match_start: int, match_end: int, snippet_chars: int = SNIPPET_CHARS) -> str:
    """
    Extract snippet around a match (±snippet_chars characters).
    Cleans up whitespace and returns readable context.
    """
    # Calculate snippet boundaries
    snippet_start = max(0, match_start - snippet_chars)
    snippet_end = min(len(text), match_end + snippet_chars)

    # Extract snippet
    snippet = text[snippet_start:snippet_end]

    # Clean up excessive whitespace while preserving single spaces
    snippet = re.sub(r'\s+', ' ', snippet)

    # Add ellipsis if truncated
    if snippet_start > 0:
        snippet = '...' + snippet
    if snippet_end < len(text):
        snippet = snippet + '...'

    return snippet.strip()


def deduplicate_matches(matches: List[Dict[str, Any]], proximity_threshold: int = 200) -> List[Dict[str, Any]]:
    """
    Deduplicate matches that occur in close proximity (e.g., same table row).

    For flight logs and similar documents, multiple name variants appear in the same row
    (e.g., "Bill Clinton | Clinton, Bill | Bill Clinton | BC"). This function groups
    matches within proximity_threshold characters and keeps only the most complete variant.

    Args:
        matches: List of match dictionaries with 'start', 'end', 'variant' keys
        proximity_threshold: Maximum character distance to consider matches as duplicates

    Returns:
        Deduplicated list of matches
    """
    if not matches:
        return matches

    # Sort matches by start position
    sorted_matches = sorted(matches, key=lambda m: m['start'])

    deduplicated = []
    current_group = [sorted_matches[0]]

    for match in sorted_matches[1:]:
        # Check if this match is close to the current group
        last_match = current_group[-1]

        if match['start'] - last_match['end'] <= proximity_threshold:
            # Add to current group
            current_group.append(match)
        else:
            # Process current group and start a new one
            deduplicated.append(select_best_match(current_group))
            current_group = [match]

    # Process the last group
    if current_group:
        deduplicated.append(select_best_match(current_group))

    return deduplicated


def select_best_match(match_group: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Select the best match from a group of proximity-based duplicates.

    Prioritizes:
    1. Longest variant (more complete name)
    2. First occurrence if variants are equal length

    Args:
        match_group: List of match dictionaries

    Returns:
        Single best match from the group
    """
    # Sort by variant length (descending) and then by position (ascending)
    best_match = max(match_group, key=lambda m: (len(m['variant']), -m['start']))
    return best_match


def process_pdfs(manifest_data: Dict[str, Any], names_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main processing function: search for all names in all P0 PDFs.
    Returns people_index data structure for Next.js website.
    """
    # Get P0 priority files from manifest
    p0_files = [f for f in manifest_data['files'] if f['priority'] == 'P0']

    print(f"\nProcessing {len(p0_files)} priority PDFs with {len(names_data['names'])} curated names...")

    # Initialize people index
    people_index = {
        '_metadata': {
            'version': '1.0',
            'generated': '2024-11-19',
            'description': 'Manual V1 MVP - 35 curated names searched in 7 priority PDFs',
            'total_names': len(names_data['names']),
            'total_documents': len(p0_files),
            'verification_note': 'SHA-256 hashes computed but marked UNVERIFIED pending official verification'
        },
        'people': []
    }

    # Process each person
    for person in names_data['names']:
        print(f"\nSearching for: {person['display_name']}")

        person_entry = {
            'display_name': person['display_name'],
            'slug': person['slug'],
            'priority': person['priority'],
            'category': person['category'],
            'found_in_documents': False,
            'total_matches': 0,
            'documents': []
        }

        # Search in each P0 document
        for file_info in p0_files:
            pdf_path = Path(file_info['local_path'])

            if not pdf_path.exists():
                print(f"  ⚠️  File not found: {pdf_path.name}")
                continue

            # Extract text from PDF (page by page)
            page_texts = extract_text_from_pdf(pdf_path)

            if not page_texts:
                print(f"  ⚠️  Could not extract text from: {pdf_path.name}")
                continue

            # Compute SHA-256 if not already done
            if file_info['sha256'] is None:
                file_info['sha256'] = compute_sha256(pdf_path)

            # Search for name variants in each page
            document_matches = []

            for page_num, page_text in page_texts.items():
                matches = find_name_matches(page_text, person['search_variants'])

                # Deduplicate matches that are in close proximity (e.g., same table row)
                deduplicated_matches = deduplicate_matches(matches)

                for match in deduplicated_matches:
                    snippet = extract_snippet(page_text, match['start'], match['end'])

                    document_matches.append({
                        'page': page_num,
                        'matched_variant': match['variant'],
                        'snippet': snippet
                    })

            # If matches found in this document, add to person's record
            if document_matches:
                person_entry['found_in_documents'] = True
                person_entry['total_matches'] += len(document_matches)

                person_entry['documents'].append({
                    'filename': file_info['filename'],
                    'classification': file_info['classification'],
                    'source_url': file_info['source_url'],
                    'source_attribution': file_info['source_attribution'],
                    'sha256': file_info['sha256'],
                    'verification_status': file_info['verification_status'],
                    'match_count': len(document_matches),
                    'matches': document_matches
                })

                print(f"  ✓ Found {len(document_matches)} matches in {pdf_path.name}")

        # Add person to index
        people_index['people'].append(person_entry)

        status = "✓ FOUND" if person_entry['found_in_documents'] else "✗ Not found"
        print(f"  {status} - Total matches: {person_entry['total_matches']}")

    return people_index, manifest_data


def save_json(data: Any, filepath: Path):
    """Save data to JSON file with pretty formatting."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved: {filepath}")


def main():
    """Main execution function."""
    # Set up paths
    script_dir = Path(__file__).parent
    manifest_path = script_dir / 'source_manifest.json'
    names_path = script_dir / 'curated_names.json'
    output_dir = script_dir / 'output'
    output_path = output_dir / 'people_index.json'
    updated_manifest_path = script_dir / 'source_manifest_updated.json'

    # Load input data
    print("Loading source manifest and curated names...")
    manifest_data = load_json(manifest_path)
    names_data = load_json(names_path)

    # Process PDFs and generate people index
    people_index, updated_manifest = process_pdfs(manifest_data, names_data)

    # Save outputs
    save_json(people_index, output_path)
    save_json(updated_manifest, updated_manifest_path)

    # Print summary
    print("\n" + "="*60)
    print("PROCESSING COMPLETE - Manual V1 MVP")
    print("="*60)
    print(f"Total names processed: {len(people_index['people'])}")
    print(f"Names found in documents: {sum(1 for p in people_index['people'] if p['found_in_documents'])}")
    print(f"Names NOT found: {sum(1 for p in people_index['people'] if not p['found_in_documents'])}")
    print(f"Total matches across all documents: {sum(p['total_matches'] for p in people_index['people'])}")
    print(f"\nOutput: {output_path}")
    print(f"Updated manifest: {updated_manifest_path}")
    print("\nNext steps:")
    print("1. Review people_index.json for accuracy")
    print("2. Bootstrap Next.js website with this data")
    print("3. Deploy to Vercel for 24-48hr launch")
    print("="*60)


if __name__ == '__main__':
    main()
