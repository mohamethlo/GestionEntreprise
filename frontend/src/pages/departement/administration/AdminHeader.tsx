import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut, ChevronDown, Shield, Settings, Bell } from "lucide-react";
import netsystemeLogo from "@/assets/netsysteme-logo.png";
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ navigate }) => {
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
    // Animation de déconnexion
    setIsDropdownOpen(false);
    
    // Petit délai pour l'animation
    setTimeout(() => {
      navigateHook("/login");
    }, 300);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-blue-200/30 bg-gradient-to-r from-blue-600/95 to-indigo-600/95 backdrop-blur-xl shadow-2xl shadow-blue-500/20">
      <div className="p-4 flex items-center justify-between">
        
        {/* Gauche : Logo et Retour */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 hover:rotate-12 group relative overflow-hidden"
            aria-label="Retour au tableau de bord principal"
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <ArrowLeft className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
          </Button>
          
          {/* Logo avec animation */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img 
                src={netsystemeLogo} 
                alt="NetSysteme Logo" 
                className="h-10 w-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 drop-shadow-2xl" 
              />
              {/* Halo autour du logo */}
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 blur-sm" />
            </div>
            
            {/* Texte avec animation de pression */}
            <div className="flex flex-col">
              <p className="text-lg font-black text-white tracking-wide drop-shadow-lg transition-all duration-300 group-hover:scale-105">
                NETSYSTEME
              </p>
              <div className="h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>
        </div>
        
        {/* Centre : Titre du département avec animations */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-500 group-hover:scale-105">
              Département Administration
            </h1>
            
            {/* Sous-titre animé */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <p className="text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
                Gestion système et sécurité
              </p>
            </div>
            
            {/* Barre de progression animée */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-1000 ease-out rounded-full" />
          </div>
        </div>
        
        {/* Droite : Profil utilisateur avec dropdown animé */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-3 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group relative overflow-hidden rounded-2xl px-4 py-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Effet de fond animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            {/* Avatar avec animation */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50">
                <User className="h-5 w-5 text-white" />
              </div>
              
              {/* Point de statut */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
            
            {/* Flèche animée */}
            <ChevronDown className={`h-4 w-4 text-white transition-all duration-300 ${
              isDropdownOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'
            }`} />
          </Button>

          {/* Dropdown Menu avec animations d'entrée */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-16 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/20 border border-white/20 overflow-hidden animate-in zoom-in-95 fade-in-80">
              
              {/* En-tête du profil avec gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                {/* Effet de particules */}
                <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-[-50%]" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Administrateur</p>
                      <p className="text-white/80 text-sm">Super Admin</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs">admin@netsysteme.com</p>
                </div>
              </div>
              
              {/* Section informations */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Settings className="h-4 w-4" />
                  <span>Accès complet système</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="h-4 w-4" />
                  <span>Toutes permissions</span>
                </div>
              </div>
              
              {/* Option Déconnexion avec animation */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Effet de fond rouge au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">Déconnexion</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Styles CSS personnalisés pour les animations avancées */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in-80 {
          animation: fadeIn 0.3s ease-out;
        }
        
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
        
        /* Effet de brillance amélioré */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
        
        /* Ombres portées premium */
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default AdminHeader;