#!/usr/bin/env python3
"""
Browser-based document downloader for Pinpoint collection.
Uses Playwright to click documents and handle downloads through the browser.
"""

import os
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
from typing import List, Dict

# Priority entities to download
TEST_ENTITIES = {
    "Bill Gates": "/m/017nt",
    "Elon Musk": "/m/018ygt",
    "Leonardo DiCaprio": "/m/0dvmd",
}

def setup_download_folder():
    """Create download folder for documents."""
    download_dir = Path("pinpoint_downloads")
    download_dir.mkdir(exist_ok=True)
    return str(download_dir.absolute())

def download_entity_documents_via_browser(entity_name: str, entity_id: str, download_dir: str):
    """Download documents by clicking on them in the browser."""
    
    print(f"\n{'='*60}")
    print(f"📥 Downloading documents for: {entity_name}")
    print(f"{'='*60}")
    
    entity_url = f"https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2&entities={entity_id}"
    downloaded_files = []
    
    with sync_playwright() as p:
        # Launch browser with download handling
        browser = p.chromium.launch(
            headless=False,  # Show browser so you can see what's happening
            slow_mo=500,  # Slow down actions for visibility
        )
        
        # Create context with download directory
        context = browser.new_context(
            accept_downloads=True,
            viewport={'width': 1920, 'height': 1080},
        )
        
        page = context.new_page()
        
        # Track downloads
        downloads_in_progress = []
        
        def handle_download(download):
            """Handle download events."""
            print(f"  📄 Download started: {download.suggested_filename}")
            downloads_in_progress.append(download)
            # Save to our directory with entity prefix
            filename = f"{entity_name.replace(' ', '_')}_{download.suggested_filename}"
            save_path = os.path.join(download_dir, filename)
            download.save_as(save_path)
            print(f"  ✅ Saved: {filename}")
            downloaded_files.append({
                'entity': entity_name,
                'original_name': download.suggested_filename,
                'saved_as': filename,
                'path': save_path
            })
        
        page.on("download", handle_download)
        
        try:
            # Navigate to entity search
            print(f"🔗 Opening: {entity_url}")
            page.goto(entity_url)
            page.wait_for_load_state('networkidle', timeout=30000)
            time.sleep(3)
            
            print("🔍 Finding document links...")
            
            # Find all document elements
            # Try multiple selectors based on Pinpoint's structure
            document_selectors = [
                'div:has-text("HOUSE_OVERSIGHT"):has-text(".pdf")',
                'a:has-text(".pdf")',
                '[role="button"]:has-text(".pdf")',
                'div[title*=".pdf"]',
                'a[title*=".pdf"]'
            ]
            
            clickable_documents = []
            for selector in document_selectors:
                try:
                    elements = page.query_selector_all(selector)
                    if elements:
                        print(f"  Found {len(elements)} elements with selector: {selector}")
                        clickable_documents.extend(elements)
                        break
                except:
                    continue
            
            if not clickable_documents:
                print("  ⚠️ No clickable documents found. Trying text search...")
                # Try to find by text content
                page_text = page.content()
                import re
                pdf_names = re.findall(r'HOUSE_OVERSIGHT_[\d-]+\.pdf', page_text)
                print(f"  Found {len(set(pdf_names))} PDF names in page")
                
                # Try clicking on text
                for pdf_name in list(set(pdf_names))[:5]:  # Try first 5
                    try:
                        element = page.get_by_text(pdf_name).first
                        if element:
                            clickable_documents.append(element)
                    except:
                        continue
            
            if clickable_documents:
                print(f"\n📥 Downloading {len(clickable_documents)} documents...")
                print("  (Two-step process: Click document → Click download button)")
                
                # Click each document to trigger download
                for i, element in enumerate(clickable_documents[:10], 1):  # Limit to 10 for testing
                    try:
                        print(f"\n  [{i}/{min(10, len(clickable_documents))}] Opening document...")
                        
                        # Scroll element into view
                        element.scroll_into_view_if_needed()
                        time.sleep(0.5)
                        
                        # Click to open document viewer
                        element.click()
                        
                        # Wait for viewer to load
                        time.sleep(3)
                        
                        # Now look for the download button
                        print("    🔍 Looking for download button...")
                        
                        # Multiple selectors for the download button
                        download_selectors = [
                            'li[data-menu-item="downloadOriginalFile"]',
                            'span:has-text("Download original file")',
                            '[role="menuitem"]:has-text("Download")',
                            'text="Download original file"',
                            # Also try the three-dot menu first if needed
                            'button[aria-label="More options"]',
                            '[aria-label="More actions"]',
                            'button:has(svg)',  # Menu button often has SVG icon
                        ]
                        
                        download_clicked = False
                        for selector in download_selectors:
                            try:
                                # First check if we need to open a menu
                                if 'More' in selector or 'svg' in selector:
                                    menu_btn = page.wait_for_selector(selector, timeout=2000)
                                    if menu_btn and menu_btn.is_visible():
                                        print("    📋 Opening menu...")
                                        menu_btn.click()
                                        time.sleep(1)
                                
                                # Now try to find download option
                                download_btn = page.wait_for_selector('li[data-menu-item="downloadOriginalFile"]', timeout=2000)
                                if not download_btn:
                                    download_btn = page.wait_for_selector('span:has-text("Download original file")', timeout=1000)
                                
                                if download_btn and download_btn.is_visible():
                                    print("    ✅ Found download button!")
                                    download_btn.click()
                                    download_clicked = True
                                    time.sleep(2)  # Wait for download to start
                                    break
                            except:
                                continue
                        
                        if not download_clicked:
                            print("    ⚠️ Could not find download button, trying keyboard shortcut...")
                            # Try Ctrl+Shift+S or Cmd+Shift+S for save
                            page.keyboard.press('Control+Shift+S' if os.name != 'darwin' else 'Meta+Shift+S')
                            time.sleep(1)
                        
                        # Go back to search results
                        print("    ↩️ Returning to search results...")
                        page.go_back()
                        time.sleep(2)
                            
                    except Exception as e:
                        print(f"    ❌ Error processing document {i}: {e}")
                        # Try to recover by going back
                        try:
                            page.go_back()
                        except:
                            pass
                        continue
                
                # Wait for downloads to complete
                if downloads_in_progress:
                    print(f"\n⏳ Waiting for {len(downloads_in_progress)} downloads to complete...")
                    for download in downloads_in_progress:
                        try:
                            download.path()  # This waits for download to complete
                        except:
                            pass
                    print("✅ Downloads completed!")
            
            else:
                print("  ❌ Could not find any clickable documents")
                print("  💡 Try manually clicking on a document to see the pattern")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            
        finally:
            # Keep browser open for a bit so you can see results
            print("\n🔍 Browser will close in 5 seconds...")
            time.sleep(5)
            browser.close()
    
    return downloaded_files

