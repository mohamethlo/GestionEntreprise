// src/components/rh/pages/LeavesContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// La ligne d'importation des icônes est corrigée pour inclure 'Settings'
import { CalendarCheck, Clock, CheckCircle2, XCircle, BarChart, Settings } from "lucide-react"; 

const LeavesContent = () => {
    // Données de simulation
    const pendingRequests = [
        { name: "S. Dubois", type: "Vacances", duration: "5 jours" },
        { name: "A. Karim", type: "RTT", duration: "2 jours" },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-3">
                <CalendarCheck className="h-6 w-6"/> Gestion des Congés et Absences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-purple-50/50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-purple-600 flex items-center gap-2">
                            <Clock className="h-5 w-5"/> En Attente de Validation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingRequests.map((req, index) => (
                            <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                <div>
                                    <p className="font-semibold">{req.name}</p>
                                    <p className="text-sm text-gray-500">{req.type} - {req.duration}</p>
                                </div>
                                <Button size="sm" variant="outline">Traiter</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart className="h-5 w-5 text-success"/> Solde Global
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Jours Restants (Moyenne)</span>
                            <span className="font-bold text-success">14.5 jours</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Total Congés Posés (Année)</span>
                            <span className="font-bold text-primary">1240 jours</span>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {/* Le composant Settings est maintenant correctement importé */}
                            <Settings className="h-5 w-5 text-gray-500"/> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start"><CheckCircle2 className="h-4 w-4 mr-2"/> Règles de RTT</Button>
                        <Button variant="outline" className="w-full justify-start"><XCircle className="h-4 w-4 mr-2"/> Jours Fériés</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LeavesContent;