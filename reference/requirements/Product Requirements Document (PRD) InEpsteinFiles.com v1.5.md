# **Product Requirements Document (PRD): InEpsteinFiles.com**

Version: 1.5  
Status: Optimized for Signal-to-Noise  
Date: November 19, 2025  
Project Name: In The Epstein Files? (Search Engine & Index)

## **1\. Executive Summary**

**InEpsteinFiles.com** is a single-purpose, high-impact search engine that allows users to verify if a specific name appears in official government documents related to Jeffrey Epstein.

The site prioritizes **accuracy, neutrality, and speed**. Given the massive and chaotic nature of the available data (65k+ pages, mixed media), the project will launch with a **"Core Index"** of high-value documents and expand to the "Full Archive" in subsequent phases.

## **2\. Core Goals & Principles**

### **2.1. Primary Objectives**

1. **Definitive Answers:** Provide an immediate binary answer (YES/NO) based *only* on indexed official documents.  
2. **Contextual Integrity:** Never show a "YES" without showing the *exact* snippet of text (evidence) and the source document type.  
3. **Speed to Market:** Launch immediately with the "Core Index" (Flight Logs \+ Depositions) while the "Senate Release" is processed in parallel.  
4. **URL-First Design:** The search result *is* the URL. Users must be able to share bill-clinton.inepsteinfiles.com.  
5. **Viral Engineering:** Dynamic social cards for every result.

### **2.2. Non-Goals**

* We are NOT indexing MP3s, Videos, or raw images in Phase 1\.  
* We are NOT indexing **Procedural Legal Filings** (e.g., motions for continuance, prison condition complaints) as they dilute the search quality.

## **3\. Phased Data Strategy (The "Definition" Fix)**

We define "The Files" in tiers to manage complexity.

### **Phase 1: The "Core Index" (Launch Criteria \- P0)**

These are the files the public is actively searching for. They are text-heavy and high-signal.

1. **The Flight Logs:** Official flight manifests (Exhibit GX-4 from *US v. Maxwell*).  
   * *Status:* Clean PDF available. Needs basic OCR.  
2. **The "Unsealed" Depositions (Jan 2024):** The \~900 pages released by Judge Preska (Giuffre v. Maxwell).  
   * *Status:* Digital PDF. High search value.  
3. **The "Birthday Book" (Curated):** *Optional.* If included, label clearly as "Personal Effects" not "Court Record."

### **Phase 2: The "Senate Release" (Post-Launch \- P1)**

The pending release of 65,000+ pages will be handled via a **"Community Triage"** strategy.

1. **Wait 24 Hours:** Do not attempt to OCR 65k pages on Day 1\.  
2. **Identify "Smoking Guns":** Monitor journalists/OSINT community to identify the top 10-20 PDFs containing new names.  
3. **Surgical Indexing:** Download and index *only* those high-value PDFs first.  
4. **Background Bulk Processing:** Run the remaining thousands of pages through a low-priority OCR queue over the following weeks.

### **Phase 3: The "Messy" Archives (Backlog \- P2)**

1. **FBI Vault Files:** The 22+ PDFs containing mostly redactions and clippings. (Low priority due to poor data quality).  
2. **House Oversight / Maxwell Trial Dumps (e.g., Prod 01):**  
   * *Status:* **Excluded from Index.** These are largely procedural motions (Rule 17c, trial scheduling).  
   * *Action:* Link to them as "External Resources" but do not pollute the search engine with them.

## **4\. Data Processing Logic (Python Script)**

* **Input:** PDF Files (Phase 1 Core Set).  
* **Process:**  
  1. **Folder Exclusion:** Script must ignore folders labeled "Procedural," "Prod 01," or "Motions" to avoid indexing lawyer names as "associates."  
  2. **OCR (Tesseract):** Mandatory for Flight Logs (often scanned) and any non-digital PDFs.  
  3. **Named Entity Recognition (NER):** Extract person names (spacy).  
  4. **Snippet Extraction:** Capture ±150 chars around the match.  
  5. **Source Tagging:** Tag every match with its dataset (e.g., SOURCE: FLIGHT LOGS 2002).  
* **Filtering:**  
  * **Blocklist:** Exclude known victims and **Attorneys of Record** (lawyers arguing the motions).  
  * **False Positive Check:** Logic to ensure "Bill" (invoice) is not indexed as "Bill" (person).

## **5\. Functional Requirements (Unchanged)**

### **5.1. URL Routing & Canonicalization (P0)**

* **Route A (Viral):** https://\[name\].inepsteinfiles.com \-\> Social sharing.  
* **Route B (SEO):** https://inepsteinfiles.com/name/\[name\] \-\> Canonical.

### **5.2. The Search Experience**

* **Input:** Large, central text input.  
* **Results View:**  
  * **Header:** Massive "YES" (Red) or "NO" (Black).  
  * **Evidence Cards:**  
    * *Card 1:* "FLIGHT LOG (2002)" \-\> Snippet.  
    * *Card 2:* "DEPOSITION (2016)" \-\> Snippet.

### **5.3. Social & Virality**

* **Dynamic OG Images:** Generated via @vercel/og.  
* **Share Button:** Pre-filled text ("Well this is awkward...").

## **6\. Technical Architecture**

### **6.1. Tech Stack**

* **Framework:** Next.js (App Router).  
* **Search:** Fuse.js (Client-side).  
* **Social:** ImageResponse.  
* **Deployment:** Vercel.

### **6.2. Cost Management**

* **OCR:** Use **Tesseract** (Free/Local) for Phase 1\. Avoid Cloud Vision API for the 65k dump to save \~$100+.  
* **Hosting:** Vercel Hobby Tier ($0).

## **7\. Implementation Roadmap**

1. **Day 1 (Today):**  
   * Script: Download & OCR "Flight Logs" \+ "Jan 2024 Unsealed Docs".  
   * Build: Next.js app with Search & Dynamic Social Cards.  
   * Launch: Deploy to Vercel.  
2. **Day 2 (Senate Release):**  
   * Monitor news for "Key Documents."  
   * Manually add those specific PDFs to the index script.  
   * Re-deploy site with new data.  
3. **Day 3+:**  
   * Add "FBI Vault" files if specific names are requested.  
   * Refine "No" page with "Check back as we process the Senate release" messaging.