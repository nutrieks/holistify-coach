import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ClientsList from "./pages/admin/ClientsList";
import ClientDetail from "./pages/admin/ClientDetail";
import Messages from "./pages/admin/Messages";
import NutritionLibrary from "./pages/admin/NutritionLibrary";
import TrainingLibrary from "./pages/admin/TrainingLibrary";
import NutritionPlanCreator from "./pages/admin/NutritionPlanCreator";
import TrainingPlanCreator from "./pages/admin/TrainingPlanCreator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dashboard redirect component
const DashboardRedirect = () => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Učitavam...</div>
      </div>
    );
  }
  
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/client" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/clients" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ClientsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/clients/:id" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ClientDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/messages" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/nutrition" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <NutritionLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/training" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TrainingLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/plans/nutrition/create" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <NutritionPlanCreator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/plans/training/create" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TrainingPlanCreator />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/client" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
