// src/RhDepartment.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RhHeader from "./CommercialHeader";
import RhNavbar, { NAV_ITEMS } from "./CommercialNavbar";
import DashboardContent from "./DashboardContent";
import ClientContent from "./pages/ClientContent";
import DevisContent from "./pages/DevisContent";
import StockContent from "./pages/StockContent";
import ProductContent from "./pages/ProductContent";
import ProformasContent from "./pages/ProformasContent";



const CommercialDepartment = () => {
  const navigate = useNavigate();
  // 'dashboard' est l'onglet actif par défaut
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key); 

  // Fonction pour rendre le contenu dynamique
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "clients":
        return <ClientContent />;
      case "devis":
        return <DevisContent />;
      case "stock":
        return <StockContent />;
      case "produit":
        return <ProductContent />;
      case "proformas":
        return <ProformasContent />;
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

export default CommercialDepartment;