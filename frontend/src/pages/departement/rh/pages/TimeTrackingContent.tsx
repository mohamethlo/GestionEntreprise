// src/components/rh/pages/TimeTrackingContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, UserCheck, Calendar, List } from "lucide-react";

const TimeTrackingContent = () => {
    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-3">
                <Clock className="h-6 w-6"/> Gestion du Pointage et Temps de Travail
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-success"/> Pointages du Jour
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                        112 / 124
                        <p className="text-sm text-muted-foreground mt-1">Employés ont pointé</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <List className="h-5 w-5 text-warning"/> Anomalies à Corriger
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold text-warning">
                        15
                        <p className="text-sm text-muted-foreground mt-1">Oublis ou erreurs de pointage</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary"/> Actions Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">Rapport d'Heures Mensuel</Button>
                        <Button variant="outline" className="w-full justify-start">Validation des Absences</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TimeTrackingContent;