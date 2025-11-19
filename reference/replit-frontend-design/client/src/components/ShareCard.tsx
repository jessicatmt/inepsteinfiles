import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareCardProps {
  name: string;
  found: boolean;
}

export default function ShareCard({ name, found }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "link copied",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex justify-center">
      <Button 
        onClick={handleCopyLink}
        variant="outline"
        size="lg"
        className="uppercase text-sm"
        data-testid="button-copy-link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            copied
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-2" />
            copy link
          </>
        )}
      </Button>
    </div>
  );
}
