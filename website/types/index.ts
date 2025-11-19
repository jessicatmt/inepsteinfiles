// TypeScript types for InEpsteinFiles.com

export interface DocumentMatch {
  page: number;
  matched_variant: string;
  snippet: string;
}

export interface DocumentEvidence {
  filename: string;
  classification: string;
  source_url: string;
  source_attribution: string;
  sha256: string;
  verification_status: string;
  match_count: number;
  matches: DocumentMatch[];
}

export interface Person {
  display_name: string;
  slug: string;
  priority: string;
  category: string;
  found_in_documents: boolean;
  total_matches: number;
  documents: DocumentEvidence[];
}

export interface PeopleIndex {
  _metadata: {
    version: string;
    generated: string;
    description: string;
    total_names: number;
    total_documents: number;
    verification_note: string;
  };
  people: Person[];
}

// Helper to get human-readable document titles
export function getDocumentTitle(filename: string, attribution: string): string {
  const titleMap: Record<string, string> = {
    "3-emails_redacted.pdf": "New Emails Released by House Oversight Committee (November 2025)",
    "EPSTEIN FLIGHT LOGS UNREDACTED.pdf": "Unredacted Flight Logs from Lolita Express",
    "contact-book.pdf": "Little Black Book - Contact Directory",
    "Epstein-Estate-Document-01.pdf": "Birthday Book (Part 1)",
    "Epstein-Estate-Document-02.pdf": "Birthday Book (Part 2)",
    "Epstein-Estate-Document-04.pdf": "Birthday Book (Part 4)",
  };

  return titleMap[filename] || attribution || filename.replace(".pdf", "").replace(/_/g, " ");
}
