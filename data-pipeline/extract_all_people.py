#!/usr/bin/env python3
"""
Extract all people entities from Coffeezilla's collection using proper DOM structure
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

async def extract_all_people_entities(page):
    """Extract all people entities using the correct DOM structure."""
    
    print("🔍 Loading people page and extracting entities...")
    
    await page.goto(PEOPLE_PAGE_URL, wait_until="networkidle")
    await page.wait_for_timeout(3000)
    
    # Click on People filter to make sure we're on the right view
    people_filter = await page.query_selector('text=People')
    if people_filter:
        await people_filter.click()
        await page.wait_for_timeout(3000)
    
    # Find all entity elements
    entity_elements = await page.query_selector_all('[data-entity-id][data-entity-name]')
    
    print(f"📊 Found {len(entity_elements)} total entities")
    
    all_entities = []
    
    for i, element in enumerate(entity_elements):
        try:
            # Get entity ID and name from attributes
            entity_id = await element.get_attribute('data-entity-id')
            entity_name = await element.get_attribute('data-entity-name')
            
            # Extract file count from the element text
            element_text = await element.inner_text()
            
            # Parse the count (should be a number in the text)
            count_match = re.search(r'(\d+(?:,\d+)*)', element_text)
            file_count = 0
            if count_match:
                count_str = count_match.group(1).replace(',', '')
                file_count = int(count_str)
            
            if entity_id and entity_name:
                all_entities.append({
                    'name': entity_name,
                    'entity_id': entity_id, 
                    'file_count': file_count
                })
                
                print(f"  {i+1:2d}. {entity_name}: {entity_id} ({file_count:,} files)")
                
        except Exception as e:
            print(f"  ❌ Error processing element {i}: {e}")
    
    return all_entities

def find_matches_for_curated_names(all_entities):
    """Find matches between extracted entities and our curated names."""
    
    print(f"\n🎯 Matching {len(all_entities)} entities to our 35 curated names...")
    
    matches = []
    matched_names = set()
    
    for curated_name in CURATED_NAMES:
        best_match = None
        
        # Try exact match first
        for entity in all_entities:
            if entity['name'].lower().strip() == curated_name.lower().strip():
                best_match = {
                    'curated_name': curated_name,
                    'entity_name': entity['name'],
                    'entity_id': entity['entity_id'],
                    'file_count': entity['file_count'],
                    'match_type': 'exact'
                }
                break
        
        # Try partial matches if no exact match
        if not best_match:
            for entity in all_entities:
                entity_lower = entity['name'].lower()
                curated_lower = curated_name.lower()
                
                # Check if all words in curated name are in entity name
                curated_words = curated_lower.split()
                entity_words = entity_lower.split()
                
                if all(word in entity_lower for word in curated_words):
                    best_match = {
                        'curated_name': curated_name,
                        'entity_name': entity['name'],
                        'entity_id': entity['entity_id'],
                        'file_count': entity['file_count'],
                        'match_type': 'partial'
                    }
                    break
                
                # Check lastname match for longer names
                if len(curated_words) > 1 and len(entity_words) > 1:
                    if curated_words[-1] == entity_words[-1]:
                        best_match = {
                            'curated_name': curated_name,
                            'entity_name': entity['name'],
                            'entity_id': entity['entity_id'],
                            'file_count': entity['file_count'],
                            'match_type': 'lastname'
                        }
                        break
        
        if best_match:
            matches.append(best_match)
            matched_names.add(curated_name)
            match_type = best_match['match_type']
            print(f"  ✅ {curated_name} -> {best_match['entity_name']} ({match_type}): {best_match['file_count']:,} files")
    
    print(f"\n📊 Found {len(matches)} matches out of 35 curated names")
    
    # Show unmatched names
    unmatched = [name for name in CURATED_NAMES if name not in matched_names]
    if unmatched:
        print(f"\n❌ Unmatched names ({len(unmatched)}):")
        for name in unmatched:
            print(f"  • {name}")
    
    return matches

def update_people_index_with_all_matches(matches):
    """Update people_index.json with all matched entities."""
    
    print(f"\n📝 Updating people_index.json with {len(matches)} matches...")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    updated_count = 0
    
    for person in index['people']:
        person_name = person['display_name']
        
        for match in matches:
            if match['curated_name'] == person_name:
                # Update or add entity information
                person['pinpoint_entity_id'] = match['entity_id']
                person['pinpoint_file_count'] = match['file_count']
                updated_count += 1
                print(f"  ✅ {person_name}: {match['entity_id']} ({match['file_count']:,} files)")
                break
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Updated {updated_count} people in people_index.json")
    return updated_count

async def main():
    """Main execution."""
    
    print("🔍 Complete Entity Extraction from Coffeezilla Collection\n")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Extract all entities
        all_entities = await extract_all_people_entities(page)
        
        await browser.close()
    
    if all_entities:
        # Find matches for our curated names
        matches = find_matches_for_curated_names(all_entities)
        
        # Update people index
        updated_count = update_people_index_with_all_matches(matches)
        
        # Save complete results
        results = {
            'extraction_timestamp': '2025-11-24',
            'total_entities_extracted': len(all_entities),
            'all_entities': all_entities,
            'curated_matches': matches,
            'updated_count': updated_count,
            'final_coverage': f"{updated_count}/35"
        }
        
        with open('complete_coffeezilla_extraction.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n🎉 COMPLETE!")
        print(f"📊 Final Results:")
        print(f"  • Total entities in Coffeezilla: {len(all_entities)}")
        print(f"  • Matches found: {len(matches)}")
        print(f"  • Coverage: {updated_count}/35 curated names ({updated_count/35*100:.1f}%)")
        print(f"💾 Complete data saved to: complete_coffeezilla_extraction.json")
        
        if updated_count > 0:
            print(f"\n🔗 Test these updated entities on inepsteinfiles.com:")
            for match in matches[-5:]:  # Show last 5
                slug = match['curated_name'].lower().replace(" ", "-").replace(".", "")
                print(f"  • https://inepsteinfiles.com/{slug}")

if __name__ == "__main__":
    asyncio.run(main())