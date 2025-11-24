#!/usr/bin/env python3
"""
Add verified entity IDs from Coffeezilla's collection to people_index.json
"""

import json
from urllib.parse import unquote

# Verified entities from your manual search
VERIFIED_ENTITIES = {
    "Bill Gates": ["/m/017nt", "%P%Bill_Gates"],
    "Elon Musk": ["/m/03nzf1"],
    "Michael Jackson": ["/m/09889g"], 
    "Naomi Campbell": ["/m/01pcrw", "%P%Naomi_Campbell"],
    "Peter Thiel": ["/m/02w8m6"],
    "David Copperfield": ["/m/01ppv3", "%P%David_Copperfield"],
    "Woody Allen": ["/m/081lh", "%P%Woody_Allen"]
}

# Choose primary entity ID for each (prefer /m/ format when available)
PRIMARY_ENTITIES = {
    "Bill Gates": "/m/017nt",
    "Elon Musk": "/m/03nzf1", 
    "Michael Jackson": "/m/09889g",
    "Naomi Campbell": "/m/01pcrw",
    "Peter Thiel": "/m/02w8m6",
    "David Copperfield": "/m/01ppv3", 
    "Woody Allen": "/m/081lh"
}

PEOPLE_INDEX_PATH = "../website/public/people_index.json"

def update_people_index():
    """Update people_index.json with verified entity IDs."""
    
    print("🔍 Adding verified entity IDs to people_index.json...")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    updated_count = 0
    
    for person in index['people']:
        person_name = person['display_name']
        
        if person_name in PRIMARY_ENTITIES:
            entity_id = PRIMARY_ENTITIES[person_name]
            person['pinpoint_entity_id'] = entity_id
            person['pinpoint_file_count'] = 0  # Will be populated when we get file counts
            updated_count += 1
            print(f"  ✅ {person_name}: {entity_id}")
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Updated {updated_count} people with entity IDs")
    print(f"📊 Total entities now: {17 + updated_count}/35")
    
    # Generate test URLs
    print(f"\n🔗 Test these on inepsteinfiles.com:")
    for name in PRIMARY_ENTITIES.keys():
        slug = name.lower().replace(" ", "-").replace(".", "")
        print(f"  • https://inepsteinfiles.com/{slug}")
    
    return updated_count

if __name__ == "__main__":
    update_people_index()