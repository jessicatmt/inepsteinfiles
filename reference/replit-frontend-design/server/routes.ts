import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { InsertDocument } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Seed initial document data
  const seedData: InsertDocument[] = [
    {
      title: "Giuffre v. Maxwell - Deposition Transcript",
      pageNumber: 52,
      excerpt: "Q: Did you ever meet Bill Clinton? A: Yes, I did. On the island and also on Jeffrey's plane.",
      sourceUrl: "https://www.documentcloud.org/documents/6250471-Epstein-Docs",
      date: "March 2015",
      names: ["Bill Clinton", "William Clinton"]
    },
    {
      title: "Flight Logs - Lolita Express Passenger Manifest",
      pageNumber: 23,
      excerpt: "Passenger list for flight February 9, 2001: Bill Clinton, Ghislaine Maxwell, Jeffrey Epstein",
      sourceUrl: "https://www.documentcloud.org/documents/1507315-epstein-flight-manifests",
      date: "February 9, 2001",
      names: ["Bill Clinton", "William Clinton", "Ghislaine Maxwell", "Jeffrey Epstein"]
    },
    {
      title: "Giuffre v. Maxwell - Deposition Transcript",
      pageNumber: 142,
      excerpt: "I was introduced to Prince Andrew at Ghislaine's London townhouse. The meeting was brief but memorable as he was a member of the Royal Family.",
      sourceUrl: "https://www.documentcloud.org/documents/6250471-Epstein-Docs",
      date: "April 2016",
      names: ["Prince Andrew", "Andrew Windsor", "Duke of York"]
    },
    {
      title: "Johanna Sjoberg Deposition",
      pageNumber: 78,
      excerpt: "Prince Andrew and I were photographed together at Ghislaine's house. Jeffrey and Ghislaine made jokes about it.",
      sourceUrl: "https://www.documentcloud.org/documents/6250471-Epstein-Docs",
      date: "May 2016",
      names: ["Prince Andrew", "Andrew Windsor"]
    },
    {
      title: "Flight Logs - International Trips",
      pageNumber: 45,
      excerpt: "Trip manifest shows Kevin Spacey, Chris Tucker, and other passengers on humanitarian trip to Africa",
      sourceUrl: "https://www.documentcloud.org/documents/1507315-epstein-flight-manifests",
      date: "September 2002",
      names: ["Kevin Spacey", "Chris Tucker"]
    },
    {
      title: "Address Book and Phone Records",
      pageNumber: 12,
      excerpt: "Contact information for Donald Trump listed with multiple phone numbers for offices and residences",
      sourceUrl: "https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted",
      date: "Undated",
      names: ["Donald Trump", "Trump"]
    },
    {
      title: "Address Book and Phone Records",
      pageNumber: 89,
      excerpt: "Alan Dershowitz contact details including home, office, and Martha's Vineyard residence",
      sourceUrl: "https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted",
      date: "Undated",
      names: ["Alan Dershowitz", "Dershowitz"]
    }
  ];

  await storage.seedDocuments(seedData);

  // Search endpoint
  app.get("/api/search/:name", async (req, res) => {
    try {
      const { name } = req.params;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name parameter is required" });
      }

      const result = await storage.searchByName(name);
      return res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