def main():
    """Main function to download documents for test entities."""
    
    print("🚀 Pinpoint Document Browser Downloader")
    print("="*60)
    
    # Setup download directory
    download_dir = setup_download_folder()
    print(f"📁 Download directory: {download_dir}")
    
    all_downloads = []
    
    # Process each entity
    for entity_name, entity_id in TEST_ENTITIES.items():
        downloads = download_entity_documents_via_browser(entity_name, entity_id, download_dir)
        all_downloads.extend(downloads)
        
        # Wait between entities
        time.sleep(3)
    
    # Save download log
    log_file = os.path.join(download_dir, f"download_log_{time.strftime('%Y%m%d_%H%M%S')}.json")
    with open(log_file, 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'download_dir': download_dir,
            'total_files': len(all_downloads),
            'files': all_downloads
        }, f, indent=2)
    
    print("\n" + "="*60)
    print("📊 DOWNLOAD SUMMARY")
    print("="*60)
    print(f"✅ Total files downloaded: {len(all_downloads)}")
    print(f"📁 Saved to: {download_dir}")
    print(f"📝 Log file: {log_file}")
    
    if all_downloads:
        print("\n📄 Downloaded files:")
        for file in all_downloads[:10]:  # Show first 10
            print(f"  • {file['saved_as']}")
        if len(all_downloads) > 10:
            print(f"  ... and {len(all_downloads) - 10} more")

if __name__ == "__main__":
    main()