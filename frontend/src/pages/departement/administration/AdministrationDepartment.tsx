import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Settings, Users, Shield, FileText, Bell, BarChart2, Lock, AlertCircle, CheckCircle2, Database, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const AdministrationDepartment = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: "Utilisateurs Actifs", value: "42", color: "success" },
    { title: "Alertes de Sécurité", value: "3", color: "destructive" },
    { title: "Sauvegardes du Jour", value: "2/3", color: "warning" },
    { title: "Espace Disque Utilisé", value: "78%", color: "warning" },
    { title: "Applications Installées", value: "15", color: "commercial" },
    { title: "Mises à Jour en Retard", value: "5", color: "destructive" },
    { title: "Tickets Ouverts", value: "7", color: "purple" },
    { title: "Temps de Réponse Moyen", value: "2h24", color: "warning" },
    { title: "SLA Actuel", value: "99.7%", color: "success" },
    { title: "Audits du Mois", value: "3", color: "purple" },
    { title: "Politiques à Mettre à Jour", value: "2", color: "destructive" },
    { title: "Certifications Actives", value: "5", color: "success" }
  ];

  const quickActions = [
    { icon: Home, label: "Tableau de Bord", color: "finance" },
    { icon: Users, label: "Gestion Utilisateurs", color: "commercial" },
    { icon: Shield, label: "Sécurité", color: "destructive" },
    { icon: Settings, label: "Paramètres Système", color: "purple" },
    { icon: FileText, label: "Rapports", color: "gray" },
    { icon: Bell, label: "Alertes", color: "warning" }
  ];

  const performanceData = [
    { title: "Disponibilité Système", value: "99.9%", unit: "(objectif 99.9%)", color: "success" },
    { title: "Temps de Réponse Moyen", value: "2h24", unit: "(objectif < 4h)", color: "warning" },
    { title: "Sécurité", value: "98%", unit: "(objectif > 95%)", color: "success" },
    { title: "Satisfaction Utilisateurs", value: "4.7/5", unit: "(objectif > 4.5)", color: "commercial" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      {/* Header */}
      <div className="border-b border-primary/20 bg-surface/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-primary/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <img src={netsystemeLogo} alt="NetSysteme" className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold text-primary">ADMINISTRATION SYSTÈME</h1>
                  <p className="text-sm text-muted-foreground">Administrateur Système ⭐</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">26 sept 2025</div>
              <div className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Tous les systèmes sont opérationnels
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="orbital"
              className="flex items-center gap-2 h-10"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Performance */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">État du Système</h2>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Tous les systèmes sont opérationnels</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Performance du Système</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {performanceData.map((item, index) => (
                  <Card key={index} className={`metric-card ${item.color} border-0`}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm opacity-90">{item.unit}</div>
                      <div className="text-xs mt-1 opacity-75">{item.title}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Columns - Metrics Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {metrics.map((metric, index) => (
                <Card key={index} className={`metric-card ${metric.color} border-0`}>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold">{metric.value}</div>
                    <div className="text-xs mt-1 opacity-90 leading-tight">
                      {metric.title}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Tasks */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Alertes et Actions Requises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">3 mises à jour de sécurité critiques en attente</span>
                </div>
                <Button variant="outline" size="sm">Mettre à jour</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-destructive" />
                  <span className="text-sm">2 tentatives de connexion suspectes détectées</span>
                </div>
                <Button variant="outline" size="sm">Voir les détails</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdministrationDepartment;
