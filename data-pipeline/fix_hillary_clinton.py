#!/usr/bin/env python3
"""
Fix Hillary Clinton's entity ID (was using Bill's)
"""

import json
from pathlib import Path

def fix_hillary_clinton():
    """Fix Hillary Clinton's incorrect entity ID"""
    
    # Load current JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    # Find and fix Hillary Clinton
    for person in data['people']:
        if person['display_name'] == 'Hillary Clinton':
            old_id = person.get('pinpoint_entity_id')
            person['pinpoint_entity_id'] = '/m/0d06m5'  # Hillary's correct entity ID
            # Also update the count to 17 as mentioned in the issue
            old_count = person.get('pinpoint_file_count')
            person['pinpoint_file_count'] = 17
            print(f"✅ Fixed Hillary Clinton:")
            print(f"   Entity ID: {old_id} → /m/0d06m5")
            print(f"   File count: {old_count} → 17")
            break
    
    # Write updated JSON
    with open(people_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"📁 File saved: {people_path}")

if __name__ == "__main__":
    fix_hillary_clinton()