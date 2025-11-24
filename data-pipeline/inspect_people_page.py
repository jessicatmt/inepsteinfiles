#!/usr/bin/env python3
"""
Inspect the actual DOM structure of Coffeezilla's people page
"""

import asyncio
from playwright.async_api import async_playwright

PEOPLE_PAGE_URL = "https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2"

async def inspect_page_structure():
    """Inspect the page to understand the DOM structure."""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        await page.goto(PEOPLE_PAGE_URL, wait_until="networkidle")
        await page.wait_for_timeout(5000)
        
        print("📄 Page loaded. Taking screenshot and saving HTML...")
        
        # Save screenshot
        await page.screenshot(path="people_page_screenshot.png", full_page=True)
        
        # Save HTML
        content = await page.content()
        with open("people_page_content.html", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Try to find elements with common patterns
        print("\n🔍 Looking for entity elements...")
        
        # Try different selectors
        selectors_to_try = [
            '[data-entity-id]',
            '[data-entity-name]', 
            '.entity',
            '.person',
            '[class*="entity"]',
            '[class*="person"]',
            'div:has-text("documents")',
            'div:has-text("files")',
            'span:has-text("documents")',
            '[role="listitem"]',
            'li',
            '.result',
            '[class*="result"]'
        ]
        
        for selector in selectors_to_try:
            try:
                elements = await page.query_selector_all(selector)
                print(f"Selector '{selector}': {len(elements)} elements")
                
                if elements and len(elements) > 0 and len(elements) < 100:
                    # Print first few elements
                    for i, elem in enumerate(elements[:3]):
                        try:
                            text = await elem.inner_text()
                            html = await elem.inner_html()
                            print(f"  [{i}] Text: {text[:100]}")
                            print(f"      HTML: {html[:150]}...")
                        except:
                            pass
                    print()
                    
            except Exception as e:
                print(f"Error with selector '{selector}': {e}")
        
        # Try clicking on "People" filter if it exists
        print("\n🔍 Looking for People filter...")
        people_filter = await page.query_selector('text=People')
        if people_filter:
            print("Found People filter, clicking...")
            await people_filter.click()
            await page.wait_for_timeout(3000)
            
            # Try again after clicking
            elements = await page.query_selector_all('[data-entity-id]')
            print(f"After clicking People: {len(elements)} elements with data-entity-id")
        
        await browser.close()
        
        print("\n💾 Saved:")
        print("  • people_page_screenshot.png")
        print("  • people_page_content.html")

if __name__ == "__main__":
    asyncio.run(inspect_page_structure())