#!/usr/bin/env python3
"""
Create a Google Sheets friendly CSV file
"""

import json
import csv
from pathlib import Path

def create_csv():
    """Create CSV file for Google Sheets"""
    
    # Load JSON
    people_path = Path("../website/public/people_index.json")
    with open(people_path, 'r') as f:
        data = json.load(f)
    
    # Create CSV file
    csv_path = Path("people_data.csv")
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Header
        writer.writerow(['Name', 'Yes/No', 'Current Count', 'Entity ID', 'New Count (Fill This)'])
        
        # Data rows
        for person in data['people']:
            name = person['display_name']
            yes_no = "YES" if person.get('found_in_documents') else "NO"
            
            # Get doc count
            doc_count = person.get('pinpoint_file_count')
            if doc_count is None:
                doc_count = person.get('total_matches', 0)
            
            # Entity ID only (easier to work with)
            entity_id = person.get('pinpoint_entity_id', 'NO_ENTITY_ID')
            
            # Empty column for new count
            new_count = ""
            
            writer.writerow([name, yes_no, doc_count, entity_id, new_count])
    
    print(f"✅ CSV created: {csv_path}")
    print(f"📁 Import this file into Google Sheets")
    print(f"📋 Use the Entity ID column to build your Pinpoint URLs")
    print(f"📝 Fill in the 'New Count' column with real counts")

if __name__ == "__main__":
    create_csv()