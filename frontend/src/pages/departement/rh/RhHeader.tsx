import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const RhHeader = ({ navigate }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="sticky top-0 z-10 border-b border-primary/20 bg-surface/50 backdrop-blur-sm">
      <div className="p-4 flex items-center justify-between">
        
        {/* Gauche : Logo et Retour */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/20"
            aria-label="Retour au tableau de bord principal"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={netsystemeLogo} alt="NetSysteme Logo" className="h-8 w-8" />
        </div>
        
        {/* Centre : Nom de l'Entreprise */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold text-primary">NETSYSTEME</h1>
          <p className="text-sm text-muted-foreground">Département Ressources Humaines</p>
        </div>
        
        {/* Droite : Date */}
        <div className="text-right">
          <div className="text-lg font-bold text-primary">{currentDate}</div>
          <div className="text-sm text-success flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Service RH Actif</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RhHeader;