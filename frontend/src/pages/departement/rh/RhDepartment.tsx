// src/RhDepartment.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RhHeader from "./RhHeader";
import RhNavbar, { NAV_ITEMS } from "./RhNavbar";

// Importez tous les composants de contenu
import DashboardContent from "./DashboardContent";
import EmployeeFileContent from "./pages/EmployeeFileContent";
import LeavesContent from "./pages/LeavesContent";
import RecruitmentContent from "./pages/RecruitmentContent";
import RhDocumentsContent from "./pages/RhDocumentsContent";
import NewHireContent from "./pages/NewHireContent";
import TimeTrackingContent from "./pages/TimeTrackingContent";
import WorkZoneContent from "./pages/WorkZoneContent";
import SalaryAdvanceContent from "./pages/SalaryAdvanceContent";

const RhDepartment = () => {
  const navigate = useNavigate();
  // 'dashboard' est l'onglet actif par défaut
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key); 

  // Fonction pour rendre le contenu dynamique
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "time-tracking":
        return <TimeTrackingContent />;
      case "work-zone":
        return <WorkZoneContent />;
      case "salary-advance":
        return <SalaryAdvanceContent />;
      case "employee-file":
        return <EmployeeFileContent />;
      case "leaves":
        return <LeavesContent />;
      case "recruitment":
        return <RecruitmentContent />;
      case "rh-documents":
        return <RhDocumentsContent />;
      case "new-hire":
        return <NewHireContent />;
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

export default RhDepartment;