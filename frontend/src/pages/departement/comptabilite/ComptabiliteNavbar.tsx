import React from 'react';
import { Button } from "@/components/ui/button";
import { Home,Wrench,Users,Settings,Calendar,Receipt, Trash } from "lucide-react";

// Liste des éléments de navigation exportée pour être utilisée dans AdminDepartment
export const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: Home },
  { key: "dakar", label: "Dépense Dakar", icon: Receipt },
  { key: "mbour", label: "Dépense Mbour", icon: Receipt },
  { key: "corbeille", label: "Corbeille", icon: Trash },
];

const DashboardNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="p-4">
      <div className="flex gap-3 flex-wrap">
        {NAV_ITEMS.map((item) => {
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
                transition-all duration-300 ease-out
                transform
                
                ${isActive 
                  ? // Style actif - Bouton bleu avec animations
                    'bg-primary text-primary-foreground shadow-2xl hover:shadow-3xl rounded-xl ' +
                    'hover:scale-105 hover:bg-primary/95 ' +
                    'active:scale-95 active:shadow-lg ' +
                    'shadow-blue-500/25 hover:shadow-blue-500/40'
                  : // Style inactif - Bouton blanc avec animations
                    'bg-white text-black border-2 border-gray-300 rounded-xl ' +
                    'hover:scale-105 hover:shadow-2xl hover:bg-white ' +
                    'active:scale-95 ' +
                    'shadow-gray-200/50 hover:shadow-primary/30 ' +
                    'hover:border-primary/30'
                }
                
                // Animation de pulse pour les boutons actifs
                ${isActive ? 'animate-pulse-subtle' : ''}
              `}
              onClick={() => setActiveTab(item.key)}
            >
              {/* Effet de brillance au survol */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                transform -skew-x-12 translate-x-[-100%]
                transition-transform duration-500 ease-out
                group-hover:translate-x-[100%]
                ${isActive ? 'via-white/30' : 'via-gray-100/40'}
              `} />
              
              {/* Icone avec animation */}
              <IconComponent className={`
                h-4 w-4 transition-all duration-300
                ${isActive 
                  ? 'text-white group-hover:scale-110' 
                  : 'text-gray-600 group-hover:text-primary group-hover:scale-110'
                }
                group-active:scale-90
              `} />
              
              {/* Texte avec animation de glissement */}
              <span className={`
                relative transition-all duration-300
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-800 group-hover:text-primary'
                }
                group-hover:translate-x-0.5
              `}>
                {item.label}
              </span>
              
              {/* Indicateur de statut actif - barre inférieure */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-white/80 rounded-full" />
              )}
              
              {/* Effet de halo au survol */}
              <div className={`
                absolute inset-0 rounded-xl
                transition-all duration-300
                ${isActive 
                  ? 'group-hover:bg-white/10' 
                  : 'group-hover:bg-primary/5'
                }
              `} />
            </Button>
          );
        })}
      </div>
      
      {/* Styles CSS personnalisés pour les animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        /* Smooth transitions pour tous les éléments interactifs */
        * {
          transition-property: transform, box-shadow, background-color, border-color;
          transition-duration: 200ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default DashboardNavbar;