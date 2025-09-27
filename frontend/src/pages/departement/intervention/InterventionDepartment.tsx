import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Wrench, Clock, MapPin, Truck, CheckCircle2, AlertCircle, Calendar, Users, ClipboardList, HardHat, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const InterventionDepartment = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: "Interventions en Cours", value: "8", color: "warning" },
    { title: "Interventions Planifiées", value: "12", color: "purple" },
    { title: "Techniciens Disponibles", value: "5/7", color: "success" },
    { title: "Interventions en Retard", value: "2", color: "destructive" },
    { title: "KM Moyens/Intervention", value: "24.5", unit: "km", color: "commercial" },
    { title: "Temps Moyen d'Intervention", value: "2h15", color: "warning" },
    { title: "Taux de Résolution", value: "94%", color: "success" },
    { title: "Interventions Urgentes", value: "3", color: "destructive" },
    { title: "Matériel en Stock", value: "87%", color: "success" },
    { title: "Satisfaction Client", value: "4.8/5", color: "commercial" },
    { title: "Contrats de Maintenance", value: "23", color: "purple" },
    { title: "Prochain Contrôle", value: "J-14", color: "warning" }
  ];

  const quickActions = [
    { icon: Home, label: "Tableau de Bord", color: "finance" },
    { icon: Wrench, label: "Nouvelle Intervention", color: "warning" },
    { icon: Users, label: "Équipe Technique", color: "commercial" },
    { icon: Calendar, label: "Planification", color: "purple" },
    { icon: Truck, label: "Gestion du Parc", color: "gray" },
    { icon: ClipboardList, label: "Rapports", color: "success" }
  ];

  const performanceData = [
    { title: "Interventions ce Mois", value: "42", unit: "(objectif 50)", color: "warning" },
    { title: "Taux de Résolution", value: "94%", unit: "(objectif > 90%)", color: "success" },
    { title: "Temps Moyen d'Intervention", value: "2h15", unit: "(objectif < 3h)", color: "success" },
    { title: "Satisfaction Client", value: "4.8/5", unit: "(objectif > 4.5)", color: "commercial" }
  ];

  const interventionsEnCours = [
    { 
      id: 1, 
      client: "Société ABC", 
      adresse: "123 Rue Principale, Ville",
      type: "Maintenance préventive",
      technicien: "Jean Dupont",
      debut: "09:00",
      statut: "En cours"
    },
    { 
      id: 2, 
      client: "Entreprise XYZ", 
      adresse: "456 Avenue Centrale, Ville",
      type: "Dépannage urgent",
      technicien: "Marie Martin",
      debut: "10:30",
      statut: "En route"
    }
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
                  <h1 className="text-xl font-bold text-primary">DÉPARTEMENT D'INTERVENTION</h1>
                  <p className="text-sm text-muted-foreground">Responsable Technique ⭐</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">26 sept 2025</div>
              <div className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Service d'intervention opérationnel
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
                <TrendingUp className="h-5 w-5 text-commercial" />
                <h2 className="text-lg font-semibold">Interventions du Jour</h2>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Service d'intervention actif et synchronisé</span>
                </div>
              </div>
              <div className="space-y-3">
                {interventionsEnCours.map((intervention) => (
                  <Card key={intervention.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{intervention.client}</h3>
                          <p className="text-sm text-muted-foreground">{intervention.type}</p>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{intervention.adresse}</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Début: {intervention.debut}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                            {intervention.statut}
                          </span>
                          <span className="text-xs mt-2 text-muted-foreground">
                            {intervention.technicien}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Indicateurs Clés</h2>
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
                      {metric.unit && <div className="text-xs opacity-75">{metric.unit}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Tâches et Alertes en bas de page */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Tâches et Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">2 interventions urgentes en attente d'affectation</span>
                </div>
                <Button variant="outline" size="sm">Affecter</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Stock critique pour les pièces détachées</span>
                </div>
                <Button variant="outline" size="sm">Commander</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterventionDepartment;
