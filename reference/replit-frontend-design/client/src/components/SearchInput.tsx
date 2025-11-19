import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const slug = searchTerm.trim().toLowerCase().replace(/\s+/g, '-');
      setLocation(`/${slug}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter any name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-lg h-12 px-4"
          data-testid="input-search"
        />
        <Button 
          type="submit" 
          size="lg"
          className="px-6"
          data-testid="button-search"
        >
          <Search className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}
