'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  defaultValue?: string;
  compact?: boolean;
}

interface SearchResult {
  slug: string;
  display_name: string;
  found_in_documents: boolean;
  pinpoint_file_count: number;
}

export default function SearchForm({ defaultValue = '', compact = false }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the search
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.results);
          setShowSuggestions(data.results.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const name = searchQuery.trim();
    if (name) {
      // If a suggestion is selected, use it
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        router.push(`/${suggestions[selectedIndex].slug}`);
      } else {
        // Otherwise, use the raw query
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${slug}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/${slug}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "type a name + enter" : "type a name"}
          className={compact 
            ? "text-center text-sm h-8 border-2 border-black px-3 w-48 bg-white focus:outline-none focus:border-black"
            : "text-center text-2xl md:text-4xl h-14 md:h-16 border-2 border-black px-4 font-bold uppercase max-w-md w-full bg-white focus:outline-none focus:border-black"
          }
          autoComplete="off"
        />
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-50 bg-white border-2 border-black mt-1 ${
          compact ? 'w-48' : 'w-full max-w-md left-0 right-0'
        } max-h-96 overflow-y-auto`}>
          {isLoading && (
            <div className="px-4 py-2 text-gray-500 text-sm">Searching...</div>
          )}
          {suggestions.map((suggestion, index) => {
            const fileCount = suggestion.pinpoint_file_count || 0;
            const found = suggestion.found_in_documents || fileCount > 0;
            
            return (
              <button
                key={suggestion.slug}
                onClick={() => handleSuggestionClick(suggestion.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-left ${
                  selectedIndex === index ? 'bg-gray-100' : ''
                }`}
              >
                {/* Name and status */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {suggestion.display_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {found ? (
                      <span className="text-red-600">
                        Found in {fileCount} document{fileCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-green-600">Not found</span>
                    )}
                  </div>
                </div>

                {/* YES/NO indicator */}
                <div className={`flex-shrink-0 font-bold text-xs px-2 py-1 ${
                  found ? 'text-red-600 bg-red-50' : 'text-black bg-gray-50'
                } rounded`}>
                  {found ? 'YES' : 'NO'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}