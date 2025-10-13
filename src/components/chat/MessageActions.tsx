import { Reply, Edit2, Trash2, Copy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  messageId: string;
  messageText: string;
  isSender: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActions = ({
  messageId,
  messageText,
  isSender,
  onReply,
  onEdit,
  onDelete,
}: MessageActionsProps) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(messageText);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isSender ? "end" : "start"}>
        <DropdownMenuItem onClick={onReply} className="gap-2">
          <Reply className="h-4 w-4" />
          <span>Odgovori</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          <span>Kopiraj</span>
        </DropdownMenuItem>
        {isSender && (
          <>
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              <span>Uredi</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              <span>Obriši</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};