import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, Zap, X, Trash2, Loader2, Plus, Navigation, Building, Construction, Sparkles } from "lucide-react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ===========================================
// CONFIGURATION API
// ===========================================
const FLASK_API_ROOT = "http://localhost:5000"; 
const AUTH_TOKEN_KEY = 'authToken'; 
const API_BASE_URL = FLASK_API_ROOT + "/api/work_locations"; 

// Configuration Google Maps
const GOOGLE_MAPS_API_KEY = "AIzaSyCtXq1hGhWTAR8mhAE923pIW7BGFVYP2a4";

/**
 * Fonction d'aide pour les requêtes API avec gestion d'erreurs et JWT.
 */
const apiFetch = async (url, options = {}) => {
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
        throw new Error(`Erreur HTTP ${response.status}: Le serveur n'a pas renvoyé de JSON.`);
    }
    return {};
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Erreur API: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};

// Composant pour la carte Google Maps - VERSION SIMPLIFIÉE ET CORRIGÉE
const MapComponent = ({ zones, onLocationSelect, center = { lat: 14.716677, lng: -17.467686 }, mapId = "map" }) => {
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    let googleMap = null;
    let clickListener = null;

    const initializeMap = () => {
      const mapElement = document.getElementById(mapId);
      if (!mapElement) {
        console.error("Élément map non trouvé:", mapId);
        return;
      }

      // Vérifier si Google Maps est chargé
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API non chargée");
        // Recharger le script
        loadGoogleMaps();
        return;
      }

      try {
        googleMap = new window.google.maps.Map(mapElement, {
          center: center,
          zoom: 18,
          styles: [
            { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
            { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
            { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
            { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
            { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d4e6ff" }, { "visibility": "on" }] }
          ]
        });

        if (onLocationSelect) {
          clickListener = googleMap.addListener('click', (event) => {
            onLocationSelect({
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            });
          });
        }

        setMap(googleMap);
        setIsMapLoaded(true);

        // Ajouter la géolocalisation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              
              new window.google.maps.Marker({
                position: userLocation,
                map: googleMap,
                title: "Votre Position",
                icon: {
                  url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzQyODVGNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI1IiBmaWxsPSIjNDI4NUY0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==',
                  scaledSize: new window.google.maps.Size(48, 48),
                  anchor: new window.google.maps.Point(24, 24),
                },
              });
            },
            () => {
              console.warn("L'utilisateur a refusé la géolocalisation.");
            }
          );
        }

      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
      }
    };

    const loadGoogleMaps = () => {
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        // Le script est déjà en cours de chargement
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initializeMap, 500);
      };
      script.onerror = () => {
        console.error("Erreur de chargement de l'API Google Maps");
      };
      document.head.appendChild(script);
    };

    // Démarrage de l'initialisation
    if (window.google && window.google.maps) {
      setTimeout(initializeMap, 100);
    } else {
      loadGoogleMaps();
    }

    // Nettoyage
    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
      // Nettoyer les cercles
      circles.forEach(circle => circle.setMap(null));
    };
  }, [mapId]); // Seulement mapId en dépendance

  // Mettre à jour le centre
  useEffect(() => {
    if (map && isMapLoaded && center) {
      map.setCenter(center);
    }
  }, [center, map, isMapLoaded]);

  // Mettre à jour les zones
  useEffect(() => {
    if (map && isMapLoaded && zones) {
      // Nettoyer les anciens cercles
      circles.forEach(circle => circle.setMap(null));
      const newCircles = [];

      // Ajouter les nouvelles zones
      zones.forEach(zone => {
        if (zone.latitude && zone.longitude) {
          const position = {
            lat: parseFloat(zone.latitude),
            lng: parseFloat(zone.longitude)
          };

          // Définir les couleurs selon le type de zone
          const isBureau = zone.type === 'bureau';
          const strokeColor = isBureau ? '#2563EB' : '#D97706'; // Bleu pour bureau, Jaune/Ambre pour chantier
          const fillColor = isBureau ? '#3B82F6' : '#F59E0B'; // Bleu pour bureau, Jaune/Ambre pour chantier

          const circle = new window.google.maps.Circle({
            strokeColor: strokeColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: fillColor,
            fillOpacity: 0.25,
            map: map,
            center: position,
            radius: zone.radius || 50
          });

          // Ajouter une infobulle avec les détails de la zone
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2 min-w-[200px]">
                <h3 class="font-semibold text-gray-900">${zone.name}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full ${isBureau ? 'bg-blue-500' : 'bg-amber-500'}"></span>
                    Type: ${zone.type}
                  </span>
                </p>
                <p class="text-sm text-gray-600">Rayon: ${zone.radius}m</p>
                ${zone.address ? `<p class="text-sm text-gray-500 mt-1">${zone.address}</p>` : ''}
              </div>
            `,
          });

          // Ajouter un événement au clic sur le cercle pour afficher l'infobulle
          circle.addListener('click', () => {
            // Fermer toutes les autres infobulles
            circles.forEach(c => {
              const existingInfoWindow = c.get('infoWindow');
              if (existingInfoWindow) {
                existingInfoWindow.close();
              }
            });
            
            infoWindow.open(map);
            infoWindow.setPosition(position);
          });

          // Stocker l'infobulle avec le cercle
          circle.set('infoWindow', infoWindow);
          circle.set('zoneData', zone);

          newCircles.push(circle);
        }
      });

      setCircles(newCircles);
    }
  }, [zones, map, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2"/>
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}
      <div 
        id={mapId} 
        className={`w-full h-full rounded-lg shadow-md ${!isMapLoaded ? 'invisible' : 'visible'}`}
      />
    </div>
  );
};

// Composant Modal séparé pour mieux gérer la carte
const CreateZoneModal = ({ isOpen, onClose, onSave, zones, isLoading }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newZone, setNewZone] = useState({
    name: '',
    radius: 50,
    type: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setNewZone(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newZone);
  };

  const resetForm = () => {
    setNewZone({
      name: '',
      radius: 50,
      type: '',
      address: '',
      latitude: '',
      longitude: '',
    });
    setSelectedLocation(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-5xl p-8 relative shadow-2xl border-2 border-indigo-100 transform animate-in zoom-in-95 duration-300">
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:rotate-90 hover:scale-110 p-2 hover:bg-gray-100 rounded-full"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          <X className="h-6 w-6"/>
        </button>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl animate-pulse-glow">
            <Plus className="h-6 w-6 text-white"/>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nouvelle Zone de Travail
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="space-y-5">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="transform hover:scale-102 transition-transform duration-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Nom de la zone*
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Siège social"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 placeholder-gray-400 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="transform hover:scale-102 transition-transform duration-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Rayon (mètres)*
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newZone.radius}
                    onChange={(e) => setNewZone({...newZone, radius: e.target.value})}
                    required
                    min="1"
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 placeholder-gray-400 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="transform hover:scale-102 transition-transform duration-200">
                <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Type de zone*
                </label>
                <select 
                  value={newZone.type}
                  onChange={(e) => setNewZone({...newZone, type: e.target.value})}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 hover:border-gray-300 cursor-pointer"
                >
                  <option value="" disabled>Sélectionnez le type</option>
                  <option value="bureau">🏢 Bureau</option>
                  <option value="chantier">🏗️ Chantier</option>
                </select>
              </div>

              <div className="transform hover:scale-102 transition-transform duration-200">
                <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Adresse
                </label>
                <input
                  type="text"
                  placeholder="Adresse complète (facultatif)"
                  value={newZone.address}
                  onChange={(e) => setNewZone({...newZone, address: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 placeholder-gray-400 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="transform hover:scale-102 transition-transform duration-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Latitude*
                  </label>
                  <input
                    type="text"
                    placeholder="14.716677"
                    value={newZone.latitude}
                    onChange={(e) => setNewZone({...newZone, latitude: e.target.value})}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 placeholder-gray-400 text-gray-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="transform hover:scale-102 transition-transform duration-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Longitude*
                  </label>
                  <input
                    type="text"
                    placeholder="-17.467686"
                    value={newZone.longitude}
                    onChange={(e) => setNewZone({...newZone, longitude: e.target.value})}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 placeholder-gray-400 text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 transform hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                    <Navigation className="h-5 w-5 text-white"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Sélection sur la carte</p>
                    <p className="text-sm text-blue-700">
                      Cliquez sur la carte à droite pour définir les coordonnées automatiquement
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 hover:-translate-y-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2"/>
                    Créer la zone de travail
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Carte dans le modal */}
          <div className="h-[600px] rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-2xl transform hover:scale-102 transition-all duration-500">
            <MapComponent 
              mapId="modal-map"
              zones={zones}
              onLocationSelect={handleLocationSelect}
              center={selectedLocation || { lat: 14.716677, lng: -17.467686 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

const WorkZoneContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/");
      setZones(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des zones:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de chargement',
        text: `Impossible de récupérer les zones de travail : ${error.message}`,
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleSaveZone = async (zoneData) => {
    setIsSaving(true);

    if (!zoneData.name || !zoneData.latitude || !zoneData.longitude || !zoneData.radius || !zoneData.type) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonColor: '#F59E0B',
      });
      setIsSaving(false);
      return;
    }

    try {
      await apiFetch("/", {
        method: "POST",
        body: JSON.stringify({
          ...zoneData,
          latitude: String(zoneData.latitude),
          longitude: String(zoneData.longitude),
          radius: Number(zoneData.radius),
        }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Zone enregistrée !',
        text: 'La nouvelle zone de travail a bien été créée.',
        confirmButtonColor: '#10B981',
      });
      
      setIsModalOpen(false);
      await fetchZones(); 

    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'enregistrement',
        text: `Impossible d'ajouter la zone: ${error.message}`,
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteZone = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/${id}`, { method: "DELETE" });

        Swal.fire({
          icon: 'success',
          title: 'Supprimée !',
          text: 'La zone de travail a été supprimée.',
          confirmButtonColor: '#10B981',
        });
        
        await fetchZones();

      } catch (error) {
        console.error("Erreur de suppression:", error.message);
        Swal.fire({
          icon: 'error',
          title: 'Échec de suppression',
          text: `Impossible de supprimer la zone: ${error.message}`,
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const totalZones = useMemo(() => zones.length, [zones]);
  const bureauZones = useMemo(() => zones.filter(z => z.type === 'bureau').length, [zones]);
  const chantierZones = useMemo(() => zones.filter(z => z.type === 'chantier').length, [zones]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-6 space-y-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header with floating animation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="animate-float">
          <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300 animate-pulse-glow">
              <MapPin className="h-7 w-7 text-white"/>
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestion des Zones de Travail
            </span>
          </h2>
          <p className="text-gray-600 mt-3 ml-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500"/>
            Définissez et gérez les zones géographiques pour le pointage
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 rounded-xl px-6 py-6 font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-5 w-5"/>
          Nouvelle Zone
        </Button>
      </div>

      {/* Stats Cards with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total des Zones</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalZones}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl transform group-hover:rotate-12 transition-transform duration-500">
                <Navigation className="h-8 w-8 text-indigo-600"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden group" style={{animationDelay: '100ms'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Zones Bureau</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{bureauZones}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl transform group-hover:rotate-12 transition-transform duration-500">
                <Building className="h-8 w-8 text-blue-600"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden group" style={{animationDelay: '200ms'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Zones Chantier</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{chantierZones}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl transform group-hover:rotate-12 transition-transform duration-500">
                <Construction className="h-8 w-8 text-amber-600"/>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map and Configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
        {/* Map */}
        <Card className="xl:col-span-2 bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden transform hover:shadow-3xl transition-all duration-500">
          <CardHeader className="pb-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <MapPin className="h-5 w-5 text-white"/>
              </div>
              Carte Interactive des Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-inner relative">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3"/>
                    <p className="text-gray-600 font-medium">Chargement de la carte...</p>
                  </div>
                </div>
              ) : (
                <MapComponent 
                  mapId="main-map"
                  zones={zones} 
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden transform hover:shadow-indigo-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white"/>
                </div>
                Zones Actives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-3">
                {zones.slice(0, 3).map((zone, index) => (
                  <div 
                    key={zone.id} 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 transform hover:scale-102"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className={`p-2.5 rounded-xl shadow-lg ${
                      zone.type === 'bureau' 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-br from-amber-400 to-orange-600'
                    }`}>
                      {zone.type === 'bureau' ? 
                        <Building className="h-5 w-5 text-white"/> : 
                        <Construction className="h-5 w-5 text-white"/>
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{zone.name}</p>
                      <p className="text-xs text-gray-600 capitalize mt-1">
                        <span className="inline-flex items-center gap-1">
                          {zone.type} • {zone.radius}m
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {zones.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 rounded-xl font-medium"
                  onClick={() => Swal.fire({
                    title: "Toutes les Zones",
                    html: `
                      <div class="text-left space-y-2 max-h-96 overflow-y-auto">
                        ${zones.map(z => `
                          <div class="p-3 border-b border-gray-200">
                            <div class="flex justify-between items-start">
                              <div>
                                <p class="font-semibold text-gray-900">${z.name}</p>
                                <p class="text-sm text-gray-600 capitalize">${z.type} • ${z.radius}m</p>
                                ${z.address ? `<p class="text-xs text-gray-500 mt-1">${z.address}</p>` : ''}
                              </div>
                              <span class="px-2 py-1 text-xs rounded-full ${
                                z.type === 'bureau' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }">${z.type}</span>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    `,
                    width: 600,
                    confirmButtonColor: '#4F46E5',
                    icon: 'info',
                  })}
                >
                  Voir toutes les zones ({zones.length})
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden transform hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Settings className="h-5 w-5 text-white"/>
                </div>
                Gestion des Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2"/>
                  <span className="text-gray-600 font-medium">Chargement...</span>
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-block p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 animate-float">
                    <MapPin className="h-12 w-12 text-gray-400"/>
                  </div>
                  <p className="text-gray-600 font-medium">Aucune zone définie</p>
                  <p className="text-sm text-gray-500 mt-2">Créez votre première zone de travail</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {zones.map((zone, index) => (
                    <div 
                      key={zone.id} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 group hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:scale-102"
                      style={{animationDelay: `${index * 50}ms`}}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-md transform group-hover:rotate-12 transition-transform duration-300 ${
                          zone.type === 'bureau' 
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                            : 'bg-gradient-to-br from-amber-400 to-orange-600'
                        }`}>
                          {zone.type === 'bureau' ? 
                            <Building className="h-4 w-4 text-white"/> : 
                            <Construction className="h-4 w-4 text-white"/>
                          }
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{zone.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <CreateZoneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveZone}
        zones={zones}
        isLoading={isSaving}
      />
    </div>
  );
};

export default WorkZoneContent;