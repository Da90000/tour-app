// src/components/admin/LocationPickerMap.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Input, Spinner, Text, Center } from '@chakra-ui/react';

const containerStyle = { width: '100%', height: '400px', borderRadius: 'md' };
const defaultCenter = { lat: 23.8103, lng: 90.4125 }; // Dhaka
const libraries = ['places'];

const LocationPickerMap = ({ onLocationSelect, initialPosition }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-unified', // Use a single, consistent ID
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
      <Center h="400px" bg="red.100" borderRadius="md">
        <Text color="red.700">Map could not load. Check API Key & "Places API".</Text>
      </Center>
    );
  }
  if (!isLoaded) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box position="relative">
      <Input
        ref={searchInputRef}
        placeholder="Search for a location..."
        position="absolute"
        top="10px"
        left="50%"
        transform="translateX(-50%)"
        width="90%"
        zIndex="1"
        bg="white"
        shadow="md"
      />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialPosition || defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </Box>
  );
};

export default LocationPickerMap;