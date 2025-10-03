
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileSearch, AlertCircle, CheckCircle2, Lock} from "lucide-react";

const DashboardContent = () => {
    // Les données originales du tableau de bord (isolées ici)
    const { metrics, performanceData } = useMemo(() => {
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

        const performanceData = [
            { title: "Disponibilité Système", value: "99.9%", unit: "(objectif 99.9%)", color: "success" },
            { title: "Temps de Réponse Moyen", value: "2h24", unit: "(objectif < 4h)", color: "warning" },
            { title: "Sécurité", value: "98%", unit: "(objectif > 95%)", color: "success" },
            { title: "Satisfaction Utilisateurs", value: "4.7/5", unit: "(objectif > 4.5)", color: "commercial" }
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
    );
};

export default DashboardContent;