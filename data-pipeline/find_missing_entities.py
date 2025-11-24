#!/usr/bin/env python3
"""
Find entity IDs for the remaining 18/35 missing celebrities in Coffeezilla's collection
"""

import requests
import json
from urllib.parse import quote
import time

# Missing entities from our 35 (no pinpoint_entity_id yet)
MISSING_ENTITIES = [
    "Elon Musk",
    "Bill Gates", 
    "Stephen Hawking",
    "Naomi Campbell",
    "Peter Thiel",
    "David Copperfield",
    "Michael Jackson",
    "Woody Allen",
    "Alec Baldwin", 
    "Cameron Diaz",
    "Cate Blanchett",
    "Courtney Love",
    "Mick Jagger",
    "Minnie Driver", 
    "Noam Chomsky",
    "Robert F. Kennedy Jr.",
    "Tom Pritzker",
    "Kathryn Ruemmler"
]

COFFEEZILLA_COLLECTION = "061ce61c9e70bdfd"

def search_entity_in_coffeezilla_api(name):
    """Try to find entity using direct API approach."""
    
    # Try different search approaches
    search_queries = [
        name,
        name.replace(" ", "+"),
        name.split()[-1],  # Last name only
    ]
    
    for query in search_queries:
        search_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&q={quote(query)}"
        print(f"  Trying: {query}")
        
        # We'd need to actually scrape this, but let's manual check key ones first
        # For now, let's use known patterns and manual findings
        
    return None

def get_known_entities_from_coffeezilla():
    """Manual collection of entities found in Coffeezilla that we can verify."""
    
    # From previous analysis and manual checking
    known_findings = {
        # From the enhanced_entity_comparison.json results
        "Barack Obama": "/m/02mjmr",  # 425 files in Coffeezilla
        "Jeffrey Epstein": "/m/02_x6w",  # 1,111 files (!!)
        "Michael Wolff": "/m/0h7pqn8",  # 212 files
        "Michael Bloomberg": "/m/0178g",  # 50 files
        "Leon Black": "03e8ec3aee2d2c0c",  # 4 files (different ID format)
        
        # Need to find these manually by searching Coffeezilla
        # High priority celebrities likely to be there:
        # "Bill Gates": "???",  # Very likely to be in documents
        # "Elon Musk": "???",   # May be mentioned 
        # "Michael Jackson": "???", # Likely referenced
        # "Naomi Campbell": "???", # Model, likely connected
    }
    
    return known_findings

def manual_search_urls():
    """Generate manual search URLs for systematic checking."""
    
    results = {
        "manual_search_needed": [],
        "search_urls": {},
        "priority_order": []
    }
    
    # Prioritize by likelihood of being in documents
    priority_groups = {
        "Very Likely": ["Bill Gates", "Elon Musk", "Michael Jackson", "Naomi Campbell"],
        "Likely": ["Peter Thiel", "David Copperfield", "Woody Allen", "Alec Baldwin"],
        "Possible": ["Cameron Diaz", "Cate Blanchett", "Courtney Love", "Mick Jagger"],
        "Academic/Political": ["Stephen Hawking", "Noam Chomsky", "Robert F. Kennedy Jr."],
        "Lower Priority": ["Minnie Driver", "Tom Pritzker", "Kathryn Ruemmler"]
    }
    
    for priority, names in priority_groups.items():
        print(f"\n🎯 {priority} Priority:")
        for name in names:
            if name in MISSING_ENTITIES:
                search_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&q={quote(name)}"
                results["search_urls"][name] = search_url
                results["manual_search_needed"].append({
                    "name": name,
                    "priority": priority,
                    "search_url": search_url
                })
                print(f"  • {name}: {search_url}")
    
    return results

def check_specific_entities():
    """Check for specific entities we suspect are in the collection."""
    
    # Let's test a few specific search patterns
    test_cases = [
        ("Bill Gates", ["/m/05c9l", "/m/0d05l9"]),  # Common Gates entity IDs
        ("Elon Musk", ["/m/0d05h4", "/m/0c9zr"]),   # Common Musk entity IDs  
        ("Michael Jackson", ["/m/09889g", "/m/028mqr"]), # MJ entity IDs
        ("Naomi Campbell", ["/m/01n8hx", "/m/025ql6"]),  # Model entity IDs
    ]
    
    print("\n🔍 Testing known entity ID patterns:")
    for name, possible_ids in test_cases:
        print(f"\n{name}:")
        for entity_id in possible_ids:
            pinpoint_url = f"https://journaliststudio.google.com/pinpoint/search?collection={COFFEEZILLA_COLLECTION}&entities={quote(entity_id)}"
            print(f"  Test: {entity_id} → {pinpoint_url}")

def main():
    """Main execution - provide manual search guidance."""
    
    print("🔍 Finding Missing Entity IDs from Coffeezilla Collection")
    print(f"Missing: {len(MISSING_ENTITIES)}/35 entities")
    
    # Show known findings first
    known = get_known_entities_from_coffeezilla()
    print(f"\n✅ Already Found from Previous Analysis:")
    for name, entity_id in known.items():
        print(f"  • {name}: {entity_id}")
    
    # Generate search URLs for systematic checking
    search_plan = manual_search_urls()
    
    # Show specific entity ID tests
    check_specific_entities()
    
    print(f"\n📋 Manual Search Plan:")
    print(f"1. Visit each search URL above")
    print(f"2. Look for the person in results")
    print(f"3. Click on person to get entity URL")
    print(f"4. Extract entity ID from URL")
    print(f"5. Note file count")
    
    print(f"\n💡 Quick Test - Try these first:")
    priority_names = ["Bill Gates", "Elon Musk", "Michael Jackson", "Naomi Campbell"]
    for name in priority_names:
        if name in search_plan["search_urls"]:
            print(f"  • {name}: {search_plan['search_urls'][name]}")
    
    # Save search plan
    output_file = "manual_entity_search_plan.json"
    with open(output_file, 'w') as f:
        json.dump(search_plan, f, indent=2)
    
    print(f"\n💾 Search plan saved to: {output_file}")
    
    return search_plan

if __name__ == "__main__":
    main()