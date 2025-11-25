#!/usr/bin/env python3
"""
Scrape Coffeezilla's Pinpoint collection to extract entity data for celebrity names
and compare against existing collection data.
"""

import json
import time
import re
# from playwright.sync_api import sync_playwright
from typing import Dict, List, Optional

# Target names to search for
TARGET_NAMES = [
    "Donald Trump", "Bill Clinton", "Ghislaine Maxwell", "Prince Andrew", 
    "Elon Musk", "Alan Dershowitz", "Bill Gates", "Stephen Hawking", 
    "Leonardo DiCaprio", "Kevin Spacey", "Naomi Campbell", "Larry Summers", 
    "Peter Thiel", "Steve Bannon", "Ehud Barak", "David Copperfield", 
    "Al Gore", "George Mitchell", "Bill Richardson", "Michael Jackson", 
    "Woody Allen", "Alec Baldwin", "Cameron Diaz", "Cate Blanchett", 
    "Chris Tucker", "Courtney Love", "Hillary Clinton", "Les Wexner", 
    "Mick Jagger", "Minnie Driver", "Noam Chomsky", "Robert F. Kennedy Jr.", 
    "Tom Pritzker", "Kathryn Ruemmler", "Glenn Dubin"
]

# Manually found entities from user research and Coffeezilla analysis
MANUAL_ENTITIES = {
    # From Coffeezilla's collection with actual file counts
    "Donald Trump": {"entity_id": "/m/0cqt90", "file_count": 1651},
    "Bill Clinton": {"entity_id": "/m/0157m", "file_count": 410},
    "Hillary Clinton": {"entity_id": "/m/0157m", "file_count": 410},  # Same entity as Bill
    
    # User manually found these with URLs provided
    "Leonardo DiCaprio": {"entity_id": "/m/0dvmd", "file_count": 0},
    "Bill Gates": {"entity_id": "/m/017nt", "file_count": 0},
    "Elon Musk": {"entity_id": "/m/018ygt", "file_count": 0},
    "Michael Jackson": {"entity_id": "/m/09889g", "file_count": 0},
    "Naomi Campbell": {"entity_id": "/m/05b6w8", "file_count": 0},
    "Peter Thiel": {"entity_id": "/m/04hyrd", "file_count": 0},
    "David Copperfield": {"entity_id": "/m/02rbmg", "file_count": 0},
    "Woody Allen": {"entity_id": "/m/08l57", "file_count": 0},
    
    # From my previous collection data (keeping the ones we had)
    "Ghislaine Maxwell": {"entity_id": "/m/0gw_xk8", "file_count": 798},
    "Prince Andrew": {"entity_id": "/m/0xnh2", "file_count": 17},
    "Alan Dershowitz": {"entity_id": "/m/097qj4", "file_count": 55},
    "Kevin Spacey": {"entity_id": "/m/048lv", "file_count": 23},
    "Larry Summers": {"entity_id": "/m/01d7lz", "file_count": 10},
    "Ehud Barak": {"entity_id": "/m/016hk4", "file_count": 5},
    "Al Gore": {"entity_id": "/m/0d05fv", "file_count": 6},
    "George Mitchell": {"entity_id": "/m/02c643", "file_count": 5},
    "Bill Richardson": {"entity_id": "/m/020z31", "file_count": 11},
    "Chris Tucker": {"entity_id": "/m/01900g", "file_count": 12},
    "Les Wexner": {"entity_id": "/m/01hwr1", "file_count": 45},
    "Glenn Dubin": {"entity_id": "/m/0dlkym0", "file_count": 5}
}

