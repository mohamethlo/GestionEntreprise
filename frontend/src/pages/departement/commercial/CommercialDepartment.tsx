import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, User, FileText, CreditCard, TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle2, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const CommercialDepartment = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: "Factures Clients Dues", value: "14", color: "destructive" },
    { title: "Paiements Fournisseur en Attente", value: "8", color: "warning" },
    { title: "Notes de Frais à Approuver", value: "12", color: "purple" },
    { title: "Total Dettes Clients", value: "18,500 fcfa", color: "finance" },
    { title: "Total Créances Fournisseurs", value: "25,400 fcfa", color: "commercial" },
    { title: "Clôture du Mois", value: "J-5", color: "destructive" },
    { title: "Documents Fiscaux", value: "7", color: "gray" },
    { title: "Suivi Budgétaire (Q3)", value: "95%", color: "warning" },
    { title: "Amortissements en Cours", value: "18", color: "finance" },
    { title: "Taux d'Erreur Saisie", value: "0.1%", color: "warning" },
    { title: "Comptes Bancaires", value: "3", color: "commercial" },
    { title: "Rapprochements à Faire", value: "1", color: "gray" },
    { title: "Dernier Audit", value: "Ok", color: "finance" }
  ];

  const quickActions = [
    { icon: Home, label: "Tableau de Bord", color: "finance" },
    { icon: FileText, label: "Facture", color: "commercial" },
    { icon: CreditCard, label: "Paiement Fournisseur", color: "finance" },
    { icon: Calendar, label: "Transaction Bancaire", color: "purple" },
    { icon: Briefcase, label: "Corbeille", color: "gray" },
    { icon: Users, label: "Recur", color: "commercial" }
  ];

  const performanceData = [
    { title: "Revenus Nouveaux", value: "150,500", unit: "fcfa", color: "finance" },
    { title: "Dépenses Totales", value: "45,200", unit: "fcfa", color: "destructive" },
    { title: "Trésorerie Actuelle", value: "210,800", unit: "fcfa", color: "purple" },
    { title: "Marge Brute", value: "68%", unit: "", color: "warning" }
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
                  <h1 className="text-xl font-bold text-primary">GESTION COMMERCIALE</h1>
                  <p className="text-sm text-muted-foreground">Admin Compta ⭐</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">26 sept 2025</div>
              <div className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Service Comptable actif et synchronisé
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
                <TrendingUp className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Saisie Rapide des Opérations</h2>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Service Comptable actif et synchronisé</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Performance Financière (Mois)</h2>
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
              Tâches et Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">3 Factures clients en retard de paiement</span>
                </div>
                <Button variant="outline" size="sm">Traiter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommercialDepartment;