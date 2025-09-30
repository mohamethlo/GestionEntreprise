// src/components/rh/pages/RhDocumentsContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileSignature, FileText, Download, Search, MoreVertical, Users, Calendar, Eye } from "lucide-react";

const RhDocumentsContent = () => {
    // Données de simulation
    const folders = [
        { name: "Contrats de Travail", count: 124, icon: FileSignature, color: "bg-blue-100 text-blue-600" },
        { name: "Règlement Intérieur", count: 1, icon: FileText, color: "bg-green-100 text-green-600" },
        { name: "Procédures d'Onboarding", count: 5, icon: Folder, color: "bg-purple-100 text-purple-600" },
        { name: "Documents Légaux", count: 23, icon: FileText, color: "bg-orange-100 text-orange-600" },
        { name: "Formulaires RH", count: 18, icon: FileSignature, color: "bg-indigo-100 text-indigo-600" },
        { name: "Archives", count: 456, icon: Folder, color: "bg-gray-100 text-gray-600" },
    ];

    const recentDocuments = [
        { 
            name: "Avenant au contrat de Télétravail (v2.1)", 
            date: "15/09/2024", 
            type: "PDF", 
            size: "2.4 MB",
            downloads: 45
        },
        { 
            name: "Manuel de Bienvenue pour les Nouveaux Embauchés", 
            date: "01/09/2024", 
            type: "DOCX", 
            size: "1.8 MB",
            downloads: 23
        },
        { 
            name: "Politique de Confidentialité", 
            date: "28/08/2024", 
            type: "PDF", 
            size: "3.1 MB",
            downloads: 67
        },
    ];

    return (
        <div className="min-h-screen bg-white p-6">
            {/* En-tête */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div className="flex items-center gap-3 mb-4 lg:mb-0">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-sm">
                        <Folder className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Bibliothèque de Documents RH</h2>
                        <p className="text-gray-600 mt-1">Gérez et organisez tous vos documents ressources humaines</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Rechercher
                    </Button>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                        <Upload className="h-4 w-4" />
                        Uploader un Fichier
                    </Button>
                </div>
            </div>

            {/* Section Upload et Stats */}
            <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Centralisez vos documents RH</h3>
                            <p className="text-gray-600 max-w-2xl">
                                Téléchargez, organisez et partagez en toute sécurité vos documents ressources humaines. 
                                Supporte PDF, DOCX, XLSX et plus encore.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                                <Users className="h-4 w-4" />
                                Gérer les Permissions
                            </Button>
                            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                                <Upload className="h-4 w-4" />
                                Nouveau Document
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grille des dossiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {folders.map((folder, index) => (
                    <Card 
                        key={index} 
                        className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-200"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${folder.color}`}>
                                    <folder.icon className="h-6 w-6" />
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                {folder.name}
                            </h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{folder.count} documents</span>
                                <div className="flex gap-1">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">Voir</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Documents récents et statistiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Documents récents */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Documents Récents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-white hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {doc.name}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {doc.date}
                                            </span>
                                            <span className="text-xs text-gray-500">{doc.type} • {doc.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Download className="h-3 w-3" />
                                        {doc.downloads}
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Statistiques et actions rapides */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                Statistiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Total des documents</span>
                                <span className="font-bold text-gray-900">627</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Espace utilisé</span>
                                <span className="font-bold text-gray-900">1.2 GB</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Documents ce mois</span>
                                <span className="font-bold text-green-600">+12</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                Actions Rapides
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Download className="h-5 w-5 text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Exporter la bibliothèque</p>
                                        <p className="text-sm text-gray-600">Télécharger tous les documents</p>
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Gérer les accès</p>
                                        <p className="text-sm text-gray-600">Configurer les permissions</p>
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Folder className="h-5 w-5 text-orange-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Nouveau dossier</p>
                                        <p className="text-sm text-gray-600">Organiser les documents</p>
                                    </div>
                                </div>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RhDocumentsContent;