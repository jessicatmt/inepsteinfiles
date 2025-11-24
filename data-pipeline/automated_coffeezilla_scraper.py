#!/usr/bin/env python3
"""
Automated scraper for Coffeezilla's Pinpoint collection to find entity IDs and file counts
"""

import asyncio
import json
import time
from playwright.async_api import async_playwright

# Our 35 curated names
CURATED_NAMES = [
    "Donald Trump", "Bill Clinton", "Ghislaine Maxwell", "Prince Andrew", "Elon Musk",
    "Alan Dershowitz", "Bill Gates", "Stephen Hawking", "Leonardo DiCaprio", "Kevin Spacey", 
    "Naomi Campbell", "Larry Summers", "Peter Thiel", "Steve Bannon", "Ehud Barak",
    "David Copperfield", "Al Gore", "George Mitchell", "Bill Richardson", "Michael Jackson",
    "Woody Allen", "Alec Baldwin", "Cameron Diaz", "Cate Blanchett", "Chris Tucker",
    "Courtney Love", "Hillary Clinton", "Les Wexner", "Mick Jagger", "Minnie Driver",
    "Noam Chomsky", "Robert F. Kennedy Jr.", "Tom Pritzker", "Kathryn Ruemmler", "Glenn Dubin"
]

# Current data from my collection
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

COFFEEZILLA_COLLECTION = "061ce61c9e70bdfd"
MY_COLLECTION = "7185d6ee2381569d"

async def search_entity_in_coffeezilla(page, name):
    """Search for an entity in Coffeezilla's collection."""
    
    search_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&p=1&q={name.replace(' ', '%20')}"
    
    print(f"🔍 Searching for: {name}")
    print(f"    URL: {search_url}")
    
    try:
        # Navigate to search page
        await page.goto(search_url, wait_until="networkidle")
        await page.wait_for_timeout(3000)  # Wait for results to load
        
        # Look for entity results in the people section
        # Try to find clickable person elements
        person_elements = await page.query_selector_all('[data-entity-id]')
        
        entity_found = None
        for element in person_elements:
            entity_id = await element.get_attribute('data-entity-id')
            element_text = await element.inner_text()
            
            # Check if this element contains our target name
            if name.lower() in element_text.lower():
                # Try to extract file count
                file_count_element = await element.query_selector('.entity-count, [class*="count"], span:has-text("documents")')
                file_count = 0
                
                if file_count_element:
                    count_text = await file_count_element.inner_text()
                    # Extract number from text
                    import re
                    count_match = re.search(r'(\d+)', count_text)
                    if count_match:
                        file_count = int(count_match.group(1))
                
                entity_found = {
                    "name": name,
                    "entity_id": entity_id,
                    "file_count_coffeezilla": file_count,
                    "coffeezilla_search_url": f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&p=1&entities={entity_id}"
                }
                break
        
        if not entity_found:
            # Try alternative approach - look for any results and click to get entity URL
            search_results = await page.query_selector_all('.search-result, .result-item, [data-testid*="result"]')
            
            for result in search_results:
                result_text = await result.inner_text()
                if name.lower() in result_text.lower():
                    # Try clicking and see if URL changes to include entity ID
                    await result.click()
                    await page.wait_for_timeout(2000)
                    
                    current_url = page.url
                    if 'entities=' in current_url:
                        # Extract entity ID from URL
                        import re
                        entity_match = re.search(r'entities=([^&]+)', current_url)
                        if entity_match:
                            entity_id = entity_match.group(1)
                            # Try to get file count from page
                            count_elements = await page.query_selector_all('span:has-text("documents"), span:has-text("results")')
                            file_count = 0
                            
                            for count_elem in count_elements:
                                count_text = await count_elem.inner_text()
                                count_match = re.search(r'(\d+)', count_text)
                                if count_match:
                                    file_count = int(count_match.group(1))
                                    break
                            
                            entity_found = {
                                "name": name,
                                "entity_id": entity_id,
                                "file_count_coffeezilla": file_count,
                                "coffeezilla_search_url": current_url
                            }
                            break
        
        if entity_found:
            print(f"    ✅ Found: {entity_found['entity_id']} ({entity_found['file_count_coffeezilla']} files)")
            return entity_found
        else:
            print(f"    ❌ Not found")
            return None
            
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return None

async def scrape_all_entities():
    """Scrape entity data for all 35 curated names."""
    
    results = {
        "coffeezilla_entities": [],
        "missing_from_coffeezilla": [],
        "missing_from_my_collection": [],
        "undercounted_in_my_collection": [],
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)  # Set to True for production
        page = await browser.new_page()
        
        # Set viewport and user agent
        await page.set_viewport_size({"width": 1920, "height": 1080})
        await page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"})
        
        for i, name in enumerate(CURATED_NAMES):
            print(f"\n[{i+1}/{len(CURATED_NAMES)}] Processing: {name}")
            
            # Search for entity in Coffeezilla's collection
            coffeezilla_entity = await search_entity_in_coffeezilla(page, name)
            
            if coffeezilla_entity:
                results["coffeezilla_entities"].append(coffeezilla_entity)
                
                # Compare with my collection
                my_data = MY_COLLECTION_DATA.get(name)
                if not my_data:
                    # Missing from my collection
                    coffeezilla_entity["file_count_mine"] = 0
                    coffeezilla_entity["status"] = "missing_from_mine"
                    results["missing_from_my_collection"].append(coffeezilla_entity)
                else:
                    # Compare file counts
                    coffeezilla_entity["file_count_mine"] = my_data["file_count"]
                    my_entity_url = f"https://journaliststudio.google.com/pinpoint/search?collection={MY_COLLECTION}&p=1&entities={my_data['entity_id']}"
                    coffeezilla_entity["my_search_url"] = my_entity_url
                    
                    # Check if significantly undercounted (more than 2x difference)
                    if coffeezilla_entity["file_count_coffeezilla"] > my_data["file_count"] * 2:
                        coffeezilla_entity["status"] = "undercounted_in_mine"
                        results["undercounted_in_my_collection"].append(coffeezilla_entity)
                    else:
                        coffeezilla_entity["status"] = "comparable"
            else:
                # Not found in Coffeezilla's collection
                my_data = MY_COLLECTION_DATA.get(name)
                not_found_entry = {
                    "name": name,
                    "entity_id": None,
                    "file_count_coffeezilla": 0,
                    "file_count_mine": my_data["file_count"] if my_data else 0,
                    "status": "not_found_in_coffeezilla"
                }
                results["missing_from_coffeezilla"].append(not_found_entry)
            
            # Small delay between requests
            await page.wait_for_timeout(1000)
        
        await browser.close()
    
    # Save results
    output_file = "automated_coffeezilla_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print(f"\n🎉 Scraping completed!")
    print(f"📊 Summary:")
    print(f"   • Found in Coffeezilla: {len(results['coffeezilla_entities'])}")
    print(f"   • Missing from my collection: {len(results['missing_from_my_collection'])}")
    print(f"   • Undercounted in my collection: {len(results['undercounted_in_my_collection'])}")
    print(f"   • Not found in Coffeezilla: {len(results['missing_from_coffeezilla'])}")
    print(f"📁 Results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    asyncio.run(scrape_all_entities())