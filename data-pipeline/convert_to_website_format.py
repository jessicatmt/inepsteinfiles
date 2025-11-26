#!/usr/bin/env python3
"""
Convert new_people_index.json to website-compatible format.
PRESERVES all existing entries (jokes, custom names, images, one-liners).
Updates existing real-people entries with new evidence data.
Adds new people from epstein-docs that weren't in the old index.
"""

import json
from pathlib import Path
import re

def slugify(name: str) -> str:
    """Convert name to URL-friendly slug."""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

# Mapping from existing display names to canonical names in epstein-docs
# This lets us match "Bill Clinton" to "President Clinton" in the new data
NAME_MAPPING = {
    'bill clinton': 'president clinton',
    'donald trump': 'president trump',
    'alan dershowitz': 'professor alan dershowitz',
    'ghislaine maxwell': 'ghislaine noelle marion maxwell',
    'jeffrey epstein': 'epstein, jeffrey edward',
    'les wexner': 'leslie wexner',
    'virginia giuffre': 'virginia roberts guiffre',
    'kevin spacey': 'kevin spacey',
}

# These are joke/custom entries - DO NOT try to match them to real people
CUSTOM_ENTRIES = {
    'adolf-hitler', 'angel-martinez', 'barack-obama', 'channing-tatum',
    'deez-nutz', 'george-w-bush', 'jeffrey-epstein', 'jessica-suarez',
    'lena-dunham', 'martin-scorsese', 'my-dad', 'my-mom', 'osama-bin-laden',
    'prince-andrew', 'taylor-swift', 'your-mom', 'jesus-christ', 'mark-sussman',
    'vladimir-putin'
}

def create_evidence_from_new(new_person):
    """Convert new format evidence to website format."""
    documents = []
    for ev in new_person.get('evidence', []):
        doc = {
            'filename': ev['doc_id'],
            'classification': ev['doc_type'],
            'source_url': ev['url'],
            'source_attribution': 'Epstein Document Archive',
            'sha256': '',
            'verification_status': 'PUBLIC_RECORD',
            'match_count': 1,
            'matches': [{
                'page': 1,
                'matched_variant': new_person['name'],
                'snippet': ev['excerpt'][:500] if ev.get('excerpt') else ''
            }]
        }
        documents.append(doc)
    return documents

def main():
    script_dir = Path(__file__).parent
    website_dir = script_dir.parent / 'website' / 'public'

    # Load new data from epstein-docs
    print("Loading new people index from epstein-docs...")
    with open(script_dir / 'new_people_index.json', 'r') as f:
        new_data = json.load(f)

    # Create lookup by lowercase name
    new_by_name = {p['name'].lower(): p for p in new_data}
    used_new_entries = set()

    # Load existing data
    print("Loading existing people index...")
    existing_path = website_dir / 'people_index.json'
    with open(existing_path, 'r') as f:
        existing = json.load(f)

    existing_people = existing.get('people', [])
    print(f"Loaded {len(existing_people)} existing entries")

    # Process existing entries - preserve everything, add new evidence where available
    updated_people = []
    matched_count = 0

    for person in existing_people:
        display_name = person['display_name']
        display_lower = display_name.lower()
        slug = person.get('slug', '')

        # Skip custom/joke entries - don't try to match them to real data
        if slug in CUSTOM_ENTRIES:
            updated_people.append(person)
            continue

        # Try to find matching entry in new data
        new_person = None

        # Direct name match
        if display_lower in new_by_name:
            new_person = new_by_name[display_lower]
            used_new_entries.add(display_lower)
        # Mapped name match
        elif display_lower in NAME_MAPPING:
            mapped_name = NAME_MAPPING[display_lower]
            if mapped_name in new_by_name:
                new_person = new_by_name[mapped_name]
                used_new_entries.add(mapped_name)

        if new_person:
            matched_count += 1
            # Update with new data but PRESERVE custom_content, display_name, slug, priority, category
            person['total_matches'] = new_person['document_count']
            person['pinpoint_file_count'] = new_person['document_count']
            person['found_in_documents'] = new_person['found']
            person['documents'] = create_evidence_from_new(new_person)
            # Add new metadata fields
            person['roles'] = new_person.get('roles', [])
            person['doc_types'] = new_person.get('doc_types', [])
            person['variations'] = new_person.get('variations', [])

        updated_people.append(person)

    print(f"Updated {matched_count} existing entries with new evidence data")

    # Add NEW people from epstein-docs that weren't in the old index
    new_additions = 0
    existing_slugs = {p['slug'] for p in updated_people}

    for new_person in new_data:
        if new_person['name'].lower() not in used_new_entries:
            new_slug = new_person['slug']

            # Skip if slug already exists
            if new_slug in existing_slugs:
                continue

            # Create new entry in website format
            entry = {
                'display_name': new_person['name'],
                'slug': new_slug,
                'priority': 'P2',  # Lower priority for auto-added
                'category': 'Person',
                'found_in_documents': new_person['found'],
                'total_matches': new_person['document_count'],
                'pinpoint_file_count': new_person['document_count'],
                'pinpoint_entity_id': None,
                'custom_content': {
                    'one_liner': None,
                    'image_url': None,
                    'youtube_embed_id': None,
                    'youtube_timestamp': None
                },
                'documents': create_evidence_from_new(new_person),
                'roles': new_person.get('roles', []),
                'doc_types': new_person.get('doc_types', []),
                'variations': new_person.get('variations', [])
            }

            updated_people.append(entry)
            existing_slugs.add(new_slug)
            new_additions += 1

    print(f"Added {new_additions} new people from epstein-docs")

    # Sort: P0 first, then P1, then by document count
    priority_order = {'P0': 0, 'P1': 1, 'Custom': 2, 'P2': 3}
    updated_people.sort(key=lambda x: (
        priority_order.get(x.get('priority', 'P2'), 3),
        -x.get('total_matches', 0)
    ))

    # Build final structure
    output = {
        '_metadata': {
            'version': '2.0',
            'generated': '2025-11-25',
            'description': 'Merged: Original curated list + epstein-docs.github.io archive (8,186 documents)',
            'total_names': len(updated_people),
            'total_documents': 8186,
            'verification_note': 'Documents sourced from public releases. Custom content preserved.',
            'has_custom_content': True,
            'last_manual_update': '2025-11-25'
        },
        'people': updated_people
    }

    # Save
    output_path = website_dir / 'people_index.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nFinal index: {len(updated_people)} people")
    print(f"Saved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.1f} KB")

    # Show some examples of preserved custom content
    print("\nPreserved custom entries:")
    for p in updated_people:
        cc = p.get('custom_content', {})
        if cc.get('one_liner') or cc.get('one_liner_popup') or cc.get('youtube_embed_id'):
            print(f"  {p['display_name']}: {cc.get('one_liner', '')[:50]}...")
            if len([x for x in updated_people if x.get('custom_content', {}).get('one_liner')]) > 10:
                break

if __name__ == '__main__':
    main()
