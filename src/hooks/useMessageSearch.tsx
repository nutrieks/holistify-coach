import { useState, useMemo } from "react";

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
}

interface SearchResult {
  message: ChatMessage;
  matchIndex: number;
  preview: string;
}

export const useMessageSearch = (messages: ChatMessage[]) => {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    messages.forEach((message, index) => {
      if (message.message.toLowerCase().includes(lowerQuery)) {
        const matchIndex = message.message.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, matchIndex - 20);
        const end = Math.min(message.message.length, matchIndex + query.length + 20);
        const preview = 
          (start > 0 ? "..." : "") +
          message.message.substring(start, end) +
          (end < message.message.length ? "..." : "");

        searchResults.push({
          message,
          matchIndex: index,
          preview,
        });
      }
    });

    return searchResults;
  }, [messages, query]);

  const goToNext = () => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }
  };

  const goToPrev = () => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  const reset = () => {
    setQuery("");
    setCurrentIndex(0);
  };

  const currentResult = results[currentIndex];

  return {
    query,
    setQuery,
    results,
    currentIndex,
    currentResult,
    goToNext,
    goToPrev,
    reset,
  };
};