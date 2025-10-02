// src/components/rh/pages/DashboardContent.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileSearch, AlertCircle, CheckCircle2, Lock} from "lucide-react";

const DashboardContent = () => {
    // Les données originales du tableau de bord (isolées ici)
    const { metrics, performanceData } = useMemo(() => {
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
        

        const performanceData = [
            { title: "CA Mensuel", value: "245,780", unit: "fcfa", color: "success" },
            { title: "Dépenses", value: "187,450", unit: "fcfa", color: "destructive" },
            { title: "Bénéfice Net", value: "58,330", unit: "fcfa", color: "success" },
            { title: "Marge Brute", value: "42%", unit: "(objectif 40%)", color: "warning" }
        ];
        return { metrics, performanceData };
    }, []);

    return (
        <div className="p-6 space-y-6" style={{backgroundColor: "white"}}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Performance */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-warning" />
                            <h2 className="text-lg font-semibold" style={{color:"black", fontSize:"25px"}}>Gestion Administration en Temps Réel</h2>
                        </div>
                        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                            <div className="flex items-center gap-2 text-success">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm">Service RH actif et synchronisé</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FileSearch className="h-5 w-5 text-warning" />
                            <h2 className="text-lg font-semibold" style={{color:"black", fontSize:"25px"}}>Indicateurs Clés d'administration</h2>
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
    );
};

export default DashboardContent;