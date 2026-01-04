// src/components/admin/ManageEvents.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Button, useToast,
  List, ListItem, Flex, Spacer, IconButton, Select, Text, Textarea,
  NumberInput, NumberInputField, HStack, useDisclosure
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import api from '../../api/api';
import EditEventModal from './EditEventModal';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

const ManageEvents = ({ groupId, days, onDataChange }) => {
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0'); // New state for reminder
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDayId && days) {
      const selectedDay = days.find(d => d.day_id.toString() === selectedDayId);
      setLocations(selectedDay ? selectedDay.locations : []);
      setSelectedLocationId('');
      setEvents([]);
    } else {
      setLocations([]);
    }
  }, [selectedDayId, days]);

  useEffect(() => {
    if (selectedLocationId && locations) {
      const selectedLocation = locations.find(l => l.location_id.toString() === selectedLocationId);
      setEvents(selectedLocation ? selectedLocation.events : []);
    } else {
      setEvents([]);
    }
  }, [selectedLocationId, locations]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventName || cost === '') {
      toast({ title: 'Event name and cost are required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/locations/${selectedLocationId}/events`, {
        event_name: eventName,
        description,
        estimated_cost_per_unit: parseFloat(cost),
        event_time: eventTime,
        reminder_minutes: parseInt(reminderMinutes) // Pass reminder data
      });
      toast({ title: 'Event added!', status: 'success' });
      setEventName(''); setDescription(''); setCost(''); setEventTime(''); setReminderMinutes('0');
      onDataChange();
    } catch (error) {
      toast({ title: 'Failed to add event.', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    onDeleteOpen();
  };
  
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    onEditOpen();
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await api.delete(`/tours/events/${selectedEvent.event_id}`);
      toast({ title: 'Event Deleted', status: 'success' });
      onDataChange();
    } catch (error) {
      toast({ title: 'Delete Failed', status: 'error' });
    } finally {
      onDeleteClose();
      setSelectedEvent(null);
    }
  };

  return (
    <>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        <Box flex="1.5">
          <Heading size="md" mb={4}>Manage Events</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>1. Select a Day</FormLabel>
              <Select placeholder="-- Select Day --" value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)}>
                {days && days.map(day => <option key={day.day_id} value={day.day_id}>Day {day.day_number}: {day.title}</option>)}
              </Select>
            </FormControl>
            <FormControl isDisabled={!selectedDayId}>
              <FormLabel>2. Select a Location</FormLabel>
              <Select 
                placeholder="-- Select Location --" 
                value={selectedLocationId} 
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>)}
              </Select>
            </FormControl>
          </VStack>
          {selectedLocationId && (
            <List spacing={3} mt={6}>
              {events.length > 0 ? events.map(evt => (
                <ListItem key={evt.event_id} p={3} shadow="sm" borderWidth="1px" borderRadius="md">
                  <Flex align="center">
                    <Box><Text fontWeight="bold">{evt.event_name}</Text><Text fontSize="sm" color="gray.600">Cost: ৳{evt.estimated_cost_per_unit}</Text></Box>
                    <Spacer />
                    <HStack>
                      <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" onClick={() => handleEditClick(evt)} />
                      <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDeleteClick(evt)} />
                    </HStack>
                  </Flex>
                </ListItem>
              )) : <Text mt={4}>No events for this location.</Text>}
            </List>
          )}
        </Box>
        <Box flex="1" p={6} borderWidth="1px" borderRadius="lg" opacity={!selectedLocationId ? 0.5 : 1}>
          <Heading size="md" mb={6}>Add New Event</Heading>
          <VStack as="form" spacing={4} onSubmit={handleAddEvent}>
            <FormControl isRequired isDisabled={!selectedLocationId}><FormLabel>Event Name</FormLabel><Input value={eventName} onChange={(e) => setEventName(e.target.value)} /></FormControl>
            <FormControl isDisabled={!selectedLocationId}><FormLabel>Time (Optional)</FormLabel><Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></FormControl>
            <FormControl isDisabled={!selectedLocationId || !eventTime}>
              <FormLabel>Reminder</FormLabel>
              <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(e.target.value)}>
                <option value="0">No Reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </Select>
            </FormControl>
            <FormControl isDisabled={!selectedLocationId}><FormLabel>Description</FormLabel><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></FormControl>
            <FormControl isRequired isDisabled={!selectedLocationId}><FormLabel>Estimated Cost</FormLabel><NumberInput value={cost} onChange={(val) => setCost(val)}><NumberInputField /></NumberInput></FormControl>
            <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting} isDisabled={!selectedLocationId}>Add Event</Button>
          </VStack>
        </Box>
      </Flex>
      <EditEventModal isOpen={isEditOpen} onClose={onEditClose} event={selectedEvent} onUpdate={onDataChange} />
      <DeleteConfirmationDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} title="Delete Event" />
    </>
  );
};

export default ManageEvents;