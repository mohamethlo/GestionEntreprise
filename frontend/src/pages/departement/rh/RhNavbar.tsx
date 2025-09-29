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
    // Ce conteneur simule le bloc d'actions rapides vu dans l'image.
    // On retire les styles "sticky" et "border-t" pour un look de bloc d'actions interne.
    <div className="p-4"> 
      
      {/* Utilisation de "flex gap-3 flex-wrap" pour aligner les boutons comme sur l'image */}
      <div className="flex gap-3 flex-wrap">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeTab;
          return (
            <Button
              key={item.key}
              // Si actif: 'default' (rempli, bleu), si inactif: 'outline' (bordure noire)
              variant={isActive ? "default" : "outline"} 
              className={`
                flex items-center gap-2 h-10 
                font-semibold
                
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 rounded-xl' 
                  // CLASSE MODIFIÉE : Ajout de hover:text-white pour garantir la couleur du texte blanche au survol.
                  : 'bg-background text-foreground border-2 border-input rounded-xl hover:shadow-md hover:shadow-primary/50 hover:bg-muted/10 hover:text-white transition-shadow duration-200'
                }
                
                transition-all
              `}
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
