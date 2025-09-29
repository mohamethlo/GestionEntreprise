// src/components/rh/pages/TimeTrackingContent.tsx

import React, { useState, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2'; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Loader2, MapPin, AlertCircle, CheckCircle2, LogIn, LogOut, ListChecks, Users, MinusCircle, UserCheck } from "lucide-react";

// Importation du composant de carte Google Maps (assurez-vous que le fichier GoogleMapComponent.tsx existe)
import GoogleMapComponent from './GoogleMapComponent'; 

// ===========================================
// 1. TYPESCRIPT INTERFACES
// ===========================================

interface AttendanceRecord {
    id: number;
    date: string; 
    check_in: string | null; 
    check_out: string | null;
    check_in_location: string | null;
    check_out_location: string | null;
}

interface CurrentAttendanceState {
    checkInTime: string | null;
    checkInLocation: string | null;
    checkOutTime: string | null;
    isPunchedIn: boolean;
    isFinished: boolean;
}

interface UserStatus {
    id: number;
    prenom: string;
    nom: string;
    status: 'present' | 'absent' | 'late';
    justification?: string;
}

// ===========================================
// 2. DONNÉES ET FONCTIONS SIMULÉES (MOCK)
// ===========================================

const MOCK_HISTORY: AttendanceRecord[] = [
    { id: 1, date: '2025-09-27', check_in: '2025-09-27T08:30:00.000Z', check_out: '2025-09-27T17:30:00.000Z', check_in_location: 'Bureau Central', check_out_location: 'Bureau Central' },
    { id: 2, date: '2025-09-26', check_in: '2025-09-26T09:00:00.000Z', check_out: '2025-09-26T18:00:00.000Z', check_in_location: 'Télétravail', check_out_location: 'Télétravail' },
];

const MOCK_TEAM_STATUS: UserStatus[] = [
    { id: 101, prenom: 'Alice', nom: 'Dupont', status: 'present' },
    { id: 102, prenom: 'Bob', nom: 'Martin', status: 'absent' },
    { id: 103, prenom: 'Clara', nom: 'Lefevre', status: 'late', justification: 'Problème de transport.' },
    { id: 104, prenom: 'David', nom: 'Roy', status: 'present' },
];

const MOCK_PRESENTS = MOCK_TEAM_STATUS.filter(u => u.status === 'present' || u.status === 'late');
const MOCK_ABSENTS = MOCK_TEAM_STATUS.filter(u => u.status === 'absent');
const MOCK_RETARDS = MOCK_TEAM_STATUS.filter(u => u.status === 'late');

const calculateTotalHours = (checkInStr: string | null, checkOutStr: string | null): string => {
    if (!checkInStr || !checkOutStr) return '-';
    try {
        const checkIn = new Date(checkInStr);
        const checkOut = new Date(checkOutStr);
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours.toFixed(1) + 'h';
    } catch {
        return '-';
    }
};

// ===========================================
// 3. COMPOSANT PRINCIPAL
// ===========================================

const TimeTrackingContent = () => {
    const [history, setHistory] = useState<AttendanceRecord[]>(MOCK_HISTORY);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    const [currentStatus, setCurrentStatus] = useState<CurrentAttendanceState>({
        checkInTime: null,
        checkInLocation: null,
        checkOutTime: null,
        isPunchedIn: false,
        isFinished: false,
    });

    // État pour la position de l'utilisateur
    const [userLocation, setUserLocation] = useState({
        latitude: 48.8584, // Coordonnées par défaut (Paris)
        longitude: 2.2945,
        name: "Localisation par défaut (Tour Eiffel)",
    });
    const [isLocating, setIsLocating] = useState(false);


    // Fonction de simulation pour obtenir la géolocalisation
    const handleGetLocation = useCallback(() => {
        setIsLocating(true);
        
        // Simuler un temps de chargement
        setTimeout(() => {
            // Simuler des coordonnées légèrement différentes
            const newLatitude = 48.8584 + (Math.random() - 0.5) * 0.01;
            const newLongitude = 2.2945 + (Math.random() - 0.5) * 0.01;
            const newLocationName = newLatitude > 48.8584 ? "Quartier Nord Simulé" : "Quartier Sud Simulé";
            
            setUserLocation({
                latitude: newLatitude, 
                longitude: newLongitude,
                name: newLocationName,
            });
            setIsLocating(false);
            
            Swal.fire({
                title: "Position Mise à Jour ✅",
                text: `Prêt à pointer au : ${newLocationName}.`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }, 1500);
    }, []);


    // Fonction de simulation pour le Check-in (Entrée)
    const handleCheckIn = () => {
        setIsActionLoading(true);
        const now = new Date();
        const checkInTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        setTimeout(() => {
            setCurrentStatus({
                ...currentStatus,
                checkInTime: checkInTime,
                checkInLocation: userLocation.name, 
                isPunchedIn: true,
            });
            setIsActionLoading(false);
            
            Swal.fire({
                title: "Pointage d'entrée réussi ! ✅",
                html: `Votre entrée a été enregistrée à **${checkInTime}** à l'adresse **${userLocation.name}**.`,
                icon: "success",
                confirmButtonText: "Compris",
                confirmButtonColor: "#28a745" 
            });
            
        }, 1500);
    };

    // Fonction de simulation pour le Check-out (Sortie)
    const handleCheckOut = () => {
        setIsActionLoading(true);
        const now = new Date();

        setTimeout(() => {
            const simulatedCheckIn = new Date(new Date().setHours(8, 30, 0, 0)).toISOString();
            const checkOutTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            setCurrentStatus({
                ...currentStatus,
                checkOutTime: checkOutTime,
                isPunchedIn: false,
                isFinished: true,
            });
            
            // Ajouter le pointage à l'historique simulé
            const newHistoryRecord: AttendanceRecord = { 
                id: Date.now(), 
                date: now.toISOString().split('T')[0],
                check_in: simulatedCheckIn,
                check_out: now.toISOString(),
                check_in_location: currentStatus.checkInLocation,
                check_out_location: userLocation.name, 
            };
            setHistory([newHistoryRecord, ...MOCK_HISTORY]);
            
            setIsActionLoading(false);
            
            Swal.fire({
                title: "Sortie enregistrée 👋",
                html: `Votre journée de travail est terminée. Sortie enregistrée à **${checkOutTime}**.`,
                icon: "info",
                confirmButtonText: "OK",
                confirmButtonColor: "#007bff" 
            });
            
        }, 1500);
    };
    
    // Logique de couleur des boutons
    const ButtonState = useMemo(() => {
        if (isActionLoading) return { text: "Chargement...", icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />, action: () => {}, variant: "default" as const, disabled: true };
        
        if (currentStatus.isFinished) return { text: "Journée Terminée", icon: <CheckCircle2 className="mr-2 h-4 w-4" />, action: () => {}, variant: "success" as const, disabled: true };
        
        if (currentStatus.isPunchedIn) return { text: "Pointer la Sortie", icon: <LogOut className="mr-2 h-4 w-4" />, action: handleCheckOut, variant: "destructive" as const, disabled: false };
        
        return { text: "Pointer l'Entrée", icon: <LogIn className="mr-2 h-4 w-4" />, action: handleCheckIn, variant: "success" as const, disabled: false };
    }, [isActionLoading, currentStatus]);


    // Calcul de la durée totale
    const todayTotalHours = useMemo(() => {
        const todayDate = new Date().toISOString().split('T')[0];
        const latestRecord = history.find(r => r.date === todayDate);
        if (latestRecord && latestRecord.check_in && latestRecord.check_out) {
             return calculateTotalHours(latestRecord.check_in, latestRecord.check_out);
        }
        return '-';
    }, [history]);


    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6"/> Gestion du Pointage
            </h2>
            
            <div className="text-sm text-red-500 bg-red-50 p-3 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4"/> **MODE SIMULATION :** Utilise SweetAlert2 et simule la géolocalisation.
            </div>

            {/* QUICK ACTIONS ROW: Pointage du jour & Carte de position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* 1. Pointage du jour */}
                <Card className="shadow-lg border-blue-200">
                    <CardHeader className="bg-blue-50/50">
                        <CardTitle className="text-xl text-blue-700">Pointage du jour</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        
                        {/* Status Message */}
                        {currentStatus.isFinished && (
                            <div className="alert alert-success bg-green-100 text-green-700 p-2 rounded flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Journée terminée
                            </div>
                        )}
                        {!currentStatus.isFinished && currentStatus.isPunchedIn && (
                             <div className="alert alert-info bg-blue-100 text-blue-700 p-2 rounded flex items-center gap-2">
                                <Clock className="h-4 w-4" /> En service depuis {currentStatus.checkInTime}
                            </div>
                        )}
                        {!currentStatus.isPunchedIn && !currentStatus.isFinished && (
                            <div className="alert alert-warning bg-yellow-100 text-yellow-700 p-2 rounded flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Vous n'avez pas encore pointé aujourd'hui
                            </div>
                        )}

                        <p><strong>Entrée:</strong> {currentStatus.checkInTime || '-'}</p>
                        <p><strong>Sortie:</strong> {currentStatus.checkOutTime || '-'}</p>
                        <p><strong>Lieu d'Entrée:</strong> {currentStatus.checkInLocation || '-'}</p>
                        <p><strong>Durée:</strong> {todayTotalHours}</p>
                        
                        <Button
                            variant={ButtonState.variant}
                            onClick={ButtonState.action}
                            disabled={ButtonState.disabled}
                            className="w-full mt-4 h-10 transition-all"
                        >
                            {ButtonState.icon}
                            {ButtonState.text}
                        </Button>
                    </CardContent>
                </Card>

                {/* 2. Votre position */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Votre position</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="bg-gray-50 border p-4 rounded-lg text-sm">
                            <p className="flex justify-between font-semibold">
                                <span><MapPin className="h-4 w-4 inline mr-1 text-primary"/> Lieu Enregistré:</span>
                                <span>{userLocation.name}</span>
                            </p>
                            <p className="flex justify-between text-muted-foreground mt-1">
                                <span>Latitude:</span>
                                <span>{userLocation.latitude.toFixed(4)}</span>
                            </p>
                            <p className="flex justify-between text-muted-foreground">
                                <span>Longitude:</span>
                                <span>{userLocation.longitude.toFixed(4)}</span>
                            </p>
                        </div>
                        
                        {/* Composant Google Maps */}
                        <GoogleMapComponent 
                            latitude={userLocation.latitude} 
                            longitude={userLocation.longitude} 
                        />

                        <Button 
                            onClick={handleGetLocation} 
                            disabled={isLocating}
                            variant="outline" 
                            className="w-full"
                        >
                            {isLocating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/> Localisation...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4 mr-2"/> Mettre à jour la Position
                                </>
                            )}
                        </Button>

                        <p className="text-muted-foreground mt-2 mb-0 text-xs">
                            *Ceci simule l'obtention de la position réelle via le navigateur.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* TEAM STATUS ROW: Présents, Absents, Retards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* 3. Présents */}
                <Card className="border-success-500 shadow-lg border-t-4 border-green-500">
                    <CardHeader className="bg-green-50/50">
                        <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                            <UserCheck className="h-5 w-5"/> Présents ({MOCK_PRESENTS.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {MOCK_PRESENTS.map(user => (
                                <li key={user.id}>
                                    {user.prenom} {user.nom} 
                                    {user.status === 'late' && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Retard
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* 4. Absents */}
                <Card className="border-danger-500 shadow-lg border-t-4 border-red-500">
                    <CardHeader className="bg-red-50/50">
                        <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                            <MinusCircle className="h-5 w-5"/> Absents ({MOCK_ABSENTS.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {MOCK_ABSENTS.map(user => (
                                <li key={user.id}>
                                    {user.prenom} {user.nom}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* 5. Retards */}
                <Card className="border-warning-500 shadow-lg border-t-4 border-yellow-500">
                    <CardHeader className="bg-yellow-50/50">
                        <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5"/> En Retard ({MOCK_RETARDS.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {MOCK_RETARDS.map(user => (
                                <li key={user.id}>
                                    {user.prenom} {user.nom}
                                    {user.justification && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Justification : {user.justification}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <hr className="my-6"/>

            {/* ATTENDANCE HISTORY ROW */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                         <ListChecks className="h-5 w-5"/> Historique des pointages (Simulé)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Entrée</TableHead>
                                    <TableHead>Sortie</TableHead>
                                    <TableHead>Durée</TableHead>
                                    <TableHead>Lieu</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {new Date(record.date).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell>
                                            {record.check_in ? new Date(record.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {record.check_out ? new Date(record.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {calculateTotalHours(record.check_in, record.check_out)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1 text-xs">
                                                <MapPin className="h-3 w-3 text-muted-foreground"/>
                                                {record.check_in_location || 'Non Défini'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimeTrackingContent;