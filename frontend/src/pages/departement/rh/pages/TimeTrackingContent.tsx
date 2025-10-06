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
  Calendar,
} from "lucide-react";
import GoogleMapComponent from './GoogleMapComponent';
import Swal from "sweetalert2";

// ===========================================
// CONFIGURATION ET UTILS
// ===========================================

const FLASK_API_ROOT = "http://localhost:5000"; 
const AUTH_TOKEN_KEY = 'authToken'; 
const API_BASE_URL = FLASK_API_ROOT + "/api/attendance"; 

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur HTTP ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
    
  } catch (error: any) {
    console.error(`Erreur API ${url}:`, error);
    throw error;
  }
};

const showSwalAlert = (config: {
  title: string;
  html?: string;
  text?: string;
  icon: 'success' | 'error' | 'warning' | 'info';
  confirmButtonText?: string;
  timer?: number;
  toast?: boolean;
}) => {
  Swal.fire({
    ...config,
    confirmButtonText: config.confirmButtonText || 'OK',
    customClass: {
        confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded',
    },
    buttonsStyling: false,
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
// TYPESCRIPT INTERFACES
// ===========================================

interface AttendanceRecord {
  id: number;
  date: string; 
  check_in: string | null; 
  check_out: string | null; 
  check_in_location: string | null;
  check_out_location: string | null;
  is_late?: boolean;
  has_justification?: boolean;
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
    name: string;
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
          showSwalAlert({
            title: "Erreur de localisation",
            text: `${error.message}. Position par défaut appliquée.`,
            icon: "error",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      showSwalAlert({
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

  // Chargement des données initiales
  const fetchInitialData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // Récupération de l'historique
      const historyData = await apiFetch("/");
      console.log("Données historiques reçues:", historyData);
      
      let records: AttendanceRecord[] = [];
      
      if (historyData.data && Array.isArray(historyData.data)) {
        records = historyData.data;
      } else if (Array.isArray(historyData)) {
        records = historyData;
      } else if (historyData.attendances && Array.isArray(historyData.attendances)) {
        records = historyData.attendances;
      } else {
        console.warn("Structure de données inattendue:", historyData);
        records = [];
      }
      
      setHistory(records);

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
      
      // Récupération des statistiques
      const statsData = await apiFetch("/stats/today");
      console.log("Données stats reçues:", statsData);
      
      setTeamStatus({
        presents: statsData.presents || [],
        absents: statsData.absents || [],
        retards: statsData.retards || [],
      });

    } catch (error: any) {
      console.error("Erreur lors du chargement des données initiales:", error.message);
      showSwalAlert({
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

  // Debug des données
  useEffect(() => {
    console.log("État actuel de l'historique:", history);
    console.log("État actuel du statut:", currentStatus);
    console.log("État de l'équipe:", teamStatus);
  }, [history, currentStatus, teamStatus]);

  // Fonction pour vérifier si l'utilisateur est en retard
  const checkIfLate = async (): Promise<boolean> => {
    try {
      const response = await apiFetch("/check_late", { method: "POST" });
      return response.is_late || false;
    } catch (error) {
      console.error("Erreur lors de la vérification du retard:", error);
      return false;
    }
  };

  // Fonction pour afficher la boîte de dialogue de justification
  const showJustificationDialog = async (): Promise<string | null> => {
    const result = await Swal.fire({
      title: '⚠️ Vous êtes en retard',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px; color: #666;">
            Vous arrivez après 9h15. Veuillez fournir une justification pour votre retard.
          </p>
          <textarea 
            id="justification-input" 
            class="swal2-textarea" 
            placeholder="Exemple: Embouteillage, rendez-vous médical, problème de transport..."
            style="width: 100%; min-height: 120px; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical;"
          ></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Valider le pointage',
      cancelButtonText: 'Annuler',
      customClass: {
        confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ml-2',
      },
      buttonsStyling: false,
      preConfirm: () => {
        const textarea = document.getElementById('justification-input') as HTMLTextAreaElement;
        const value = textarea?.value?.trim();
        
        if (!value) {
          Swal.showValidationMessage('La justification est obligatoire');
          return false;
        }
        
        if (value.length < 10) {
          Swal.showValidationMessage('La justification doit contenir au moins 10 caractères');
          return false;
        }
        
        return value;
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed && result.value) {
      return result.value;
    }
    
    return null;
  };

  // Fonction de pointage d'entrée avec gestion du retard
  const handleCheckIn = async () => {
    if (!userLocation.latitude || !userLocation.longitude) {
      showSwalAlert({
        title: "Localisation indisponible",
        text: "Votre position n'est pas encore disponible. Veuillez attendre un instant.",
        icon: "warning",
      });
      return;
    }
    
    if (currentStatus.isPunchedIn || currentStatus.isFinished) {
        return;
    }

    // Vérifier si l'utilisateur est en retard
    const isLate = await checkIfLate();
    let justification: string | null = null;

    // Si en retard, demander une justification
    if (isLate) {
      justification = await showJustificationDialog();
      
      // Si l'utilisateur annule la justification, on arrête le processus
      if (justification === null) {
        showSwalAlert({
          title: "Pointage annulé",
          text: "Vous devez fournir une justification pour pointer en retard.",
          icon: "info",
        });
        return;
      }
    }

    setIsActionLoading(true);

    try {
      const payload: any = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        location_name: userLocation.name,
      };

      // Ajouter la justification si l'utilisateur est en retard
      if (isLate && justification) {
        payload.justification = justification;
      }

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

      let alertMessage = `${response.message} (à ${checkInTime}).`;
      if (isLate) {
        alertMessage += '<br><br><span style="color: #f59e0b; font-weight: bold;">⚠️ Retard enregistré avec justification</span>';
      }

      showSwalAlert({
        title: isLate ? "Pointage d'entrée enregistré (Retard)" : "Pointage d'entrée réussi ✅",
        html: alertMessage,
        icon: isLate ? "warning" : "success",
        confirmButtonText: "Compris",
      });

    } catch (error: any) {
      let message = error.message || "Une erreur est survenue lors du pointage d'entrée.";
      
      showSwalAlert({
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
      showSwalAlert({
        title: "Action impossible",
        text: "Vous devez d'abord pointer votre entrée.",
        icon: "warning",
      });
      return;
    }

    if (!userLocation.latitude || !userLocation.longitude) {
        showSwalAlert({
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

      showSwalAlert({
        title: "Sortie enregistrée 👋",
        html: `${response.message} (à ${checkOutTime}).`,
        icon: "info",
        confirmButtonText: "OK",
      });

    } catch (error: any) {
      let message = error.message || "Une erreur est survenue lors du pointage de sortie.";
      
      showSwalAlert({
        title: "Échec du pointage de sortie",
        text: message,
        icon: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

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
  
  if (isDataLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-3 text-lg text-primary">Chargement des données...</span>
        </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: "white"}}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Section Pointage du jour et Carte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Pointage du jour */}
          <Card className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 h-full transform hover:-translate-y-1 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-2xl group-hover:from-blue-500/15 group-hover:to-cyan-500/10 transition-all duration-500"></div>
            
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(59,130,246,0.1)_50%)] bg-[length:20px_20px] group-hover:bg-[length:25px_25px] transition-all duration-700"></div>
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(59,130,246,0.1)_50%)] bg-[length:20px_20px] group-hover:bg-[length:25px_25px] transition-all duration-700"></div>
            </div>

            <CardHeader className="pb-4 pt-6 relative z-10 transform group-hover:translate-y-0.5 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 ${
                      !currentStatus.isPunchedIn && !currentStatus.isFinished 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30 group-hover:shadow-green-500/50'
                        : currentStatus.isPunchedIn && !currentStatus.isFinished
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30 group-hover:shadow-blue-500/50'
                        : 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30 group-hover:shadow-slate-500/50'
                    }`}>
                      <Clock className="w-6 h-6 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse group-hover:scale-110 transition-transform duration-300 ${
                      !currentStatus.isPunchedIn && !currentStatus.isFinished 
                        ? 'bg-green-400'
                        : currentStatus.isPunchedIn && !currentStatus.isFinished
                        ? 'bg-blue-400'
                        : 'bg-slate-400'
                    }`}></div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                      Pointage du jour
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors duration-300">Statut en temps réel</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 group-hover:border-blue-500/50 group-hover:bg-slate-700/80 group-hover:shadow-lg transition-all duration-300">
                    {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors duration-300">Live</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
              {/* Barre de statut */}
              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700 group-hover:border-slate-600 group-hover:bg-slate-800/70 transition-all duration-300">
                <div className="flex items-center gap-3">
                  {currentStatus.isFinished && (
                    <>
                      <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-400 font-semibold group-hover:text-slate-300 transition-colors duration-300">Journée terminée</span>
                    </>
                  )}
                  {!currentStatus.isFinished && currentStatus.isPunchedIn && (
                    <>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-300">En service • {currentStatus.checkInTime}</span>
                    </>
                  )}
                  {!currentStatus.isPunchedIn && !currentStatus.isFinished && (
                    <>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-green-400 font-semibold group-hover:text-green-300 transition-colors duration-300">En attente de pointage</span>
                    </>
                  )}
                </div>
                <div className="text-slate-300 text-sm font-mono group-hover:text-white transition-colors duration-300">
                  {todayTotalHours}
                </div>
              </div>

              {/* Grid des informations */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group/item hover:bg-slate-800/70 hover:scale-[1.03] transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full group-hover/item:scale-150 transition-transform duration-300 ${
                      currentStatus.isPunchedIn || currentStatus.isFinished ? 'bg-green-400' : 'bg-slate-500'
                    }`}></div>
                    <span className="text-xs text-slate-400 uppercase font-bold group-hover/item:text-slate-300 transition-colors duration-300">Entrée</span>
                  </div>
                  <div className={`font-bold text-lg group-hover/item:text-blue-100 transition-colors duration-300 ${
                    currentStatus.checkInTime ? 'text-white' : 'text-slate-500'
                  }`}>{currentStatus.checkInTime || '--:--'}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate group-hover/item:text-slate-400 transition-colors duration-300">{currentStatus.checkInLocation || 'Non localisé'}</div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-red-500/50 transition-all duration-300 group/item hover:bg-slate-800/70 hover:scale-[1.03] transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full group-hover/item:scale-150 transition-transform duration-300 ${
                      currentStatus.isFinished ? 'bg-red-400' : 'bg-slate-500'
                    }`}></div>
                    <span className="text-xs text-slate-400 uppercase font-bold group-hover/item:text-slate-300 transition-colors duration-300">Sortie</span>
                  </div>
                  <div className={`font-bold text-lg group-hover/item:text-red-100 transition-colors duration-300 ${
                    currentStatus.checkOutTime ? 'text-white' : 'text-slate-500'
                  }`}>{currentStatus.checkOutTime || '--:--'}</div>
                  <div className="text-xs text-slate-500 mt-1 group-hover/item:text-slate-400 transition-colors duration-300">
                    {currentStatus.isFinished ? 'Journée terminée' : 'En attente'}
                  </div>
                </div>
              </div>

              {/* Carte durée */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30 group-hover:border-blue-500/50 group-hover:from-blue-500/15 group-hover:to-cyan-500/15 transition-all duration-300 transform group-hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400 mb-1 group-hover:text-slate-300 transition-colors duration-300">Durée de travail</div>
                    <div className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">{todayTotalHours}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500/50 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                    <Clock className="w-6 h-6 text-blue-400 group-hover:text-blue-300 group-hover:rotate-12 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Bouton principal */}
              <Button
                variant={ButtonState.variant}
                onClick={ButtonState.action}
                disabled={ButtonState.disabled}
                className={`
                  w-full py-6 rounded-xl font-bold text-base transition-all duration-300
                  relative overflow-hidden group/btn transform
                  ${
                    !currentStatus.isPunchedIn && !currentStatus.isFinished
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02]'
                      : currentStatus.isPunchedIn && !currentStatus.isFinished
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 text-slate-400 border-slate-600 hover:scale-100 cursor-not-allowed'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex items-center justify-center gap-3 relative z-10">
                  {ButtonState.icon}
                  <span className="text-lg group-hover/btn:scale-105 transition-transform duration-300">
                    {!currentStatus.isPunchedIn && !currentStatus.isFinished
                      ? 'Pointer l\'entrée'
                      : currentStatus.isPunchedIn && !currentStatus.isFinished
                      ? 'Pointer la sortie'
                      : 'Journée terminée'
                    }
                  </span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Géolocalisation */}
          <Card className="group relative bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-200 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02]">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-padding group-hover:opacity-100 opacity-0 transition-all duration-500 -z-10">
              <div className="absolute inset-[2px] rounded-2xl bg-white group-hover:bg-emerald-50/80 transition-colors duration-500"></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/3 rounded-2xl group-hover:from-emerald-500/8 group-hover:to-cyan-500/5 transition-all duration-500"></div>
            
            <CardHeader className="pb-4 pt-6 relative z-10 transform group-hover:translate-y-0.5 transition-transform duration-300">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-emerald-900 group-hover:text-emerald-800 transition-colors duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-105 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span>Votre position en temps réel</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
              {userLocation.latitude && userLocation.longitude ? (
                <div className="relative overflow-hidden rounded-xl border border-emerald-200 group/map hover:border-emerald-400/50 transition-all duration-300">
                  <GoogleMapComponent
                    latitude={userLocation.latitude}
                    longitude={userLocation.longitude}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-white/80 rounded-xl border border-emerald-200 group/loader hover:border-emerald-400/50 transition-all duration-300 relative overflow-hidden">
                  <div className="text-center relative z-10 transform group-hover/loader:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-emerald-500/30 group-hover/loader:shadow-emerald-500/50 group-hover/loader:scale-110 transition-all duration-300">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                    <p className="text-emerald-700 font-medium group-hover/loader:text-emerald-600 transition-colors duration-300">{userLocation.name}</p>
                  </div>
                </div>
              )}

              {/* Badge de localisation */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-4 border border-emerald-300 group/location hover:border-emerald-400/50 hover:from-emerald-500/15 hover:to-cyan-500/15 transition-all duration-300 transform group-hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse group-hover/location:scale-150 transition-transform duration-300"></div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-600 group-hover/location:text-emerald-500 transition-colors duration-300">
                        Position actuelle
                      </p>
                      <p className="text-emerald-900 font-medium text-base group-hover/location:text-emerald-800 transition-colors duration-300">
                        {userLocation.name}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-300 group-hover/location:border-emerald-400/50 group-hover/location:bg-emerald-500/30 group-hover/location:scale-110 transition-all duration-300">
                    <MapPin className="w-4 h-4 text-emerald-500 group-hover/location:text-emerald-400 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques d'équipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {/* Carte Présents */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
            
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-lg border-2 border-white">
                    {allTeamUsers.MOCK_PRESENTS.length}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-extrabold text-2xl text-gray-800 block">Présents</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      {allTeamUsers.MOCK_PRESENTS.length} personne{allTeamUsers.MOCK_PRESENTS.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-6">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {allTeamUsers.MOCK_PRESENTS.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-emerald-50 group-hover:border-emerald-100 transition-all duration-300 hover:bg-emerald-25 hover:shadow-lg hover:scale-105 cursor-pointer transform"
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                        user.status === 'late' 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600' 
                          : 'bg-gradient-to-br from-emerald-500 to-green-500 group-hover:from-emerald-600 group-hover:to-green-600'
                      } transition-all duration-300`}>
                        {user.prenom[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-base">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-gray-500">En ligne</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {user.status === 'late' && (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border-2 border-amber-200 group-hover:border-amber-300 group-hover:bg-amber-200 transition-all">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          Retard
                        </span>
                      )}
                      {(!user.status || user.status === 'present') && (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border-2 border-emerald-200 group-hover:border-emerald-300 group-hover:bg-emerald-200 transition-all">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          À l'heure
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {allTeamUsers.MOCK_PRESENTS.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                    <UserCheck className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Aucun présent</p>
                  <p className="text-sm text-gray-400 mt-2">Vérifiez les pointages</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte Absents */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border-2 border-red-100 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
            
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <MinusCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-lg border-2 border-white">
                    {allTeamUsers.MOCK_ABSENTS.length}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-extrabold text-2xl text-gray-800 block">Absents</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      {allTeamUsers.MOCK_ABSENTS.length} personne{allTeamUsers.MOCK_ABSENTS.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-6">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {allTeamUsers.MOCK_ABSENTS.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-red-50 group-hover:border-red-100 transition-all duration-300 hover:bg-red-25 hover:shadow-lg hover:scale-105 cursor-pointer transform"
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:from-red-500 group-hover:to-rose-600 transition-all">
                      {user.prenom[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-base">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-xs text-gray-500">Hors ligne</div>
                    </div>
                  </div>
                ))}
              </div>

              {allTeamUsers.MOCK_ABSENTS.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                    <MinusCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Aucun absent</p>
                  <p className="text-sm text-gray-400 mt-2">Tout le monde est présent !</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte Retards */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-lg border-2 border-white">
                    {allTeamUsers.MOCK_RETARDS.length}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-extrabold text-2xl text-gray-800 block">En Retard</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                      {allTeamUsers.MOCK_RETARDS.length} personnel{allTeamUsers.MOCK_RETARDS.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-6">
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {allTeamUsers.MOCK_RETARDS.map((user, index) => (
                  <div
                    key={user.id}
                    className="p-4 bg-white rounded-2xl border-2 border-amber-50 group-hover:border-amber-100 transition-all duration-300 hover:bg-amber-25 hover:shadow-lg hover:scale-105 cursor-pointer transform"
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:from-amber-500 group-hover:to-orange-600 transition-all">
                          {user.prenom[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-base">
                            {user.prenom} {user.nom}
                          </div>
                          {user.justification && (
                            <div className="mt-2 transform origin-left transition-all duration-300 group-hover:scale-105">
                              <div className="flex items-center gap-2 text-xs text-gray-600 bg-amber-50/80 backdrop-blur-sm px-3 py-2 rounded-xl border-2 border-amber-200 shadow-sm">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                {user.justification}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {allTeamUsers.MOCK_RETARDS.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Aucun retard</p>
                  <p className="text-sm text-gray-400 mt-2">Tout le monde est à l'heure !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historique des pointages */}
        <div className="group relative bg-gradient-to-br from-gray-900 to-primary/90 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-primary/30">
          <div className="relative p-6 border-b border-primary/30 bg-gradient-to-r from-primary/20 to-blue-600/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <ListChecks className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  Historique des pointages
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                </h3>
                <p className="text-sm text-blue-100/80 mt-1">Derniers enregistrements de présence en temps réel</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary/40 to-blue-600/40 backdrop-blur-sm border-b border-primary/30">
                  <th className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wider text-left min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      DATE
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wider text-left min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      ENTRÉE
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wider text-left min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      SORTIE
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wider text-left min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      DURÉE
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wider text-left min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      LIEU
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr 
                    key={record.id} 
                    className={`
                      group/row transition-all duration-300 hover:bg-primary/10
                      ${index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/50"}
                      border-b border-gray-700/30
                    `}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover/row:bg-primary/30 transition-colors">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {new Date(record.date).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(record.date).toLocaleDateString('fr-FR', { 
                              weekday: 'short' 
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover/row:bg-green-500/30 transition-colors">
                          <LogIn className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {record.check_in ? new Date(record.check_in).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : '--:--'}
                          </div>
                          {record.check_in && (
                            <div className="text-xs text-green-400/70">
                              Pointage validé
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover/row:bg-red-500/30 transition-colors">
                          <LogOut className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {record.check_out ? new Date(record.check_out).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : '--:--'}
                          </div>
                          {record.check_out && (
                            <div className="text-xs text-red-400/70">
                              Sortie enregistrée
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover/row:bg-blue-500/30 transition-colors">
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {calculateTotalHours(record.check_in, record.check_out)}
                          </div>
                          <div className="text-xs text-blue-400/70">
                            Temps travaillé
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover/row:bg-purple-500/30 transition-colors">
                          <MapPin className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white text-sm truncate">
                            {record.check_in_location || 'Non Défini'}
                          </div>
                          <div className="text-xs text-purple-400/70">
                            Localisation
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center shadow-2xl">
                  <ListChecks className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Aucun historique</h4>
                <p className="text-gray-400">Les pointages apparaîtront ici</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border-t border-gray-700/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">{history.filter(r => r.check_in).length} Entrée(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-gray-300">{history.filter(r => r.check_out).length} Sortie(s)</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  {history.length} enregistrement{history.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingContent;