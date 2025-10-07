// src/components/rh/pages/DashboardContent.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileSearch, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";

const DashboardContent = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [animatedValues, setAnimatedValues] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    // Animation d'entrée
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Les données originales du tableau de bord (isolées ici)
    const { metrics, performanceData } = useMemo(() => {
        const metrics = [
            { title: "Employés Actifs", value: "124", color: "success" },
            { title: "Congés en Cours", value: "18", color: "warning" },
            { title: "Entretiens Aujourd'hui", value: "5", color: "purple" },
            { title: "Contrats à Renouveler", value: "7", color: "destructive" },
            { title: "Formations en Cours", value: "9", color: "commercial" },
            { title: "Retards du Mois", value: "12", color: "warning" },
            { title: "Nouvelles Embauches (Mois)", value: "4", color: "success" },
            { title: "Taux de Turnover", value: "5.2%", color: "destructive" },
      
        ];

        const performanceData = [
        ];
        return { metrics, performanceData };
    }, []);

    // Animation des valeurs au chargement
    useEffect(() => {
        const timer = setTimeout(() => {
            const initialValues = {};
            metrics.forEach((_, index) => {
                initialValues[`metric-${index}`] = true;
            });
            performanceData.forEach((_, index) => {
                initialValues[`performance-${index}`] = true;
            });
            setAnimatedValues(initialValues);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [metrics, performanceData]);

    const handleCardHover = (index, type) => {
        setHoveredCard(`${type}-${index}`);
    };

    const handleCardLeave = () => {
        setHoveredCard(null);
    };

    const handleQuickAction = (action) => {
        // Animation de feedback
        const button = document.activeElement;
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
        console.log(`Action: ${action}`);
        // Ici vous pouvez ajouter la logique pour chaque action
    };

    return (
        <div 
            className="p-6 space-y-6" 
            style={{backgroundColor: "white"}}
        >
            <div 
                className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                {/* Left Column - Performance */}
                <div className="space-y-8">
    {/* Section Titre avec Animation */}
    <div className="transition-all duration-700 hover:scale-[1.01] group/title">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg transform group-hover/title:scale-110 transition-transform duration-500">
                <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-500 group-hover/title:translate-x-2">
                Ressources Humaines en Temps Réel
            </h2>
        </div>
        
        {/* Badge de Statut */}
        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl transition-all duration-500 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:shadow-xl hover:scale-[1.02] group/status">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transform group-hover/status:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <span className="text-sm font-semibold text-green-800 group-hover/status:text-green-900 transition-colors duration-300">
                        Service RH actif et synchronisé
                    </span>
                    <p className="text-xs text-green-600 group-hover/status:text-green-700 transition-colors duration-300 mt-1">
                        Tous les systèmes fonctionnent normalement
                    </p>
                </div>
                <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                </div>
            </div>
        </div>
    </div>

    {/* Section Indicateurs Clés */}
    <div className="transition-all duration-700 delay-200 group/indicators">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg transform group-hover/indicators:scale-110 transition-transform duration-500">
                <FileSearch className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-500 group-hover/indicators:translate-x-2">
                Indicateurs Clés RH
            </h2>
        </div>
        
        {/* Grille des indicateurs */}
        <div className="grid grid-cols-2 gap-4">
            {performanceData.map((item, index) => (
                <Card 
                    key={index} 
                    className={`border-0 shadow-lg transition-all duration-500 ${
                        hoveredCard === `performance-${index}` 
                            ? 'scale-105 shadow-2xl -translate-y-2' 
                            : 'hover:scale-102 hover:shadow-xl hover:-translate-y-1'
                    } ${
                        animatedValues[`performance-${index}`] 
                            ? 'animate-fade-in-up opacity-100' 
                            : 'opacity-0'
                    } bg-white group/metric relative overflow-hidden`}
                    style={{ 
                        animationDelay: `${index * 150}ms`,
                    }}
                    onMouseEnter={() => handleCardHover(index, 'performance')}
                    onMouseLeave={handleCardLeave}
                >
                    {/* Effet de fond animé */}
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover/metric:opacity-5 transition-opacity duration-500 ${
                        item.color.includes('blue') ? 'from-blue-500 to-cyan-500' :
                        item.color.includes('green') ? 'from-green-500 to-emerald-500' :
                        item.color.includes('purple') ? 'from-purple-500 to-pink-500' :
                        'from-orange-500 to-amber-500'
                    }`} />
                    
                    <CardContent className="p-5 relative z-10">
                        {/* Valeur principale */}
                        <div className={`text-3xl font-bold transition-all duration-500 group-hover/metric:scale-110 group-hover/metric:translate-y-1 ${
                            item.color.includes('blue') ? 'text-blue-600' :
                            item.color.includes('green') ? 'text-green-600' :
                            item.color.includes('purple') ? 'text-purple-600' :
                            'text-orange-600'
                        }`}>
                            {item.value}
                        </div>
                        
                        {/* Unité */}
                        <div className={`text-sm font-medium transition-all duration-500 group-hover/metric:translate-x-1 ${
                            item.color.includes('blue') ? 'text-blue-500' :
                            item.color.includes('green') ? 'text-green-500' :
                            item.color.includes('purple') ? 'text-purple-500' :
                            'text-orange-500'
                        }`}>
                            {item.unit}
                        </div>
                        
                        {/* Titre */}
                        <div className="text-sm font-semibold text-gray-900 mt-2 transition-all duration-500 group-hover/metric:translate-x-1 group-hover/metric:text-gray-800">
                            {item.title}
                        </div>
                        
                        {/* Description supplémentaire au survol */}
                        <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover/metric:opacity-100 transition-all duration-500 transform translate-y-2 group-hover/metric:translate-y-0">
                            {item.description || "Cliquez pour plus de détails"}
                        </div>
                    </CardContent>
                    
                    {/* Barre colorée en bas */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover/metric:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover/metric:scale-x-100 ${
                        item.color.includes('blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        item.color.includes('green') ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        item.color.includes('purple') ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-gradient-to-r from-orange-500 to-amber-500'
                    }`} />
                </Card>
            ))}
        </div>
    </div>
</div>

<style jsx>{`
    .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`}</style>

                {/* Right Columns - Metrics Grid */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {metrics.map((metric, index) => (
                            <Card 
                                key={index} 
                                className={`metric-card ${metric.color} border-0 transition-all duration-300 ${
                                    hoveredCard === `metric-${index}` 
                                        ? 'scale-110 shadow-xl -translate-y-2 z-10' 
                                        : 'hover:scale-105 hover:-translate-y-1'
                                } ${
                                    animatedValues[`metric-${index}`] 
                                        ? 'animate-fade-in-up' 
                                        : 'opacity-0'
                                }`}
                                style={{ 
                                    animationDelay: `${index * 50 + 200}ms`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={() => handleCardHover(index, 'metric')}
                                onMouseLeave={handleCardLeave}
                            >
                                <CardContent className="p-3">
                                    <div className="text-lg font-bold transition-all duration-300 hover:text-xl">
                                        {metric.value}
                                    </div>
                                    <div className="text-xs mt-1 opacity-90 leading-tight transition-all duration-300 hover:opacity-100 hover:font-medium">
                                        {metric.title}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Cards Section */}
            <div 
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                <Card 
    className="cursor-pointer border-0 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
    onClick={() => handleQuickAction('Recrutement')}
>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-sky-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:via-sky-500/5 group-hover:to-cyan-500/5 transition-all duration-700" />
    
    <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                23
            </div>
            <div className="text-sm font-semibold text-blue-800">
                Candidatures
            </div>
            <div className="text-xs text-blue-600/75 group-hover:text-blue-700 transition-colors duration-300">
                En cours d'évaluation
            </div>
        </div>
    </CardContent>
    
    {/* Barre colorée en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>

<Card 
    className="cursor-pointer border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
    onClick={() => handleQuickAction('Formations')}
>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/0 to-lime-500/0 group-hover:from-emerald-500/5 group-hover:via-green-500/5 group-hover:to-lime-500/5 transition-all duration-700" />
    
    <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                <FileSearch className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                87%
            </div>
            <div className="text-sm font-semibold text-emerald-800">
                Taux de Participation
            </div>
            <div className="text-xs text-emerald-600/75 group-hover:text-emerald-700 transition-colors duration-300">
                Formations 2024
            </div>
        </div>
    </CardContent>
    
    {/* Barre colorée en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>

<Card 
    className="cursor-pointer border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
    onClick={() => handleQuickAction('Evaluations')}
>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:via-purple-500/5 group-hover:to-fuchsia-500/5 transition-all duration-700" />
    
    <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                42
            </div>
            <div className="text-sm font-semibold text-violet-800">
                Évaluations
            </div>
            <div className="text-xs text-violet-600/75 group-hover:text-violet-700 transition-colors duration-300">
                Planifiées ce mois
            </div>
        </div>
    </CardContent>
    
    {/* Barre colorée en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>

<Card 
    className="cursor-pointer border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
    onClick={() => handleQuickAction('Documents')}
>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-orange-500/0 to-red-500/0 group-hover:from-amber-500/5 group-hover:via-orange-500/5 group-hover:to-red-500/5 transition-all duration-700" />
    
    <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                156
            </div>
            <div className="text-sm font-semibold text-amber-800">
                Documents RH
            </div>
            <div className="text-xs text-amber-600/75 group-hover:text-amber-700 transition-colors duration-300">
                Archivés en 2024
            </div>
        </div>
    </CardContent>
    
    {/* Barre colorée en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>
            </div>

            {/* Bottom Section - Tasks */}
            <Card 
    className={`border-0 shadow-xl transition-all duration-700 delay-300 bg-gradient-to-br from-orange-50 to-amber-50/30 backdrop-blur-sm relative overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } hover:shadow-2xl hover:-translate-y-2 group/card`}
>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-amber-500/0 to-orange-500/0 group-hover/card:from-orange-500/5 group-hover/card:via-amber-500/5 group-hover/card:to-orange-500/5 transition-all duration-700" />
    
    {/* Élément décoratif en coin */}
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-amber-500/10 rounded-bl-2xl transform group-hover/card:scale-150 transition-transform duration-500" />
    
    <CardHeader className="pb-4 border-b border-orange-100/50 relative z-10">
        <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg transform group-hover/card:scale-110 transition-transform duration-300">
                <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                Tâches et Alertes RH
            </span>
            <div className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md transform group-hover/card:scale-110 transition-transform duration-300">
                8 alertes
            </div>
        </CardTitle>
    </CardHeader>
    
    <CardContent className="pt-6 relative z-10">
        <div className="space-y-4">
            {/* Alerte 1 - Contrats */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-orange-50/50 rounded-2xl border-2 border-orange-200 transition-all duration-500 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:shadow-lg hover:scale-[1.02] group/alert">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-md transform group-hover/alert:scale-110 group-hover/alert:rotate-12 transition-all duration-300">
                            <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover/alert:text-orange-700 transition-colors duration-300">
                            3 contrats arrivent à échéance cette semaine
                        </p>
                        <p className="text-xs text-gray-500 group-hover/alert:text-orange-600 transition-colors duration-300 mt-1">
                            Action requise • Échéance proche
                        </p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-orange-300 bg-white text-orange-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:text-white hover:border-orange-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold px-4 rounded-xl"
                    onClick={() => handleQuickAction('Voir contrats')}
                >
                    Examiner
                </Button>
            </div>

            {/* Alerte 2 - Congés */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-purple-50/50 rounded-2xl border-2 border-purple-200 transition-all duration-500 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-lg hover:scale-[1.02] group/alert">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md transform group-hover/alert:scale-110 group-hover/alert:rotate-12 transition-all duration-300">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover/alert:text-purple-700 transition-colors duration-300">
                            5 demandes de congés en attente de validation
                        </p>
                        <p className="text-xs text-gray-500 group-hover/alert:text-purple-600 transition-colors duration-300 mt-1">
                            En attente • Validation requise
                        </p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-purple-300 bg-white text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold px-4 rounded-xl"
                    onClick={() => handleQuickAction('Voir congés')}
                >
                    Traiter
                </Button>
            </div>

            {/* Alerte 3 - Documents (nouvelle) */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-2xl border-2 border-blue-200 transition-all duration-500 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-lg hover:scale-[1.02] group/alert">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md transform group-hover/alert:scale-110 group-hover/alert:rotate-12 transition-all duration-300">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover/alert:text-blue-700 transition-colors duration-300">
                            2 documents administratifs à relire
                        </p>
                        <p className="text-xs text-gray-500 group-hover/alert:text-blue-600 transition-colors duration-300 mt-1">
                            Révision • Documents importants
                        </p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-blue-300 bg-white text-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold px-4 rounded-xl"
                    onClick={() => handleQuickAction('Voir documents')}
                >
                    Vérifier
                </Button>
            </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mt-6 pt-4 border-t border-orange-100/50">
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Progression des tâches</span>
                <span className="font-semibold text-orange-600">2/8 terminées</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2 mt-2">
                <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '25%' }}
                />
            </div>
        </div>
    </CardContent>

    {/* Barre de progression décorative en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover/card:scale-x-100" />
</Card>

            {/* Styles CSS pour les animations */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
                
                .metric-card:hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Animation de pulse subtile pour les cartes importantes */
                .metric-card.destructive {
                    animation: subtle-pulse 2s ease-in-out infinite;
                }
                
                @keyframes subtle-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
};

export default DashboardContent;