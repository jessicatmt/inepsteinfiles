# **Data Pipeline & Engineering Specification**

Project: InEpsteinFiles.com  
Version: 1.2  
Role: Defines the ETL logic and Data Integrity Protocols for the index.

## **1\. The "Triage" Protocol (File Classification)**

Before processing, every file goes through an automated audit to assign a DocType.

| DocType | Identifying Features | Action |
| :---- | :---- | :---- |
| **Flight Logs** | Keywords: "N908JE", "Pilot", "Passenger", "Airport" | **Priority P0**. OCR Required (High Sensitivity). |
| **Depositions** | Keywords: "Deposition", "Sworn", "testimony", "q:", "a:", "Exhibit" | **Priority P0**. Native Text Extraction (Fast). |
| **Contact Books** | Keywords: "Name", "Address", "Telephone", "Black Book" | **Priority P0**. Regex Parsing (High Complexity). |
| **Phone Records** | Keywords: "BellSouth", "Call Detail", "Subscriber" | **Priority P1**. Table Extraction (pdfplumber). |
| **Legal/Procedural** | Keywords: "Motion", "Memorandum", "Continuance", "Docket" | **EXCLUDE**. Do not index. |
| **Complaints** | Keywords: "Plaintiff alleges", "Civil Action", "Complaint" | **EXCLUDE**. Unproven allegations. |

## **2\. Data Integrity & Verification (New P0)**

To prevent accusations of "fake news" or tampering, every indexed file must be cryptographically verified.

### **2.1. The "Gold Standard" Hashes**

We will maintain a known\_hashes.json registry containing the SHA-256 hashes of widely accepted official releases (e.g., from CourtListener, DOJ.gov, or verified journalists).

### **2.2. Verification Logic**

* **Before Indexing:** The script calculates the SHA-256 hash of the local PDF.  
* **Comparison:** It checks this hash against known\_hashes.json.  
* **If Match:** The file is flagged verified: true in the database.  
* **If No Match:** The file is flagged verified: false (User Warning: "Unverified Source").

### **2.3. User-Facing Proof**

The frontend EvidenceCard component will display:

* **Source:** "US Govt (Justice.gov)"  
* **File Hash:** e3b0c442... (Click to Verify)  
* *Tooltip:* "This code proves the file has not been altered since release."

## **3\. Parsing Logic (By Document Type)**

### **3.1. Flight Log Parser**

* **Structure:** Grid/Table.  
* **Extraction Target:** Columns Passenger Names, Date, From, To.  
* **Deduplication Logic (Fingerprinting):**  
  * Create a unique ID for every row found: ID \= MD5(Date \+ Passenger\_Name\_Normalized).  
  * Maintain a seen\_ids set during processing.  
  * **If ID in seen\_ids:** Skip (Duplicate entry).  
  * **If ID not in seen\_ids:** Add to database and seen\_ids.  
* **Normalization:**  
  * "Bill Clinton" / "William Clinton" \-\> bill-clinton  
  * "G. Maxwell" / "Ghislaine" \-\> ghislaine-maxwell

### **3.2. Deposition Parser (The "Q\&A" Engine)**

* **Structure:** Standard Legal Transcript.  
* **Logic:**  
  * Identify the **Witness** (e.g., "Virginia Giuffre").  
  * Scan for **Named Entities** (People) in the "A:" (Answer) blocks.  
  * **Context Rule:** Capture the preceding "Q:" (Question) to provide context.  
  * *Example:*  
    * Q: "Did you see \[NAME\] at the island?"  
    * A: "Yes."  
    * *Index:* \[NAME\] \-\> Status: **POSSIBLE SIGHTING** \-\> Source: Giuffre Deposition.

### **3.3. Phone Log Parser**

* **Structure:** Tables (Date, Time, Number).  
* **Logic:** Extract phone numbers. Match against a known\_associates\_numbers.json (if available) or simply index the raw number for reverse lookup.

## **4\. The JSON Output Schema (Updated)**

\[  
  {  
    "id": "bill-clinton",  
    "display\_name": "Bill Clinton",  
    "status": "FOUND",  
    "evidence": \[  
      {  
        "source\_type": "FLIGHT\_LOG",  
        "doc\_title": "Epstein Flight Manifests 2000-2002",  
        "snippet": "PASSENGER: Bill Clinton...",  
        "file\_url": "/pdfs/flight\_logs\_unredacted.pdf\#page=42",  
        "file\_hash": "a8f5f167f44f4964e6c998dee827110c...",  
        "verification\_status": "VERIFIED\_OFFICIAL"  
      }  
    \]  
  }  
\]  
