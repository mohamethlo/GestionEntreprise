import { useState } from "react";

const netsystemeLogo = "/logo/netsysteme.png";

interface Department {
  id: string;
  name: string;
  color: string;
  angle: number;
  icon: string;
}

const departments: Department[] = [
  { id: "commercial", name: "Gestion Commercial", color: "commercial", angle: 0, icon: "💼" },
  { id: "comptabilite", name: "Gestion Comptable", color: "comptabilite", angle: 72, icon: "💳" },
  { id: "intervention", name: "Gestion intervention", color: "intervention", angle: 144, icon: "🔧" },
  { id: "rh", name: "Gestion RH", color: "hr", angle: 216, icon: "👥" },
  { id: "utilisateur", name: "Gestion Utilisateur", color: "utilisateur", angle: 288, icon: "👤" },
];

const Dashboard = () => {
  const [isRotating, setIsRotating] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);

  const handleDepartmentClick = (departmentId: string) => {
    setIsRotating(false);
    setSelectedDepartment(departmentId);

    setTimeout(() => {
      // Simulation de navigation - remplacez par votre logique de routing
      window.location.href = `/department/${departmentId}`;
      // Ou avec React Router : navigate(`/department/${departmentId}`);
    }, 1000);
  };

  const handleOrbitClick = () => {
    if (!isRotating && !hoveredDepartment) {
      setIsRotating(true);
      setSelectedDepartment(null);
    }
  };

  const handleDepartmentMouseEnter = (departmentId: string) => {
    setHoveredDepartment(departmentId);
    setIsRotating(false);
  };

  const handleDepartmentMouseLeave = () => {
    setHoveredDepartment(null);
    if (!selectedDepartment) {
      setIsRotating(true);
    }
  };

  // Configuration responsive : PC vs Mobile
  const isMobile = window.innerWidth < 768;
  const containerSize = isMobile ? 500 : 750; // Mobile: 500px (plus grand), PC: 750px
  const radius = containerSize * (isMobile ? 0.48 : 0.4); // Mobile: plus éloigné, PC: inchangé

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface overflow-hidden">
      {/* Background Effects responsive */}
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-commercial/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/10 rounded-full animate-ripple ${isMobile ? 'w-[520px] h-[520px]' : 'w-[700px] h-[700px]'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/20 rounded-full animate-ripple ${isMobile ? 'w-[380px] h-[380px]' : 'w-[500px] h-[500px]'}`} style={{ animationDelay: '2s' }} />
        
        {/* Ondes lumineuses adaptatives */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`border border-primary/5 rounded-full animate-wave ${isMobile ? 'w-[580px] h-[580px]' : 'w-[800px] h-[800px]'}`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/8 rounded-full animate-wave ${isMobile ? 'w-[440px] h-[440px]' : 'w-[600px] h-[600px]'}`} style={{ animationDelay: '1.5s' }}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/12 rounded-full animate-wave ${isMobile ? 'w-[300px] h-[300px]' : 'w-[400px] h-[400px]'}`} style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      {/* Header - Identique à l'original */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={netsystemeLogo} alt="NetSysteme" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-glow">NETSYSTEME</h1>
          </div>
          <div className="text-sm text-muted-foreground">24/7 - Système Actif</div>
        </div>
      </div>

      {/* Central Orbital System - Ajusté pour éviter la barre du navigateur sur PC */}
      <div className={`relative z-10 flex items-center justify-center ${isMobile ? 'h-[calc(100vh-100px)] mt-4' : 'h-[calc(100vh-180px)] mt-8'}`}>
        <div
          className="relative"
          style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
          onClick={handleOrbitClick}
        >
          {/* Central Logo avec effet pulsant */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-surface to-surface-elevated border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_hsl(var(--primary)/0.3)] animate-glow">
              <img src={netsystemeLogo} alt="NetSysteme" className="h-20 w-20" />
            </div>
          </div>

          {/* Zone d'espacement visuel adaptative */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/5 pointer-events-none ${isMobile ? 'w-32 h-32' : 'w-56 h-56'}`}></div>

          {/* Orbital Container avec cartes qui orbitent */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ${
              isRotating ? "orbit-container" : "orbit-container paused"
            }`}
          >
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${dept.angle}deg) translateY(-${radius}px)`,
                }}
              >
                {/* Carte plus large et moins haute */}
                <div
                  className={`department-card w-56 h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 px-4 ${
                    selectedDepartment === dept.id ? "active scale-110" : "hover:scale-105"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDepartmentClick(dept.id);
                  }}
                >
                  <div className="text-6xl mb-4">{dept.icon}</div> {/* Icônes ÉNORMES */}
                  <div className="text-lg font-semibold leading-tight text-center">{dept.name}</div> {/* Texte fixe */}
                </div>
              </div>
            ))}
          </div>

          {/* Orbital Lines très longues */}
          {departments.map((dept) => (
            <div
              key={`line-${dept.id}`}
              className="absolute top-1/2 left-1/2 w-px bg-gradient-to-t from-transparent via-primary/20 to-transparent"
              style={{
                height: `${radius}px`,
                transform: `translate(-50%, -50%) rotate(${dept.angle}deg)`,
                transformOrigin: "center bottom",
              }}
            />
          ))}

          {/* Cercle orbital pour visualiser la trajectoire */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-primary/5 pointer-events-none"></div>
        </div>
      </div>

      {/* Instructions - Identiques à l'original */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center text-muted-foreground">
        <p className="text-sm">Cliquez sur un département pour y accéder</p>
        <p className="text-xs mt-1">Cliquez au centre pour redémarrer la rotation</p>
      </div>

      {/* Styles CSS pour l'animation orbitale et les effets de "guerre d'alerte" */}
      <style>{`
        .orbit-container {
          animation: orbit 35s linear infinite;
        }
        
        .orbit-container.paused {
          animation-play-state: paused;
        }
        
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        /* Animations de clignotement et ondulation */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes ripple {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4); }
        }
        
        @keyframes wave {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px hsl(var(--primary)/0.3); }
          50% { box-shadow: 0 0 60px hsl(var(--primary)/0.6), 0 0 100px hsl(var(--primary)/0.2); }
        }
        
        /* ANIMATIONS DE GUERRE D'ALERTE ! */
        @keyframes battle-alert {
          0% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }
          25% { 
            box-shadow: 0 0 40px rgba(255, 0, 0, 0.6), 0 0 60px rgba(255, 0, 0, 0.3);
            border-color: rgba(255, 0, 0, 0.8);
            transform: scale(1.05);
          }
          50% { 
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.6), 0 0 80px rgba(0, 255, 255, 0.3);
            border-color: rgba(0, 255, 255, 0.8);
            transform: scale(1.08);
          }
          75% { 
            box-shadow: 0 0 45px rgba(255, 255, 0, 0.6), 0 0 70px rgba(255, 255, 0, 0.3);
            border-color: rgba(255, 255, 0, 0.8);
            transform: scale(1.03);
          }
          100% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }
        }
        
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-3px) scale(1.1); }
          50% { transform: translateY(-6px) scale(1.15); }
          75% { transform: translateY(-3px) scale(1.05); }
        }
        
        @keyframes text-pulse {
          0%, 100% { opacity: 1; color: rgba(255, 255, 255, 1); }
          50% { opacity: 0.7; color: rgba(255, 100, 100, 1); }
        }
        
        @keyframes message-flash {
          0%, 90% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
          10%, 80% { 
            opacity: 1; 
            transform: translate(-50%, -10px) scale(1);
            background-color: #ef4444;
          }
          45% { 
            background-color: #f97316;
            transform: translate(-50%, -15px) scale(1.1);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-ripple {
          animation: ripple 6s ease-out infinite;
        }
        
        .animate-wave {
          animation: wave 8s ease-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-battle-alert {
          animation: battle-alert 3s ease-in-out infinite;
        }
        
        .animate-icon-bounce {
          animation: icon-bounce 2s ease-in-out infinite;
        }
        
        .animate-text-pulse {
          animation: text-pulse 2.5s ease-in-out infinite;
        }
        
        .animate-message-flash {
          animation: message-flash 4s ease-in-out infinite;
        }
        
        .department-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: visible;
        }
        
        .department-card.hovered {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
          transform: translateY(-5px) scale(1.05);
          animation: none; /* Arrête l'animation de guerre */
        }
        
        .department-card.hovered .animate-battle-alert,
        .department-card.hovered .animate-icon-bounce,
        .department-card.hovered .animate-text-pulse,
        .department-card.hovered .animate-message-flash {
          animation-play-state: paused;
        }
        
        .department-card.active {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(0, 255, 0, 0.8);
          box-shadow: 0 0 60px rgba(0, 255, 0, 0.6);
          animation: none;
        }
        
        .department-content {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;