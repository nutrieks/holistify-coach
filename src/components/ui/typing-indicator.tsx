import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  names: string[];
  className?: string;
}

export function TypingIndicator({ names, className }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const displayText = names.length === 1 
    ? `${names[0]} tipka...`
    : names.length === 2 
    ? `${names[0]} i ${names[1]} tipkaju...`
    : `${names[0]} i još ${names.length - 1} tipkaju...`;

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground", className)}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
      </div>
      <span>{displayText}</span>
    </div>
  );
}