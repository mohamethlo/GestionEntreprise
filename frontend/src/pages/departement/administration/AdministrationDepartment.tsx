
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RhHeader from "./AdminHeader";
import RhNavbar, { NAV_ITEMS } from "./AdminNavbar";
import UserContent from "./pages/UserContent";
import DashboardContent from "./DashboardContent";
import SecurityContent from "./pages/SecurityContent";
import SettingContent from "./pages/SettingContent";
import PasswordContent from "./pages/PasswordContent";


const RhDepartment = () => {
  const navigate = useNavigate();
  // 'dashboard' est l'onglet actif par défaut
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key); 

  // Fonction pour rendre le contenu dynamique
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UserContent />;
      case "security":
        return < SecurityContent/>;
      case "password":
        return <PasswordContent />;
      case "setting":
        return <SettingContent />;
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