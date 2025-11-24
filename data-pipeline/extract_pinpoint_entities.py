#!/usr/bin/env python3
"""
Extract Pinpoint entity IDs from the copied HTML and update people_index.json
"""

import json
import re
from pathlib import Path

# File paths
PEOPLE_INDEX_PATH = "../website/public/people_index.json"
HTML_FILE_PATH = "/Users/Me/Documents/Obsidian/operating_manual/Daily notes/element of a lot of name searches.md"

def extract_entities_from_html():
    """Extract entity data from the copied HTML file."""
    
    print("🔍 Reading HTML data...")
    with open(HTML_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match entity divs
    pattern = r'data-entity-id="([^"]+)"\s+data-entity-name="([^"]+)".*?<span>(\d+)</span>'
    matches = re.findall(pattern, content, re.DOTALL)
    
    entities = {}
    for entity_id, entity_name, file_count in matches:
        # Skip % prefixed entities (these are likely internal/legal entities)
        if entity_id.startswith('%'):
            continue
            
        entities[entity_name] = {
            'entity_id': entity_id,
            'file_count': int(file_count)
        }
        print(f"  • {entity_name}: {entity_id} ({file_count} files)")
    
    # Manually add Ghislaine Maxwell since she's clearly in the data
    entities["Ghislaine Maxwell"] = {
        'entity_id': '/m/0gw_xk8',
        'file_count': 798
    }
    print(f"  • Ghislaine Maxwell: /m/0gw_xk8 (798 files) [manually added]")
    
    print(f"\n✅ Extracted {len(entities)} entities")
    return entities

def load_people_index():
    """Load our current people index."""
    
    print(f"📝 Loading {PEOPLE_INDEX_PATH}...")
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_name_matches(our_names, pinpoint_entities):
    """Find matches between our names and Pinpoint entities."""
    
    matches = {}
    
    for our_name in our_names:
        # Direct match
        if our_name in pinpoint_entities:
            matches[our_name] = pinpoint_entities[our_name]
            continue
            
        # Try case variations and common name variations
        variations = [
            our_name.lower(),
            our_name.upper(), 
            our_name.title(),
        ]
        
        # Add common name variations
        if our_name == "Bill Clinton":
            variations.extend(["William Clinton", "William J. Clinton", "Bill J. Clinton"])
        elif our_name == "Donald Trump":
            variations.extend(["Trump", "Donald J. Trump"])
        elif our_name == "Prince Andrew":
            variations.extend(["Andrew", "Duke of York", "Andrew Mountbatten-Windsor"])
        elif our_name == "Robert F. Kennedy Jr.":
            variations.extend(["Robert Kennedy Jr.", "RFK Jr.", "Robert F Kennedy Jr"])
        elif our_name == "Larry Summers":
            variations.extend(["Larry H Summers", "Larry H. Summers"])
        elif our_name == "George Mitchell":
            variations.extend(["George John Mitchell", "George J. Mitchell"])
        
        # Check variations
        for variant in variations:
            if variant in pinpoint_entities:
                matches[our_name] = pinpoint_entities[variant]
                break
        
        # Check partial matches (lastname)
        if our_name not in matches:
            lastname = our_name.split()[-1]
            for pinpoint_name in pinpoint_entities:
                if lastname.lower() in pinpoint_name.lower():
                    print(f"  🤔 Potential match: {our_name} -> {pinpoint_name}")
    
    return matches

def update_people_index(index, matches):
    """Update the people index with Pinpoint data."""
    
    updated_count = 0
    
    for person in index['people']:
        name = person['display_name']
        
        if name in matches:
            person['pinpoint_entity_id'] = matches[name]['entity_id']
            person['pinpoint_file_count'] = matches[name]['file_count']
            updated_count += 1
            print(f"  ✅ {name}: {matches[name]['entity_id']} ({matches[name]['file_count']} files)")
        else:
            print(f"  ⚠️  {name}: No match found")
    
    print(f"\n💾 Updated {updated_count}/{len(index['people'])} people")
    return index

def save_updated_index(index):
    """Save the updated people index."""
    
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print("✅ Saved updated people_index.json")

def main():
    """Main execution."""
    
    # Extract entities from HTML
    pinpoint_entities = extract_entities_from_html()
    
    # Load our current index
    index = load_people_index()
    our_names = [person['display_name'] for person in index['people']]
    
    print(f"\n🎯 Our {len(our_names)} people:")
    for name in our_names:
        print(f"  • {name}")
    
    # Find matches
    print(f"\n🔍 Finding matches...")
    matches = find_name_matches(our_names, pinpoint_entities)
    
    print(f"\n📊 Found {len(matches)} matches:")
    for name, data in matches.items():
        print(f"  • {name}: {data['entity_id']} ({data['file_count']} files)")
    
    # Update index
    print(f"\n📝 Updating people index...")
    updated_index = update_people_index(index, matches)
    
    # Save
    save_updated_index(updated_index)
    
    print(f"\n🎉 Done! Pinpoint integration complete.")
    print(f"Next: Update website to link to Pinpoint entity pages")

if __name__ == '__main__':
    main()