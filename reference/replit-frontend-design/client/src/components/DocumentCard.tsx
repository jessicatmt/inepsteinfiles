import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { DocumentMatch } from "@shared/schema";

interface DocumentCardProps {
  document: DocumentMatch;
}

export default function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card data-testid={`card-document-${document.pageNumber}`}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h3 className="font-bold text-base uppercase flex-1" data-testid="text-document-title">
              {document.documentTitle}
            </h3>
            <span className="text-sm text-muted-foreground" data-testid="text-page">
              p. {document.pageNumber}
            </span>
          </div>
          {document.date && (
            <p className="text-sm text-muted-foreground" data-testid="text-document-date">
              {document.date}
            </p>
          )}
        </div>
        
        <p className="text-sm leading-relaxed" data-testid="text-excerpt">
          {document.excerpt}
        </p>
        
        <a 
          href={document.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm hover:underline"
          data-testid="link-view-document"
        >
          view document
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </CardContent>
    </Card>
  );
}
