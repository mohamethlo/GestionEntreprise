// src/components/rh/pages/SalaryAdvanceContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, Clock, ListChecks } from "lucide-react";

const SalaryAdvanceContent = () => {
    // Données de simulation
    const requests = [
        { name: "J. Martin", amount: "500 €", status: "En attente" },
        { name: "S. Diallo", amount: "300 €", status: "Approuvée" },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-3">
                <Wallet className="h-6 w-6"/> Gestion des Avances sur Salaire
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500"/> Montant en Cours
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                        12 500 €
                        <p className="text-sm text-muted-foreground mt-1">Total des avances non remboursées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-warning"/> Demandes en Attente (2)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {requests.map((req, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b pb-1">
                                <span>{req.name} - {req.amount}</span>
                                <Button size="sm" variant="secondary"> Examiner</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-primary"/> Processus
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">Historique des Transactions</Button>
                        <Button variant="outline" className="w-full justify-start">Règles et Limites</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalaryAdvanceContent;