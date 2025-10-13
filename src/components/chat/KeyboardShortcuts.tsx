import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

const ShortcutRow = ({ keys, description }: ShortcutRowProps) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <span key={index}>
          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="mx-1">+</span>}
        </span>
      ))}
    </div>
  </div>
);

export const KeyboardShortcuts = () => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Prečaci tipkovnice">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prečaci tipkovnice</DialogTitle>
          <DialogDescription>
            Koristite ove prečace za brži rad s porukama
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 mt-4">
          <ShortcutRow keys={[modKey, "K"]} description="Pretraživanje poruka" />
          <ShortcutRow keys={["Enter"]} description="Pošalji poruku" />
          <ShortcutRow keys={["Shift", "Enter"]} description="Novi red" />
          <ShortcutRow keys={["Esc"]} description="Odustani od pretraživanja" />
          <ShortcutRow keys={["↑"]} description="Uredi zadnju poruku (prazan input)" />
          <ShortcutRow keys={[modKey, "/"]} description="Prikaži prečace" />
        </div>
      </DialogContent>
    </Dialog>
  );
};