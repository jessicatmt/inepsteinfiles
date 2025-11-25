#!/usr/bin/env python3
"""
Test the document scraper with one entity first.
"""

from download_missing_docs import scrape_entity_documents, setup_folders

def test_single_entity():
    """Test scraping for Bill Gates only."""
    
    setup_folders()
    
    # Test with Bill Gates first
    entity_name = "Bill Gates"
    entity_id = "/m/017nt"
    
    print(f"🧪 Testing document scraper with: {entity_name}")
    print(f"Entity ID: {entity_id}")
    
    documents = scrape_entity_documents(entity_name, entity_id)
    
    if documents:
        print(f"\n✅ SUCCESS: Found {len(documents)} documents for {entity_name}")
        for i, doc in enumerate(documents, 1):
            print(f"  {i}. {doc['title']}")
            print(f"     URL: {doc['url']}")
    else:
        print(f"\n❌ No documents found for {entity_name}")
        print("This could mean:")
        print("  • The entity has no documents in Coffeezilla's collection")
        print("  • The scraper needs adjustments for the page structure")
        print("  • The entity ID is incorrect")
    
    return documents

if __name__ == "__main__":
    test_single_entity()