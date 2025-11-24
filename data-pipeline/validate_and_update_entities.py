#!/usr/bin/env python3
"""
Use Playwright to validate entity IDs in Coffeezilla's collection and update people_index.json
"""

import asyncio
import json
import re
from playwright.async_api import async_playwright

# Entity IDs to test
TEST_ENTITIES = {
    "Bill Gates": "/m/05c9l",
    "Elon Musk": "/m/0d05h4", 
    "Michael Jackson": "/m/09889g",
    "Naomi Campbell": "/m/025ql6",
    "Peter Thiel": "/m/0gshq",
    "David Copperfield": "/m/020k8", 
    "Woody Allen": "/m/083gg",
    "Alec Baldwin": "/m/0197cp",
    "Cameron Diaz": "/m/01vmy7",
    "Cate Blanchett": "/m/0cvqx",
    "Courtney Love": "/m/01w5n9",
    "Mick Jagger": "/m/014xs3",
    "Stephen Hawking": "/m/06xy8",
    "Noam Chomsky": "/m/05bc6",
    "Robert F. Kennedy Jr.": "/m/01w77k",
    "Minnie Driver": "/m/02qj6r",
    "Tom Pritzker": "/m/0h7p_g",
    "Kathryn Ruemmler": "/m/0j_68fv"
}

COFFEEZILLA_COLLECTION = "061ce61c9e70bdfd"
PEOPLE_INDEX_PATH = "../website/public/people_index.json"

async def validate_entity_in_coffeezilla(page, name, entity_id):
    """Validate an entity ID in Coffeezilla's collection."""
    
    test_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&entities={entity_id}"
    
    print(f"🔍 Testing {name} ({entity_id})")
    print(f"    URL: {test_url}")
    
    try:
        await page.goto(test_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Look for search results or "no results" messages
        page_content = await page.content()
        
        # Check for common "no results" indicators
        no_results_indicators = [
            "no results",
            "0 results", 
            "not found",
            "no matches",
            "no documents"
        ]
        
        has_no_results = any(indicator in page_content.lower() for indicator in no_results_indicators)
        
        # Look for document count indicators
        count_match = re.search(r'(\d+)\s+(?:document|result|file)', page_content, re.IGNORECASE)
        file_count = 0
        
        if count_match and not has_no_results:
            file_count = int(count_match.group(1))
        
        # Also try to find specific count elements
        try:
            count_elements = await page.query_selector_all('text=/\\d+\\s+(?:document|result|file)/i')
            if count_elements and not has_no_results:
                for elem in count_elements:
                    elem_text = await elem.inner_text()
                    match = re.search(r'(\d+)', elem_text)
                    if match:
                        file_count = max(file_count, int(match.group(1)))
        except:
            pass
        
        # Determine if entity exists in collection
        if has_no_results or file_count == 0:
            print(f"    ❌ Not found in Coffeezilla's collection")
            return None
        else:
            print(f"    ✅ Found: {file_count} files")
            return {
                "name": name,
                "entity_id": entity_id,
                "file_count": file_count,
                "coffeezilla_url": test_url
            }
            
    except Exception as e:
        print(f"    ❌ Error testing: {e}")
        return None

async def validate_inepsteinfiles_result(page, name):
    """Validate the result shows correctly on inepsteinfiles.com"""
    
    slug = name.lower().replace(" ", "-").replace(".", "")
    test_url = f"https://inepsteinfiles.com/{slug}"
    
    print(f"    Testing inepsteinfiles.com result: {test_url}")
    
    try:
        await page.goto(test_url, wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2000)
        
        # Look for YES/NO text
        page_text = await page.inner_text('body')
        
        if 'YES' in page_text and name in page_text:
            print(f"    ✅ Shows YES on inepsteinfiles.com")
            return True
        elif 'NO' in page_text:
            print(f"    ⚠️ Still shows NO - may need cache refresh")
            return False
        else:
            print(f"    ❓ Unclear result")
            return False
            
    except Exception as e:
        print(f"    ❌ Error testing inepsteinfiles: {e}")
        return False

async def update_people_index(validated_entities):
    """Update people_index.json with validated entities."""
    
    print(f"\n📝 Updating people_index.json...")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    updated_count = 0
    
    for person in index['people']:
        person_name = person['display_name']
        
        # Check if this person was validated
        for entity in validated_entities:
            if entity['name'] == person_name:
                person['pinpoint_entity_id'] = entity['entity_id']
                person['pinpoint_file_count'] = entity['file_count']
                updated_count += 1
                print(f"  ✅ Updated {person_name}: {entity['entity_id']} ({entity['file_count']} files)")
                break
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Updated {updated_count} people in index")
    return updated_count

async def main():
    """Main validation and update process."""
    
    print("🔍 Validating Entity IDs and Updating InEpsteinFiles.com\n")
    
    validated_entities = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        # Set viewport and headers
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        for i, (name, entity_id) in enumerate(TEST_ENTITIES.items()):
            print(f"\n[{i+1}/{len(TEST_ENTITIES)}] Processing: {name}")
            
            # Test entity in Coffeezilla's collection
            result = await validate_entity_in_coffeezilla(page, name, entity_id)
            
            if result:
                validated_entities.append(result)
                
                # Brief delay between requests
                await page.wait_for_timeout(1000)
        
        # Update people index with validated entities
        if validated_entities:
            updated_count = await update_people_index(validated_entities)
            
            print(f"\n🔄 Testing InEpsteinFiles.com results after update...")
            
            # Test a few results on inepsteinfiles.com
            for entity in validated_entities[:5]:  # Test first 5
                await validate_inepsteinfiles_result(page, entity['name'])
                await page.wait_for_timeout(1000)
        
        await browser.close()
    
    # Summary
    print(f"\n🎉 Validation Complete!")
    print(f"📊 Results:")
    print(f"  • Tested: {len(TEST_ENTITIES)} entities")
    print(f"  • Found in Coffeezilla: {len(validated_entities)}")
    print(f"  • Updated in index: {len(validated_entities)}")
    
    if validated_entities:
        print(f"\n✅ Successfully Added:")
        for entity in validated_entities:
            print(f"  • {entity['name']}: {entity['file_count']} files")
        
        print(f"\n🔗 Test These URLs:")
        for entity in validated_entities:
            slug = entity['name'].lower().replace(" ", "-").replace(".", "")
            print(f"  • https://inepsteinfiles.com/{slug}")
    
    # Save validation results
    with open('validation_results.json', 'w') as f:
        json.dump({
            'validated_entities': validated_entities,
            'total_tested': len(TEST_ENTITIES),
            'total_found': len(validated_entities)
        }, f, indent=2)
    
    return validated_entities

if __name__ == "__main__":
    asyncio.run(main())