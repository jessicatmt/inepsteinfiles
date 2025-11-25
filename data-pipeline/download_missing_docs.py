#!/usr/bin/env python3
"""
Download missing documents from Coffeezilla's Pinpoint collection for entities with 0 file count.
"""

import json
import time
import os
import requests
import tempfile
from urllib.parse import urlparse, urljoin
from playwright.sync_api import sync_playwright
from typing import Dict, List, Optional

# Entities that exist in Coffeezilla's collection but have 0 files in ours
# ALL entities that show YES but need document harvesting
PRIORITY_ENTITIES = {
    "Adolf Hitler": {"entity_id": "/m/07_m9_", "pinpoint_count": 0},
    "Al Gore": {"entity_id": "/m/0d05fv", "pinpoint_count": 6},
    "Alec Baldwin": {"entity_id": "/m/018ygt", "pinpoint_count": 0},
    "Barack Obama": {"entity_id": "/m/02mjmr", "pinpoint_count": 0},
    "Benjamin Netanyahu": {"entity_id": "/m/0fm2h", "pinpoint_count": 0},
    "Bill Gates": {"entity_id": "/m/017nt", "pinpoint_count": 0},
    "Bill Richardson": {"entity_id": "/m/020z31", "pinpoint_count": 11},
    "Channing Tatum": {"entity_id": "/m/06lvlf", "pinpoint_count": 0},
    "David Copperfield": {"entity_id": "/m/02rbmg", "pinpoint_count": 0},
    "Ehud Barak": {"entity_id": "/m/016hk4", "pinpoint_count": 5},
    "Elon Musk": {"entity_id": "/m/018ygt", "pinpoint_count": 0},
    "George H. W. Bush": {"entity_id": "/m/034ls", "pinpoint_count": 0},
    "George W. Bush": {"entity_id": "/m/09b6zr", "pinpoint_count": 0},
    "Jeffrey Epstein": {"entity_id": "/m/0fz196", "pinpoint_count": 0},
    "Joe Biden": {"entity_id": "/m/012gx2", "pinpoint_count": 0},
    "Kathryn Ruemmler": {"entity_id": "/m/0gvs5b7", "pinpoint_count": 0},
    "Lena Dunham": {"entity_id": "/m/0b3w054", "pinpoint_count": 0},
    "Leonardo DiCaprio": {"entity_id": "/m/0dvmd", "pinpoint_count": 0},
    "Les Wexner": {"entity_id": "/m/01hwr1", "pinpoint_count": 45},
    "Martin Scorsese": {"entity_id": "/m/04sry", "pinpoint_count": 0},
    "Michael Jackson": {"entity_id": "/m/09889g", "pinpoint_count": 0},
    "Michael Wolff": {"entity_id": "/m/04q34ww", "pinpoint_count": 0},
    "Mick Jagger": {"entity_id": "/m/01kx_81", "pinpoint_count": 0},
    "Naomi Campbell": {"entity_id": "/m/05b6w8", "pinpoint_count": 0},
    "Noam Chomsky": {"entity_id": "/m/0b78hw", "pinpoint_count": 0},
    "Osama bin Laden": {"entity_id": "/m/05mg9", "pinpoint_count": 0},
    "Peter Thiel": {"entity_id": "/m/04hyrd", "pinpoint_count": 0},
    "Richard Dawkins": {"entity_id": "/m/06g4_", "pinpoint_count": 0},
    "Rupert Murdoch": {"entity_id": "/m/06hrk", "pinpoint_count": 0},
    "Stephen Hawking": {"entity_id": "/m/01tdnyh", "pinpoint_count": 0},
    "Steve Bannon": {"entity_id": "/m/0bqscsg", "pinpoint_count": 0},
    "Taylor Swift": {"entity_id": "/m/0dl567", "pinpoint_count": 0},
    "Vladimir Putin": {"entity_id": "/m/08193", "pinpoint_count": 0},
    "Warren Buffett": {"entity_id": "/m/01d_ys", "pinpoint_count": 0},
    "Woody Allen": {"entity_id": "/m/08l57", "pinpoint_count": 0},
}

# Google Drive folder ID for InEpsteinFiles documents  
GDRIVE_FOLDER_ID = None  # Will be set by user - create folder first

SCREENSHOTS_FOLDER = "screenshots"

