import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function InfoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto" id="about">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger className="w-full" data-testid="button-how-it-works-toggle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 hover-elevate rounded-md">
              <h2 className="text-xl font-semibold">How this works</h2>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Data Sources</h3>
                <p className="text-muted-foreground">
                  This tool searches through publicly available court documents, flight logs, 
                  and government records related to the Jeffrey Epstein case. All documents 
                  are sourced from official public records.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Search Methodology</h3>
                <p className="text-muted-foreground">
                  Names are searched across all available documents using exact and fuzzy matching. 
                  Results show the specific documents and page numbers where names appear.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Disclaimer</h3>
                <p className="text-muted-foreground">
                  Appearance in these documents does not imply wrongdoing. Many individuals 
                  appear in various contexts including witness lists, deposition transcripts, 
                  and flight manifests. Always refer to the original documents for full context.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Document database last updated: November 19, 2024
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
