import { type Document, type InsertDocument, type SearchResult, type DocumentMatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  searchByName(name: string): Promise<SearchResult>;
  getAllDocuments(): Promise<Document[]>;
  seedDocuments(documents: InsertDocument[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;

  constructor() {
    this.documents = new Map();
  }

  async searchByName(name: string): Promise<SearchResult> {
    // Convert kebab-case back to spaces for matching (e.g., "bill-clinton" -> "bill clinton")
    const normalizedSearchName = name.toLowerCase().trim().replace(/[-_]/g, ' ');
    
    const matchingDocs = Array.from(this.documents.values()).filter(doc => 
      doc.names.some(docName => 
        docName.toLowerCase().includes(normalizedSearchName) ||
        normalizedSearchName.includes(docName.toLowerCase())
      )
    );

    const matches: DocumentMatch[] = matchingDocs.map(doc => ({
      documentTitle: doc.title,
      excerpt: doc.excerpt,
      pageNumber: doc.pageNumber || 0,
      sourceUrl: doc.sourceUrl,
      date: doc.date || undefined,
    }));

    return {
      name,
      found: matches.length > 0,
      matches,
    };
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async seedDocuments(insertDocuments: InsertDocument[]): Promise<void> {
    for (const insertDoc of insertDocuments) {
      const id = randomUUID();
      const doc: Document = { 
        ...insertDoc, 
        id,
        pageNumber: insertDoc.pageNumber ?? null,
        date: insertDoc.date ?? null
      };
      this.documents.set(id, doc);
    }
  }
}

export const storage = new MemStorage();
