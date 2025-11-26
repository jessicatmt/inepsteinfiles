#!/usr/bin/env python3
"""
Build new people_index.json from epstein-docs data.
This script takes their pre-processed analyses and creates our index format.

Data sources:
- epstein_docs_analyses.json: 8,186 documents with extracted people, summaries, topics
- epstein_docs_dedupe.json: 11,299 name variations mapped to canonical names

Output:
- new_people_index.json: Our format with document counts, excerpts, variations
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def slugify(name: str) -> str:
    """Convert name to URL-friendly slug."""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

def is_valid_person(name: str) -> bool:
    """Filter out non-person entries (redactions, titles, emails, etc.)."""
    # Skip redacted entries
    if '(b)(6)' in name or '(b)(7)' in name:
        return False
    # Skip emails
    if '@' in name:
        return False
    # Skip generic titles and legal terms
    skip_patterns = [
        'defendant', 'plaintiff', 'the court', 'attorney', 'judge',
        'victim', 'accuser', 'inmate', 'warden', 'captain', 'lieutenant',
        'correctional officer', 'chief', 'commissioner', 'administrator',
        'agent', 'u.s.', 'united states', 'fbi', 'cia', 'doj',
        'company', 'inc.', 'corp.', 'llc', 'organization',
        'anonymous', 'unknown', 'redacted', 'esq.', 'esq,',
        'honorable', 'magistrate', 'clerk', 'counsel',
        'usdoj.gov', '.gov', '.com', '.org', '.net',
        'government', 'bureau', 'department', 'office of'
    ]
    name_lower = name.lower()
    for pattern in skip_patterns:
        if pattern in name_lower:
            return False
    # Skip single-word generic names
    if len(name.split()) == 1 and name.lower() in [
        'defendant', 'plaintiff', 'judge', 'counsel', 'attorney',
        'he', 'she', 'they', 'it', 'mr', 'ms', 'mrs', 'dr',
        'the', 'court', 'state', 'government'
    ]:
        return False
    # Must have at least 2 characters
    if len(name) < 2:
        return False
    # Skip ALL CAPS legal document headers (likely not real people)
    if name.isupper() and len(name.split()) > 3:
        return False
    return True

def is_celebrity_or_notable(name: str, doc_count: int) -> bool:
    """Prioritize celebrities and notable figures for the main index."""
    # High-profile names we definitely want
    notable_names = [
        'clinton', 'trump', 'prince andrew', 'dershowitz', 'epstein',
        'maxwell', 'wexner', 'weinstein', 'cosby', 'spacey',
        'richardson', 'mitchell', 'brunel', 'dubin', 'farmer',
        'roberts', 'giuffre', 'ransome', 'wild', 'kellen',
        'marcinkova', 'groff', 'visoski', 'rodriguez', 'alessi',
        'black', 'brockman', 'barak', 'barr', 'acosta',
        'gates', 'musk', 'hawking', 'pinker', 'krauss'
    ]
    name_lower = name.lower()
    for notable in notable_names:
        if notable in name_lower:
            return True
    # Anyone with 5+ documents is worth including
    return doc_count >= 5

def main():
    script_dir = Path(__file__).parent

    # Load the data
    print("Loading analyses.json...")
    with open(script_dir / 'epstein_docs_analyses.json', 'r') as f:
        analyses = json.load(f)

    print("Loading dedupe.json...")
    with open(script_dir / 'epstein_docs_dedupe.json', 'r') as f:
        dedupe = json.load(f)

    print(f"Total documents: {analyses['total']}")
    print(f"Name variations: {len(dedupe['people'])}")

    # Build reverse lookup: canonical name -> all variations
    name_variations = defaultdict(set)
    for variation, canonical in dedupe['people'].items():
        name_variations[canonical].add(variation)

    # Extract all people from documents with their evidence
    people_data = defaultdict(lambda: {
        'documents': [],
        'roles': set(),
        'doc_types': set(),
        'topics': set()
    })

    print("\nProcessing documents...")
    for doc in analyses['analyses']:
        if 'analysis' not in doc or 'key_people' not in doc['analysis']:
            continue

        analysis = doc['analysis']
        doc_id = doc.get('document_id', 'unknown')
        doc_type = analysis.get('document_type', 'Unknown')
        summary = analysis.get('summary', '')
        significance = analysis.get('significance', '')
        topics = analysis.get('key_topics', [])

        for person in analysis['key_people']:
            if person is None:
                continue
            if isinstance(person, dict):
                name = person.get('name')
                if name is None:
                    continue
                name = name.strip()
            else:
                name = str(person).strip()
            if not name or not is_valid_person(name):
                continue

            # Normalize to canonical name if available
            canonical = dedupe['people'].get(name, name)

            role = person.get('role', 'Mentioned')

            people_data[canonical]['documents'].append({
                'doc_id': doc_id,
                'doc_type': doc_type,
                'role': role,
                'summary': summary[:500] if summary else '',  # Truncate long summaries
                'significance': significance[:300] if significance else ''
            })
            people_data[canonical]['roles'].add(role)
            people_data[canonical]['doc_types'].add(doc_type)
            for topic in topics[:3]:  # Limit topics per doc
                people_data[canonical]['topics'].add(topic)

    print(f"Total unique people found: {len(people_data)}")

    # Build the final index
    people_index = []

    for canonical_name, data in people_data.items():
        doc_count = len(data['documents'])

        # Filter out canonical names that aren't valid people
        if not is_valid_person(canonical_name):
            continue

        # Filter: only include people with enough documents or notable names
        if not is_celebrity_or_notable(canonical_name, doc_count):
            continue

        # Get name variations
        variations = list(name_variations.get(canonical_name, set()))
        variations = [v for v in variations if v != canonical_name][:10]  # Limit variations

        # Get top 5 most relevant documents as evidence
        evidence = []
        seen_summaries = set()
        for doc in data['documents'][:20]:  # Check first 20
            summary = doc['summary']
            if summary and summary not in seen_summaries:
                evidence.append({
                    'doc_id': doc['doc_id'],
                    'doc_type': doc['doc_type'],
                    'role': doc['role'],
                    'excerpt': summary,
                    'url': f"https://epstein-docs.github.io/document/{doc['doc_id']}/"
                })
                seen_summaries.add(summary)
                if len(evidence) >= 5:
                    break

        person_entry = {
            'name': canonical_name,
            'slug': slugify(canonical_name),
            'document_count': doc_count,
            'found': doc_count > 0,
            'roles': list(data['roles'])[:5],
            'doc_types': list(data['doc_types'])[:5],
            'topics': list(data['topics'])[:10],
            'variations': variations,
            'evidence': evidence,
            'last_updated': '2025-11-25'
        }

        people_index.append(person_entry)

    # Sort by document count
    people_index.sort(key=lambda x: x['document_count'], reverse=True)

    print(f"\nFinal index entries: {len(people_index)}")
    print(f"Top 20 by document count:")
    for p in people_index[:20]:
        print(f"  {p['name']}: {p['document_count']} docs")

    # Save the new index
    output_path = script_dir / 'new_people_index.json'
    with open(output_path, 'w') as f:
        json.dump(people_index, f, indent=2)

    print(f"\nSaved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.1f} KB")

    # Also save a compact version for the website
    compact_index = []
    for p in people_index:
        compact_index.append({
            'name': p['name'],
            'slug': p['slug'],
            'document_count': p['document_count'],
            'found': p['found'],
            'variations': p['variations'][:5],
            'evidence': p['evidence'][:3]  # Only top 3 for website
        })

    compact_path = script_dir / 'people_index_compact.json'
    with open(compact_path, 'w') as f:
        json.dump(compact_index, f)

    print(f"Compact version: {compact_path}")
    print(f"Compact size: {compact_path.stat().st_size / 1024:.1f} KB")

if __name__ == '__main__':
    main()
