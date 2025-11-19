import DocumentCard from '../DocumentCard';

export default function DocumentCardExample() {
  const mockDocument = {
    documentTitle: "Epstein Flight Logs - January 2002",
    excerpt: "...passenger manifest included the following names: John Doe, Jane Smith, and several unidentified individuals...",
    pageNumber: 47,
    sourceUrl: "https://example.com/documents/flight-logs-2002.pdf",
    date: "January 15, 2002"
  };

  return <DocumentCard document={mockDocument} />;
}
