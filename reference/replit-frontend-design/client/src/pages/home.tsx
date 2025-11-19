import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";

export default function Home() {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-3xl md:text-5xl font-bold uppercase tracking-tight">
            <span>IS</span>
            <Input
              type="text"
              placeholder="type a name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-center text-2xl md:text-4xl h-14 md:h-16 border-2 font-bold uppercase max-w-md flex-shrink-0"
              data-testid="input-search"
            />
            <span className="whitespace-nowrap">IN THE EPSTEIN FILES?</span>
          </div>
        </form>
      </div>
    </div>
  );
}
