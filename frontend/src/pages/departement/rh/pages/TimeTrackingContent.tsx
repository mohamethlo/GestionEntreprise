// src/components/rh/pages/TimeTrackingContent.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Clock,
  Loader2,
  MapPin,
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
  ListChecks,
  UserCheck,
  MinusCircle,
} from "lucide-react";
import GoogleMapComponent from './GoogleMapComponent';

// ===========================================
// TYPESCRIPT INTERFACES
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
// DONNÉES SIMULÉES (MOCK)
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

const showSwalAlert = (config: {
  title: string;
  html?: string;
  text?: string;
  icon: string;
  confirmButtonText?: string;
  timer?: number;
  toast?: boolean;
}) => {
  const message = config.html || config.text || config.title;
  alert(`${config.icon.toUpperCase()}: ${message}`);
};

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

const TimeTrackingContent = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>(MOCK_HISTORY);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  const [currentStatus, setCurrentStatus] = useState<CurrentAttendanceState>({
    checkInTime: null,
    checkInLocation: null,
    checkOutTime: null,
    isPunchedIn: false,
    isFinished: false,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number | null,
    longitude: number | null,
    name: string,
  }>({
    latitude: null,
    longitude: null,
    name: "Acquisition de la position...",
  });

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Surveillance de la position en temps réel
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            latitude,
            longitude,
            name: `Position (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation continue:", error);
          setUserLocation({
            latitude: 48.8584,
            longitude: 2.2945,
            name: "Erreur - Position de secours",
          });
          alert(`Erreur de localisation: ${error.message}.`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleCheckIn = () => {
    if (!userLocation.latitude || !userLocation.longitude) {
      alert("Votre position n'est pas encore disponible. Veuillez attendre un instant.");
      return;
    }
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

      showSwalAlert({
        title: "Pointage d'entrée réussi ! ✅",
        html: `Votre entrée a été enregistrée à ${checkInTime} à l'adresse ${userLocation.name}.`,
        icon: "success",
        confirmButtonText: "Compris",
      });
    }, 1500);
  };

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

      const newHistoryRecord: AttendanceRecord = {
        id: Date.now(),
        date: now.toISOString().split('T')[0],
        check_in: simulatedCheckIn,
        check_out: now.toISOString(),
        check_in_location: currentStatus.checkInLocation,
        check_out_location: userLocation.name,
      };
      setHistory([newHistoryRecord, ...history]);
      setIsActionLoading(false);

      showSwalAlert({
        title: "Sortie enregistrée 👋",
        html: `Votre journée de travail est terminée. Sortie enregistrée à ${checkOutTime}.`,
        icon: "info",
        confirmButtonText: "OK",
      });
    }, 1500);
  };

  const ButtonState = useMemo(() => {
    if (isActionLoading)
      return {
        text: "Chargement...",
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
        action: () => {},
        variant: "default" as const,
        disabled: true,
        className: ""
      };

    if (currentStatus.isFinished)
      return {
        text: "Journée Terminée",
        icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
        action: () => {},
        variant: "default" as const,
        disabled: true,
        className: "bg-gray-400"
      };

    if (currentStatus.isPunchedIn)
      return {
        text: "Pointer la Sortie",
        icon: <LogOut className="mr-2 h-4 w-4" />,
        action: handleCheckOut,
        variant: "destructive" as const,
        disabled: false,
        className: "bg-red-500 hover:bg-red-600"
      };

    return {
      text: "Pointer l'Entrée",
      icon: <LogIn className="mr-2 h-4 w-4" />,
      action: handleCheckIn,
      variant: "default" as const,
      disabled: !userLocation.latitude,
      className: !userLocation.latitude ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
    };
  }, [isActionLoading, currentStatus, userLocation.latitude]);

  const todayTotalHours = useMemo(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    const latestRecord = history.find(r => r.date === todayDate);
    if (latestRecord && latestRecord.check_in && latestRecord.check_out) {
      return calculateTotalHours(latestRecord.check_in, latestRecord.check_out);
    }
    return '-';
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto p-6 space-y-6">
        {/* Section Pointage du jour et Carte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pointage du jour */}
          <Card className="shadow-lg border-t-4 border-t-primary/70">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary/80">
                <Clock className="w-5 h-5" />
                Pointage du jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Messages */}
              {currentStatus.isFinished && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Journée terminée
                </div>
              )}
              {!currentStatus.isFinished && currentStatus.isPunchedIn && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" /> En service depuis {currentStatus.checkInTime}
                </div>
              )}
              {!currentStatus.isPunchedIn && !currentStatus.isFinished && (
                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Vous n'avez pas encore pointé aujourd'hui
                </div>
              )}

              <div className="text-4xl font-extrabold text-primary text-center">
                {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Entrée:</strong> {currentStatus.checkInTime || '-'}</p>
                <p><strong>Sortie:</strong> {currentStatus.checkOutTime || '-'}</p>
                <p><strong>Lieu d'Entrée:</strong> {currentStatus.checkInLocation || '-'}</p>
                <p><strong>Durée:</strong> {todayTotalHours}</p>
              </div>

              <Button
                variant={ButtonState.variant}
                onClick={ButtonState.action}
                disabled={ButtonState.disabled}
                className={`w-full text-lg font-semibold py-7 transition-all duration-300 ${ButtonState.className}`}
              >
                {ButtonState.icon}
                {ButtonState.text}
              </Button>
            </CardContent>
          </Card>

          {/* Géolocalisation */}
          <Card className="shadow-lg border-t-4 border-t-primary/70">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary/80">
                <MapPin className="w-5 h-5" />
                Votre position en temps réel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userLocation.latitude && userLocation.longitude ? (
                <GoogleMapComponent
                  latitude={userLocation.latitude}
                  longitude={userLocation.longitude}
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>{userLocation.name}</p>
                  </div>
                </div>
              )}
              <div className="text-center p-2 bg-blue-50 rounded-md">
                <p className="text-sm font-semibold text-blue-700">{userLocation.name}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                *Votre position est mise à jour automatiquement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques d'équipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                <UserCheck className="w-5 h-5" />
                Présents ({MOCK_PRESENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {MOCK_PRESENTS.map(user => (
                  <li key={user.id} className="flex items-center justify-between">
                    <span>{user.prenom} {user.nom}</span>
                    {user.status === 'late' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Retard
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                <MinusCircle className="w-5 h-5" />
                Absents ({MOCK_ABSENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {MOCK_ABSENTS.map(user => (
                  <li key={user.id}>
                    {user.prenom} {user.nom}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700 text-lg">
                <AlertCircle className="w-5 h-5" />
                En Retard ({MOCK_RETARDS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {MOCK_RETARDS.map(user => (
                  <li key={user.id}>
                    <div>{user.prenom} {user.nom}</div>
                    {user.justification && (
                      <p className="text-xs text-gray-500 mt-1">
                        {user.justification}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Historique des pointages */}
        <div className="bg-surface rounded-lg shadow-sm border border-primary/20 overflow-hidden">
          <div className="p-4 border-b border-primary/20 bg-surface/50">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Historique des pointages
            </h3>
            <p className="text-sm text-muted-foreground">Derniers enregistrements de présence</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface/60">
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Entrée</TableHead>
                  <TableHead className="text-white">Sortie</TableHead>
                  <TableHead className="text-white">Durée</TableHead>
                  <TableHead className="text-white">Lieu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record, index) => (
                  <TableRow 
                    key={record.id} 
                    className={index % 2 === 0 ? "bg-surface/80" : "bg-surface/70"}
                  >
                    <TableCell className="font-medium text-white">
                      {new Date(record.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {record.check_in ? new Date(record.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell className="text-white">
                      {calculateTotalHours(record.check_in, record.check_out)}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {record.check_in_location || 'Non Défini'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingContent;