#!/usr/bin/env python3
"""
Search for remaining entities using both /m/ and %P% patterns in Coffeezilla's collection
"""

import asyncio
from playwright.async_api import async_playwright
from urllib.parse import quote
import re

# Remaining entities to find
REMAINING_ENTITIES = [
    "Alec Baldwin",
    "Cameron Diaz", 
    "Cate Blanchett", 
    "Courtney Love", 
    "Mick Jagger",
    "Stephen Hawking", 
    "Noam Chomsky", 
    "Robert F. Kennedy Jr.",
    "Minnie Driver", 
    "Tom Pritzker", 
    "Kathryn Ruemmler"
]

# Known Google Knowledge Graph IDs to try
GOOGLE_ENTITY_IDS = {
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

async def test_entity_patterns(page, name):
    """Test different entity ID patterns for a person."""
    
    print(f"🔍 Searching for: {name}")
    
    # Generate possible entity patterns
    test_patterns = [
        # Standard Google Knowledge Graph ID
        GOOGLE_ENTITY_IDS.get(name, ""),
        
        # %P% pattern with full name
        f"%P%{name.replace(' ', '_')}",
        
        # %P% pattern with variations
        f"%P%{name.replace(' ', '_').replace('.', '')}",
        f"%P%{name.replace(' Jr.', '_Jr').replace(' ', '_')}",
        
        # Try common variations for specific people
    ]
    
    # Add specific variations for certain names
    if name == "Robert F. Kennedy Jr.":
        test_patterns.extend(["%P%Robert_Kennedy_Jr", "%P%RFK_Jr", "%P%Robert_F_Kennedy"])
    elif name == "Mick Jagger":
        test_patterns.extend(["%P%Michael_Jagger", "/m/05g7q"])
    elif name == "Alec Baldwin":
        test_patterns.extend(["%P%Alexander_Baldwin", "/m/0kgqm"])
    elif name == "Stephen Hawking":
        test_patterns.extend(["/m/0gkcj", "/m/017jq"])
    
    found_entities = []
    
    for pattern in test_patterns:
        if not pattern:
            continue
            
        test_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&entities={quote(pattern)}"
        
        print(f"  Testing: {pattern}")
        
        try:
            await page.goto(test_url, wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(2000)
            
            # Check page content for results
            content = await page.content()
            
            # Look for document count
            count_match = re.search(r'(\d+)\s+(?:document|result|file)', content, re.IGNORECASE)
            
            # Check for no results indicators
            no_results = any(indicator in content.lower() for indicator in [
                "no results", "0 results", "not found", "no matches", "no documents"
            ])
            
            if count_match and not no_results:
                file_count = int(count_match.group(1))
                if file_count > 0:
                    print(f"    ✅ FOUND: {pattern} ({file_count} files)")
                    found_entities.append({
                        'name': name,
                        'entity_id': pattern,
                        'file_count': file_count,
                        'test_url': test_url
                    })
                    break  # Found one, move to next person
                    
        except Exception as e:
            print(f"    ❌ Error testing {pattern}: {e}")
            
        await page.wait_for_timeout(500)  # Brief delay
    
    if not found_entities:
        print(f"    ❌ No entity found for {name}")
    
    return found_entities

async def search_all_remaining():
    """Search for all remaining entities."""
    
    print("🔍 Searching for Remaining Entities in Coffeezilla Collection\n")
    
    all_found = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        for i, name in enumerate(REMAINING_ENTITIES):
            print(f"\n[{i+1}/{len(REMAINING_ENTITIES)}] {name}")
            
            found = await test_entity_patterns(page, name)
            all_found.extend(found)
            
            await page.wait_for_timeout(1000)  # Delay between people
        
        await browser.close()
    
    # Results summary
    print(f"\n🎉 Search Complete!")
    print(f"📊 Results:")
    print(f"  • Searched: {len(REMAINING_ENTITIES)} entities")
    print(f"  • Found: {len(all_found)} entities")
    
    if all_found:
        print(f"\n✅ Found Entities:")
        for entity in all_found:
            print(f"  • {entity['name']}: {entity['entity_id']} ({entity['file_count']} files)")
        
        # Save results
        import json
        with open('found_entities.json', 'w') as f:
            json.dump(all_found, f, indent=2)
        
        print(f"\n💾 Saved results to found_entities.json")
        
        # Generate update script
        print(f"\n📝 Ready to update people_index.json:")
        for entity in all_found:
            print(f"  '{entity['name']}': '{entity['entity_id']}',")
    
    return all_found

if __name__ == "__main__":
    asyncio.run(search_all_remaining())