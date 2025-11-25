#!/usr/bin/env python3
"""
Process CSV updates from user's manual verification
Update people_index.json with correct document counts
"""

import json
import csv
from pathlib import Path

def process_csv_updates():
    """Process user's CSV updates and update people_index.json"""
    
    # Load current JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    # Create lookup by name
    people_by_name = {person['display_name']: person for person in data['people']}
    
    # Process CSV
    csv_path = "/Users/Me/Downloads/jsonfilesfix.csv"
    updates_made = 0
    
    print("🔄 Processing CSV updates...")
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            name = row['Name']
            done = row['Done '].strip().upper() == 'TRUE'
            yes_no = row['Yes/No'].strip().upper() == 'YES'
            new_count = row['New Count (Fill This)'].strip()
            
            # Skip if not done or no new count
            if not done or not new_count:
                continue
                
            try:
                new_count = int(new_count)
            except ValueError:
                print(f"⚠️  Invalid count for {name}: {new_count}")
                continue
            
            # Find person in JSON
            if name in people_by_name:
                person = people_by_name[name]
                old_count = person.get('pinpoint_file_count') or person.get('total_matches', 0)
                
                # Update the counts
                person['found_in_documents'] = yes_no
                person['pinpoint_file_count'] = new_count
                
                # Also update total_matches for consistency
                if 'total_matches' in person:
                    person['total_matches'] = new_count
                
                print(f"✅ {name}: {old_count} → {new_count} (YES={yes_no})")
                updates_made += 1
            else:
                print(f"⚠️  Name not found in JSON: {name}")
    
    # Write updated JSON
    with open(people_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎯 Updated {updates_made} entries in people_index.json")
    print(f"📁 File saved: {people_path}")

if __name__ == "__main__":
    process_csv_updates()