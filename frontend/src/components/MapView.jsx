// src/components/MapView.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import {
  Box, Text, Spinner, Center, Flex, VStack, Divider, Button, Link,
  Stat, StatLabel, StatNumber, Heading
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const containerStyle = { width: '100%', height: '100%', borderRadius: 'inherit' };
const libraries = ['places'];

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
        console.error(`Error fetching directions: ${status}`);
        setSelectedDestination({ name: 'Route not found' });
      }
    }
    );
  };

  if (loadError) return <Center h="100%" bg="red.100"><Text>Map cannot be loaded.</Text></Center>;
  if (!isLoaded) return <Center h="100%"><Spinner size="xl" /></Center>;

  const generateGoogleMapsUrl = () => {
    if (!userPosition || !selectedDestination?.end_location) return '#';
    const origin = `${userPosition.lat},${userPosition.lng}`;
    const destination = `${selectedDestination.end_location.lat()},${selectedDestination.end_location.lng()}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  return (
    <Box position="relative" w="100%" h="100%">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
        onClick={() => { setDirections(null); setSelectedDestination(null); }}
      >
        {userPosition && (
          <Marker position={userPosition} title="Your Location" icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }} />
        )}

        {mapPins.map((pin) => (
          <Marker
            key={`pin-${pin.id}`}
            position={{ lat: pin.latitude, lng: pin.longitude }}
            label={{ text: `${pin.order_in_day}`, color: "white", fontWeight: "bold" }}
            title={pin.name}
            onClick={() => calculateRoute(pin)}
          />
        ))}

        {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#4285F4', strokeWeight: 5, strokeOpacity: 0.8 } }} />}
      </GoogleMap>

      {selectedDestination && (
        <Box
          position="absolute"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="lg"
          zIndex={1}
          w="90%"
          maxW="400px"
        >
          <VStack align="stretch" spacing={3}>
            <Heading size="md">Route to: {selectedDestination.name}</Heading>
            <Divider />
            <Flex justify="space-around">
              <Stat textAlign="center">
                <StatLabel>Distance</StatLabel>
                <StatNumber>{selectedDestination.distance?.text || 'N/A'}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Est. Time</StatLabel>
                <StatNumber>{selectedDestination.duration?.text || 'N/A'}</StatNumber>
              </Stat>
            </Flex>
            <Button
              as={Link}
              href={generateGoogleMapsUrl()}
              isExternal
              colorScheme="blue"
              rightIcon={<ExternalLinkIcon />}
              width="full"
            >
              Open in Google Maps App
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default MapView;