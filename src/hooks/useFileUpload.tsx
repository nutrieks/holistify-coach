import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    userId: string
  ): Promise<FileUploadResult | null> => {
    try {
      setUploading(true);

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Greška",
          description: "Datoteka je prevelika. Maksimalna veličina je 10MB.",
          variant: "destructive",
        });
        return null;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Greška",
          description: "Tip datoteke nije podržan.",
          variant: "destructive",
        });
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);

      return {
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno učitavanje datoteke",
        variant: "destructive",
      });
      console.error("File upload error:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
