#!/usr/bin/env python3
"""
Scrape all entities from Coffeezilla's people search sidebar
"""

import asyncio
import json
import re
from playwright.async_api import async_playwright

# Our 35 curated names for matching
CURATED_NAMES = [
    "Donald Trump", "Bill Clinton", "Ghislaine Maxwell", "Prince Andrew", "Elon Musk",
    "Alan Dershowitz", "Bill Gates", "Stephen Hawking", "Leonardo DiCaprio", "Kevin Spacey", 
    "Naomi Campbell", "Larry Summers", "Peter Thiel", "Steve Bannon", "Ehud Barak",
    "David Copperfield", "Al Gore", "George Mitchell", "Bill Richardson", "Michael Jackson",
    "Woody Allen", "Alec Baldwin", "Cameron Diaz", "Cate Blanchett", "Chris Tucker",
    "Courtney Love", "Hillary Clinton", "Les Wexner", "Mick Jagger", "Minnie Driver",
    "Noam Chomsky", "Robert F. Kennedy Jr.", "Tom Pritzker", "Kathryn Ruemmler", "Glenn Dubin"
]

PEOPLE_PAGE_URL = "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2"
PEOPLE_INDEX_PATH = "../website/public/people_index.json"

async def scrape_people_sidebar(page):
    """Scrape all entities from the people sidebar."""
    
    print("🔍 Loading Coffeezilla's people search page...")
    
    try:
        await page.goto(PEOPLE_PAGE_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)  # Wait for sidebar to load
        
        print("📋 Extracting entities from sidebar...")
        
        # Look for entity elements in sidebar - they should have data-entity-id attributes
        entity_elements = await page.query_selector_all('[data-entity-id]')
        
        if not entity_elements:
            # Try alternative selectors
            entity_elements = await page.query_selector_all('.entity-item, .person-item, [class*="entity"], [class*="person"]')
        
        entities = []
        
        for element in entity_elements:
            try:
                # Get entity ID
                entity_id = await element.get_attribute('data-entity-id')
                
                # Get entity name
                name_element = await element.query_selector('.entity-name, .person-name, [class*="name"]')
                if not name_element:
                    # Try getting text directly from element
                    element_text = await element.inner_text()
                    # Extract name (first line usually)
                    name = element_text.split('\n')[0].strip()
                else:
                    name = await name_element.inner_text()
                    name = name.strip()
                
                # Get file count
                count_element = await element.query_selector('.count, .file-count, [class*="count"]')
                file_count = 0
                
                if count_element:
                    count_text = await count_element.inner_text()
                    count_match = re.search(r'(\d+)', count_text)
                    if count_match:
                        file_count = int(count_match.group(1))
                else:
                    # Try to extract from element text
                    element_text = await element.inner_text()
                    count_match = re.search(r'(\d+)', element_text)
                    if count_match:
                        file_count = int(count_match.group(1))
                
                if entity_id and name:
                    entities.append({
                        'name': name,
                        'entity_id': entity_id,
                        'file_count': file_count
                    })
                    print(f"  • {name}: {entity_id} ({file_count} files)")
                    
            except Exception as e:
                print(f"  ❌ Error processing element: {e}")
                continue
        
        print(f"\n✅ Extracted {len(entities)} total entities from sidebar")
        return entities
        
    except Exception as e:
        print(f"❌ Error loading page: {e}")
        return []

def match_entities_to_curated(entities):
    """Match extracted entities to our curated names."""
    
    print(f"\n🎯 Matching entities to our 35 curated names...")
    
    matches = []
    
    for curated_name in CURATED_NAMES:
        # Try exact match first
        for entity in entities:
            if entity['name'].lower() == curated_name.lower():
                matches.append({
                    'curated_name': curated_name,
                    'entity_name': entity['name'],
                    'entity_id': entity['entity_id'],
                    'file_count': entity['file_count'],
                    'match_type': 'exact'
                })
                print(f"  ✅ {curated_name}: {entity['entity_id']} ({entity['file_count']} files)")
                break
        else:
            # Try partial/fuzzy matches
            for entity in entities:
                # Check if last name matches
                curated_last = curated_name.split()[-1].lower()
                entity_last = entity['name'].split()[-1].lower()
                
                if curated_last == entity_last and len(curated_last) > 3:
                    matches.append({
                        'curated_name': curated_name,
                        'entity_name': entity['name'],
                        'entity_id': entity['entity_id'],
                        'file_count': entity['file_count'],
                        'match_type': 'lastname'
                    })
                    print(f"  🤔 {curated_name} -> {entity['name']}: {entity['entity_id']} ({entity['file_count']} files)")
                    break
    
    print(f"\n📊 Found {len(matches)} matches out of {len(CURATED_NAMES)} curated names")
    return matches

def update_people_index_with_matches(matches):
    """Update people_index.json with matched entities."""
    
    print(f"\n📝 Updating people_index.json...")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    updated_count = 0
    
    for person in index['people']:
        person_name = person['display_name']
        
        for match in matches:
            if match['curated_name'] == person_name:
                person['pinpoint_entity_id'] = match['entity_id']
                person['pinpoint_file_count'] = match['file_count']
                updated_count += 1
                print(f"  ✅ {person_name}: {match['entity_id']} ({match['file_count']} files)")
                break
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Updated {updated_count} people in index")
    return updated_count

async def main():
    """Main scraping and updating process."""
    
    print("🔍 Scraping Coffeezilla People Sidebar for All Entities\n")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        # Set viewport
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Scrape all entities from sidebar
        entities = await scrape_people_sidebar(page)
        
        await browser.close()
    
    if entities:
        # Match to our curated names
        matches = match_entities_to_curated(entities)
        
        # Update people index
        if matches:
            updated_count = update_people_index_with_matches(matches)
            
            print(f"\n🎉 Complete! Updated {updated_count} entities")
            print(f"📊 Total coverage: {updated_count}/35 curated names")
            
            # Save all results for reference
            with open('all_coffeezilla_entities.json', 'w') as f:
                json.dump({
                    'total_entities': len(entities),
                    'all_entities': entities,
                    'matches': matches,
                    'updated_count': updated_count
                }, f, indent=2)
            
            print(f"💾 Saved complete results to all_coffeezilla_entities.json")
        
    return entities

if __name__ == "__main__":
    asyncio.run(main())