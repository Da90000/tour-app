import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Navigation2,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const containerStyle = { width: '100%', height: '100%', borderRadius: 'inherit' };
const libraries = ['places'];

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  clickableIcons: false,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#746855" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#263c3f" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#6b9a76" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#38414e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#212a37" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9ca5b3" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#746855" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#1f2835" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#f3d19c" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#17263c" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#515c6d" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#17263c" }]
    }
  ]
};

const MapView = ({ pins }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-unified',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [mapPins, setMapPins] = useState([]);

  useEffect(() => {
    setMapPins(pins || []);
  }, [pins]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Error watching position:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const onLoad = useCallback(mapInstance => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  useEffect(() => {
    if (map && isLoaded && (mapPins.length > 0 || userPosition)) {
      const bounds = new window.google.maps.LatLngBounds();
      if (mapPins.length > 0) {
        mapPins.forEach(pin => bounds.extend({ lat: pin.latitude, lng: pin.longitude }));
      }
      if (userPosition) {
        bounds.extend(userPosition);
      }
      if (!bounds.isEmpty()) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          map.setCenter(bounds.getCenter());
          map.setZoom(14);
        } else {
          map.fitBounds(bounds);
        }
      }
    }
  }, [map, isLoaded, userPosition, mapPins]);

  const calculateRoute = (pin) => {
    if (!userPosition || !window.google || !isLoaded) return;
    setDirections(null);
    setSelectedDestination(null);
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: userPosition,
      destination: { lat: pin.latitude, lng: pin.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
        setSelectedDestination({
          name: pin.name || pin.location_name,
          ...result.routes[0].legs[0]
        });
      } else {
        setSelectedDestination({ name: 'Route not found' });
      }
    });
  };

  const generateGoogleMapsUrl = () => {
    if (!userPosition || !selectedDestination?.end_location) return '#';
    const origin = `${userPosition.lat},${userPosition.lng}`;
    const destination = `${selectedDestination.end_location.lat()},${selectedDestination.end_location.lng()}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  if (loadError) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/50 text-red-400">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="font-bold uppercase tracking-widest text-xs">Navigation System Error</span>
    </div>
  );

  if (!isLoaded) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/50 text-primary">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <span className="font-bold uppercase tracking-widest text-[10px]">Loading Satellite Interface...</span>
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={() => { setDirections(null); setSelectedDestination(null); }}
      >
        {userPosition && (
          <Marker
            position={userPosition}
            title="User Position"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#8b5cf6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2
            }}
          />
        )}

        {mapPins.map((pin) => (
          <Marker
            key={`pin-${pin.id}`}
            position={{ lat: pin.latitude, lng: pin.longitude }}
            label={{ text: `${pin.order_in_day}`, color: "white", fontWeight: "bold", fontSize: "14px" }}
            title={pin.name}
            onClick={() => calculateRoute(pin)}
          />
        ))}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#8b5cf6',
                strokeWeight: 6,
                strokeOpacity: 0.6
              }
            }}
          />
        )}
      </GoogleMap>

      {/* Floating Header */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-slate-900/80 backdrop-blur-md border-white/10 text-slate-300 px-4 py-2 flex items-center gap-2">
          <Navigation className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Active Tracking Active</span>
        </Badge>
      </div>

      {selectedDestination && (
        <div className="absolute bottom-6 left-6 right-6 z-10 fade-in">
          <Card className="bg-slate-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden max-w-md mx-auto">
            <CardHeader className="pb-2 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2 italic">
                  <MapPin className="h-4 w-4 text-primary" /> {selectedDestination.name}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setSelectedDestination(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <Navigation2 className="h-3 w-3" /> Distance
                  </p>
                  <p className="text-xl font-bold font-mono text-white italic">
                    {selectedDestination.distance?.text || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Duration
                  </p>
                  <p className="text-xl font-bold font-mono text-white italic">
                    {selectedDestination.duration?.text || 'N/A'}
                  </p>
                </div>
              </div>

              <Button
                as="a"
                href={generateGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/80"
              >
                Open in External Navigation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;