// src/components/rh/pages/GoogleMapComponent.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, MapPin, Building, Construction } from 'lucide-react';

// Configuration Google Maps
const GOOGLE_MAPS_API_KEY = "AIzaSyCtXq1hGhWTAR8mhAE923pIW7BGFVYP2a4";

// Configuration API pour récupérer les zones de travail
const FLASK_API_ROOT = "http://localhost:5000"; 
const AUTH_TOKEN_KEY = 'authToken'; 
const WORK_ZONES_API_URL = `${FLASK_API_ROOT}/api/work_locations`;

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

interface WorkZone {
  id: number;
  name: string;
  type: 'bureau' | 'chantier';
  latitude: string;
  longitude: string;
  radius: number;
  address?: string;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [workZones, setWorkZones] = useState<WorkZone[]>([]);
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);

  // Fonction pour récupérer les zones de travail
  const fetchWorkZones = useCallback(async () => {
    setIsLoadingZones(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(WORK_ZONES_API_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setWorkZones(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des zones de travail:", error);
      // On continue sans les zones en cas d'erreur
    } finally {
      setIsLoadingZones(false);
    }
  }, []);

  // Fonction pour initialiser la carte
  const initializeMap = useCallback(() => {
    const mapElement = document.getElementById('user-location-map');
    if (!mapElement) {
      setMapError("Élément map non trouvé");
      return;
    }

    if (!window.google || !window.google.maps) {
      setMapError("Google Maps API non chargée");
      return;
    }

    try {
      const googleMap = new window.google.maps.Map(mapElement, {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
        styles: [
          { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
          { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
          { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
          { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
          { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
          { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
          { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
          { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d4e6ff" }, { "visibility": "on" }] }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Créer le marqueur utilisateur avec un design personnalisé
      const userMarker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: googleMap,
        title: "Votre position actuelle",
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzQyODVGNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI1IiBmaWxsPSIjNDI4NUY0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==',
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
        zIndex: 1000, // Toujours au-dessus des cercles
      });

      setMap(googleMap);
      setMarker(userMarker);
      setIsMapLoaded(true);
      setMapError(null);

    } catch (error) {
      console.error("Erreur lors de l'initialisation de la carte:", error);
      setMapError("Erreur lors de l'initialisation de la carte");
    }
  }, [latitude, longitude]);

  // Fonction pour dessiner les zones de travail avec cercles de 50m
  const drawWorkZones = useCallback(() => {
    if (!map || !isMapLoaded || !workZones.length) return;

    console.log(`Dessin de ${workZones.length} zones de travail`);

    // Nettoyer les anciens cercles et marqueurs
    circles.forEach(circle => circle.setMap(null));
    markers.forEach(marker => marker.setMap(null));
    
    const newCircles: google.maps.Circle[] = [];
    const newMarkers: google.maps.Marker[] = [];

    workZones.forEach(zone => {
      if (zone.latitude && zone.longitude) {
        const position = {
          lat: parseFloat(zone.latitude),
          lng: parseFloat(zone.longitude)
        };

        console.log(`Dessin zone: ${zone.name} à ${position.lat}, ${position.lng}`);

        // Définir les couleurs selon le type de zone
        const isBureau = zone.type === 'bureau';
        const strokeColor = isBureau ? '#2563EB' : '#D97706';
        const fillColor = isBureau ? '#3B82F6' : '#F59E0B';

        // TOUJOURS utiliser 50m de rayon
        const circleRadius = 50;

        // Créer le cercle
        const circle = new window.google.maps.Circle({
          strokeColor: strokeColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: fillColor,
          fillOpacity: 0.25,
          map: map,
          center: position,
          radius: circleRadius, // Fixé à 50m
          clickable: true
        });

        // Ajouter un marqueur au centre de la zone
        const zoneMarker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: `${zone.name} (${zone.type}) - ${circleRadius}m`,
          icon: {
            url: isBureau 
              ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTMgMjFoMThhMiAyIDAgMCAwIDItMlY5YTIgMiAwIDAgMC0yLTJoLTRWNWEyIDIgMCAwIDAtMi0ySDlhMiAyIDAgMCAwLTIgMnYyaC00YTIgMiAwIDAgMC0yIDJ2MTBhMiAyIDAgMCAwIDIgMnoiIGZpbGw9IiMyNTYzZUIiLz4KPC9zdmc+Cg=='
              : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEzIDNsMi4zOCAyLjM4LTcuNzQgNy43NEw1IDEwLjcydjMuNTZsMy41Ni0zLjU2IDcuNzQtNy43NEwxNyA3VjN6IiBmaWxsPSIjRDk3NzA2Ii8+Cjwvc3ZnPgo=',
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12),
          },
          zIndex: 500,
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
              <p class="text-sm text-gray-600">Rayon: ${circleRadius}m</p>
              ${zone.address ? `<p class="text-sm text-gray-500 mt-1">${zone.address}</p>` : ''}
            </div>
          `,
        });

        // Événements pour afficher l'infobulle
        circle.addListener('click', (event: google.maps.MapMouseEvent) => {
          infoWindow.setPosition(position);
          infoWindow.open(map);
        });

        zoneMarker.addListener('click', () => {
          infoWindow.setPosition(position);
          infoWindow.open(map);
        });

        newCircles.push(circle);
        newMarkers.push(zoneMarker);
      }
    });

    setCircles(newCircles);
    setMarkers(newMarkers);
    
    console.log(`${newCircles.length} cercles dessinés`);
  }, [map, isMapLoaded, workZones]);

  // Charger Google Maps API
  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadGoogleMaps = () => {
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        if (window.google.maps?.ready) {
          window.google.maps.ready(initializeMap);
        }
        return;
      }

      script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google.maps?.ready) {
          window.google.maps.ready(initializeMap);
        } else {
          setTimeout(initializeMap, 500);
        }
      };
      script.onerror = () => {
        console.error("Erreur de chargement de l'API Google Maps");
        setMapError("Erreur de chargement de l'API Google Maps");
      };
      document.head.appendChild(script);
    };

    if (window.google && window.google.maps) {
      if (window.google.maps.ready) {
        window.google.maps.ready(initializeMap);
      } else {
        setTimeout(initializeMap, 100);
      }
    } else {
      loadGoogleMaps();
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
      circles.forEach(circle => circle.setMap(null));
      markers.forEach(marker => marker.setMap(null));
    };
  }, [initializeMap]);

  // Récupérer les zones de travail au chargement
  useEffect(() => {
    fetchWorkZones();
  }, [fetchWorkZones]);

  // Dessiner les zones quand la carte et les données sont prêtes
  useEffect(() => {
    if (map && isMapLoaded && workZones.length > 0) {
      drawWorkZones();
    }
  }, [map, isMapLoaded, workZones, drawWorkZones]);

  // Mettre à jour le centre de la carte quand les coordonnées changent
  useEffect(() => {
    if (map && isMapLoaded) {
      const newCenter = { lat: latitude, lng: longitude };
      map.setCenter(newCenter);
      
      if (marker) {
        marker.setPosition(newCenter);
      }
    }
  }, [latitude, longitude, map, marker, isMapLoaded]);

  // Gestion des erreurs
  if (mapError) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-red-700 font-semibold text-lg mb-2">Erreur de chargement</p>
          <p className="text-red-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-emerald-200 bg-white/80 backdrop-blur-sm">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-emerald-700 font-medium">Chargement de la carte...</p>
          <p className="text-emerald-600 text-sm mt-1">Acquisition de votre position</p>
        </div>
      )}
      
      <div 
        id="user-location-map" 
        className={`w-full h-full ${!isMapLoaded ? 'invisible' : 'visible'}`}
      />
      
      {/* Badge de coordonnées */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-emerald-200 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-emerald-500" />
        <div className="text-xs font-medium text-emerald-700">
          <div>{latitude.toFixed(6)}°</div>
          <div>{longitude.toFixed(6)}°</div>
        </div>
      </div>

      {/* Indicateur de statut */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-emerald-600 border border-emerald-200 flex items-center gap-1">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        Position en direct
      </div>

      {/* Légende des zones */}
      {isMapLoaded && workZones.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-emerald-200">
          <div className="text-xs font-semibold text-emerald-700 mb-2">Zones de travail (50m)</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600">Bureaux</span>
            </div>
            <div className="flex items-center gap-2">
              <Construction className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-gray-600">Chantiers</span>
            </div>
          </div>
        </div>
      )}

      {/* Compteur de zones */}
      {isMapLoaded && workZones.length > 0 && (
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-emerald-600 border border-emerald-200">
          {workZones.length} zone{workZones.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Indicateur de chargement des zones */}
      {isMapLoaded && isLoadingZones && (
        <div className="absolute top-16 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-amber-600 border border-amber-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Chargement des zones...
        </div>
      )}
    </div>
  );
};

export default React.memo(GoogleMapComponent);