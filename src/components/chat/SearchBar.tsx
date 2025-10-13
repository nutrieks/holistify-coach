import { useEffect, useRef } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  currentIndex: number;
  totalResults: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  className?: string;
}

export const SearchBar = ({
  query,
  onQueryChange,
  currentIndex,
  totalResults,
  onNext,
  onPrev,
  onClose,
  className,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 border-b bg-background",
        className
      )}
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Pretraži poruke..."
        className="flex-1 h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {totalResults > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentIndex + 1} / {totalResults}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onPrev}
            disabled={totalResults === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onNext}
            disabled={totalResults === 0}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};