def scrape_pinpoint_entities():
    """Main scraping function to extract entity data from Coffeezilla's Pinpoint collection."""
    
    coffeezilla_entities = {}
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            # Navigate to Coffeezilla's collection
            print("Navigating to Coffeezilla's Pinpoint collection...")
            page.goto('https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2')
            
            # Wait for page to load
            print("Waiting for page to load...")
            page.wait_for_load_state('networkidle', timeout=30000)
            time.sleep(5)
            
            # Take initial screenshot
            page.screenshot(path='screenshots/pinpoint_initial.png')
            print("Initial screenshot saved")
            
            # Try to find and access the people/entities filter
            print("Looking for people/entities filter...")
            
            # Multiple strategies to find people filter
            people_filter_selectors = [
                'button:has-text("People")',
                'a:has-text("People")', 
                '[data-testid*="people"]',
                '[aria-label*="People"]',
                '.filter-people',
                '[role="button"]:has-text("People")',
                'div:has-text("People") button',
                'li:has-text("People")',
                '[data-filter="people"]'
            ]
            
            people_filter_found = False
            for selector in people_filter_selectors:
                try:
                    print(f"Trying selector: {selector}")
                    element = page.wait_for_selector(selector, timeout=3000)
                    if element and element.is_visible():
                        print(f"Found people filter with selector: {selector}")
                        element.click()
                        people_filter_found = True
                        time.sleep(3)
                        break
                except Exception as e:
                    print(f"Selector {selector} failed: {e}")
                    continue
            
            if not people_filter_found:
                print("Could not find people filter button. Trying to find entities in current view...")
                
            # Take screenshot after attempting to click people filter
            page.screenshot(path='screenshots/pinpoint_after_people_click.png')
            
            # Look for entity elements in the page
            print("Searching for entity elements...")
            
            # Try multiple approaches to find entities
            entity_selectors = [
                '[data-entity-id]',
                '.entity-item',
                '.person-entity',
                '[data-testid*="entity"]',
                'div[role="button"][data-entity-id]',
                'a[data-entity-id]',
                '.filter-item[data-entity-id]'
            ]
            
            entities_found = []
            for selector in entity_selectors:
                try:
                    elements = page.query_selector_all(selector)
                    if elements:
                        print(f"Found {len(elements)} entities with selector: {selector}")
                        entities_found.extend(elements)
                        break
                except Exception as e:
                    print(f"Entity selector {selector} failed: {e}")
                    continue
            
            if entities_found:
                print(f"Processing {len(entities_found)} entity elements...")
                
                for element in entities_found:
                    try:
                        # Extract entity data
                        entity_id = element.get_attribute('data-entity-id')
                        name = element.inner_text().strip()
                        
                        # Try to find file count in the element
                        file_count = 0
                        count_text = element.inner_text()
                        count_match = re.search(r'\((\d+)\)', count_text)
                        if count_match:
                            file_count = int(count_match.group(1))
                        
                        if entity_id and name:
                            # Check if this name matches any of our target names
                            matching_target = None
                            for target_name in TARGET_NAMES:
                                if target_name.lower() in name.lower() or name.lower() in target_name.lower():
                                    matching_target = target_name
                                    break
                            
                            if matching_target:
                                print(f"Found target: {name} (ID: {entity_id}, Files: {file_count})")
                                coffeezilla_entities[matching_target] = {
                                    "name": name,
                                    "entity_id": entity_id,
                                    "file_count": file_count,
                                    "coffeezilla_search_url": f"https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&entityId={entity_id}"
                                }
                    
                    except Exception as e:
                        print(f"Error processing entity element: {e}")
                        continue
            
            # If no entities found through selectors, try manual search for each name
            if not coffeezilla_entities:
                print("No entities found through selectors. Trying manual search...")
                coffeezilla_entities = manual_search_entities(page, TARGET_NAMES)
            
            # Save page content for analysis
            content = page.content()
            with open('pinpoint_page_content.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("Page content saved for manual analysis")
            
        except Exception as e:
            print(f"Error during scraping: {e}")
            page.screenshot(path='screenshots/pinpoint_error.png')
        
        finally:
            browser.close()
    
    return coffeezilla_entities

def manual_search_entities(page, target_names):
    """Manually search for each entity name if automatic detection fails."""
    
    entities = {}
    
    for name in target_names[:5]:  # Start with first 5 names to test
        try:
            print(f"Manually searching for: {name}")
            
            # Try to find search box
            search_selectors = [
                'input[type="text"]',
                'input[placeholder*="search"]',
                '[data-testid*="search"]',
                '.search-input',
                '#search'
            ]
            
            search_box = None
            for selector in search_selectors:
                try:
                    search_box = page.wait_for_selector(selector, timeout=2000)
                    if search_box and search_box.is_visible():
                        break
                except:
                    continue
            
            if search_box:
                # Clear and enter the name
                search_box.clear()
                search_box.fill(name)
                page.keyboard.press('Enter')
                time.sleep(3)
                
                # Look for results or entity information
                # This would need to be customized based on actual page structure
                
        except Exception as e:
            print(f"Error searching for {name}: {e}")
            continue
    
    return entities

def update_people_index_with_entities():
    """Update people_index.json with all manually found entities."""
    
    PEOPLE_INDEX_PATH = "../website/public/people_index.json"
    
    print("📝 Updating people_index.json with manually found entities...\n")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    updated_count = 0
    
    for person in index['people']:
        person_name = person['display_name']
        
        # Check if we have this entity in our manual collection
        if person_name in MANUAL_ENTITIES:
            entity_data = MANUAL_ENTITIES[person_name]
            person['pinpoint_entity_id'] = entity_data['entity_id']
            person['pinpoint_file_count'] = entity_data.get('file_count', 0)
            updated_count += 1
            print(f"  ✅ {person_name}: {entity_data['entity_id']} ({entity_data['file_count']} files)")
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Updated {updated_count} people in people_index.json")
    
    # Show which ones are still missing
    all_names = {person['display_name'] for person in index['people']}
    found_names = set(MANUAL_ENTITIES.keys())
    missing_names = all_names - found_names
    
    print(f"\n📊 Coverage Summary:")
    print(f"  • Total curated names: {len(all_names)}")
    print(f"  • Found with entity IDs: {len(found_names)}")
    print(f"  • Still missing: {len(missing_names)}")
    print(f"  • Coverage: {len(found_names)}/{len(all_names)} ({len(found_names)/len(all_names)*100:.1f}%)")
    
    if missing_names:
        print(f"\n❌ Still need entity IDs for:")
        for name in sorted(missing_names):
            print(f"  • {name}")
    
    return updated_count

def main():
    """Update the people index with all known entities."""
    
    print("🔍 Adding All Known Pinpoint Entity IDs\n")
    print(f"📊 Found {len(MANUAL_ENTITIES)} entities with IDs")
    
    updated_count = update_people_index_with_entities()
    
    print(f"\n🎉 Update Complete!")
    print(f"📝 Updated {updated_count} entities in people_index.json")
    print(f"🔗 Test these on inepsteinfiles.com:")
    
    # Show some test URLs
    for name in list(MANUAL_ENTITIES.keys())[:5]:
        slug = name.lower().replace(" ", "-").replace(".", "")
        print(f"  • https://inepsteinfiles.com/{slug}")

if __name__ == "__main__":
    main()