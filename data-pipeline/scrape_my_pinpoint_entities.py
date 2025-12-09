#!/usr/bin/env python3
"""
Scrape ALL entities from Jessica's Pinpoint collection sidebar.
This extracts every person entity that Pinpoint has identified in the documents.

Collection URL: https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d
"""

import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright

# Your Pinpoint collection
COLLECTION_ID = "7185d6ee2381569d"
BASE_URL = f"https://journaliststudio.google.com/pinpoint/search?collection={COLLECTION_ID}"
# Direct link to people search type (spt=2 means people)
PEOPLE_URL = f"{BASE_URL}&spt=2"

OUTPUT_FILE = "my_pinpoint_entities.json"


async def scrape_all_entities(page):
    """Scrape all entities from the people sidebar."""

    print("🔍 Loading your Pinpoint collection people page...")
    print(f"   URL: {PEOPLE_URL}\n")

    try:
        # Navigate to people search
        await page.goto(PEOPLE_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(5000)  # Wait for JS to render

        # Take a screenshot for debugging
        await page.screenshot(path="screenshots/my_pinpoint_initial.png")
        print("📸 Saved initial screenshot")

        # Get page content for analysis
        content = await page.content()

        # Look for entity elements - Pinpoint uses data-entity-id attributes
        print("\n🔎 Looking for entity elements...")

        # Try multiple selector strategies
        selectors_to_try = [
            '[data-entity-id]',
            '[data-entity-name]',
            'div[role="option"]',  # Sometimes entities are in dropdown options
            '.entity-chip',
            '[class*="entity"]',
            '[class*="person"]',
            'button[data-entity-id]',
            'a[data-entity-id]',
        ]

        all_entities = []

        for selector in selectors_to_try:
            elements = await page.query_selector_all(selector)
            if elements:
                print(f"   Found {len(elements)} elements with selector: {selector}")

                for elem in elements:
                    try:
                        entity_id = await elem.get_attribute('data-entity-id')
                        entity_name = await elem.get_attribute('data-entity-name')

                        # If no data-entity-name, try to get inner text
                        if not entity_name:
                            entity_name = await elem.inner_text()
                            entity_name = entity_name.strip().split('\n')[0]  # First line

                        # Try to extract file count
                        text = await elem.inner_text()
                        count_match = re.search(r'(\d+)', text)
                        file_count = int(count_match.group(1)) if count_match else 0

                        if entity_id and entity_name:
                            # Skip non-person entities (orgs, places, etc)
                            if entity_id.startswith('/m/') or entity_id.startswith('/g/'):
                                all_entities.append({
                                    'name': entity_name,
                                    'entity_id': entity_id,
                                    'file_count': file_count,
                                    'pinpoint_url': f"{BASE_URL}&entities={entity_id}"
                                })
                    except Exception as e:
                        continue

        # Remove duplicates
        seen = set()
        unique_entities = []
        for e in all_entities:
            key = e['entity_id']
            if key not in seen:
                seen.add(key)
                unique_entities.append(e)

        print(f"\n✅ Found {len(unique_entities)} unique entities")
        return unique_entities, content

    except Exception as e:
        print(f"❌ Error: {e}")
        await page.screenshot(path="screenshots/my_pinpoint_error.png")
        return [], ""


async def scroll_and_load_all(page):
    """Scroll through the sidebar to load all entities (lazy loading)."""

    print("\n📜 Scrolling to load all entities...")

    # Find the sidebar/list container
    sidebar_selectors = [
        '[class*="sidebar"]',
        '[class*="list"]',
        '[class*="results"]',
        '[role="listbox"]',
    ]

    sidebar = None
    for selector in sidebar_selectors:
        sidebar = await page.query_selector(selector)
        if sidebar:
            break

    if not sidebar:
        print("   Could not find scrollable sidebar")
        return

    # Scroll down incrementally to trigger lazy loading
    prev_count = 0
    for i in range(20):  # Max 20 scroll attempts
        await page.evaluate('''
            const sidebar = document.querySelector('[class*="sidebar"], [class*="list"], [role="listbox"]');
            if (sidebar) sidebar.scrollTop += 500;
        ''')
        await page.wait_for_timeout(500)

        # Check if new entities loaded
        elements = await page.query_selector_all('[data-entity-id]')
        curr_count = len(elements)

        if curr_count == prev_count:
            print(f"   Scroll {i+1}: No new entities (total: {curr_count})")
            break
        else:
            print(f"   Scroll {i+1}: Found {curr_count} entities (+{curr_count - prev_count})")
            prev_count = curr_count

    print(f"   Done scrolling. Total entities visible: {prev_count}")


async def main():
    """Main scraping function."""

    print("=" * 60)
    print("🔍 Scraping ALL Entities from Your Pinpoint Collection")
    print("=" * 60)
    print(f"Collection: {COLLECTION_ID}")
    print(f"Started: {datetime.now().isoformat()}")
    print()

    async with async_playwright() as p:
        # Launch browser (visible for debugging)
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = await context.new_page()

        # Try to scroll and load all entities first
        await page.goto(PEOPLE_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)

        await scroll_and_load_all(page)

        # Now scrape all entities
        entities, html_content = await scrape_all_entities(page)

        await browser.close()

    if entities:
        # Sort by file count (most documents first)
        entities.sort(key=lambda x: x['file_count'], reverse=True)

        # Save results
        output = {
            'collection_id': COLLECTION_ID,
            'scraped_at': datetime.now().isoformat(),
            'total_entities': len(entities),
            'entities': entities
        }

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved {len(entities)} entities to {OUTPUT_FILE}")

        # Show top 20 by file count
        print(f"\n📊 Top 20 entities by document count:")
        for i, e in enumerate(entities[:20], 1):
            print(f"   {i:2}. {e['name']} ({e['file_count']} docs) - {e['entity_id']}")

        # Save raw HTML for debugging
        with open('my_pinpoint_page.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"\n📄 Saved raw HTML to my_pinpoint_page.html")

    else:
        print("\n❌ No entities found. Check screenshots for debugging.")
        print("   The page structure may have changed or require authentication.")

    print(f"\n✅ Done at {datetime.now().isoformat()}")
    return entities


if __name__ == "__main__":
    # Make sure screenshots directory exists
    import os
    os.makedirs("screenshots", exist_ok=True)

    asyncio.run(main())
