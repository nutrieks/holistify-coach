import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;
}

interface ChatMessageProps {
  message: ChatMessage;
  isSender: boolean;
  senderName?: string;
  showAvatar?: boolean;
}

export const ChatMessage = ({
  message,
  isSender,
  senderName = "User",
  showAvatar = true,
}: ChatMessageProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isImage = message.attachment_type?.startsWith("image/");
  const isPdf = message.attachment_type === "application/pdf";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isSender ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="text-xs">
            {senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col", isSender ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-sm rounded-2xl px-4 py-2 shadow-sm",
            isSender
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none"
          )}
        >
          {message.message && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          )}

          {message.attachment_url && (
            <div className="mt-2">
              {isImage ? (
                <div className="rounded-lg overflow-hidden max-w-xs">
                  <img
                    src={message.attachment_url}
                    alt={message.attachment_name}
                    className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.attachment_url, "_blank")}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  {isPdf ? (
                    <FileText className="w-8 h-8 text-red-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {message.attachment_name}
                    </p>
                    {message.attachment_size && (
                      <p className="text-xs text-muted-foreground">
                        {(message.attachment_size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={() => window.open(message.attachment_url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {isSender && (
            <span className="text-xs text-muted-foreground">
              {message.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
