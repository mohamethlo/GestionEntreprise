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
import Swal from "sweetalert2"; // <-- Ajout de l'import SweetAlert2

// ===========================================
// CONFIGURATION ET UTILS
// ===========================================

// 🛑🛑🛑 IMPORTANT : METTRE À JOUR CETTE VALEUR 🛑🛑🛑
const FLASK_API_ROOT = "http://localhost:5000"; 
// Clé d'authentification harmonisée
const AUTH_TOKEN_KEY = 'authToken'; 

const API_BASE_URL = FLASK_API_ROOT + "/api/attendance"; 

/**
 * Fonction d'aide pour les requêtes API avec gestion d'erreurs, JWT, et erreurs non-JSON.
 */
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json(); 
  } catch (e) {
    if (!response.ok) {
        const text = await response.text();
        if (text.includes("<!doctype html>")) {
             throw new Error(`Erreur HTTP ${response.status}: Le serveur a renvoyé une page HTML (possiblement une erreur ou une redirection).`);
        }
        throw new Error(`Erreur HTTP ${response.status}: Le serveur n'a pas renvoyé de JSON.`);
    }
    return {};
  }

  if (!response.ok) {
    const errorMessage = data.message || `Erreur API: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};


// ===========================================
// UTILS
// ===========================================

// Remplacement de l'ancienne fonction "showSwalAlert" par l'appel direct à Swal.fire
const showSwalAlert = (config: {
  title: string;
  html?: string;
  text?: string;
  icon: 'success' | 'error' | 'warning' | 'info';
  confirmButtonText?: string;
  timer?: number;
  toast?: boolean;
}) => {
  // Utilisez directement Swal.fire
  Swal.fire({
    ...config,
    confirmButtonText: config.confirmButtonText || 'OK',
    customClass: {
        confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded',
    },
    buttonsStyling: false, // Nécessaire pour utiliser les classes Tailwind sur le bouton
  });
};

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
// TYPESCRIPT INTERFACES (Aucun changement ici)
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

interface TeamStatusAPI {
    id: number;
    name: string; // Format: "Nom Prenom"
}


// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

const TimeTrackingContent = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); 
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

  const [teamStatus, setTeamStatus] = useState<{
    presents: TeamStatusAPI[],
    absents: TeamStatusAPI[],
    retards: TeamStatusAPI[],
  }>({ presents: [], absents: [], retards: [] });


  // --- Effets de chargement initial ---

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
          setUserLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
            name: `Position (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
          }));
        },
        (error) => {
          console.error("Erreur de géolocalisation continue:", error);
          setUserLocation((prev) => ({
            ...prev,
            latitude: 48.8584,
            longitude: 2.2945,
            name: "Erreur - Position de secours",
          }));
          showSwalAlert({ // <-- Utilisation de Swal.fire
            title: "Erreur de localisation",
            text: `${error.message}. Position par défaut appliquée.`,
            icon: "error",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Géolocalisation non supportée",
        text: "La géolocalisation n'est pas supportée par ce navigateur.",
        icon: "warning",
      });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Chargement des données initiales (Historique et Statut du jour)
  const fetchInitialData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // 1. Récupérer l'historique
      const historyData = await apiFetch("/");
      const records: AttendanceRecord[] = historyData.data || [];
      setHistory(records);

      // 2. Déterminer le statut d'aujourd'hui
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(r => r.date === todayDateStr);

      if (todayRecord) {
        setCurrentStatus({
          checkInTime: todayRecord.check_in ? new Date(todayRecord.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null,
          checkInLocation: todayRecord.check_in_location,
          checkOutTime: todayRecord.check_out ? new Date(todayRecord.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null,
          isPunchedIn: !!todayRecord.check_in && !todayRecord.check_out,
          isFinished: !!todayRecord.check_out,
        });
      } else {
         setCurrentStatus({
          checkInTime: null,
          checkInLocation: null,
          checkOutTime: null,
          isPunchedIn: false,
          isFinished: false,
        });
      }
      
      // 3. Récupérer les statistiques d'équipe
      const statsData = await apiFetch("/stats/today");
      setTeamStatus({
        presents: statsData.presents || [],
        absents: statsData.absents || [],
        retards: statsData.retards || [],
      });


    } catch (error: any) {
      console.error("Erreur lors du chargement des données initiales:", error.message);
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Erreur de chargement",
        text: `Impossible de récupérer les données de pointage. Erreur: ${error.message}`,
        icon: "error",
      });
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  // --- Fonctions de pointage API ---

  const handleCheckIn = async () => {
    if (!userLocation.latitude || !userLocation.longitude) {
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Localisation indisponible",
        text: "Votre position n'est pas encore disponible. Veuillez attendre un instant.",
        icon: "warning",
      });
      return;
    }
    
    if (currentStatus.isPunchedIn || currentStatus.isFinished) {
        return;
    }

    setIsActionLoading(true);

    try {
      const payload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        location_name: userLocation.name,
      };

      const response = await apiFetch("/check_in", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const now = new Date();
      const checkInTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      setCurrentStatus(prev => ({
        ...prev,
        checkInTime: checkInTime,
        checkInLocation: userLocation.name,
        isPunchedIn: true,
        isFinished: false,
      }));
      
      await fetchInitialData();

      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Pointage d'entrée réussi ! ✅",
        html: `${response.message} (à ${checkInTime}).`,
        icon: "success",
        confirmButtonText: "Compris",
      });

    } catch (error: any) {
      let message = error.message || "Une erreur est survenue lors du pointage d'entrée.";
      
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Échec du pointage d'entrée",
        text: message,
        icon: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentStatus.isPunchedIn) {
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Action impossible",
        text: "Vous devez d'abord pointer votre entrée.",
        icon: "warning",
      });
      return;
    }

    if (!userLocation.latitude || !userLocation.longitude) {
        showSwalAlert({ // <-- Utilisation de Swal.fire
            title: "Localisation indisponible",
            text: "Votre position n'est pas encore disponible. Veuillez attendre un instant.",
            icon: "warning",
        });
        return;
    }
    
    setIsActionLoading(true);

    try {
      const payload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        location: currentStatus.checkInLocation || userLocation.name, 
      };

      const response = await apiFetch("/check_out", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const now = new Date();
      const checkOutTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      setCurrentStatus(prev => ({
        ...prev,
        checkOutTime: checkOutTime,
        isPunchedIn: false,
        isFinished: true,
      }));

      await fetchInitialData();

      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Sortie enregistrée 👋",
        html: `${response.message} (à ${checkOutTime}).`,
        icon: "info",
        confirmButtonText: "OK",
      });

    } catch (error: any) {
      let message = error.message || "Une erreur est survenue lors du pointage de sortie.";
      
      showSwalAlert({ // <-- Utilisation de Swal.fire
        title: "Échec du pointage de sortie",
        text: message,
        icon: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Mémos et états dérivés (inchangé) ---

  const ButtonState = useMemo(() => {
    if (isActionLoading || isDataLoading)
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
        disabled: !userLocation.latitude, 
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
  }, [isActionLoading, isDataLoading, currentStatus, userLocation.latitude]);

  const todayTotalHours = useMemo(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    const latestRecord = history.find(r => r.date === todayDate);
    if (latestRecord && latestRecord.check_in && latestRecord.check_out) {
      return calculateTotalHours(latestRecord.check_in, latestRecord.check_out);
    }
    return '-';
  }, [history]);

  const allTeamUsers = useMemo(() => {
    const parseName = (fullName: string): { nom: string, prenom: string } => {
        const parts = fullName.split(' ');
        const nom = parts[0] || '';
        const prenom = parts.slice(1).join(' ') || '';
        return { nom, prenom };
    };

    const presentUsers: UserStatus[] = teamStatus.presents.map(u => ({
        id: u.id,
        ...parseName(u.name),
        status: teamStatus.retards.some(r => r.id === u.id) ? 'late' : 'present',
    }));
    
    const absentUsers: UserStatus[] = teamStatus.absents.map(u => ({
        id: u.id,
        ...parseName(u.name),
        status: 'absent',
    }));
    
    const lateUsers: UserStatus[] = presentUsers.filter(u => u.status === 'late').map(u => ({
        ...u,
        justification: "Retard constaté via l'heure de pointage.", 
    }));
    
    return {
        MOCK_PRESENTS: presentUsers,
        MOCK_ABSENTS: absentUsers,
        MOCK_RETARDS: lateUsers,
    };
  }, [teamStatus]);
  
  // Affichage du chargement des données initiales
  if (isDataLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-3 text-lg text-primary">Chargement des données...</span>
        </div>
    );
  }

  // --- Rendu du composant (inchangé) ---
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
                Présents ({allTeamUsers.MOCK_PRESENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {allTeamUsers.MOCK_PRESENTS.map(user => (
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
                Absents ({allTeamUsers.MOCK_ABSENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {allTeamUsers.MOCK_ABSENTS.map(user => (
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
                En Retard ({allTeamUsers.MOCK_RETARDS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {allTeamUsers.MOCK_RETARDS.map(user => (
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