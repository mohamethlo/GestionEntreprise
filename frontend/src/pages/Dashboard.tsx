import { useState, useEffect } from "react";

const netsystemeLogo = "/logo/netsysteme.png";

interface Department {
  id: string;
  name: string;
  color: string;
  angle: number;
  icon: string;
  gradient: string;
}

const departments: Department[] = [
  { id: "commercial", name: "Gestion Commercial", color: "commercial", angle: 0, icon: "💼", gradient: "from-blue-500 to-cyan-500" },
  { id: "comptabilite", name: "Gestion Comptable", color: "comptabilite", angle: 72, icon: "💳", gradient: "from-emerald-500 to-teal-500" },
  { id: "intervention", name: "Gestion intervention", color: "intervention", angle: 144, icon: "🔧", gradient: "from-orange-500 to-amber-500" },
  { id: "rh", name: "Gestion RH", color: "hr", angle: 216, icon: "👥", gradient: "from-purple-500 to-pink-500" },
  { id: "utilisateur", name: "Gestion Utilisateur", color: "utilisateur", angle: 288, icon: "👤", gradient: "from-rose-500 to-red-500" },
];

const Dashboard = () => {
  const [isRotating, setIsRotating] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDepartmentClick = (departmentId: string) => {
    setIsRotating(false);
    setSelectedDepartment(departmentId);
    
    // Créer des particules d'explosion
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }));
    setParticles(newParticles);
    
    setTimeout(() => setParticles([]), 1000);

    setTimeout(() => {
      window.location.href = `/department/${departmentId}`;
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
  const containerSize = isMobile ? 500 : 750;
  const radius = containerSize * (isMobile ? 0.48 : 0.4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden relative">
      {/* Curseur personnalisé effet */}
      <div 
        className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-700 ease-out z-0"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />
      
      {/* Grille animée futuriste */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      {/* Effets de fond améliorés */}
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
        
        {/* Anneaux orbitaux multiples */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[700px] h-[700px] border border-blue-500/10 rounded-full animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-cyan-500/15 rounded-full animate-spin-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-purple-500/20 rounded-full animate-pulse-ring" />
        </div>
        
        {/* Étoiles scintillantes */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Header amélioré */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={netsystemeLogo} alt="NetSysteme" className="h-10 w-10 animate-pulse-glow" />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-gradient-x">
                NETSYSTEME
              </h1>
              <p className="text-xs text-blue-300/70">Enterprise Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-300 font-medium">Système Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Orbital System */}
      <div className={`relative z-10 flex items-center justify-center ${isMobile ? 'h-[calc(100vh-100px)] mt-4' : 'h-[calc(100vh-180px)] mt-8'}`}>
        <div
          className="relative"
          style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
          onClick={handleOrbitClick}
        >
          {/* Logo central ultra moderne */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative group">
              {/* Anneaux tournants autour du logo */}
              <div className="absolute inset-0 -m-8">
                <div className="w-full h-full border-2 border-blue-500/30 rounded-full animate-spin-slow" />
                <div className="absolute inset-0 w-full h-full border-2 border-t-transparent border-cyan-500/50 rounded-full animate-spin-reverse" />
              </div>
              
              {/* Container du logo avec glassmorphism */}
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-slate-800/80 via-blue-900/60 to-slate-800/80 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_120px_rgba(59,130,246,0.6)] transition-all duration-500">
                <img src={netsystemeLogo} alt="NetSysteme" className="h-20 w-20 drop-shadow-2xl relative z-10" />
                
                {/* Effet de pulse de lumière */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/0 via-cyan-500/20 to-blue-500/0 animate-pulse-slow" />
                
                {/* Particules orbitales */}
                <div className="absolute inset-0">
                  {[0, 120, 240].map((angle) => (
                    <div
                      key={angle}
                      className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50"
                      style={{
                        top: '50%',
                        left: '50%',
                        animation: `orbit-particle 3s linear infinite`,
                        animationDelay: `${angle / 120}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Zone d'espacement visuel */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none ${isMobile ? 'w-32 h-32' : 'w-56 h-56'}`} />

          {/* Orbital Container */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ${
              isRotating ? "orbit-container" : "orbit-container paused"
            }`}
          >
            {departments.map((dept) => {
              const isHovered = hoveredDepartment === dept.id;
              const isSelected = selectedDepartment === dept.id;
              
              return (
                <div
                  key={dept.id}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${dept.angle}deg) translateY(-${radius}px)`,
                  }}
                >
                  <div
                    className={`department-card group relative w-56 h-40 cursor-pointer transition-all duration-500 ${
                      isSelected ? "scale-110" : isHovered ? "scale-105" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDepartmentClick(dept.id);
                    }}
                    onMouseEnter={() => handleDepartmentMouseEnter(dept.id)}
                    onMouseLeave={handleDepartmentMouseLeave}
                  >
                    {/* Fond glassmorphism avec gradient */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${dept.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                    <div className="absolute inset-0 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-300" />
                    
                    {/* Effet de lueur au hover */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${dept.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
                    
                    {/* Contenu de la carte */}
                    <div className="relative h-full flex flex-col items-center justify-center p-4 z-10">
                      <div className={`text-6xl mb-4 transform transition-all duration-500 ${isHovered ? 'scale-125 rotate-12' : ''} group-hover:drop-shadow-2xl`}>
                        {dept.icon}
                      </div>
                      <div className="text-base font-semibold text-white/90 group-hover:text-white leading-tight text-center transition-colors duration-300">
                        {dept.name}
                      </div>
                      
                      {/* Indicateur de hover */}
                      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${dept.gradient} group-hover:w-3/4 transition-all duration-500 rounded-full`} />
                    </div>
                    
                    {/* Particules au clic */}
                    {isSelected && particles.map(particle => (
                      <div
                        key={particle.id}
                        className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white animate-particle-burst"
                        style={{
                          transform: `translate(${particle.x}px, ${particle.y}px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lignes orbitales élégantes */}
          {departments.map((dept) => (
            <div
              key={`line-${dept.id}`}
              className={`absolute top-1/2 left-1/2 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent`}
              style={{
                height: `${radius}px`,
                transform: `translate(-50%, -50%) rotate(${dept.angle}deg)`,
                transformOrigin: "center bottom",
                opacity: hoveredDepartment === dept.id ? 0.4 : 0.15,
                transition: 'opacity 0.3s ease'
              }}
            />
          ))}

          {/* Cercle orbital principal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Instructions modernisées */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center backdrop-blur-xl bg-white/5 px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
        <p className="text-sm text-blue-200/90 font-medium">✨ Cliquez sur un département pour y accéder</p>
        <p className="text-xs mt-2 text-blue-300/60">💫 Cliquez au centre pour redémarrer la rotation</p>
      </div>

      {/* Styles CSS pour les animations */}
      <style>{`
        /* Animations principales */
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
        
        /* Animations fluides améliorées */
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, 20px) rotate(180deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        
        @keyframes pulse-ring {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.6;
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
          }
          50% { 
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 1));
          }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes orbit-particle {
          0% {
            transform: rotate(0deg) translateX(80px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }
        
        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }
        
        @keyframes grid-flow {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        /* Classes utilitaires */
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 4s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-particle-burst {
          animation: particle-burst 1s ease-out forwards;
        }
        
        /* Styles des cartes département */
        .department-card {
          position: relative;
          overflow: visible;
        }
        
        .department-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .department-card:hover::before {
          opacity: 1;
          animation: rotate-border 3s linear infinite;
        }
        
        @keyframes rotate-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Effets de survol personnalisés */
        .department-card:hover {
          transform: translateY(-8px) scale(1.05);
        }
        
        .department-card:active {
          transform: translateY(-4px) scale(1.02);
        }
        
        /* Transitions fluides globales */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;