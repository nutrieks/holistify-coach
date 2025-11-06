import { useAuth } from "@/hooks/useAuth";
import { FormsTab } from "@/components/FormsTab";

const ClientForms = () => {
  const { profile } = useAuth();
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Učitavam...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <FormsTab 
        clientId={profile.id} 
        clientName={profile.full_name || "Klijent"} 
      />
    </div>
  );
};

export default ClientForms;
