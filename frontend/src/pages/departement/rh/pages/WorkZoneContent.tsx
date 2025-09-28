// src/components/rh/pages/WorkZoneContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, UserPlus, Zap } from "lucide-react";

const WorkZoneContent = () => {
    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-indigo-600 flex items-center gap-3">
                <MapPin className="h-6 w-6"/> Gestion des Zones de Travail
            </h2>

            <Card className="bg-indigo-50/50 border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-xl text-indigo-700">Vue d'ensemble Géographique</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 bg-gray-200 flex items-center justify-center rounded-lg text-lg text-gray-500">
                        [Carte interactive des sites et zones de présence]
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-warning"/> Géolocalisation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">5 zones de travail définies (Bureau A, Télétravail, etc.)</p>
                        <Button variant="outline" className="w-full justify-start">Définir Nouvelles Zones</Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-500"/> Utilisateurs par Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">78 employés rattachés à "Bureau Principal"</p>
                        <Button variant="outline" className="w-full justify-start"><UserPlus className="h-4 w-4 mr-2"/> Affecter un Employé</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WorkZoneContent;