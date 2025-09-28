// src/components/rh/pages/DashboardContent.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileSearch, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const DashboardContent = () => {
    // Les données originales du tableau de bord (isolées ici)
    const { metrics, performanceData } = useMemo(() => {
        const metrics = [
            { title: "Employés Actifs", value: "124", color: "success" },
            { title: "Congés en Cours", value: "18", color: "warning" },
            { title: "Entretiens Aujourd'hui", value: "5", color: "purple" },
            { title: "Contrats à Renouveler", value: "7", color: "destructive" },
            { title: "Formations en Cours", value: "9", color: "commercial" },
            { title: "Retards du Mois", value: "12", color: "warning" },
            { title: "Nouvelles Embauches (Mois)", value: "4", color: "success" },
            { title: "Taux de Turnover", value: "5.2%", color: "destructive" },
            { title: "Évaluations en Attente", value: "23", color: "warning" },
            { title: "Documents à Signer", value: "3", color: "purple" },
            { title: "Moyenne d'Ancienneté", value: "3.2 ans", color: "commercial" },
            { title: "Taux d'Augmentation", value: "4.5%", color: "success" }
        ];

        const performanceData = [
            { title: "Effectif Total", value: "124", unit: "employés", color: "commercial" },
            { title: "Taux de Turnover", value: "5.2%", unit: "(objectif < 8%)", color: "destructive" },
            { title: "Taux de Rétention", value: "94.8%", unit: "(objectif > 90%)", color: "success" },
            { title: "Temps de Recrutement", value: "28", unit: "jours", color: "warning" }
        ];
        return { metrics, performanceData };
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Performance */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-warning" />
                            <h2 className="text-lg font-semibold">Ressources Humaines en Temps Réel</h2>
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
                            <h2 className="text-lg font-semibold">Indicateurs Clés RH</h2>
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
                        Tâches et Alertes RH
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-warning" />
                                <span className="text-sm">3 contrats arrivent à échéance cette semaine</span>
                            </div>
                            <Button variant="outline" size="sm">Voir</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-100/10 rounded-lg border border-purple-200/20">
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-purple-400" />
                                <span className="text-sm">5 demandes de congés en attente de validation</span>
                            </div>
                            <Button variant="outline" size="sm">Voir</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardContent;