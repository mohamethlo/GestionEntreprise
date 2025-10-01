import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, User, Briefcase, FileText, Calendar, UserPlus, Clock, MapPin, Wallet, Users, Shield, Settings, Bell } from "lucide-react";

// Liste des éléments de navigation exportée pour être utilisée dans AdminDepartment
export const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: Home },
  { key: "users", label: "Gestion utilisateur", icon: Users },
  { key: "security", label: "Gestion Roles et Permissions", icon: Shield },
  { key: "password", label: "Rénitialisation Mot de Passe", icon: FileText },
  { key: "setting", label: "Paramètre du système", icon: Settings },
];

const AdminNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="p-4">
      <div className="flex gap-3 flex-wrap">
        {NAV_ITEMS.map((item, index) => {
          const isActive = item.key === activeTab;
          const IconComponent = item.icon;
          
          return (
            <Button
              key={item.key}
              variant={isActive ? "default" : "outline"}
              className={`
                group relative
                flex items-center gap-2 h-10 
                font-semibold
                overflow-hidden
                transition-all duration-500 ease-out
                transform
                
                // Animation d'entrée pour chaque bouton
                animate-in slide-in-from-left-8
                fade-in-0
                zoom-in-95
                
                ${isActive 
                  ? // Style actif - Bouton bleu avec animations
                    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl rounded-xl ' +
                    'hover:scale-105 hover:from-blue-700 hover:to-indigo-700 ' +
                    'active:scale-95 active:shadow-lg ' +
                    'shadow-blue-500/25 hover:shadow-blue-500/40'
                  : // Style inactif - Bouton blanc avec animations
                    'bg-white text-black border-2 border-gray-300 rounded-xl ' +
                    'hover:scale-105 hover:shadow-2xl hover:bg-white ' +
                    'active:scale-95 ' +
                    'shadow-gray-200/50 hover:shadow-blue-500/20 ' +
                    'hover:border-blue-400/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                }
                
                // Animation de pulse pour les boutons actifs
                ${isActive ? 'animate-pulse-subtle' : ''}
                
                // Délai d'animation progressif pour l'entrée
                [animation-delay:${index * 100}ms]
                [animation-duration:600ms]
              `}
              onClick={() => setActiveTab(item.key)}
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: '600ms'
              }}
            >
              {/* Effet de particules d'entrée */}
              <div className={`
                absolute inset-0 rounded-xl
                bg-gradient-to-r from-blue-400/20 to-purple-400/20
                opacity-0 group-hover:opacity-100
                transition-all duration-700 ease-out
                transform scale-0 group-hover:scale-100
                ${isActive ? 'opacity-20' : ''}
              `} />
              
              {/* Effet de brillance au survol */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                transform -skew-x-12 translate-x-[-150%]
                transition-transform duration-700 ease-out
                group-hover:translate-x-[150%]
                ${isActive ? 'via-white/40' : 'via-blue-100/60'}
              `} />
              
              {/* Icone avec animation */}
              <IconComponent className={`
                h-4 w-4 transition-all duration-500
                relative z-10
                ${isActive 
                  ? 'text-white group-hover:scale-110 group-hover:rotate-12' 
                  : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110 group-hover:rotate-12'
                }
                group-active:scale-90
                animate-in zoom-in-50
                [animation-delay:${index * 150 + 200}ms]
              `} 
              style={{
                animationDelay: `${index * 150 + 200}ms`
              }}
              />
              
              {/* Texte avec animation de glissement */}
              <span className={`
                relative z-10 transition-all duration-500
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-800 group-hover:text-blue-700'
                }
                group-hover:translate-x-1
                animate-in slide-in-from-bottom-5
                [animation-delay:${index * 100 + 300}ms]
              `}
              style={{
                animationDelay: `${index * 100 + 300}ms`
              }}
              >
                {item.label}
              </span>
              
              {/* Indicateur de statut actif - barre inférieure animée */}
              {isActive && (
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 
                  w-4/5 h-0.5 bg-white/90 rounded-full
                  animate-in slide-in-from-bottom-2
                  zoom-in-75
                  [animation-delay:200ms]
                `} 
                style={{
                  animationDelay: '200ms'
                }}
                />
              )}
              
              {/* Points lumineux d'animation */}
              <div className={`
                absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full
                opacity-0 group-hover:opacity-100
                transition-all duration-300
                group-hover:animate-ping
                ${isActive ? 'opacity-100 animate-ping' : ''}
              `} />
              
              {/* Effet de halo pulsant pour l'état actif */}
              {isActive && (
                <div className={`
                  absolute inset-0 rounded-xl
                  bg-white/20
                  animate-pulse
                  opacity-40
                `} />
              )}
              
              {/* Animation de rebond au clic */}
              <div className={`
                absolute inset-0 rounded-xl bg-white/30
                scale-0 opacity-0
                transition-all duration-200
                group-active:scale-100 group-active:opacity-100
              `} />
            </Button>
          );
        })}
      </div>
      
      {/* Styles CSS personnalisés pour les animations avancées */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
        }
        
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes zoomIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromBottom {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-left-8 {
          animation-name: slideInFromLeft;
        }
        
        .slide-in-from-bottom-5 {
          animation-name: slideInFromBottom;
        }
        
        .slide-in-from-bottom-2 {
          animation-name: slideInFromBottom;
          animation-duration: 400ms;
        }
        
        .zoom-in-95 {
          animation-name: zoomIn;
          animation-duration: 500ms;
        }
        
        .zoom-in-50 {
          animation-name: zoomIn;
          animation-duration: 400ms;
        }
        
        .zoom-in-75 {
          animation-name: zoomIn;
          animation-duration: 300ms;
        }
        
        .fade-in-0 {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        /* Smooth transitions pour tous les éléments interactifs */
        * {
          transition-property: transform, box-shadow, background-color, border-color, opacity;
          transition-duration: 300ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Effet de profondeur amélioré */
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.15);
        }
        
        .shadow-blue-500/25 {
          box-shadow: 0 10px 30px -5px rgba(59, 130, 246, 0.25);
        }
        
        .shadow-blue-500/40 {
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AdminNavbar;