// src/components/admin/EditLocationModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast, VStack, Text, HStack, Select
} from '@chakra-ui/react';
import api from '../../api/api';
import LocationPickerMap from './LocationPickerMap';

const EditLocationModal = ({ isOpen, onClose, location, onUpdate }) => {
  const [locationName, setLocationName] = useState('');
  const [orderInDay, setOrderInDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0'); // New state
  const [coords, setCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && location) {
      setLocationName(location.location_name || '');
      setOrderInDay(location.order_in_day || '');
      setStartTime(location.start_time || '');
      setEndTime(location.end_time || '');
      setReminderMinutes(location.reminder_minutes?.toString() || '0'); // Set new state
      if (location.latitude != null && location.longitude != null) {
        setCoords({ lat: location.latitude, lng: location.longitude });
      } else {
        setCoords(null);
      }
    }
  }, [isOpen, location]);

  if (!location) return null;

  const handleLocationSelect = (newCoords) => {
    setCoords(newCoords);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const updatedLocation = { 
      location_name: locationName, 
      order_in_day: parseInt(orderInDay),
      start_time: startTime,
      end_time: endTime,
      reminder_minutes: parseInt(reminderMinutes),
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null,
    };
    try {
      await api.put(`/tours/locations/${location.location_id}`, updatedLocation);
      toast({ title: 'Location Updated!', status: 'success' });
      onUpdate();
      onClose();
    } catch (error) { 
      toast({ title: 'Update Failed', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Location</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Location Name</FormLabel>
              <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Order in Day</FormLabel>
              <Input type="number" value={orderInDay} onChange={(e) => setOrderInDay(e.target.value)} />
            </FormControl>
            <HStack w="100%">
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </FormControl>
            </HStack>
            <FormControl>
              <FormLabel>Reminder (for Start Time)</FormLabel>
              <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(e.target.value)}>
                <option value="0">No Reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Set Pin on Map</FormLabel>
              <LocationPickerMap 
                onLocationSelect={handleLocationSelect} 
                initialPosition={coords} 
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                Search for a place or click directly on the map to set coordinates.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} isDisabled={isSubmitting}>Cancel</Button>
          <Button colorScheme="purple" ml={3} onClick={handleSubmit} isLoading={isSubmitting}>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditLocationModal;