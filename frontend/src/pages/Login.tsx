import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, User, Shield, Sparkles } from "lucide-react";
import Swal from "sweetalert2";

const netsystemeLogo = "/logo/netsysteme.png";

// Clé d'authentification harmonisée
const AUTH_TOKEN_KEY = 'authToken'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Effet pour les particules animées
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-primary/20 rounded-full animate-float';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      document.querySelector('.particles-container')?.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    // Créer des particules périodiquement
    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Échec de la connexion. Veuillez vérifier vos identifiants.";
        try {
          const error = await response.json();
          errorMessage = error.msg || errorMessage;
        } catch (e) {
          errorMessage = `Erreur de connexion (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.access_token;

      localStorage.setItem(AUTH_TOKEN_KEY, token);

      // Animation de succès améliorée
      await Swal.fire({
        icon: "success",
        title: "Connexion réussie ✅",
        text: "Redirection vers le tableau de bord...",
        timer: 2000,
        showConfirmButton: false,
        background: '#1f2937',
        color: 'white',
        customClass: {
          popup: 'animate-scaleIn'
        }
      });

      // Redirection avec animation
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Erreur de connexion ❌",
        text: err.message || "Une erreur inconnue est survenue.",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'animate-shake'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Container pour les particules */}
      <div className="particles-container absolute inset-0 pointer-events-none" />
      
      {/* Éléments décoratifs animés */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-ping-slow" />
      </div>

      {/* Lignes de grille animées */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2">
          <CardHeader className="text-center pb-8 pt-12">
            {/* Logo avec animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse" />
                <img 
                  src={netsystemeLogo} 
                  alt="NetSysteme" 
                  className="relative h-20 w-20 rounded-2xl transform hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
              </div>
            </div>
            
            {/* Titre avec effet de dégradé animé */}
            <CardTitle className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                NETSYSTEME
              </span>
            </CardTitle>
            
            <CardDescription className="text-slate-300 text-lg">
              Accédez à votre espace de gestion
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-12">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Champ Email */}
              <div className="space-y-3 group">
                <Label htmlFor="email" className="text-slate-300 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  Adresse email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 pr-4 py-3 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                    disabled={isLoading}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-3 group">
                <Label htmlFor="password" className="text-slate-300 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 py-3 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 rounded-xl"
                    disabled={isLoading}
                  />
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden group"
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Effet de brillance */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000 ${
                  isHovered ? 'translate-x-full' : '-translate-x-full'
                }`} />
                
                {/* Contenu du bouton */}
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Se connecter</span>
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* Informations de sécurité */}
            <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 text-slate-400">
                <Shield className="h-4 w-4 text-green-400" />
                <p className="text-sm">Vos identifiants sont sécurisés et cryptés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            © 2024 NetSysteme • Votre partenaire de confiance
          </p>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;