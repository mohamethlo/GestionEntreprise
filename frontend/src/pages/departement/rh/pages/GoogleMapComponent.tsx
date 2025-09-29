// src/components/rh/pages/GoogleMapComponent.tsx

import React, { useMemo } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';

// REMPLACER PAR VOTRE CLÉ API GOOGLE MAPS
const GOOGLE_MAPS_API_KEY = "AIzaSyCtXq1hGhWTAR8mhAE923pIW7BGFVYP2a4"; 

const containerStyle = {
  width: '100%',
  height: '200px'
};

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}


const GoogleMapComponent: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  
  // 1. Chargement du script Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // 2. Définition des coordonnées du centre de la carte
  const center = useMemo(() => ({
    lat: latitude,
    lng: longitude
  }), [latitude, longitude]);

  // 3. Gestion des états de chargement et d'erreur (avec ton design)
  if (loadError) {
    return (
      <div 
        className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg flex items-center gap-2" 
        style={containerStyle}
      >
        <AlertCircle className="h-5 w-5 flex-shrink-0"/>
        <div className="text-sm">
          <p className="font-semibold">Erreur de chargement de la carte</p>
          <p className="text-xs">Vérifiez la clé API Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className="bg-gray-100 flex flex-col items-center justify-center p-4 rounded-lg" 
        style={containerStyle}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2"/>
        <p className="text-sm text-gray-600">Chargement de la carte...</p>
      </div>
    );
  }

  // 4. Affichage de la carte Google Maps (logique du collègue)
  return (
    <div className="relative rounded-lg overflow-hidden shadow-inner">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: false, // Garde les contrôles Google Maps
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Marqueur sur la position de l'utilisateur avec ton design */}
        <Marker 
          position={center}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
      </GoogleMap>
      
      {/* Badge de coordonnées (ton design) */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm">
        <MapPin className="h-3 w-3 text-primary" />
        <span className="font-medium">{latitude.toFixed(4)}°, {longitude.toFixed(4)}°</span>
      </div>
    </div>
  );
};

export default React.memo(GoogleMapComponent);