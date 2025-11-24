#!/usr/bin/env python3
"""
Scrape Coffeezilla's Pinpoint collection to extract entity data for celebrity names
and compare against existing collection data.
"""

import json
import time
import re
from playwright.sync_api import sync_playwright
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

# Existing data from my collection for comparison
MY_COLLECTION_DATA = {
    "Donald Trump": {"entity_id": "/m/0cqt90", "file_count": 44},
    "Bill Clinton": {"entity_id": "/m/0157m", "file_count": 46},
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
    "Hillary Clinton": {"entity_id": "/m/0d06m5", "file_count": 9},
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

def compare_collections(coffeezilla_entities):
    """Compare Coffeezilla's entities with my existing collection data."""
    
    results = {
        "totally_missing_from_my_collection": [],
        "undercounted_in_my_collection": []
    }
    
    for target_name in TARGET_NAMES:
        coffeezilla_data = coffeezilla_entities.get(target_name)
        my_data = MY_COLLECTION_DATA.get(target_name)
        
        if coffeezilla_data:
            my_file_count = my_data['file_count'] if my_data else 0
            coffeezilla_file_count = coffeezilla_data['file_count']
            
            if my_file_count == 0:
                # Totally missing from my collection
                results["totally_missing_from_my_collection"].append({
                    "name": coffeezilla_data['name'],
                    "entity_id": coffeezilla_data['entity_id'],
                    "file_count_coffeezilla": coffeezilla_file_count,
                    "file_count_mine": 0,
                    "status": "missing",
                    "coffeezilla_search_url": coffeezilla_data['coffeezilla_search_url']
                })
            elif coffeezilla_file_count > my_file_count:
                # Undercounted in my collection
                results["undercounted_in_my_collection"].append({
                    "name": coffeezilla_data['name'],
                    "entity_id": coffeezilla_data['entity_id'],
                    "file_count_coffeezilla": coffeezilla_file_count,
                    "file_count_mine": my_file_count,
                    "status": "undercounted",
                    "coffeezilla_search_url": coffeezilla_data['coffeezilla_search_url']
                })
    
    return {"comparison_results": results}

def main():
    """Main execution function."""
    
    # Create screenshots directory
    import os
    os.makedirs('screenshots', exist_ok=True)
    
    print("Starting Pinpoint entity scraping...")
    print(f"Looking for {len(TARGET_NAMES)} target names")
    print(f"Comparing against {len(MY_COLLECTION_DATA)} existing entities")
    
    # Scrape Coffeezilla's collection
    coffeezilla_entities = scrape_pinpoint_entities()
    
    print(f"\nFound {len(coffeezilla_entities)} matching entities in Coffeezilla's collection")
    
    # Compare with my collection
    comparison_results = compare_collections(coffeezilla_entities)
    
    # Save results
    output_file = 'pinpoint_entity_comparison.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(comparison_results, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {output_file}")
    
    # Print summary
    missing = comparison_results["comparison_results"]["totally_missing_from_my_collection"]
    undercounted = comparison_results["comparison_results"]["undercounted_in_my_collection"]
    
    print(f"\nSUMMARY:")
    print(f"- Totally missing from my collection: {len(missing)}")
    print(f"- Undercounted in my collection: {len(undercounted)}")
    
    if missing:
        print("\nMissing entities:")
        for entity in missing:
            print(f"  - {entity['name']}: {entity['file_count_coffeezilla']} files")
    
    if undercounted:
        print("\nUndercounted entities:")
        for entity in undercounted:
            print(f"  - {entity['name']}: {entity['file_count_coffeezilla']} vs {entity['file_count_mine']} files")

if __name__ == "__main__":
    main()