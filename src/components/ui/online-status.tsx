import { cn } from "@/lib/utils";

interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
  showText?: boolean;
}

export function OnlineStatus({ isOnline, className, showText = false }: OnlineStatusProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {showText && (
        <span className="text-sm text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
}