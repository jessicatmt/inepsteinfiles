#!/usr/bin/env python3
"""
Fix Rupert Murdoch's file count
"""

import json
from pathlib import Path

def fix_rupert_murdoch():
    """Fix Rupert Murdoch's missing file count"""
    
    # Load current JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    # Find and fix Rupert Murdoch
    for person in data['people']:
        if person['display_name'] == 'Rupert Murdoch':
            old_count = person.get('pinpoint_file_count')
            person['pinpoint_file_count'] = 12  # Correct count as mentioned
            print(f"✅ Fixed Rupert Murdoch's file count:")
            print(f"   Old: {old_count}")
            print(f"   New: 12")
            break
    
    # Write updated JSON
    with open(people_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"📁 File saved: {people_path}")

if __name__ == "__main__":
    fix_rupert_murdoch()