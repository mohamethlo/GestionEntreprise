import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CommercialDepartment from "./pages/departement/commercial/CommercialDepartment";
import NotFound from "./pages/NotFound";
import AdministrationDepartment from "./pages/departement/administration/AdministrationDepartment";
import ComptabiliteDepartment from "./pages/departement/comptabilite/ComptabiliteDepartment";
import RhDepartment from "./pages/departement/rh/RhDepartment";
import InterventionDepartment from "./pages/departement/intervention/InterventionDepartment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/department/commercial" element={<CommercialDepartment />} />
          <Route path="/department/utilisateur" element={<AdministrationDepartment />} />
          <Route path="/department/comptabilite" element={<ComptabiliteDepartment />} />
          <Route path="/department/rh" element={<RhDepartment/>} />
          <Route path="/department/intervention" element={<InterventionDepartment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