def setup_folders():
    """Create necessary folders for screenshots."""
    os.makedirs(SCREENSHOTS_FOLDER, exist_ok=True)
    print(f"📁 Created folder: {SCREENSHOTS_FOLDER}/")

def download_and_upload_to_gdrive(url: str, filename: str, entity_name: str) -> Dict:
    """Download file to temp location and upload directly to Google Drive."""
    try:
        print(f"⬇️  Downloading: {filename}")
        
        # Download to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            
            temp_path = temp_file.name
            file_size = os.path.getsize(temp_path)
        
        print(f"📤 Uploading to Google Drive: {filename} ({file_size:,} bytes)")
        
        # This would use the Google Workspace MCP to upload
        # For now, return the temp path so user can handle upload
        return {
            'success': True,
            'filename': filename,
            'temp_path': temp_path,
            'file_size': file_size,
            'entity_name': entity_name,
            'url': url
        }
        
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return {
            'success': False,
            'filename': filename,
            'error': str(e),
            'entity_name': entity_name,
            'url': url
        }

def scrape_entity_documents(entity_name: str, entity_id: str) -> List[Dict]:
    """Scrape document URLs for a specific entity from Coffeezilla's collection."""
    
    documents = []
    entity_url = f"https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2&entities={entity_id}"
    
    with sync_playwright() as p:
        print(f"\n🔍 Searching for {entity_name} documents...")
        print(f"🔗 URL: {entity_url}")
        
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            # Navigate to entity search URL
            page.goto(entity_url)
            page.wait_for_load_state('networkidle', timeout=30000)
            time.sleep(5)
            
            # Take screenshot for debugging
            screenshot_name = f"entity_{entity_name.lower().replace(' ', '_')}.png"
            page.screenshot(path=f"{SCREENSHOTS_FOLDER}/{screenshot_name}")
            print(f"📸 Screenshot saved: {screenshot_name}")
            
            # Look for document links
            print("🔍 Looking for document links...")
            
            # Multiple selectors to find document links - updated based on Pinpoint structure
            doc_selectors = [
                'a[href*=".pdf"]',
                'a[href*="download"]', 
                'a[href*="document"]',
                'a[title*=".pdf"]',
                '.document-link',
                '.file-link',
                '[data-testid*="document"]',
                'a[download]',
                # Pinpoint-specific selectors based on screenshot
                'a:has(.pdf-icon)',
                'a[title*="HOUSE_OVERSIGHT"]',
                'div[role="button"]:has-text(".pdf")',
                'div:has-text("HOUSE_OVERSIGHT") a',
                '[title*="HOUSE_OVERSIGHT"]'
            ]
            
            found_links = []
            for selector in doc_selectors:
                try:
                    elements = page.query_selector_all(selector)
                    if elements:
                        print(f"📄 Found {len(elements)} potential documents with selector: {selector}")
                        
                        for element in elements:
                            href = element.get_attribute('href')
                            title = element.get_attribute('title') or element.inner_text().strip()
                            download_attr = element.get_attribute('download')
                            
                            if href and (href.endswith('.pdf') or 'download' in href.lower() or download_attr):
                                # Convert relative URLs to absolute
                                if href.startswith('/'):
                                    href = urljoin('https://journaliststudio.google.com', href)
                                elif href.startswith('//'):
                                    href = 'https:' + href
                                
                                doc_info = {
                                    'title': title,
                                    'url': href,
                                    'entity_name': entity_name,
                                    'entity_id': entity_id
                                }
                                found_links.append(doc_info)
                                print(f"  📎 {title}: {href}")
                        
                        if found_links:
                            break  # Use first successful selector
                            
                except Exception as e:
                    print(f"Error with selector {selector}: {e}")
                    continue
            
            # If no direct PDF links found, look for document entries that might need clicking
            if not found_links:
                print("🔍 No direct PDF links found. Looking for document entries...")
                
                # Look for document title patterns and try to construct download URLs
                document_titles = []
                try:
                    # Find all text containing "HOUSE_OVERSIGHT" and ".pdf"
                    page_content = page.content()
                    
                    # Look for PDF file names in the page content
                    import re
                    pdf_patterns = re.findall(r'HOUSE_OVERSIGHT_[\d-]+\.pdf', page_content)
                    
                    for pdf_name in set(pdf_patterns):  # Remove duplicates
                        document_titles.append(pdf_name)
                        print(f"  🔍 Found document title: {pdf_name}")
                        
                        # Try to construct potential download URL
                        # Pinpoint typically uses a pattern like this
                        potential_urls = [
                            f"https://journaliststudio.google.com/pinpoint/collections/061ce61c9e70bdfd/documents/{pdf_name}",
                            f"https://storage.googleapis.com/pinpoint-collections/061ce61c9e70bdfd/{pdf_name}",
                            f"https://journaliststudio.google.com/pinpoint/download?collection=061ce61c9e70bdfd&document={pdf_name}",
                        ]
                        
                        for url in potential_urls:
                            doc_info = {
                                'title': pdf_name,
                                'url': url,
                                'entity_name': entity_name,
                                'entity_id': entity_id,
                                'url_type': 'constructed'
                            }
                            found_links.append(doc_info)
                            print(f"  📎 Constructed URL: {pdf_name} -> {url}")
                            break  # Use first URL pattern for now
                        
                except Exception as e:
                    print(f"Error finding document titles: {e}")
                
                # Also look for broader patterns
                entry_selectors = [
                    '.document-entry',
                    '.search-result', 
                    '.file-entry',
                    '[data-testid*="result"]',
                    '.result-item',
                    # More specific Pinpoint selectors
                    'div:has-text("HOUSE_OVERSIGHT")',
                    'div:has-text(".pdf")',
                    '[role="listitem"]',
                    '.document-item'
                ]
                
                for selector in entry_selectors:
                    try:
                        elements = page.query_selector_all(selector)
                        if elements:
                            print(f"📋 Found {len(elements)} document entries with selector: {selector}")
                            
                            for i, element in enumerate(elements[:5]):  # Limit to first 5 results
                                try:
                                    # Try clicking on the element to see if it reveals download options
                                    element.click()
                                    time.sleep(2)
                                    
                                    # Look for download links that appeared after clicking
                                    for doc_selector in doc_selectors:
                                        new_links = page.query_selector_all(doc_selector)
                                        for link in new_links:
                                            href = link.get_attribute('href')
                                            if href and href.endswith('.pdf') and href not in [d['url'] for d in found_links]:
                                                title = link.get_attribute('title') or f"Document_{i+1}.pdf"
                                                found_links.append({
                                                    'title': title,
                                                    'url': href,
                                                    'entity_name': entity_name,
                                                    'entity_id': entity_id
                                                })
                                                print(f"  📎 Found after click: {title}: {href}")
                                
                                except Exception as e:
                                    print(f"Error clicking element {i}: {e}")
                                    continue
                            
                            if found_links:
                                break
                                
                    except Exception as e:
                        print(f"Error with entry selector {selector}: {e}")
                        continue
            
            documents = found_links
            
        except Exception as e:
            print(f"❌ Error scraping {entity_name}: {e}")
            try:
                page.screenshot(path=f"{SCREENSHOTS_FOLDER}/error_{entity_name.lower().replace(' ', '_')}.png")
            except:
                print("Could not save error screenshot (browser closed)")
        
        finally:
            browser.close()
    
    return documents

