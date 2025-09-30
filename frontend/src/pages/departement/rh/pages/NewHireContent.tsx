// src/components/rh/pages/NewHireContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FormInput, Truck, FileSignature, CheckCircle2, Calendar, Mail, Download, Clock, AlertCircle, ChevronRight } from "lucide-react";

const NewHireContent = () => {
    // Données de simulation
    const onboardingSteps = [
        { 
            step: "Fiche d'Information Remplie", 
            status: "Terminé", 
            icon: CheckCircle2, 
            color: "text-green-600",
            bgColor: "bg-green-100",
            date: "15/12/2024"
        },
        { 
            step: "Création du Compte Informatique", 
            status: "En Cours", 
            icon: Clock, 
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            date: "En cours"
        },
        { 
            step: "Signature du Contrat", 
            status: "En Attente", 
            icon: FileSignature, 
            color: "text-red-600",
            bgColor: "bg-red-100",
            date: "20/12/2024"
        },
        { 
            step: "Configuration du Poste", 
            status: "À venir", 
            icon: Truck, 
            color: "text-gray-600",
            bgColor: "bg-gray-100",
            date: "22/12/2024"
        },
    ];

    const upcomingHires = [
        { 
            name: "Jean Dubois", 
            startDate: "01/01/2025", 
            position: "Développeur Fullstack", 
            department: "IT",
            progress: 75 
        },
        { 
            name: "Marie Lambert", 
            startDate: "08/01/2025", 
            position: "Chef de Projet", 
            department: "Marketing",
            progress: 40 
        },
        { 
            name: "Thomas Schmidt", 
            startDate: "15/01/2025", 
            position: "Analyste RH", 
            department: "Ressources Humaines",
            progress: 20 
        },
    ];

    return (
        <div className="min-h-screen bg-white p-6">
            {/* En-tête */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div className="flex items-center gap-3 mb-4 lg:mb-0">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-sm">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Processus de Nouvelle Embauche</h2>
                        <p className="text-gray-600 mt-1">Gérez l'intégration de vos nouveaux collaborateurs</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                    <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <FormInput className="h-4 w-4" />
                        Nouvelle Embauche
                    </Button>
                </div>
            </div>

            {/* Carte principale d'action */}
            <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
                <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lancez un nouvel onboarding</h3>
                            <p className="text-gray-600 max-w-2xl">
                                Initiez le processus d'intégration pour un nouveau collaborateur. 
                                Toutes les étapes seront planifiées automatiquement.
                            </p>
                        </div>
                        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 h-auto text-lg">
                            <FormInput className="h-5 w-5" />
                            Démarrer le Formulaire
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Suivi des nouvelles embauches */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Arrivées Imminentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {upcomingHires.map((hire, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{hire.name}</h4>
                                        <p className="text-gray-600">{hire.position}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Début: {hire.startDate}
                                            </span>
                                            <span className="text-sm text-gray-500">{hire.department}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-green-600">{hire.progress}%</span>
                                        <p className="text-xs text-gray-500">complété</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${hire.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Étapes d'onboarding détaillées */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Progression de l'Onboarding
                            <span className="text-sm font-normal text-gray-500 ml-2">• Jean Dubois</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {onboardingSteps.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.step}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className={`text-sm font-medium ${item.color}`}>
                                            {item.status}
                                        </span>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                </div>
                                {item.status === "Terminé" && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                                {item.status === "En Cours" && (
                                    <div className="animate-pulse">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                    </div>
                                )}
                                {item.status === "En Attente" && (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                        ))}
                        
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Progression globale</span>
                                <span className="text-lg font-bold text-green-600">50%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 w-1/2"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Outils d'intégration */}
            <Card className="border-0 shadow-lg mt-8">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        Outils d'Aide à l'Intégration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="p-4 h-auto flex flex-col items-center gap-3 border-gray-200 hover:bg-gray-50 group">
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900">Checklist Onboarding</p>
                                <p className="text-sm text-gray-600 mt-1">Liste de contrôle complète</p>
                            </div>
                        </Button>
                        
                        <Button variant="outline" className="p-4 h-auto flex flex-col items-center gap-3 border-gray-200 hover:bg-gray-50 group">
                            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900">Welcome Pack</p>
                                <p className="text-sm text-gray-600 mt-1">Envoyer le kit de bienvenue</p>
                            </div>
                        </Button>
                        
                        <Button variant="outline" className="p-4 h-auto flex flex-col items-center gap-3 border-gray-200 hover:bg-gray-50 group">
                            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <FileSignature className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900">Documents Types</p>
                                <p className="text-sm text-gray-600 mt-1">Modèles de contrats</p>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <Card className="border-0 shadow-sm bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-gray-600">Embauches ce mois</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">8</div>
                        <div className="text-sm text-gray-600">Onboardings en cours</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">3</div>
                        <div className="text-sm text-gray-600">En attente</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">94%</div>
                        <div className="text-sm text-gray-600">Taux de réussite</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewHireContent;