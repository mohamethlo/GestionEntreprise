import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut, ChevronDown } from "lucide-react";
import netsystemeLogo from "@/assets/netsysteme-logo.png";
import { useNavigate } from 'react-router-dom';

const CommercialHeader = ({ navigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigateHook = useNavigate();

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Logique de déconnexion
    console.log("Déconnexion...");
    
    // Redirection vers la page login
    navigateHook("/login");
    
    setIsDropdownOpen(false);
  };

  return (
    <div className="sticky top-0 z-10 border-b border-primary/20 bg-surface/100 backdrop-blur-sm">
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
          <p className="text-sm text-muted-foreground" style={{fontSize: "20px", color: "white"}}>NETSYSTEME</p>
        </div>
        
        {/* Centre : Nom de l'Entreprise */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold text-primary">Département Commercial</h1>
        </div>
        
        {/* Droite : Profil utilisateur avec dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-primary/20 transition-all duration-200 group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <User className="h-4 w-4 text-primary" />
            </div>
            <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 animate-in fade-in-80">
              {/* En-tête du profil */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Administrateur Commercial</p>
                <p className="text-xs text-gray-500 mt-1">commercial@netsysteme.com</p>
              </div>
              
              {/* Option Déconnexion */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommercialHeader;