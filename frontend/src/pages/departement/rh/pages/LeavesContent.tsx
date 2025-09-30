// src/components/rh/pages/LeavesContent.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, CheckCircle2, XCircle, BarChart, Settings, Plus, Download, Filter } from "lucide-react";

const LeavesContent = () => {
    // Données de simulation
    const pendingRequests = [
        { name: "S. Dubois", type: "Vacances", duration: "5 jours", date: "15-20 Déc 2024" },
        { name: "A. Karim", type: "RTT", duration: "2 jours", date: "10-11 Jan 2025" },
        { name: "M. Bernard", type: "Maladie", duration: "3 jours", date: "En cours" },
    ];

    const leaveBalance = [
        { type: "Congés Payés", used: 12, total: 25, color: "bg-blue-500" },
        { type: "RTT", used: 4, total: 10, color: "bg-purple-500" },
        { type: "Congés Maladie", used: 2, total: 15, color: "bg-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-white p-6">
            {/* En-tête */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div className="flex items-center gap-3 mb-4 lg:mb-0">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-sm">
                        <CalendarCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Gestion des Congés et Absences</h2>
                        <p className="text-gray-600 mt-1">Gérez les demandes de congés et suivez les soldes</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtrer
                    </Button>
                    <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4" />
                        Nouvelle Demande
                    </Button>
                </div>
            </div>

            {/* Cartes principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Demandes en attente */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Demandes en Attente
                                <span className="bg-orange-100 text-orange-600 text-sm px-2 py-1 rounded-full">3</span>
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                                Voir tout
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingRequests.map((req, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${
                                        req.type === "Vacances" ? "bg-blue-100" : 
                                        req.type === "RTT" ? "bg-purple-100" : "bg-orange-100"
                                    }`}>
                                        {req.type === "Vacances" && <CalendarCheck className="h-4 w-4 text-blue-600" />}
                                        {req.type === "RTT" && <Clock className="h-4 w-4 text-purple-600" />}
                                        {req.type === "Maladie" && <CheckCircle2 className="h-4 w-4 text-orange-600" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{req.name}</p>
                                        <p className="text-sm text-gray-600">{req.type} • {req.duration}</p>
                                        <p className="text-xs text-gray-500">{req.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Valider
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Refuser
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Statistiques rapides */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart className="h-5 w-5 text-purple-600" />
                            Vue d'ensemble
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {leaveBalance.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{item.type}</span>
                                        <span className="font-semibold text-gray-900">{item.used}/{item.total} jours</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${(item.used / item.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Taux d'occupation</span>
                                <span className="text-lg font-bold text-purple-600">78%</span>
                            </div>
                            <p className="text-xs text-gray-600">Moyenne départementale: 72%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section inférieure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-600" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Règles de RTT</p>
                                    <p className="text-sm text-gray-600">Configurer les règles d'attribution</p>
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-5 w-5 text-blue-600" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Jours Fériés</p>
                                    <p className="text-sm text-gray-600">Gérer le calendrier</p>
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Download className="h-5 w-5 text-purple-600" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Export des données</p>
                                    <p className="text-sm text-gray-600">Télécharger les rapports</p>
                                </div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Calendrier des congés */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5 text-green-600" />
                            Congés du Mois
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <div>
                                    <p className="font-semibold text-gray-900">L. Martinez</p>
                                    <p className="text-sm text-gray-600">Vacances • 5 jours</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">15-20 Déc</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <p className="font-semibold text-gray-900">P. Moreau</p>
                                    <p className="text-sm text-gray-600">Formation • 2 jours</p>
                                </div>
                                <span className="text-sm font-medium text-blue-600">18-19 Déc</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div>
                                    <p className="font-semibold text-gray-900">T. Schmidt</p>
                                    <p className="text-sm text-gray-600">Maladie • 3 jours</p>
                                </div>
                                <span className="text-sm font-medium text-orange-600">En cours</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LeavesContent;