#!/usr/bin/env python3
"""
Fix download URLs using the correct Google Docs pattern from Pinpoint.
"""

import re
from urllib.parse import urlparse, parse_qs

def analyze_url_pattern():
    """Analyze the provided URL to understand the pattern."""
    
    sample_url = """https://doc-10-as-journaliststudio.googleusercontent.com/download/065cjauj97i2b8omnokaq2bhup2tmtbjjmcmmld6fkoi8j1t2408bb6ko9t0/065cjaujc39j9plccibcp5eb0a8rc0l4dgal9geudnj0kmo76vvre8nl971g/1764052605000/102937794036203933795/102937794036203933795/CiMKITJlZGIzODUwODcwZGRlMzZfMDYxY2U2MWM5ZTcwYmRmZA?dat=AUVqhcBCw_NOBNAKid1UnEcMBhNAXreh86yz8AzN4YTeD-nfUC58HpsU2NQ5FuoklMApXyiBB_aTgQ-DSWCYJ-2Om42pF2TyCGCmnMuNZfr4Romvy4ibi4sReCI0GZduc0Cc9yusz6ijor1x2IftKwR09cIgbnW8QJWOp8Okgo8Bs9m0TRgHqLhp4nYJ4Z3w4reXpJxa89zLvdOkyl2Qvz52c0cbC6xqz8ItsfIa_KzfacCT3M6ExdiXiQTRbPSy15WDpckcM11XhJKLyDI9RrjWhaGXVMti9JN6w3hdQ1-6bf_X-JEoWciYnKJl5Bu8Ae0ekyv4rrfgMLW_QK_vs-hWaihcNQSOqE43eyi6MxowCVhbPDS1BAIpd0-rXCPx2dd_UzJe9N-OwwNRw2PvwVRWJ1XO0fiz5MLCZ4VT_yAtnrO9Q_6XgSTANM3Vzc67tnXV-rYgalifwgAuX6J3EParqHqc02YRW3Yi-Ic7qYHymCY-Aeqg-VmsMa6FA9sv9iXyAYP9bbfho0-iUZIB_li5qaHXuYAmM-pIJdB0OxnSN-Cro0HRM18nqbetr57QyMt_WQeVajwMRAZ9WPUvIXQ-GrmrbVjCZ7sl4UgqKZL1O8vQ5j2vK6Er5NmGrj7NAEsptDtaB1Upp_O9MohNA9RHeaaxJlwuxF62YzuniVdlTYn6UQXoLI623GLWqYynjERKPhPR4y_LCLyCv6Vcq7UQKK_kZepBf_tp-tv917G2VsNTfjlzgzBoRmOn27bQtrJqOW1E10Gh8MMJsPAOA2eLe2SKV94bEBATe8xUUeAWaTx7JbSgiHWfBXKSnxp95ltqLErnKyTsKIGlBzKgTwt5NiKmFiqKWggxcFfQdT9PindbSH4WBaWYjXL5y-YPvlBe-mobxudYUu3xtxfOz8mxLbpGvnho5O7R0n7esK8kfWtt9S2i2nbGwibwVazHvP3nTzh30khQOia245WZ9WudFjwCbRCluXk22Di0AKmSYCHzb6rEEUqXXLNkxX2X8fqPlK412WK8XzPpGNcm7vJqfRjHnpOeSNrN9dbMK9isPHVlW07PE5PbrctbEEWwVXypOV4EoYCze31JU4uZ1RxTY4bOKAosXCMtEeeRp8W3viQaRCNy80BJVlCe0TeJCM6ZaT-Yrq7KlrjWIOLzN7-NVMRZMTXd_ziLxBqysUua3KxO2-JwUcTaZoUYuObhos4ecTA7WKHx0Tt_LkgxckxhHszyO71uPUVzVzSX_0KXxaavN0wAZWHqa09j2o77-mv4mt89CVmm_WHMI_wunj9ZNgwV"""
    
    print("📊 Analyzing Pinpoint Download URL Pattern\n")
    print("="*60)
    
    # Parse the URL
    parsed = urlparse(sample_url)
    
    print(f"🌐 Domain: {parsed.netloc}")
    print(f"📁 Path: {parsed.path}")
    
    # Extract path components
    path_parts = parsed.path.strip('/').split('/')
    print(f"\n📂 Path Components:")
    for i, part in enumerate(path_parts):
        print(f"  [{i}] {part[:50]}..." if len(part) > 50 else f"  [{i}] {part}")
    
    print(f"\n🔑 Query Parameters:")
    params = parse_qs(parsed.query)
    for key, value in params.items():
        print(f"  • {key}: {value[0][:50]}..." if len(value[0]) > 50 else f"  • {key}: {value[0]}")
    
    print("\n" + "="*60)
    print("✅ URL PATTERN IDENTIFIED:")
    print("="*60)
    
    print("""
Pattern Structure:
https://doc-{server}-journaliststudio.googleusercontent.com/download/{session_id1}/{session_id2}/{timestamp}/{user_id1}/{user_id2}/{doc_info}?dat={auth_token}

Key Components:
• Server: doc-10-as (varies by document)
• Session IDs: Long alphanumeric strings
• Timestamp: Unix timestamp in milliseconds
• User ID: 102937794036203933795 (your Google user ID)
• Doc Info: Encoded document identifier
• Auth Token: Long authentication string

⚠️ IMPORTANT: These URLs are session-specific and expire!
They cannot be constructed - they must be captured from the browser.
""")
    
    print("\n🔧 SOLUTION:")
    print("Since we can't construct these URLs, we need to:")
    print("1. Use Playwright to actually click on each document")
    print("2. Capture the download URL from the network request")
    print("3. Download immediately while the session is valid")
    print("4. Or use browser automation to save files directly")
    
    return parsed

if __name__ == "__main__":
    analyze_url_pattern()
    
    print("\n📝 Next Steps:")
    print("1. Update scraper to use browser automation for downloads")
    print("2. Configure Playwright to save downloads to a specific folder")
    print("3. Click each document link and let browser handle download")
    print("4. Monitor download folder for completed files")