// src/components/rh/pages/RecruitmentContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Mail, PhoneCall, PlusCircle } from "lucide-react";

const RecruitmentContent = () => {
    // Données de simulation
    const pipeline = [
        { stage: "Candidatures", count: 45, color: "bg-gray-200" },
        { stage: "Entretiens RH", count: 12, color: "bg-warning-100" },
        { stage: "Entretiens Techniques", count: 5, color: "bg-warning-200" },
        { stage: "Offres Envoyées", count: 2, color: "bg-success-100" },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-warning-600 flex items-center gap-3">
                <Briefcase className="h-6 w-6"/> Pipeline de Recrutement
            </h2>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Postes Actuellement Ouverts (3)</h3>
                <Button variant="default" className="bg-warning hover:bg-warning/90">
                    <PlusCircle className="h-4 w-4 mr-2"/> Créer une Offre
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pipeline visualisé */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Statut des Candidats</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-end h-32">
                        {pipeline.map((item, index) => (
                            <div key={index} className="text-center">
                                <div className={`h-16 w-16 mx-auto flex items-center justify-center rounded-full font-bold text-lg ${item.color}`}>
                                    {item.count}
                                </div>
                                <p className="text-sm mt-1">{item.stage}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Tâches rapides */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Alertes Recrutement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start"><Mail className="h-4 w-4 mr-2"/> 12 CV à trier (Marketing)</Button>
                        <Button variant="outline" className="w-full justify-start"><PhoneCall className="h-4 w-4 mr-2"/> 3 Entretiens planifiés aujourd'hui</Button>
                        <Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2"/> Relancer les managers pour feedback</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RecruitmentContent;