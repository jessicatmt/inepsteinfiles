#!/usr/bin/env python3
"""
Add new entities from CSV and implement custom content feature
Also generates a document download manifest for later processing
"""

import json
import re
from datetime import datetime

# Parse the CSV data
NEW_ENTITIES = {
    "Barack Obama": {
        "entity_id": "/m/02mjmr", 
        "one_liner": '"Told you." - Donald Trump',
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F02mjmr"
    },
    "Prince Andrew": {
        "entity_id": "/m/0xnh2",
        "one_liner": 'And why he\'s just "Andrew Mountbatten-Windsor" the peasant now.',
        "category": "Royal Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F0xnh2"
    },
    "Rupert Murdoch": {
        "entity_id": "/m/06hrk",
        "one_liner": None,
        "category": "Business Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F06hrk"
    },
    "George W. Bush": {
        "entity_id": "/m/09b6zr",
        "one_liner": '"Sir, a (your joke here)"',
        "image_path": "/images/george-w-bush.jpg",
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F09b6zr"
    },
    "Benjamin Netanyahu": {
        "entity_id": "/m/0fm2h",
        "one_liner": None,
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F0fm2h"
    },
    "Vladimir Putin": {
        "entity_id": "/m/08193",
        "one_liner": None,
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F08193"
    },
    "Joe Biden": {
        "entity_id": "/m/012gx2",
        "one_liner": None,
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F012gx2"
    },
    "Warren Buffett": {
        "entity_id": "/m/01d_ys",
        "one_liner": None,
        "category": "Business Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F01d_ys"
    },
    "Adolf Hitler": {
        "entity_id": "/m/07_m9_",
        "one_liner": "AYO wrongdoing implied (just not like, here).",
        "category": "Historical Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F07_m9_"
    },
    "Channing Tatum": {
        "entity_id": "/m/06lvlf",
        "one_liner": None,
        "youtube_embed_id": "dno1HK7X2gU",
        "youtube_timestamp": 53,
        "category": "Entertainment Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F06lvlf"
    },
    "Jesus Christ": {
        "entity_id": None,  # Using custom entity format
        "one_liner": None,
        "category": "Religious Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%25P%25Jesus_Christ"
    },
    "Martin Scorsese": {
        "entity_id": "/m/04sry",
        "one_liner": None,
        "image_path": "/images/martin-scorsese.webp",
        "category": "Entertainment Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F04sry"
    },
    "George H. W. Bush": {
        "entity_id": "/m/034ls",
        "one_liner": None,
        "category": "Political Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F034ls"
    },
    "Richard Dawkins": {
        "entity_id": "/m/06g4_",
        "one_liner": None,
        "category": "Academic Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F06g4_"
    },
    "Lena Dunham": {
        "entity_id": "/m/0b3w054",
        "one_liner": "RESTART THE GIRLS DISCOURSE.",
        "category": "Entertainment Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F0b3w054"
    },
    "Osama bin Laden": {
        "entity_id": "/m/05mg9",
        "one_liner": "Osama Bin Listed",
        "category": "Historical Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F05mg9"
    },
    "Michael Wolff": {
        "entity_id": "/m/04q34ww",
        "one_liner": None,
        "category": "Media Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F04q34ww"
    },
    "Taylor Swift": {
        "entity_id": "/m/0dl567",
        "one_liner": "Absolutely no wrongdoing implied here or anywhere, ever.",
        "category": "Entertainment Figure",
        "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&entities=%2Fm%2F0dl567"
    }
}

