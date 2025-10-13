import { useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const QUICK_EMOJIS = ["❤️", "👍", "😂", "🎉", "🤔", "👏"];

export const EmojiPickerComponent = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" type="button">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none" align="end">
        <div className="mb-2 p-2 border-b flex gap-1">
          {QUICK_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                onEmojiSelect(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
          width="100%"
          height={350}
          searchPlaceHolder="Pretraži emoji..."
        />
      </PopoverContent>
    </Popover>
  );
};