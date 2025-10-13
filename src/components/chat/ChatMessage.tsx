import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageActions } from "./MessageActions";

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
  reply_to_id?: string;
  reply_to_message?: string;
  edited_at?: string;
  deleted_at?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
  isSender: boolean;
  senderName?: string;
  showAvatar?: boolean;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
  isHighlighted?: boolean;
}

export const ChatMessage = ({
  message,
  isSender,
  senderName = "User",
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  isHighlighted = false,
}: ChatMessageProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isImage = message.attachment_type?.startsWith("image/");
  const isPdf = message.attachment_type === "application/pdf";
  const isDeleted = !!message.deleted_at;

  if (isDeleted) {
    return (
      <div
        className={cn(
          "flex gap-3 mb-4 animate-fade-in opacity-50",
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
          <div className="max-w-sm rounded-2xl px-4 py-2 bg-muted/50 italic">
            <p className="text-sm text-muted-foreground">Poruka obrisana</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-fade-in group",
        isSender ? "flex-row-reverse" : "flex-row",
        isHighlighted && "bg-accent/20 -mx-2 px-2 py-1 rounded-lg"
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
        {message.reply_to_message && (
          <div className="max-w-sm mb-1 px-3 py-1 text-xs bg-muted/50 rounded-lg border-l-2 border-primary">
            <p className="text-muted-foreground truncate">
              Odgovor na: {message.reply_to_message}
            </p>
          </div>
        )}
        
        <div className="flex items-start gap-2">
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

          {onReply && onEdit && onDelete && (
            <MessageActions
              messageId={message.id}
              messageText={message.message}
              isSender={isSender}
              onReply={() => onReply(message)}
              onEdit={() => onEdit(message)}
              onDelete={() => onDelete(message.id)}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {message.edited_at && (
            <span className="text-xs text-muted-foreground italic">(uređeno)</span>
          )}
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
