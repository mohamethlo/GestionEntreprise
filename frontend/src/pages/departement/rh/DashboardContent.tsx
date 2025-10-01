// src/components/rh/pages/DashboardContent.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileSearch, AlertCircle, CheckCircle2, Clock } from "lucide-react";

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
            { title: "Évaluations en Attente", value: "23", color: "warning" },
            { title: "Documents à Signer", value: "3", color: "purple" },
            { title: "Moyenne d'Ancienneté", value: "3.2 ans", color: "commercial" },
            { title: "Taux d'Augmentation", value: "4.5%", color: "success" }
        ];

        const performanceData = [
            { title: "Effectif Total", value: "124", unit: "employés", color: "commercial" },
            { title: "Taux de Turnover", value: "5.2%", unit: "(objectif < 8%)", color: "destructive" },
            { title: "Taux de Rétention", value: "94.8%", unit: "(objectif > 90%)", color: "success" },
            { title: "Temps de Recrutement", value: "28", unit: "jours", color: "warning" }
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
                <div className="space-y-6">
                    <div className="transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-warning animate-pulse" />
                            <h2 className="text-lg font-semibold transition-colors duration-300 hover:text-warning/80" style={{color:"black", fontSize:"25px"}}>
                                Ressources Humaines en Temps Réel
                            </h2>
                        </div>
                        <div className="p-4 bg-success/10 border border-success/20 rounded-lg transition-all duration-300 hover:bg-success/15 hover:border-success/30 hover:shadow-lg">
                            <div className="flex items-center gap-2 text-success">
                                <CheckCircle2 className="h-4 w-4 animate-bounce" />
                                <span className="text-sm">Service RH actif et synchronisé</span>
                            </div>
                        </div>
                    </div>

                    <div className="transition-all duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-4">
                            <FileSearch className="h-5 w-5 text-warning transition-transform duration-300 hover:scale-110" />
                            <h2 className="text-lg font-semibold transition-colors duration-300 hover:text-warning/80" style={{color:"black", fontSize:"25px"}}>
                                Indicateurs Clés RH
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {performanceData.map((item, index) => (
                                <Card 
                                    key={index} 
                                    className={`metric-card ${item.color} border-0 transition-all duration-300 ${
                                        hoveredCard === `performance-${index}` 
                                            ? 'scale-105 shadow-lg -translate-y-1' 
                                            : 'hover:scale-102'
                                    } ${
                                        animatedValues[`performance-${index}`] 
                                            ? 'animate-fade-in-up' 
                                            : 'opacity-0'
                                    }`}
                                    style={{ 
                                        animationDelay: `${index * 100}ms`,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={() => handleCardHover(index, 'performance')}
                                    onMouseLeave={handleCardLeave}
                                >
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold transition-all duration-300 hover:text-xl">
                                            {item.value}
                                        </div>
                                        <div className="text-sm opacity-90 transition-opacity duration-300 hover:opacity-100">
                                            {item.unit}
                                        </div>
                                        <div className="text-xs mt-1 opacity-75 transition-all duration-300 hover:opacity-100 hover:font-medium">
                                            {item.title}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

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

            {/* Bottom Section - Tasks */}
            <Card 
                className={`border-primary/20 transition-all duration-700 delay-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } hover:shadow-lg hover:border-primary/30`}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 transition-colors duration-300 hover:text-warning">
                        <AlertCircle className="h-5 w-5 text-warning animate-pulse" />
                        Tâches et Alertes RH
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 transition-all duration-300 hover:bg-warning/15 hover:border-warning/30 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-warning transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" />
                                <span className="text-sm transition-all duration-300 group-hover:font-medium">
                                    3 contrats arrivent à échéance cette semaine
                                </span>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="transition-all duration-300 hover:scale-105 hover:bg-warning hover:text-white active:scale-95"
                                onClick={() => handleQuickAction('Voir contrats')}
                            >
                                Voir
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-100/10 rounded-lg border border-purple-200/20 transition-all duration-300 hover:bg-purple-100/15 hover:border-purple-200/30 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                                <span className="text-sm transition-all duration-300 group-hover:font-medium">
                                    5 demandes de congés en attente de validation
                                </span>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="transition-all duration-300 hover:scale-105 hover:bg-purple-400 hover:text-white active:scale-95"
                                onClick={() => handleQuickAction('Voir congés')}
                            >
                                Voir
                            </Button>
                        </div>
                    </div>
                </CardContent>
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