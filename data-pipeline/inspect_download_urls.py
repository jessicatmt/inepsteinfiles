#!/usr/bin/env python3
"""
Inspect network requests to find actual download URL patterns for Pinpoint documents.
"""

import json
import time
import re
from playwright.sync_api import sync_playwright
from typing import Dict, List

def inspect_download_patterns():
    """Use Playwright to monitor network requests and find download patterns."""
    
    print("🔍 Inspecting Pinpoint to find actual download URL patterns...\n")
    
    # Test with Bill Gates first since we know he has documents
    entity_name = "Bill Gates"
    entity_id = "/m/017nt"
    entity_url = f"https://journaliststudio.google.com/pinpoint/search?collection=061ce61c9e70bdfd&spt=2&entities={entity_id}"
    
    captured_requests = []
    download_patterns = []
    
    with sync_playwright() as p:
        print(f"🚀 Launching browser with network monitoring...")
        browser = p.chromium.launch(
            headless=False,  # Show browser to see what's happening
            slow_mo=1000
        )
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        
        # Enable request interception to monitor all network activity
        page = context.new_page()
        
        # Capture all requests
        def log_request(request):
            url = request.url
            # Look for PDF-related requests
            if any(pattern in url.lower() for pattern in ['.pdf', 'download', 'document', 'file', 'blob', 'storage']):
                captured_requests.append({
                    'url': url,
                    'method': request.method,
                    'resource_type': request.resource_type,
                    'headers': dict(request.headers)
                })
                print(f"  📡 Captured: {request.method} {url[:100]}...")
        
        # Capture all responses  
        def log_response(response):
            url = response.url
            # Look for successful PDF downloads
            if response.status == 200 and any(pattern in url.lower() for pattern in ['.pdf', 'download', 'document']):
                content_type = response.headers.get('content-type', '')
                if 'pdf' in content_type.lower() or 'octet-stream' in content_type.lower():
                    download_patterns.append({
                        'url': url,
                        'status': response.status,
                        'content_type': content_type,
                        'headers': dict(response.headers)
                    })
                    print(f"  ✅ Found download: {url[:100]}...")
        
        page.on("request", log_request)
        page.on("response", log_response)
        
        try:
            # Navigate to entity search
            print(f"📍 Navigating to: {entity_url}")
            page.goto(entity_url)
            page.wait_for_load_state('networkidle', timeout=30000)
            time.sleep(5)
            
            print("\n🖱️ Looking for clickable document links...")
            
            # Try to find and click on a document to trigger download
            document_selectors = [
                'a[href*=".pdf"]',
                'button:has-text(".pdf")',
                'div:has-text("HOUSE_OVERSIGHT"):has-text(".pdf")',
                '[role="button"]:has-text(".pdf")',
                'a[download]',
                '[data-testid*="document"]',
                '.document-link',
                'text=HOUSE_OVERSIGHT_016221-016412.pdf',  # Specific document we know exists
            ]
            
            clicked = False
            for selector in document_selectors:
                try:
                    elements = page.query_selector_all(selector)
                    if elements:
                        print(f"  🎯 Found {len(elements)} elements with selector: {selector}")
                        # Try clicking the first one
                        if len(elements) > 0:
                            print(f"  🖱️ Clicking on first element...")
                            elements[0].click()
                            clicked = True
                            time.sleep(3)  # Wait for download to start
                            break
                except Exception as e:
                    print(f"  ❌ Could not click: {e}")
                    continue
            
            if not clicked:
                print("  ⚠️ Could not find clickable document element")
                
            # Also try hovering to see if that reveals download links
            print("\n🖱️ Trying hover actions to reveal download links...")
            hover_selectors = [
                'div:has-text("HOUSE_OVERSIGHT")',
                '[role="listitem"]',
                '.result-item'
            ]
            
            for selector in hover_selectors[:3]:  # Try first 3
                try:
                    elements = page.query_selector_all(selector)
                    if elements and len(elements) > 0:
                        elements[0].hover()
                        time.sleep(1)
                except:
                    pass
            
            # Check for download buttons that might have appeared
            download_buttons = page.query_selector_all('button:has-text("Download")')
            if download_buttons:
                print(f"  📥 Found {len(download_buttons)} download buttons")
                try:
                    download_buttons[0].click()
                    time.sleep(3)
                except:
                    pass
                    
            # Take screenshot for reference
            page.screenshot(path='screenshots/network_inspection.png')
            print("  📸 Screenshot saved: network_inspection.png")
            
        except Exception as e:
            print(f"❌ Error during inspection: {e}")
        
        finally:
            browser.close()
    
    # Analyze captured patterns
    print("\n" + "="*60)
    print("📊 ANALYSIS RESULTS")
    print("="*60)
    
    if captured_requests:
        print(f"\n📡 Captured {len(captured_requests)} PDF-related requests:")
        # Group by domain
        domains = {}
        for req in captured_requests:
            from urllib.parse import urlparse
            domain = urlparse(req['url']).netloc
            if domain not in domains:
                domains[domain] = []
            domains[domain].append(req)
        
        for domain, requests in domains.items():
            print(f"\n  Domain: {domain}")
            for req in requests[:3]:  # Show first 3 per domain
                print(f"    • {req['method']}: {req['url'][:100]}...")
    
    if download_patterns:
        print(f"\n✅ Found {len(download_patterns)} successful download patterns:")
        for pattern in download_patterns[:5]:  # Show first 5
            print(f"  • {pattern['url'][:150]}...")
            print(f"    Content-Type: {pattern['content_type']}")
            
        # Extract URL pattern
        if download_patterns:
            sample_url = download_patterns[0]['url']
            print(f"\n🔍 Analyzing URL pattern from: {sample_url}")
            
            # Try to extract the pattern
            if 'storage.googleapis.com' in sample_url:
                print("  ✅ Pattern: Google Cloud Storage URL")
                print("  Template: https://storage.googleapis.com/[bucket]/[path]/[filename].pdf")
            elif 'journaliststudio.google.com' in sample_url:
                print("  ✅ Pattern: Pinpoint API URL")
                print("  Template: https://journaliststudio.google.com/pinpoint/[endpoint]")
    else:
        print("\n⚠️ No download patterns captured. Manual inspection needed.")
        print("\nPossible reasons:")
        print("  • Downloads require authentication")
        print("  • Documents open in viewer instead of downloading")
        print("  • Need to inspect browser DevTools manually")
    
    # Save results
    results = {
        'captured_requests': captured_requests,
        'download_patterns': download_patterns,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    with open('download_url_analysis.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Full analysis saved to: download_url_analysis.json")
    
    return download_patterns

if __name__ == "__main__":
    patterns = inspect_download_patterns()
    
    if patterns:
        print("\n🎉 SUCCESS! Found working download patterns.")
        print("Next step: Update the scraper with the correct URL pattern.")
    else:
        print("\n🔧 Manual inspection needed.")
        print("Next steps:")
        print("  1. Open browser DevTools (F12)")
        print("  2. Go to Network tab")
        print("  3. Click on a document in Pinpoint")
        print("  4. Look for the download request")
        print("  5. Copy the URL pattern")