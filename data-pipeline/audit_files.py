import os
import fitz  # PyMuPDF
import csv
import re

# --- KEYWORDS FOR CLASSIFICATION ---
CLASSIFICATION_RULES = {
    "FLIGHT_LOG": ["flight log", "n908je", "pilot", "passenger", "aircraft", "cessna", "gulfstream"],
    "DEPOSITION": ["deposition", "sworn", "testimony", "q:", "a:", "united states district court", "exhibit"],
    "CONTACT_BOOK": ["address book", "telephone", "directory", "name/address", "black book"],
    "PHONE_LOG": ["bellsouth", "call detail", "incoming", "outgoing", "duration"],
    "PROCEDURAL_JUNK": ["motion to compel", "continuance", "memorandum of law", "scheduling order", "pursuant to rule", "status conference"],
    "COMPLAINT": ["plaintiff alleges", "civil action no", "jury trial demanded", "complaint for damages"]
}

def clean_path(raw_path):
    """Cleans drag-and-dropped paths from Terminal."""
    # Remove surrounding quotes if present
    path = raw_path.strip()
    if (path.startswith('"') and path.endswith('"')) or (path.startswith("'") and path.endswith("'")):
        path = path[1:-1]
    # Remove backslash escapes (common in Mac terminal drag-and-drop)
    path = path.replace(r'\ ', ' ')
    return path

def get_file_info(filepath):
    """Analyzes a single PDF to determine its type and quality."""
    filename = os.path.basename(filepath)
    try:
        doc = fitz.open(filepath)
        num_pages = len(doc)
        
        # 1. Check Text Density (Is it a Scan?)
        total_text_len = 0
        text_sample = ""
        
        # Sample first 3, middle 3, and last 3 pages
        pages_to_check = list(range(min(3, num_pages))) + \
                         list(range(max(0, num_pages//2), min(num_pages, num_pages//2 + 3))) + \
                         list(range(max(0, num_pages-3), num_pages))
        pages_to_check = sorted(list(set(pages_to_check))) 

        for p_num in pages_to_check:
            try:
                page = doc.load_page(p_num)
                text = page.get_text().lower()
                total_text_len += len(text)
                text_sample += text + " "
            except:
                continue

        avg_char_per_page = total_text_len / len(pages_to_check) if pages_to_check else 0
        needs_ocr = "YES" if avg_char_per_page < 100 else "NO"

        # 2. Classification
        classification = "UNKNOWN"
        scores = {k: 0 for k in CLASSIFICATION_RULES.keys()}
        
        for category, keywords in CLASSIFICATION_RULES.items():
            for word in keywords:
                if word in text_sample:
                    scores[category] += 1
        
        best_match = max(scores, key=scores.get)
        if scores[best_match] > 0:
            classification = best_match
            
        # 3. Action
        action = "MANUAL REVIEW"
        if classification == "PROCEDURAL_JUNK":
            action = "DELETE / IGNORE"
        elif classification == "COMPLAINT":
            action = "IGNORE (Allegations)"
        elif classification in ["FLIGHT_LOG", "DEPOSITION", "CONTACT_BOOK"]:
            action = "KEEP (Process for V1)"
        
        return {
            "Filename": filename,
            "Classification": classification,
            "Action": action,
            "Needs_OCR": needs_ocr,
            "Pages": num_pages,
            "Avg_Chars_Page": int(avg_char_per_page),
            "Path": filepath,
            "Error": ""
        }

    except Exception as e:
        return {
            "Filename": filename,
            "Classification": "ERROR",
            "Action": "CHECK MANUALLY",
            "Needs_OCR": "UNKNOWN",
            "Pages": 0,
            "Avg_Chars_Page": 0,
            "Path": filepath,
            "Error": str(e)
        }

def main():
    print("--- EPSTEIN FILES AUDITOR ---")
    # The clean_path function fixes the Mac path issue
    raw_input = input("Enter the full path to your folder (drag and drop here): ")
    folder_path = clean_path(raw_input)
    
    if not os.path.isdir(folder_path):
        print(f"Error: '{folder_path}' is not a valid folder.")
        print("Tip: Ensure you have read permissions for this folder.")
        return

    output_csv = os.path.join(os.getcwd(), "audit_results.csv")
    print(f"Scanning folder: {folder_path}")
    
    results = []
    try:
        files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    except PermissionError:
        print("PERMISSION DENIED: Cannot read the contents of this folder.")
        print("Fix: Move the folder to your Desktop or Documents, or go to System Settings > Privacy & Security > Full Disk Access and add Terminal.")
        return
    
    if not files:
        print("No PDF files found in that folder.")
        return

    print(f"Found {len(files)} PDFs. Analyzing...")

    for i, file in enumerate(files):
        print(f"[{i+1}/{len(files)}] Processing {file}...")
        full_path = os.path.join(folder_path, file)
        info = get_file_info(full_path)
        results.append(info)

    # Save to CSV
    keys = ["Filename", "Action", "Classification", "Needs_OCR", "Pages", "Avg_Chars_Page", "Path", "Error"]
    
    try:
        with open(output_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(results)
        print("-" * 30)
        print("AUDIT COMPLETE!")
        print(f"Results saved to: {output_csv}")
    except PermissionError:
        print("Error: Could not save CSV. Check permissions in the current folder.")

if __name__ == "__main__":
    main()