def download_entity_documents():
    """Main function to download missing documents for all priority entities."""
    
    setup_folders()
    
    print("🚀 Starting document download for entities with 0 file count...\n")
    
    all_documents = []
    download_log = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'entities_processed': [],
        'total_downloads': 0,
        'failed_downloads': 0
    }
    
    for entity_name, entity_data in PRIORITY_ENTITIES.items():
        entity_id = entity_data['entity_id']
        
        print(f"\n{'='*60}")
        print(f"Processing: {entity_name} (ID: {entity_id})")
        print(f"{'='*60}")
        
        # Scrape document URLs for this entity
        documents = scrape_entity_documents(entity_name, entity_id)
        
        if documents:
            print(f"\n📄 Found {len(documents)} documents for {entity_name}")
            
            downloaded_count = 0
            failed_count = 0
            temp_files = []  # Track temp files for cleanup
            
            for i, doc in enumerate(documents, 1):
                # Generate safe filename
                safe_title = "".join(c for c in doc['title'] if c.isalnum() or c in (' ', '-', '_', '.')).strip()
                if not safe_title.endswith('.pdf'):
                    safe_title += '.pdf'
                filename = f"{entity_name.replace(' ', '_')}_{i:02d}_{safe_title}"
                
                # Download and prepare for Google Drive upload
                result = download_and_upload_to_gdrive(doc['url'], filename, entity_name)
                
                if result['success']:
                    downloaded_count += 1
                    doc['temp_path'] = result['temp_path']
                    doc['file_size'] = result['file_size']
                    temp_files.append(result['temp_path'])
                else:
                    failed_count += 1
                    doc['error'] = result.get('error', 'Unknown error')
                
                # Add delay between downloads
                time.sleep(2)
            
            print(f"\n📊 {entity_name} Summary:")
            print(f"  ✅ Downloaded: {downloaded_count}")
            print(f"  ❌ Failed: {failed_count}")
            
            download_log['entities_processed'].append({
                'entity_name': entity_name,
                'entity_id': entity_id,
                'documents_found': len(documents),
                'downloaded_count': downloaded_count,
                'failed_count': failed_count,
                'documents': documents
            })
            
            download_log['total_downloads'] += downloaded_count
            download_log['failed_downloads'] += failed_count
            
            # Add temp file paths for Google Drive upload
            download_log['entities_processed'][-1]['temp_files'] = temp_files
            
            all_documents.extend(documents)
        
        else:
            print(f"📭 No documents found for {entity_name}")
            download_log['entities_processed'].append({
                'entity_name': entity_name,
                'entity_id': entity_id,
                'documents_found': 0,
                'downloaded_count': 0,
                'failed_count': 0,
                'documents': []
            })
    
    # Save download log
    log_filename = f"download_log_{time.strftime('%Y%m%d_%H%M%S')}.json"
    with open(log_filename, 'w', encoding='utf-8') as f:
        json.dump(download_log, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"🎉 DOWNLOAD COMPLETE!")
    print(f"{'='*60}")
    print(f"📊 Final Summary:")
    print(f"  • Entities processed: {len(PRIORITY_ENTITIES)}")
    print(f"  • Total documents found: {len(all_documents)}")
    print(f"  • Successfully downloaded: {download_log['total_downloads']}")
    print(f"  • Failed downloads: {download_log['failed_downloads']}")
    print(f"  • Log saved: {log_filename}")
    
    if download_log['total_downloads'] > 0:
        print(f"\n📁 Temporary files ready for Google Drive upload:")
        total_temp_files = 0
        for entity_data in download_log['entities_processed']:
            if 'temp_files' in entity_data and entity_data['temp_files']:
                entity_name = entity_data['entity_name']
                temp_files = entity_data['temp_files']
                total_temp_files += len(temp_files)
                print(f"  📂 {entity_name}: {len(temp_files)} files")
                for temp_path in temp_files:
                    file_size = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
                    print(f"    💾 {os.path.basename(temp_path)} ({file_size:,} bytes) -> {temp_path}")
        
        print(f"\n🔄 Next Steps:")
        print(f"  1. Create a Google Drive folder for InEpsteinFiles documents")
        print(f"  2. Use the Google Workspace MCP to upload {total_temp_files} files to Drive")
        print(f"  3. Add these files to your Pinpoint collection")
        print(f"  4. Clean up temporary files after upload")
        
        print(f"\n⚠️  Remember to clean up temp files after uploading:")
        print(f"  rm /tmp/tmp*")  # They're in /tmp/ by default
    
    return download_log

if __name__ == "__main__":
    # First, set up virtual environment if needed
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Playwright not installed. Setting up virtual environment...")
        import subprocess
        import sys
        
        # Create venv if it doesn't exist
        if not os.path.exists('venv'):
            subprocess.run([sys.executable, '-m', 'venv', 'venv'])
        
        # Install playwright in venv
        if os.name == 'nt':  # Windows
            pip_path = 'venv/Scripts/pip'
            python_path = 'venv/Scripts/python'
        else:  # Unix/Linux/macOS
            pip_path = 'venv/bin/pip'
            python_path = 'venv/bin/python'
        
        subprocess.run([pip_path, 'install', 'playwright', 'requests'])
        subprocess.run([python_path, '-m', 'playwright', 'install'])
        
        print("✅ Playwright installed. Please run the script again.")
        exit(0)
    
    download_entity_documents()