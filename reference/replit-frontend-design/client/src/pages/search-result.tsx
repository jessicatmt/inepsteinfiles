import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function SearchResultPage() {
  const [, params] = useRoute("/:name");
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: result, isLoading } = useQuery<SearchResult>({
    queryKey: ['/api/search', params?.name],
    enabled: !!params?.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const slug = searchTerm.trim().toLowerCase().replace(/\s+/g, '-');
      setLocation(`/${slug}`);
      setSearchTerm("");
    }
  };

  const handlePostOnX = () => {
    if (!result) return;
    const text = encodeURIComponent(`${result.name} ${result.found ? 'IS' : 'is NOT'} in the Epstein files`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-8">
          <div 
            className={cn(
              "text-8xl md:text-[14rem] font-black tracking-tighter leading-none",
              result.found ? "text-destructive" : "text-foreground"
            )}
            data-testid="text-answer"
          >
            {result.found ? "YES" : "NO"}
          </div>
          
          <p className="text-2xl md:text-3xl uppercase tracking-wide" data-testid="text-subtitle">
            {result.name} {result.found ? "is in the epstein files" : "is not in the epstein files"}
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handlePostOnX}
            variant="default"
            size="lg"
            className="bg-black hover:bg-black/90 text-white rounded-full px-6"
            data-testid="button-post-x"
          >
            Post on{" "}
            <svg viewBox="0 0 24 24" className="w-4 h-4 ml-1 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </Button>
        </div>

        {result.found && result.matches.length > 0 && (
          <div className="space-y-6 border-t pt-12">
            {result.matches.map((doc, index) => (
              <div key={index} className="space-y-2" data-testid={`document-${index}`}>
                <a 
                  href={doc.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:underline"
                  data-testid="link-document"
                >
                  <div className="font-bold uppercase text-base">
                    {doc.documentTitle}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    page {doc.pageNumber} • {doc.date}
                  </div>
                  <div className="text-sm mt-2">
                    {doc.excerpt}
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6 border-t pt-12">
          <p className="text-center text-sm uppercase tracking-wide text-muted-foreground">
            search another name
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <Input
              type="text"
              placeholder="type a name + enter"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-center text-base h-12 border-2"
              data-testid="input-search"
            />
          </form>
        </div>

        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">
            <a 
              href="/about" 
              className="hover:underline"
              data-testid="link-about"
            >
              about
            </a>
            {" • "}
            last updated: november 19, 2024
            {" • "}
            <a 
              href="https://twitter.com/jessicasuarez" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              data-testid="link-twitter"
            >
              @jessicasuarez
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
