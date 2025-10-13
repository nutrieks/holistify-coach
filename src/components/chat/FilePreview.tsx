import { FileText, FileImage, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  const isImage = file.type.startsWith("image/");
  const fileUrl = URL.createObjectURL(file);

  return (
    <div className="relative inline-block mr-2 mb-2">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted">
        {isImage ? (
          <img src={fileUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="destructive"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
        onClick={onRemove}
      >
        <X className="w-3 h-3" />
      </Button>
      <p className="text-xs text-muted-foreground mt-1 truncate w-20">
        {file.name}
      </p>
    </div>
  );
};
