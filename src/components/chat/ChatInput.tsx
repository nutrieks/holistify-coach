import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FilePreview } from "./FilePreview";
import { EmojiPickerComponent } from "./EmojiPicker";

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  replyingTo?: { id: string; message: string } | null;
  onCancelReply?: () => void;
  editingMessage?: { id: string; message: string } | null;
  onCancelEdit?: () => void;
  onEditSave?: (messageId: string, newText: string) => void;
}

export const ChatInput = ({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Napišite poruku...",
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onEditSave,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-populate message when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSend = () => {
    if ((!message.trim() && !selectedFile) || disabled) return;

    if (editingMessage && onEditSave) {
      onEditSave(editingMessage.id, message);
      setMessage("");
      onCancelEdit?.();
      return;
    }

    onSend(message, selectedFile || undefined);
    setMessage("");
    setSelectedFile(null);
    onCancelReply?.();
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
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

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
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
    <div className="border-t bg-background">
      {(replyingTo || editingMessage) && (
        <div className="p-2 bg-muted/50 border-b flex items-center justify-between">
          <div className="flex-1 truncate">
            <span className="text-xs font-medium text-muted-foreground">
              {editingMessage ? "Uređivanje poruke:" : "Odgovor na:"}
            </span>
            <p className="text-sm truncate">
              {editingMessage?.message || replyingTo?.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={editingMessage ? onCancelEdit : onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {selectedFile && (
        <div className="p-2 border-b">
          <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping?.();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !selectedFile)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
