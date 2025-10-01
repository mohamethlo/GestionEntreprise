// src/RhDepartment.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RhHeader from "./InterventionHeader";
import RhNavbar, { NAV_ITEMS } from "./InterventionNavbar";
import DashboardContent from "./DashboardContent";
import InterventionContent from "./pages/InterventionContent";
import InstallationContent from "./pages/InstallationContent";
import TeamsContent from "./pages/TeamsContent";


const InterventionDepartment = () => {
  const navigate = useNavigate();
  // 'dashboard' est l'onglet actif par défaut
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key); 

  // Fonction pour rendre le contenu dynamique
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "intervention":
        return <InterventionContent />;
      case "installation":
        return <InstallationContent />;
      case "equipe":
        return <TeamsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      
      {/* 1. Header (Logo, Nom, Date) */}
      <RhHeader navigate={navigate} />
      
      {/* 2. Navbar (Menu de navigation) */}
      <RhNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 3. Contenu Dynamique */}
      <div className="flex-1">
        {renderContent()}
      </div>

    </div>
  );
};

export default InterventionDepartment;