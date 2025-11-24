#!/usr/bin/env python3
"""
Scrape entity IDs and file counts from Pinpoint people search page.
This allows us to link directly to entity pages for accurate results.
"""

import json
import time
from playwright.sync_api import sync_playwright

PINPOINT_PEOPLE_URL = "https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2"
PEOPLE_INDEX_PATH = "../website/public/people_index.json"

def scrape_entity_data():
    """Scrape entity IDs and document counts from Pinpoint."""

    print("🔍 Launching browser to scrape Pinpoint entity data...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to True for production
        page = browser.new_page()

        print(f"📄 Loading {PINPOINT_PEOPLE_URL}")
        page.goto(PINPOINT_PEOPLE_URL)

        # Wait for entity elements to load
        print("⏳ Waiting for people entities to load...")
        page.wait_for_selector('[data-entity-id]', timeout=30000)
        time.sleep(3)  # Extra wait for dynamic content

        # Extract all entity elements
        entity_elements = page.query_selector_all('[data-entity-id]')
        print(f"✅ Found {len(entity_elements)} entities")

        entity_data = {}

        for element in entity_elements:
            # Get entity ID from data attribute
            entity_id = element.get_attribute('data-entity-id')

            # Get entity name from text content
            entity_name_elem = element.query_selector('.entity-name, [class*="name"]')
            entity_name = entity_name_elem.inner_text().strip() if entity_name_elem else None

            # Get document count
            count_elem = element.query_selector('.entity-count, [class*="count"]')
            if count_elem:
                count_text = count_elem.inner_text().strip()
                # Extract number from text like "44" or "44 documents"
                doc_count = int(''.join(filter(str.isdigit, count_text)))
            else:
                doc_count = 0

            if entity_name and entity_id:
                entity_data[entity_name] = {
                    'entity_id': entity_id,
                    'file_count': doc_count
                }
                print(f"  • {entity_name}: {entity_id} ({doc_count} files)")

        browser.close()
        return entity_data

def update_people_index(entity_data):
    """Update people_index.json with entity IDs and file counts."""

    print(f"\n📝 Loading {PEOPLE_INDEX_PATH}...")
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)

    updated_count = 0

    for person in index['people']:
        name = person['display_name']

        if name in entity_data:
            person['pinpoint_entity_id'] = entity_data[name]['entity_id']
            person['pinpoint_file_count'] = entity_data[name]['file_count']
            updated_count += 1
            print(f"  ✅ {name}: {entity_data[name]['entity_id']} ({entity_data[name]['file_count']} files)")
        else:
            print(f"  ⚠️  {name}: Not found in Pinpoint entities")

    print(f"\n💾 Saving updated index...")
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {updated_count}/{len(index['people'])} people with entity data")

if __name__ == '__main__':
    try:
        entity_data = scrape_entity_data()
        update_people_index(entity_data)
        print("\n🎉 Done! Entity IDs and file counts updated.")
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
