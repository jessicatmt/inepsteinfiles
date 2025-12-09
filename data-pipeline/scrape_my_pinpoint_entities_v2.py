#!/usr/bin/env python3
"""
Scrape ALL entities from Jessica's Pinpoint collection sidebar.
This version clicks "Show more" to expand the full entity list.

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

OUTPUT_FILE = "my_pinpoint_entities_v2.json"


async def expand_and_scrape_people(page):
    """Click 'Show more' repeatedly to load all people, then scrape."""

    print("🔍 Looking for 'By people' section...")

    # Wait for the page to fully load
    await page.wait_for_timeout(3000)

    # Take initial screenshot
    await page.screenshot(path="screenshots/v2_initial.png")
    print("📸 Saved initial screenshot")

    # Find the "By people" section and its "Show more" button
    # The structure from the screenshot shows:
    # - "By people" header
    # - List of people with document counts
    # - "Show more" link

    click_count = 0
    max_clicks = 50  # Safety limit

    while click_count < max_clicks:
        # Look for "Show more" specifically in the people section
        # Try multiple approaches to find the right button

        show_more_clicked = False

        # Strategy 1: Find by text content
        try:
            # Find all "Show more" elements
            show_more_elements = await page.query_selector_all('text="Show more"')

            if show_more_elements:
                # The first "Show more" should be in the people section
                # (based on the page layout: people, organizations, locations)
                for elem in show_more_elements:
                    # Check if this is visible and clickable
                    is_visible = await elem.is_visible()
                    if is_visible:
                        # Get parent context to verify it's in "By people"
                        await elem.click()
                        click_count += 1
                        print(f"   Clicked 'Show more' #{click_count}")
                        await page.wait_for_timeout(1000)  # Wait for expansion
                        show_more_clicked = True
                        break
        except Exception as e:
            print(f"   Strategy 1 failed: {e}")

        if not show_more_clicked:
            # Strategy 2: Use XPath to find Show more near "By people"
            try:
                # Find Show more links
                buttons = await page.query_selector_all('button, a, div[role="button"]')
                for btn in buttons:
                    text = await btn.inner_text()
                    if 'show more' in text.lower():
                        is_visible = await btn.is_visible()
                        if is_visible:
                            await btn.click()
                            click_count += 1
                            print(f"   Clicked 'Show more' #{click_count}")
                            await page.wait_for_timeout(1000)
                            show_more_clicked = True
                            break
            except Exception as e:
                print(f"   Strategy 2 failed: {e}")

        if not show_more_clicked:
            print("   No more 'Show more' buttons found")
            break

    print(f"✅ Clicked 'Show more' {click_count} times")

    # Take screenshot after expansion
    await page.screenshot(path="screenshots/v2_expanded.png")
    print("📸 Saved expanded screenshot")

    # Now scrape all people entities
    return await extract_people_entities(page)


async def extract_people_entities(page):
    """Extract all people entities from the expanded sidebar."""

    print("\n🔎 Extracting people entities...")

    entities = []

    # Get the full page HTML for analysis
    content = await page.content()

    # Strategy 1: Find elements with data-entity-id
    elements = await page.query_selector_all('[data-entity-id]')
    print(f"   Found {len(elements)} elements with data-entity-id")

    for elem in elements:
        try:
            entity_id = await elem.get_attribute('data-entity-id')
            entity_name = await elem.get_attribute('data-entity-name')

            # Try to get text content for name and count
            text = await elem.inner_text()

            if not entity_name:
                # Extract name from text (usually first line before number)
                lines = text.strip().split('\n')
                entity_name = lines[0].strip() if lines else None

            # Extract document count from text
            count_match = re.search(r'([\d,]+)\s*$', text.replace('\n', ' '))
            file_count = int(count_match.group(1).replace(',', '')) if count_match else 0

            if entity_id and entity_name:
                # Only include Knowledge Graph entities (/m/ or /g/)
                if entity_id.startswith('/m/') or entity_id.startswith('/g/'):
                    entities.append({
                        'name': entity_name.strip(),
                        'entity_id': entity_id,
                        'file_count': file_count,
                        'pinpoint_url': f"{BASE_URL}&entities={entity_id}"
                    })
        except Exception as e:
            continue

    # Strategy 2: Parse HTML directly for entity patterns
    # Look for patterns like: data-entity-id="/m/xxxxx"
    entity_pattern = r'data-entity-id="(/[mg]/[^"]+)"'
    name_pattern = r'data-entity-name="([^"]+)"'

    html_entities = re.findall(entity_pattern, content)
    html_names = re.findall(name_pattern, content)

    print(f"   Found {len(html_entities)} entity IDs in HTML")
    print(f"   Found {len(html_names)} entity names in HTML")

    # Look for the sidebar list items with people
    # Based on the screenshot, each person row has: icon, name, count
    # Try to find the container and iterate

    people_rows = await page.query_selector_all('[class*="person"], [class*="entity"], [role="listitem"]')
    print(f"   Found {len(people_rows)} potential person rows")

    # Deduplicate
    seen = set()
    unique_entities = []
    for e in entities:
        key = e['entity_id']
        if key not in seen:
            seen.add(key)
            unique_entities.append(e)

    return unique_entities, content


async def scrape_people_section_directly(page):
    """Alternative approach: Navigate to people filter and scrape."""

    print("\n📊 Trying direct people filter approach...")

    # The URL with spt=2 should show people filter
    people_url = f"{BASE_URL}&spt=2"
    await page.goto(people_url, wait_until="networkidle", timeout=60000)
    await page.wait_for_timeout(3000)

    await page.screenshot(path="screenshots/v2_people_filter.png")

    # Look for a "People" dropdown or filter that shows all entities
    # Check for expandable sections

    # Find and click any expandable headers
    headers = await page.query_selector_all('[class*="header"], [class*="title"], h2, h3')
    for header in headers:
        text = await header.inner_text()
        if 'people' in text.lower():
            print(f"   Found people header: {text}")
            try:
                await header.click()
                await page.wait_for_timeout(1000)
            except:
                pass

    return await extract_people_entities(page)


async def main():
    """Main scraping function."""

    print("=" * 60)
    print("🔍 Scraping ALL People from Your Pinpoint Collection (v2)")
    print("=" * 60)
    print(f"Collection: {COLLECTION_ID}")
    print(f"Started: {datetime.now().isoformat()}")
    print()

    async with async_playwright() as p:
        # Launch browser (visible for debugging)
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = await context.new_page()

        # Navigate to the collection
        print(f"📍 Loading: {BASE_URL}\n")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)

        # Try to expand and scrape people
        entities, html_content = await expand_and_scrape_people(page)

        # If we didn't get many entities, try the alternative approach
        if len(entities) < 20:
            print(f"\n⚠️ Only found {len(entities)} entities, trying alternative approach...")
            entities2, _ = await scrape_people_section_directly(page)

            # Merge results
            seen = {e['entity_id'] for e in entities}
            for e in entities2:
                if e['entity_id'] not in seen:
                    entities.append(e)
                    seen.add(e['entity_id'])

        await browser.close()

    if entities:
        # Sort by file count
        entities.sort(key=lambda x: x['file_count'], reverse=True)

        # Filter to likely people (exclude organizations, places)
        # Organizations often have entity IDs starting with certain patterns
        people_entities = []
        for e in entities:
            name = e['name'].lower()
            # Skip obvious non-people
            if any(skip in name for skip in ['court', 'committee', 'department', 'bureau', 'district', 'united states', 'new york', 'florida', 'palm beach']):
                continue
            people_entities.append(e)

        output = {
            'collection_id': COLLECTION_ID,
            'scraped_at': datetime.now().isoformat(),
            'total_entities': len(people_entities),
            'all_entities_found': len(entities),
            'entities': people_entities
        }

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved {len(people_entities)} people entities to {OUTPUT_FILE}")
        print(f"   (Filtered from {len(entities)} total entities)")

        # Show results
        print(f"\n📊 People found (top 30):")
        for i, e in enumerate(people_entities[:30], 1):
            print(f"   {i:2}. {e['name']} ({e['file_count']:,} docs)")

        # Check for Piers Morgan specifically
        piers = [e for e in entities if 'piers' in e['name'].lower() or 'morgan' in e['name'].lower()]
        if piers:
            print(f"\n✅ Found Piers Morgan: {piers}")
        else:
            print(f"\n⚠️ Piers Morgan not found in scraped entities")
            print("   This may require manually expanding the people list further")

    else:
        print("\n❌ No entities found")

    print(f"\n✅ Done at {datetime.now().isoformat()}")


if __name__ == "__main__":
    import os
    os.makedirs("screenshots", exist_ok=True)
    asyncio.run(main())
