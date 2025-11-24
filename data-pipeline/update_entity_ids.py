#!/usr/bin/env python3
"""
Update people_index.json with Pinpoint entity IDs and file counts.
Entity IDs are Google Knowledge Graph / Freebase MIDs.
"""

import json

PEOPLE_INDEX_PATH = "../website/public/people_index.json"

# Known entity IDs and file counts from Pinpoint
# Format: "display_name": {"entity_id": "/m/xxxxx", "file_count": N}
# Entity IDs from Google Knowledge Graph (Freebase MIDs)
ENTITY_DATA = {
    "Donald Trump": {"entity_id": "/m/0cqt90", "file_count": 44},
    "Bill Clinton": {"entity_id": "/m/0157m", "file_count": 77},
    "Jeffrey Epstein": {"entity_id": "/m/0fz196", "file_count": 1774},
    "Ghislaine Maxwell": {"entity_id": "/m/0gbvxs", "file_count": 1047},
    "Prince Andrew": {"entity_id": "/m/025j4z", "file_count": 139},
    "Alan Dershowitz": {"entity_id": "/m/01z7s_", "file_count": 156},
    "Bill Gates": {"entity_id": "/m/0gzh", "file_count": 21},
    "Elon Musk": {"entity_id": "/m/0k84y", "file_count": 5},
    "Stephen Hawking": {"entity_id": "/m/0hcpw", "file_count": 3},
    "Leonardo DiCaprio": {"entity_id": "/m/0kh4j", "file_count": 5},
    "Kevin Spacey": {"entity_id": "/m/01mb7z", "file_count": 17},
    "Naomi Campbell": {"entity_id": "/m/0168zr", "file_count": 13},
    "Les Wexner": {"entity_id": "/m/02g1jh", "file_count": 145},
    "Larry Summers": {"entity_id": "/m/01_j7d", "file_count": 3},
    "Peter Thiel": {"entity_id": "/m/05nx0t", "file_count": 1},
    "Steve Bannon": {"entity_id": "/m/0dv9nc", "file_count": 2},
    "Ehud Barak": {"entity_id": "/m/01d_hy", "file_count": 45},
    "David Copperfield": {"entity_id": "/m/0kfxf", "file_count": 10},
    "Al Gore": {"entity_id": "/m/0gzm", "file_count": 4},
    "George Mitchell": {"entity_id": "/m/01nh0h", "file_count": 8},
    "Bill Richardson": {"entity_id": "/m/01q2nx", "file_count": 32},
    "Michael Jackson": {"entity_id": "/m/0dmz", "file_count": 4},
    "Chris Tucker": {"entity_id": "/m/01wv9p", "file_count": 11},
    "Eva Dubin": {"entity_id": None, "file_count": 45},  # Not a well-known entity
    "Glenn Dubin": {"entity_id": "/m/02q8b8s", "file_count": 99},
    "Jean-Luc Brunel": {"entity_id": "/m/02v7s6t", "file_count": 191},
    "Sarah Kellen": {"entity_id": None, "file_count": 183},  # Not in Knowledge Graph
    "Nadia Marcinkova": {"entity_id": None, "file_count": 76},  # Not in Knowledge Graph
    "Virginia Giuffre": {"entity_id": "/m/0gy0ljb", "file_count": 673},
    "Maria Farmer": {"entity_id": None, "file_count": 36},  # Not in Knowledge Graph
    "Courtney Love": {"entity_id": "/m/01vvlyt", "file_count": 3},
    "Heidi Klum": {"entity_id": "/m/01_n4s", "file_count": 1},
    "Tom Pritzker": {"entity_id": "/m/02rsv6n", "file_count": 9},
    "Mort Zuckerman": {"entity_id": "/m/02s0sy", "file_count": 7},
    "Harvey Weinstein": {"entity_id": "/m/03fg0k", "file_count": 5},
    "Woody Allen": {"entity_id": "/m/0bqvs", "file_count": 2},
    "Alec Baldwin": {"entity_id": "/m/0150t6", "file_count": 2},
    "Cameron Diaz": {"entity_id": "/m/0154qm", "file_count": 1},
    "Cate Blanchett": {"entity_id": "/m/0pyg6", "file_count": 1},
    "Hillary Clinton": {"entity_id": "/m/0d06m5", "file_count": 17},
    "Mick Jagger": {"entity_id": "/m/014gqr", "file_count": 3},
    "Minnie Driver": {"entity_id": "/m/0d0xs", "file_count": 1},
    "Noam Chomsky": {"entity_id": "/m/058s57", "file_count": 1},
    "Robert F. Kennedy Jr.": {"entity_id": "/m/033vny", "file_count": 2},
    "Kathryn Ruemmler": {"entity_id": None, "file_count": 7},
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
