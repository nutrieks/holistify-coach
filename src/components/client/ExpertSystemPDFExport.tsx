import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { OptimalCaloriesResult } from "@/utils/expertSystemCalculations";

interface ExpertSystemPDFExportProps {
  result: OptimalCaloriesResult;
  clientName: string;
}

export default function ExpertSystemPDFExport({ 
  result, 
  clientName 
}: ExpertSystemPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Generate HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Expert System Preporuke - ${clientName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .highlight {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .big-number {
      font-size: 48px;
      font-weight: bold;
      color: #2563eb;
    }
    .macro-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .macro-box {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .macro-box .value {
      font-size: 24px;
      font-weight: bold;
    }
    .reasoning {
      background: #f9fafb;
      padding: 15px;
      border-left: 4px solid #10b981;
      margin: 10px 0;
    }
    .badge {
      display: inline-block;
      background: #e5e7eb;
      padding: 5px 10px;
      border-radius: 4px;
      margin: 5px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>Expert System Preporuke</h1>
  <p><strong>Klijent:</strong> ${clientName}</p>
  <p><strong>Datum:</strong> ${new Date().toLocaleDateString('hr-HR')}</p>

  <div class="highlight">
    <h2>Finalne Preporuke</h2>
    <p>Adaptive TDEE</p>
    <div class="big-number">${Math.round(result.adaptiveTDEE)} kcal</div>
    <p style="margin-top: 20px;">Preporučene Dnevne Kalorije</p>
    <div class="big-number" style="color: #10b981;">${Math.round(result.recommendedCalories)} kcal</div>
  </div>

  <h2>Makronutrijenti</h2>
  <div class="macro-grid">
    <div class="macro-box">
      <div style="color: #ef4444;">Protein</div>
      <div class="value">${Math.round(result.protein)}g</div>
      <div>${((result.protein * 4) / result.recommendedCalories * 100).toFixed(0)}%</div>
    </div>
    <div class="macro-box">
      <div style="color: #3b82f6;">Ugljikohidrati</div>
      <div class="value">${Math.round(result.carbs)}g</div>
      <div>${((result.carbs * 4) / result.recommendedCalories * 100).toFixed(0)}%</div>
    </div>
    <div class="macro-box">
      <div style="color: #f59e0b;">Masti</div>
      <div class="value">${Math.round(result.fats)}g</div>
      <div>${((result.fats * 9) / result.recommendedCalories * 100).toFixed(0)}%</div>
    </div>
  </div>

  <h2>Detalji Kalkulacije</h2>
  <p><strong>DEE (Daily Energy Expenditure):</strong> ${Math.round(result.dee)} kcal</p>
  <p><strong>TEF (Thermic Effect of Food):</strong> ${Math.round(result.tef)} kcal</p>
  <p><strong>Adaptive TDEE:</strong> ${Math.round(result.adaptiveTDEE)} kcal</p>

  <h2>Metabolički Profil</h2>
  <p><span class="badge">Insulin Sensitivity: ${result.insulinSensitivity.score.toUpperCase()}</span></p>
  <p><span class="badge">Muscle Potential: ${result.musclePotential.score.toUpperCase()}</span></p>
  <p><span class="badge">Deficit Speed: ${result.deficitSpeed.speed.toUpperCase()}</span></p>

  <h2>Razlozi za Preporuke</h2>
  ${result.reasoning.map(reason => `<div class="reasoning">✓ ${reason}</div>`).join('')}

  <div class="footer">
    <p>Ovaj izvještaj je generiran automatski Expert System alatom.</p>
    <p>Za dodatna pitanja kontaktirajte svog trenera/nutricionistu.</p>
  </div>
</body>
</html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expert-system-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Izvoz Uspješan",
        description: "Izvještaj je spremljen. Otvorite HTML file i koristite 'Print to PDF' za finalni PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri izvozu PDF-a.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting}
      variant="outline"
      className="w-full"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Izvozim PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Izvezi PDF Izvještaj
        </>
      )}
    </Button>
  );
}
