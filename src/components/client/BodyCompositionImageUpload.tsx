import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BodyCompositionImageUploadProps {
  clientId: string;
  onAnalysisComplete: (bodyFatPercentage: number) => void;
}

export default function BodyCompositionImageUpload({ 
  clientId, 
  onAnalysisComplete 
}: BodyCompositionImageUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Greška",
        description: "Slika je prevelika. Maksimalna veličina je 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Greška",
        description: "Molimo odaberite sliku.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64 for AI analysis
    setIsAnalyzing(true);
    try {
      const base64Reader = new FileReader();
      base64Reader.onload = async () => {
        const imageBase64 = base64Reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('analyze-body-composition', {
          body: { imageBase64 }
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        toast({
          title: "Analiza Završena",
          description: `Procijenjeni %BF: ${data.bodyFatPercentage}%\nMišićna masa: ${data.muscleMassLevel}\n\n${data.assessment}`,
        });

        onAnalysisComplete(data.bodyFatPercentage);
      };
      base64Reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Došlo je do greške pri analizi slike.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Analiza Tjelesne Kompozicije
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload slike tijela za AI procjenu postotka tjelesne masti. 
          Najbolji rezultati: frontalna slika, dobro osvjetljenje, blaga odjeća.
        </p>

        <div className="flex flex-col items-center gap-4">
          {preview && (
            <div className="relative w-full max-w-sm">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}

          <label htmlFor="body-image-upload">
            <Button
              type="button"
              disabled={isAnalyzing}
              onClick={() => document.getElementById('body-image-upload')?.click()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analiziram sliku...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {preview ? "Odaberi Drugu Sliku" : "Upload Sliku"}
                </>
              )}
            </Button>
          </label>
          <input
            id="body-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={isAnalyzing}
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>⚠️ AI procjena je aproksimacija i ne zamjenjuje profesionalne mjerenja.</p>
          <p>📷 Za najbolje rezultate: frontalna i bočna slika u minimalnoj odjeći.</p>
        </div>
      </CardContent>
    </Card>
  );
}
