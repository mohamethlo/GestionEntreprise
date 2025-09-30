import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

const netsystemeLogo = "/logo/netsysteme.png";

// Clé d'authentification harmonisée
const AUTH_TOKEN_KEY = 'authToken'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
            // Tente de lire le message d'erreur du backend (JSON)
            const error = await response.json();
            errorMessage = error.msg || errorMessage;
        } catch (e) {
            // Si la réponse n'est pas du JSON (ex: Erreur 500)
            errorMessage = `Erreur de connexion (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.access_token;

      // ✅ CORRECTION JWT : Sauvegarde du token avec la clé 'authToken'
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      // SweetAlert2 succès
      Swal.fire({
        icon: "success",
        title: "Connexion réussie ✅",
        text: "Redirection vers le tableau de bord...",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
            confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded',
        },
        buttonsStyling: false,
      });

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      // SweetAlert2 erreur
      Swal.fire({
        icon: "error",
        title: "Erreur de connexion ❌",
        text: err.message || "Une erreur inconnue est survenue.",
        customClass: {
            confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded',
        },
        buttonsStyling: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-commercial/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={netsystemeLogo} alt="NetSysteme" className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-bold text-glow">NETSYSTEME</CardTitle>
            <CardDescription className="text-muted-foreground">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  // L'état est correctement mis à jour ici
                  onChange={(e) => {
                    // Vérification de débogage : décommentez pour voir si l'événement est déclenché
                    // console.log("Email change:", e.target.value); 
                    setEmail(e.target.value)
                  }}
                  required
                  className="border-primary/30 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  // L'état est correctement mis à jour ici
                  onChange={(e) => {
                    // Vérification de débogage : décommentez pour voir si l'événement est déclenché
                    // console.log("Password change:", e.target.value); 
                    setPassword(e.target.value)
                  }}
                  required
                  className="border-primary/30 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;