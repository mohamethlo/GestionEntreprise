// src/components/rh/pages/RhDocumentsContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileSignature, FileText } from "lucide-react";

const RhDocumentsContent = () => {
    // Données de simulation
    const folders = [
        { name: "Contrats de Travail", count: 124, icon: FileSignature },
        { name: "Règlement Intérieur", count: 1, icon: FileText },
        { name: "Procédures d'Onboarding", count: 5, icon: Folder },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
                <Folder className="h-6 w-6"/> Bibliothèque de Documents RH
            </h2>

            <Card className="shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Téléchargement de Fichiers</h3>
                    <div className="flex gap-3">
                        <Button variant="outline"><Upload className="h-4 w-4 mr-2"/> Uploader un Fichier</Button>
                        <Button variant="default">Gérer les Permissions</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {folders.map((folder, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                            <folder.icon className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="font-semibold">{folder.name}</p>
                                <p className="text-sm text-muted-foreground">{folder.count} documents</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Documents Récents</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Avenant au contrat de Télétravail (v2.1) - Publié le 15/09</li>
                        <li>Manuel de Bienvenue pour les Nouveaux Embauchés - Mis à jour le 01/09</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default RhDocumentsContent;