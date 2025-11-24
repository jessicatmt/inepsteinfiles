#!/usr/bin/env python3
"""
Update people_index.json with Pinpoint entity IDs and file counts.
Entity IDs are Google Knowledge Graph / Freebase MIDs.
"""

import json

PEOPLE_INDEX_PATH = "../website/public/people_index.json"

# Known entity IDs and file counts from Pinpoint
# Format: "display_name": {"entity_id": "/m/xxxxx", "file_count": N}
# ONLY include entity IDs that have been VERIFIED against Pinpoint's people filter
# Entity IDs must be scraped from Pinpoint, NOT guessed from Freebase/Wikidata
ENTITY_DATA = {
    # VERIFIED from Pinpoint people filter page:
    "Donald Trump": {"entity_id": "/m/0cqt90", "file_count": 44},
    # All others need verification - remove entity_id until scraped from Pinpoint
}

def main():
    print(f"📝 Loading {PEOPLE_INDEX_PATH}...")
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)

    updated_count = 0
    not_found = []

    for person in index['people']:
        name = person['display_name']

        if name in ENTITY_DATA:
            data = ENTITY_DATA[name]
            if data['entity_id']:
                person['pinpoint_entity_id'] = data['entity_id']
            if data['file_count']:
                person['pinpoint_file_count'] = data['file_count']
            updated_count += 1
            print(f"  ✅ {name}: {data['entity_id'] or 'no entity'} ({data['file_count']} files)")
        else:
            not_found.append(name)
            print(f"  ⚠️  {name}: No data available")

    print(f"\n💾 Saving updated index...")
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Updated {updated_count}/{len(index['people'])} people")
    if not_found:
        print(f"⚠️  Names not in ENTITY_DATA: {not_found}")

if __name__ == '__main__':
    main()
