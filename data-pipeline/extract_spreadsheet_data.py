#!/usr/bin/env python3
"""
Extract all names from people_index.json into spreadsheet format
"""

import json
from pathlib import Path

def extract_spreadsheet_data():
    """Extract data for spreadsheet"""
    
    # Load JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    print("Name\tYes/No\tDocs Count\tPinpoint Search URL")
    print("=" * 80)
    
    for person in data['people']:
        name = person['display_name']
        yes_no = "YES" if person.get('found_in_documents') else "NO"
        
        # Get doc count - prefer pinpoint_file_count, fallback to total_matches
        doc_count = person.get('pinpoint_file_count')
        if doc_count is None:
            doc_count = person.get('total_matches', 0)
        
        # Build Pinpoint URL - simpler format for Google Sheets
        entity_id = person.get('pinpoint_entity_id')
        if entity_id:
            pinpoint_url = f"journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&entities={entity_id}"
        else:
            pinpoint_url = "NO_ENTITY_ID"
        
        print(f"{name}\t{yes_no}\t{doc_count}\t{pinpoint_url}")

if __name__ == "__main__":
    extract_spreadsheet_data()