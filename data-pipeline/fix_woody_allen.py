#!/usr/bin/env python3
"""
Fix Woody Allen's entity ID
"""

import json
from pathlib import Path

def fix_woody_allen():
    """Fix Woody Allen's incorrect entity ID"""
    
    # Load current JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    # Find and fix Woody Allen
    for person in data['people']:
        if person['display_name'] == 'Woody Allen':
            old_id = person.get('pinpoint_entity_id')
            person['pinpoint_entity_id'] = '/m/081lh'  # Correct entity ID
            print(f"✅ Fixed Woody Allen's entity ID:")
            print(f"   Old: {old_id}")
            print(f"   New: /m/081lh")
            break
    
    # Write updated JSON
    with open(people_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"📁 File saved: {people_path}")

if __name__ == "__main__":
    fix_woody_allen()