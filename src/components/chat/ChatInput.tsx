import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Napišite poruku...",
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;

    onSend(message, selectedFile || undefined);
    setMessage("");
    setSelectedFile(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    if (onTyping) {
      onTyping();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t bg-background p-4">
      {selectedFile && (
        <div className="mb-2">
          <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="mb-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (onTyping) onTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[44px] max-h-32 resize-none",
            "focus-visible:ring-1 focus-visible:ring-primary"
          )}
          rows={1}
        />

        <Button
          type="button"
          size="icon"
          className="mb-1"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !selectedFile)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Enter za slanje, Shift+Enter za novi red
      </p>
    </div>
  );
};
