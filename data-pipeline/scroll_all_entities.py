#!/usr/bin/env python3
"""
Scroll through ALL entities in Coffeezilla's people search to find all our celebrities
"""

import asyncio
import json
from playwright.async_api import async_playwright

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

async def scroll_and_extract_all_entities(page):
    """Scroll through all entities and extract them."""
    
    print("🔍 Loading people page...")
    await page.goto(PEOPLE_PAGE_URL, wait_until="networkidle")
    await page.wait_for_timeout(3000)
    
    # Click People filter
    people_filter = await page.query_selector('text=People')
    if people_filter:
        print("📋 Clicking People filter...")
        await people_filter.click()
        await page.wait_for_timeout(3000)
    
    all_entities = {}  # Use dict to avoid duplicates
    
    print("📜 Scrolling through all entities...")
    
    last_count = 0
    no_change_cycles = 0
    
    for scroll_attempt in range(50):  # Max 50 scroll attempts
        # Get current entities
        entity_elements = await page.query_selector_all('[data-entity-id][data-entity-name]')
        
        print(f"  Scroll {scroll_attempt + 1}: Found {len(entity_elements)} entities")
        
        # Extract entities
        for element in entity_elements:
            try:
                entity_id = await element.get_attribute('data-entity-id')
                entity_name = await element.get_attribute('data-entity-name')
                element_text = await element.inner_text()
                
                # Extract file count
                import re
                count_match = re.search(r'(\d+(?:,\d+)*)', element_text)
                file_count = 0
                if count_match:
                    file_count = int(count_match.group(1).replace(',', ''))
                
                if entity_id and entity_name:
                    # Use entity_id as key to avoid duplicates
                    all_entities[entity_id] = {
                        'name': entity_name,
                        'entity_id': entity_id,
                        'file_count': file_count
                    }
                    
                    # Check if it's one of our curated names
                    if entity_name in CURATED_NAMES:
                        print(f"    🎯 FOUND: {entity_name} ({file_count:,} files)")
            except:
                continue
        
        current_count = len(all_entities)
        
        # Check if we found new entities
        if current_count == last_count:
            no_change_cycles += 1
            if no_change_cycles >= 3:  # Stop if no new entities for 3 cycles
                print(f"    No new entities found for 3 cycles, stopping...")
                break
        else:
            no_change_cycles = 0
            last_count = current_count
        
        # Scroll down to load more entities
        try:
            # Try scrolling the entity list container
            await page.evaluate("""
                const container = document.querySelector('[data-entity-id]')?.parentElement?.parentElement;
                if (container) {
                    container.scrollTop += 500;
                } else {
                    window.scrollBy(0, 500);
                }
            """)
            await page.wait_for_timeout(1500)
            
            # Also try pressing Page Down
            await page.keyboard.press('PageDown')
            await page.wait_for_timeout(1000)
            
        except Exception as e:
            print(f"    Scroll error: {e}")
            break
    
    entity_list = list(all_entities.values())
    entity_list.sort(key=lambda x: x['file_count'], reverse=True)  # Sort by file count
    
    print(f"\n📊 Total unique entities found: {len(entity_list)}")
    
    return entity_list

def match_curated_names(all_entities):
    """Find all our curated names in the extracted entities."""
    
    print(f"\n🎯 Searching for our 35 curated names...")
    
    matches = []
    found_names = set()
    
    # Create lookup for faster searching
    entity_lookup = {entity['name'].lower(): entity for entity in all_entities}
    
    for curated_name in CURATED_NAMES:
        curated_lower = curated_name.lower()
        
        # Try exact match
        if curated_lower in entity_lookup:
            entity = entity_lookup[curated_lower]
            matches.append({
                'curated_name': curated_name,
                'entity': entity,
                'match_type': 'exact'
            })
            found_names.add(curated_name)
            print(f"  ✅ {curated_name}: {entity['entity_id']} ({entity['file_count']:,} files)")
        else:
            # Try partial matches
            for entity in all_entities:
                entity_lower = entity['name'].lower()
                
                # Check if curated name words are in entity name
                curated_words = curated_lower.split()
                if len(curated_words) > 1:
                    if all(word in entity_lower for word in curated_words):
                        matches.append({
                            'curated_name': curated_name,
                            'entity': entity,
                            'match_type': 'partial'
                        })
                        found_names.add(curated_name)
                        print(f"  🔍 {curated_name} -> {entity['name']}: {entity['entity_id']} ({entity['file_count']:,} files)")
                        break
    
    # Show unmatched
    unmatched = [name for name in CURATED_NAMES if name not in found_names]
    print(f"\n❌ Still unmatched ({len(unmatched)}):")
    for name in unmatched:
        print(f"  • {name}")
    
    return matches

async def main():
    """Main execution."""
    
    print("🔍 Comprehensive Entity Search in Coffeezilla Collection\n")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Extract all entities with scrolling
        all_entities = await scroll_and_extract_all_entities(page)
        
        await browser.close()
    
    # Find matches for curated names
    matches = match_curated_names(all_entities)
    
    # Save results
    results = {
        'total_entities': len(all_entities),
        'matches_found': len(matches),
        'coverage': f"{len(matches)}/35",
        'all_entities': all_entities,
        'curated_matches': matches
    }
    
    with open('comprehensive_entity_search.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n🎉 Search Complete!")
    print(f"📊 Results:")
    print(f"  • Total entities found: {len(all_entities)}")
    print(f"  • Curated matches: {len(matches)}/35")
    print(f"  • Coverage: {len(matches)/35*100:.1f}%")
    print(f"💾 Saved to: comprehensive_entity_search.json")

if __name__ == "__main__":
    asyncio.run(main())