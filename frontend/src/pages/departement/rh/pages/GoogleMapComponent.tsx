import React, { useMemo } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Loader2, AlertCircle } from 'lucide-react';

// REMPLACER PAR VOTRE CLÉ API GOOGLE MAPS
const GOOGLE_MAPS_API_KEY = "VOTRE_CLE_API_GOOGLE_MAPS_ICI"; 

const containerStyle = {
  width: '100%',
  height: '150px' // Hauteur définie pour correspondre au design existant
};

interface GoogleMapProps {
    latitude: number;
    longitude: number;
}

/**
 * Composant d'intégration de Google Maps avec marqueur centré sur la position de l'utilisateur.
 */
const GoogleMapComponent: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
    
    // 1. Chargement du script Google Maps
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        // Ajoutez d'autres librairies si nécessaire, ex: libraries: ['places']
    });

    // 2. Définition des coordonnées du centre de la carte
    const center = useMemo(() => ({
        lat: latitude,
        lng: longitude
    }), [latitude, longitude]);

    // 3. Gestion des états de chargement et d'erreur
    if (loadError) {
        return (
            <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md flex items-center gap-2" style={containerStyle}>
                <AlertCircle className="h-5 w-5"/>
                Erreur de chargement de la carte. Vérifiez la clé API.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-gray-100 flex items-center justify-center p-4 rounded-md" style={containerStyle}>
                <Loader2 className="h-6 w-6 animate-spin text-blue-500"/>
                Chargement de la carte...
            </div>
        );
    }

    // 4. Affichage de la carte
    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15} // Zoom approprié pour voir la position
            options={{
                disableDefaultUI: true, // Désactive les boutons par défaut (zoom, Street View)
            }}
        >
            {/* Marqueur sur la position de l'utilisateur */}
            <Marker position={center} />
        </GoogleMap>
    );
};

export default React.memo(GoogleMapComponent);