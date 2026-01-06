import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { Input } from '../ui/input';

const containerStyle = { width: '100%', height: '400px', borderRadius: '1.5rem' };
const defaultCenter = { lat: 23.8103, lng: 90.4125 }; // Dhaka
const libraries = ['places'];

const LocationPickerMap = ({ onLocationSelect, initialPosition }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-unified',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    setMarkerPosition(initialPosition || null);
  }, [initialPosition]);

  const onLoad = useCallback(map => {
    mapRef.current = map;
    if (initialPosition) {
      map.panTo(initialPosition);
      map.setZoom(14);
    }
  }, [initialPosition]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onMapClick = useCallback((e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(newPosition);
    if (onLocationSelect) {
      onLocationSelect(newPosition);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    if (isLoaded && searchInputRef.current && !autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const newPosition = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setMarkerPosition(newPosition);
          if (onLocationSelect) {
            onLocationSelect(newPosition);
          }
          if (mapRef.current) {
            mapRef.current.panTo(newPosition);
            mapRef.current.setZoom(15);
          }
        }
      });
    }
  }, [isLoaded, onLocationSelect]);

  if (loadError) {
    return (
      <div className="h-[400px] bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center justify-center text-red-400 gap-2 p-6 text-center">
        <AlertCircle className="h-8 w-8" />
        <p className="font-medium">Spatial interface failed to initialize. Verify API protocols and 'Places' authorization.</p>
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="h-[400px] bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Initializing Satellite Link...</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-10 transition-transform group-hover:scale-[1.01]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            ref={searchInputRef}
            placeholder="Search for sector coordinates..."
            className="pl-10 bg-white/90 backdrop-blur-md border-white/20 text-slate-900 placeholder:text-slate-400 shadow-2xl rounded-xl h-10"
          />
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialPosition || defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [{ "saturation": 36 }, { "color": "#000000" }, { "lightness": 40 }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text.stroke",
              "stylers": [{ "visibility": "on" }, { "color": "#000000" }, { "lightness": 16 }]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#000000" }, { "lightness": 20 }]
            },
            // Simplified dark theme for map
          ]
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
};

export default LocationPickerMap;