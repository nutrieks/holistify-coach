import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { NutritionPlanViewer } from "@/components/nutrition-plan/NutritionPlanViewer";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function NutritionPlanViewerPage() {
  const { planId } = useParams<{ planId: string }>();
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanClient = async () => {
      if (!planId) return;
      
      try {
        const { data } = await supabase
          .from('meal_plans')
          .select('client_id')
          .eq('id', planId)
          .single();
        
        if (data) {
          setClientId(data.client_id);
        }
      } catch (error) {
        console.error('Error fetching plan client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanClient();
  }, [planId]);

  if (loading) {
    return (
      <AdminLayout title="Plan Prehrane">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (!planId || !clientId) {
    return (
      <AdminLayout title="Plan Prehrane">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Plan nije pronađen</p>
          <Button asChild>
            <Link to="/admin/nutrition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Plan Prehrane">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/nutrition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak na Biblioteku
            </Link>
          </Button>
        </div>

        <NutritionPlanViewer 
          planId={planId}
          clientId={clientId}
          editable={true}
        />
      </div>
    </AdminLayout>
  );
}