# Updates for the missing 12 entities
MISSING_ENTITY_UPDATES = {
    "Alec Baldwin": {"entity_id": "/m/018ygt", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F018ygt"},
    "Cameron Diaz": {"entity_id": None},  # NO match
    "Cate Blanchett": {"entity_id": None},  # NO match
    "Courtney Love": {"entity_id": None},  # NO match
    "Kathryn Ruemmler": {"entity_id": "/m/0gvs5b7", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F0gvs5b7"},
    "Mick Jagger": {"entity_id": "/m/01kx_81", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F01kx_81"},
    "Minnie Driver": {"entity_id": None},  # NO match
    "Noam Chomsky": {"entity_id": "/m/0b78hw", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F0b78hw"},
    "Robert F. Kennedy Jr.": {"entity_id": None},  # NO match
    "Stephen Hawking": {"entity_id": "/m/01tdnyh", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F01tdnyh"},
    "Steve Bannon": {"entity_id": "/m/0bqscsg", "coffeezilla_url": "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&p=1&docid=cccbc732dc853df5_061ce61c9e70bdfd_0&page=1&entities=%2Fm%2F0bqscsg"},
    "Tom Pritzker": {"entity_id": None}  # NO match
}

def generate_document_download_manifest():
    """Generate a manifest of documents to download from Coffeezilla's collection."""
    
    manifest = {
        "generated": datetime.now().isoformat(),
        "purpose": "Documents to download from Coffeezilla's Pinpoint collection for local processing",
        "entities_to_download": []
    }
    
    # Combine all entities with Coffeezilla URLs
    all_entities = {}
    
    # Add new entities
    for name, data in NEW_ENTITIES.items():
        if data.get('coffeezilla_url'):
            all_entities[name] = {
                "entity_id": data.get('entity_id'),
                "coffeezilla_url": data['coffeezilla_url'],
                "category": data.get('category', 'Other')
            }
    
    # Add missing entity updates
    for name, data in MISSING_ENTITY_UPDATES.items():
        if data.get('coffeezilla_url'):
            all_entities[name] = {
                "entity_id": data.get('entity_id'),
                "coffeezilla_url": data['coffeezilla_url'],
                "category": "Unknown"
            }
    
    # Create download tasks
    for name, data in all_entities.items():
        manifest["entities_to_download"].append({
            "name": name,
            "entity_id": data['entity_id'],
            "coffeezilla_url": data['coffeezilla_url'],
            "category": data['category'],
            "status": "pending",
            "documents_to_fetch": []  # Will be populated during actual download
        })
    
    # Save manifest
    with open('document_download_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n📋 Document Download Manifest Generated:")
    print(f"  • Entities to process: {len(manifest['entities_to_download'])}")
    print(f"  • Saved to: document_download_manifest.json")
    
    return manifest

def update_people_index():
    """Update people_index.json with new entities and custom content."""
    
    PEOPLE_INDEX_PATH = "../website/public/people_index.json"
    
    print("📝 Updating people_index.json with new entities and custom content...\n")
    
    # Load current index
    with open(PEOPLE_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    # First, update the missing entities in existing list
    updated_existing = 0
    for person in index['people']:
        person_name = person['display_name']
        
        # Check for missing entity updates
        if person_name in MISSING_ENTITY_UPDATES:
            update = MISSING_ENTITY_UPDATES[person_name]
            if update.get('entity_id'):
                person['pinpoint_entity_id'] = update['entity_id']
                person['pinpoint_file_count'] = 0  # Will be updated from Coffeezilla
                updated_existing += 1
                print(f"  ✅ Updated {person_name}: {update['entity_id']}")
        
        # Add custom_content field if not present
        if 'custom_content' not in person:
            person['custom_content'] = {
                'one_liner': None,
                'image_url': None,
                'youtube_embed_id': None,
                'youtube_timestamp': None
            }
    
    # Add new entities
    added_new = 0
    for name, data in NEW_ENTITIES.items():
        # Check if entity already exists
        exists = any(p['display_name'].lower() == name.lower() for p in index['people'])
        
        if not exists:
            slug = name.lower().replace(" ", "-").replace(".", "").replace("'", "")
            
            new_person = {
                "display_name": name,
                "slug": slug,
                "priority": "P1",  # Default priority
                "category": data.get('category', 'Other'),
                "found_in_documents": False,  # Will be updated if found
                "total_matches": 0,
                "pinpoint_entity_id": data.get('entity_id'),
                "pinpoint_file_count": 0,
                "custom_content": {
                    "one_liner": data.get('one_liner'),
                    "image_url": data.get('image_path'),
                    "youtube_embed_id": data.get('youtube_embed_id'),
                    "youtube_timestamp": data.get('youtube_timestamp')
                },
                "documents": []
            }
            
            index['people'].append(new_person)
            added_new += 1
            print(f"  ➕ Added new entity: {name}")
        else:
            # Update existing entity with custom content
            for person in index['people']:
                if person['display_name'].lower() == name.lower():
                    if 'custom_content' not in person:
                        person['custom_content'] = {}
                    
                    if data.get('one_liner'):
                        person['custom_content']['one_liner'] = data['one_liner']
                    if data.get('image_path'):
                        person['custom_content']['image_url'] = data['image_path']
                    if data.get('youtube_embed_id'):
                        person['custom_content']['youtube_embed_id'] = data['youtube_embed_id']
                    if data.get('youtube_timestamp'):
                        person['custom_content']['youtube_timestamp'] = data['youtube_timestamp']
                    if data.get('entity_id'):
                        person['pinpoint_entity_id'] = data['entity_id']
                    
                    print(f"  📝 Updated custom content for: {name}")
    
    # Sort entities alphabetically
    index['people'] = sorted(index['people'], key=lambda x: x['display_name'])
    
    # Update metadata
    index['_metadata']['total_names'] = len(index['people'])
    index['_metadata']['generated'] = datetime.now().strftime("%Y-%m-%d")
    index['_metadata']['has_custom_content'] = True
    
    # Save updated index
    with open(PEOPLE_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Update Complete!")
    print(f"  • Updated {updated_existing} existing entities with IDs")
    print(f"  • Added {added_new} new entities")
    print(f"  • Total entities: {len(index['people'])}")
    
    # Summary of coverage
    entities_with_ids = sum(1 for p in index['people'] if p.get('pinpoint_entity_id'))
    print(f"\n📊 Coverage:")
    print(f"  • Entities with Pinpoint IDs: {entities_with_ids}/{len(index['people'])} ({entities_with_ids/len(index['people'])*100:.1f}%)")
    
    # Count entities with custom content
    with_oneliners = sum(1 for p in index['people'] if p.get('custom_content', {}).get('one_liner'))
    with_images = sum(1 for p in index['people'] if p.get('custom_content', {}).get('image_url'))
    with_youtube = sum(1 for p in index['people'] if p.get('custom_content', {}).get('youtube_embed_id'))
    
    print(f"\n✨ Custom Content:")
    print(f"  • One-liners: {with_oneliners}")
    print(f"  • Images: {with_images}")
    print(f"  • YouTube embeds: {with_youtube}")
    
    # Return stats for testing
    return {
        "updated_existing": updated_existing,
        "added_new": added_new,
        "total": len(index['people']),
        "with_ids": entities_with_ids,
        "with_oneliners": with_oneliners,
        "with_images": with_images,
        "with_youtube": with_youtube
    }

if __name__ == "__main__":
    print("🚀 Processing new entities and custom content from CSV...\n")
    
    # Update the people index
    stats = update_people_index()
    
    # Generate document download manifest
    manifest = generate_document_download_manifest()
    
    print("\n✨ All done! Next steps:")
    print("  1. Review the updated people_index.json")
    print("  2. Use document_download_manifest.json to fetch documents from Coffeezilla")
    print("  3. Update website to display custom content (one-liners, images, YouTube embeds)")
    print("  4. Deploy changes to production")