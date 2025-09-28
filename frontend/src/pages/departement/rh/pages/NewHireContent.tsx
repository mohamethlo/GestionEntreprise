// src/components/rh/pages/NewHireContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FormInput, Truck, FileSignature, CheckCircle2 } from "lucide-react";

const NewHireContent = () => {
    // Données de simulation
    const onboardingSteps = [
        { step: "Fiche d'Information Remplie", status: "Terminé", icon: CheckCircle2, color: "text-success" },
        { step: "Création du Compte Informatique", status: "En Cours", icon: Truck, color: "text-warning" },
        { step: "Signature du Contrat", status: "En Attente", icon: FileSignature, color: "text-destructive" },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-success-600 flex items-center gap-3">
                <UserPlus className="h-6 w-6"/> Processus de Nouvelle Embauche
            </h2>

            <Card className="bg-success-50/50 border-success-200 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Initier un Nouvel Onboarding</h3>
                    <Button variant="default" className="bg-success hover:bg-success/90">
                        <FormInput className="h-4 w-4 mr-2"/> Démarrer le Formulaire
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Suivi des Nouveaux Arrivants (Prochaine Semaine)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className="font-bold text-primary">Jean Dubois (Début: 01/10/2025 - Poste: Développeur)</h4>
                    <div className="space-y-2 pl-4 border-l-2 border-primary">
                        {onboardingSteps.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                                <span className="font-medium">{item.step} :</span>
                                <span className={item.color}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Outils d'Aide à l'Intégration</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                    <Button variant="outline">Checklist Onboarding</Button>
                    <Button variant="outline">Envoyer le Welcome Pack</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewHireContent;