#!/usr/bin/env python3
"""
Comprehensive check of all 35 curated names against Coffeezilla's Pinpoint collection
"""

import json
import re
from urllib.parse import quote

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

# Current data from your collection
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

# Known entity IDs from Leonardo DiCaprio example you found
KNOWN_COFFEEZILLA_ENTITIES = {
    "Leonardo DiCaprio": "/m/0dvmd"
}

# Collections
MY_COLLECTION = "7185d6ee2381569d"
COFFEEZILLA_COLLECTION = "061ce61c9e70bdfd"

def generate_search_urls():
    """Generate search URLs for each name to test systematically."""
    
    results = {
        "search_urls": {},
        "known_entities": {},
        "missing_from_my_collection": [],
        "undercounted_in_my_collection": [],
        "need_manual_check": []
    }
    
    for name in CURATED_NAMES:
        # Create search URL for Coffeezilla's collection
        search_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&p=1&q={quote(name)}"
        results["search_urls"][name] = search_url
        
        # Check if we have entity ID already
        if name in KNOWN_COFFEEZILLA_ENTITIES:
            entity_id = KNOWN_COFFEEZILLA_ENTITIES[name]
            entity_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&p=1&entities={quote(entity_id)}"
            
            my_data = MY_COLLECTION_DATA.get(name, {"file_count": 0})
            
            results["known_entities"][name] = {
                "entity_id": entity_id,
                "coffeezilla_search_url": entity_url,
                "file_count_mine": my_data["file_count"],
                "status": "known_entity_needs_file_count_check"
            }
        else:
            # Add to manual check list
            results["need_manual_check"].append({
                "name": name,
                "search_url": search_url,
                "my_file_count": MY_COLLECTION_DATA.get(name, {}).get("file_count", 0),
                "my_entity_id": MY_COLLECTION_DATA.get(name, {}).get("entity_id", None)
            })
    
    return results

def create_comprehensive_check_list():
    """Create a comprehensive checklist for manual verification."""
    
    print("🔍 Creating comprehensive check for all 35 curated names...")
    
    results = generate_search_urls()
    
    print(f"\n📊 Summary:")
    print(f"  • Total names to check: {len(CURATED_NAMES)}")
    print(f"  • Already in my collection: {len(MY_COLLECTION_DATA)}")
    print(f"  • Known Coffeezilla entities: {len(KNOWN_COFFEEZILLA_ENTITIES)}")
    print(f"  • Need manual verification: {len(results['need_manual_check'])}")
    
    print(f"\n✅ Known Coffeezilla Entities:")
    for name, data in results["known_entities"].items():
        print(f"  • {name}: {data['entity_id']} (mine: {data['file_count_mine']} files)")
    
    print(f"\n🔍 Need Manual Check ({len(results['need_manual_check'])} names):")
    for item in results["need_manual_check"]:
        mine_status = f"mine: {item['my_file_count']} files" if item['my_file_count'] > 0 else "MISSING from mine"
        print(f"  • {item['name']} - {mine_status}")
        print(f"    Search: {item['search_url']}")
    
    # Save results
    output_file = "comprehensive_coffeezilla_check.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n📋 Next Steps:")
    print(f"1. Manually visit each search URL")
    print(f"2. Look for entity ID in the URL when you click on a person")
    print(f"3. Note the file count from Coffeezilla's collection")
    print(f"4. Compare with your collection's counts")
    
    return results

if __name__ == "__main__":
    results = create_comprehensive_check_list()