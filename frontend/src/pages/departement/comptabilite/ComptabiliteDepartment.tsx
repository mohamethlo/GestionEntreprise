import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, DollarSign, CreditCard, FileText, BarChart2, TrendingUp, Calendar, AlertCircle, CheckCircle2, Receipt, Banknote, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import netsystemeLogo from "@/assets/netsysteme-logo.png";

const ComptabiliteDepartment = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: "Chiffre d'Affaires (Mois)", value: "245,780", unit: "fcfa", color: "success" },
    { title: "Dépenses (Mois)", value: "187,450", unit: "fcfa", color: "destructive" },
    { title: "Bénéfice Brut", value: "58,330", unit: "fcfa", color: "success" },
    { title: "Factures Impayées", value: "12", color: "warning" },
    { title: "TVA à Déclarer", value: "32,450", unit: "fcfa", color: "purple" },
    { title: "Déclaration Fiscale", value: "J-8", color: "destructive" },
    { title: "Trésorerie", value: "1,245,600", unit: "fcfa", color: "success" },
    { title: "Dettes Fournisseurs", value: "87,320", unit: "fcfa", color: "warning" },
    { title: "Créances Clients", value: "145,600", unit: "fcfa", color: "purple" },
    { title: "Marge Brute", value: "42%", color: "success" },
    { title: "Rentabilité Nette", value: "18%", color: "success" },
    { title: "Dernier Bilan", value: "Q2 2025", color: "commercial" }
  ];

  const quickActions = [
    { icon: Home, label: "Tableau de Bord", color: "finance" },
    { icon: FileText, label: "Nouvelle Facture", color: "commercial" },
    { icon: Receipt, label: "Reçus & Dépenses", color: "destructive" },
    { icon: Banknote, label: "Paiements", color: "success" },
    { icon: Scale, label: "Bilan & Compte de Résultat", color: "purple" },
    { icon: Calendar, label: "Calendrier Fiscal", color: "warning" }
  ];

  const performanceData = [
    { title: "CA Mensuel", value: "245,780", unit: "fcfa", color: "success" },
    { title: "Dépenses", value: "187,450", unit: "fcfa", color: "destructive" },
    { title: "Bénéfice Net", value: "58,330", unit: "fcfa", color: "success" },
    { title: "Marge Brute", value: "42%", unit: "(objectif 40%)", color: "warning" }
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
                  <h1 className="text-xl font-bold text-primary">COMPTABILITÉ & FINANCES</h1>
                  <p className="text-sm text-muted-foreground">Responsable Comptable ⭐</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">26 sept 2025</div>
              <div className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Comptabilité à jour
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
                <h2 className="text-lg font-semibold">Performance Financière</h2>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Toutes les opérations sont à jour</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Aperçu Financier</h2>
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

        {/* Bottom Section - Tasks */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Alertes et Échéances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">Déclaration de TVA à effectuer avant le 30/09/2025</span>
                </div>
                <Button variant="outline" size="sm">Déclarer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-destructive" />
                  <span className="text-sm">12 factures clients en retard de paiement</span>
                </div>
                <Button variant="outline" size="sm">Voir</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComptabiliteDepartment;
