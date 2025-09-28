// src/components/rh/RhNavbar.jsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, User, Briefcase, FileText, Calendar, UserPlus, Clock, MapPin, Wallet } from "lucide-react";

// Liste des éléments de navigation exportée pour être utilisée dans RhDepartment
export const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: Home },
  { key: "time-tracking", label: "Pointage", icon: Clock },
  { key: "work-zone", label: "Zone de travail", icon: MapPin },
  { key: "salary-advance", label: "Avance Salaire", icon: Wallet },
  { key: "employee-file", label: "Fiche Employé", icon: User },
  { key: "leaves", label: "Gestion des Congés", icon: Calendar },
  { key: "recruitment", label: "Recrutement", icon: Briefcase },
  { key: "rh-documents", label: "Document RH", icon: FileText },
  { key: "new-hire", label: "Nouvelle Embauche", icon: UserPlus }
  
];

const RhNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sticky top-[72px] z-10 p-4 border-b border-gray-200 bg-background shadow-sm overflow-x-auto whitespace-nowrap">
      <div className="flex gap-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeTab;
          return (
            <Button
              key={item.key}
              variant={isActive ? "default" : "outline"}
              className={`flex items-center gap-2 h-10 transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab(item.key)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default RhNavbar;