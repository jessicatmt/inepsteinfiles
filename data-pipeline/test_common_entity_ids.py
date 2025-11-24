#!/usr/bin/env python3
"""
Test common Google Knowledge Graph entity IDs for our missing celebrities
"""

# Common entity IDs for our missing people (from Google Knowledge Graph)
COMMON_ENTITY_IDS = {
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

def generate_test_urls():
    """Generate test URLs for each entity ID."""
    
    print("🔍 Testing Common Entity IDs in Coffeezilla's Collection\n")
    
    results = []
    
    for name, entity_id in COMMON_ENTITY_IDS.items():
        test_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&entities={entity_id}"
        
        results.append({
            "name": name,
            "entity_id": entity_id,
            "test_url": test_url
        })
        
        print(f"• {name}: {entity_id}")
        print(f"  Test: {test_url}")
        print()
    
    print(f"📋 Manual Testing Instructions:")
    print(f"1. Visit each URL above")
    print(f"2. If you see results, the person is in Coffeezilla's collection") 
    print(f"3. Note the file count shown")
    print(f"4. Add to our people_index.json")
    
    # Save for reference
    with open("entity_id_tests.json", "w") as f:
        import json
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Saved test URLs to: entity_id_tests.json")
    
    return results

if __name__ == "__main__":
    generate_test_urls()