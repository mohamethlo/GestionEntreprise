import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Package, Users, TrendingUp, Shield, Building2, Database } from "lucide-react";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Pointage géolocalisé",
      description: "Contrôle de présence par localisation",
      icon: MapPin,
      color: "commercial"
    },
    {
      title: "Interventions",
      description: "Planification et suivi",
      icon: Clock,
      color: "finance"
    },
    {
      title: "Gestion de stock",
      description: "Inventaire et alertes",
      icon: Package,
      color: "stock"
    },
    {
      title: "Gestion clientèle",
      description: "CRM intégré",
      icon: Users,
      color: "hr"
    },
    {
      title: "Suivi des dépenses",
      description: "Gestion financière",
      icon: TrendingUp,
      color: "tech"
    },
    {
      title: "Gestion des rôles",
      description: "Accès sécurisé",
      icon: Shield,
      color: "commercial"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-commercial/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 border border-primary/5 rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-primary/20 bg-surface/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={netsystemeLogo} alt="NetSysteme" className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold text-glow">NETSYSTEME</h1>
                  <p className="text-sm text-muted-foreground">Gestion d'Entreprise</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all duration-300"
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Solution Complète de Gestion
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Centralisez et optimisez tous les aspects de votre entreprise avec notre plateforme intégrée de nouvelle génération.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${feature.color}/20 group-hover:bg-${feature.color}/30 transition-colors duration-300`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Disponibilité continue</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-finance mb-2">99.9%</div>
              <p className="text-muted-foreground">Fiabilité système</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="feature-card max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Prêt à démarrer ?
                </CardTitle>
                <CardDescription>
                  Accédez à votre espace de gestion personnalisé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all duration-300"
                  size="lg"
                >
                  Commencer maintenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
