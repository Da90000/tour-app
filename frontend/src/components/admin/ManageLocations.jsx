// src/components/admin/ManageLocations.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Button, useToast,
  List, ListItem, Flex, Spacer, IconButton, Select, Text, HStack, useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import api from '../../api/api';
import EditLocationModal from './EditLocationModal';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

const ManageLocations = ({ groupId, days, onDataChange }) => {
  const [selectedDayId, setSelectedDayId] = useState('');
  const [locations, setLocations] = useState([]);
  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationName, setLocationName] = useState('');
  const [orderInDay, setOrderInDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0'); // New state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDayId && days) {
      const selectedDay = days.find(d => d.day_id.toString() === selectedDayId);
      setLocations(selectedDay ? selectedDay.locations.sort((a, b) => a.order_in_day - b.order_in_day) : []);
    } else {
      setLocations([]);
    }
  }, [selectedDayId, days]);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationName || !orderInDay) {
        toast({ title: 'Location Name and Order are required.', status: 'warning' });
        return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/days/${selectedDayId}/locations`, { 
        location_name: locationName, 
        order_in_day: parseInt(orderInDay),
        start_time: startTime,
        end_time: endTime,
        reminder_minutes: parseInt(reminderMinutes),
        latitude: null,
        longitude: null,
      });
      toast({ title: 'Location added!', status: 'success' });
      setLocationName(''); setOrderInDay(''); setStartTime(''); setEndTime(''); setReminderMinutes('0');
      onDataChange();
    } catch (error) {
      toast({ title: 'Failed to add location.', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (loc) => { setSelectedLocation(loc); onEditOpen(); };
  const handleDeleteClick = (loc) => { setSelectedLocation(loc); onDeleteOpen(); };

  const confirmDelete = async () => {
    if (!selectedLocation) return;
    try {
      await api.delete(`/tours/locations/${selectedLocation.location_id}`);
      toast({ title: 'Location Deleted', status: 'success' });
      onDataChange();
    } catch (error) {
      toast({ title: 'Delete Failed', status: 'error' });
    } finally {
      onDeleteClose();
      setSelectedLocation(null);
    }
  };

  return (
    <>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        <Box flex="1.5">
          <Heading size="md" mb={4}>Existing Locations</Heading>
          <FormControl mb={4}>
            <FormLabel>Select a Day</FormLabel>
            <Select placeholder="-- Select a Day --" value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)}>
              {days.map(day => <option key={day.day_id} value={day.day_id}>Day {day.day_number}: {day.title}</option>)}
            </Select>
          </FormControl>
          
          {selectedDayId && (
            <List spacing={3}>
              {locations.length > 0 ? locations.map(loc => (
                <ListItem key={loc.location_id} p={3} shadow="sm" borderWidth="1px" borderRadius="md">
                  <Flex align="center">
                    <Box><Text fontWeight="bold">{loc.order_in_day}. {loc.location_name}</Text></Box>
                    <Spacer />
                    <HStack>
                      <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" onClick={() => handleEditClick(loc)} />
                      <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDeleteClick(loc)} />
                    </HStack>
                  </Flex>
                </ListItem>
              )) : <Text>No locations for this day.</Text>}
            </List>
          )}
        </Box>

        <Box flex="1" p={6} borderWidth="1px" borderRadius="lg" opacity={!selectedDayId ? 0.5 : 1}>
          <Heading size="md" mb={6}>Add New Location</Heading>
          <VStack as="form" spacing={4} onSubmit={handleAddLocation}>
            <FormControl isRequired isDisabled={!selectedDayId}><FormLabel>Location Name</FormLabel><Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Main Hotel"/></FormControl>
            <FormControl isRequired isDisabled={!selectedDayId}><FormLabel>Order in Day</FormLabel><Input type="number" value={orderInDay} onChange={(e) => setOrderInDay(e.target.value)} placeholder="e.g., 1, 2, 3..."/></FormControl>
            <HStack w="100%">
                <FormControl isDisabled={!selectedDayId}><FormLabel>Start Time</FormLabel><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></FormControl>
                <FormControl isDisabled={!selectedDayId}><FormLabel>End Time</FormLabel><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></FormControl>
            </HStack>
            <FormControl isDisabled={!selectedDayId}>
              <FormLabel>Reminder (for Start Time)</FormLabel>
              <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(e.target.value)}>
                <option value="0">No Reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </Select>
            </FormControl>
            <Text fontSize="xs" color="gray.500">Map coordinates can be added via the 'Edit' button after creation.</Text>
            <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting} isDisabled={!selectedDayId}>Add Location</Button>
          </VStack>
        </Box>
      </Flex>
      <EditLocationModal isOpen={isEditOpen} onClose={onEditClose} location={selectedLocation} onUpdate={onDataChange} />
      <DeleteConfirmationDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} title="Delete Location" body="Are you sure? This also deletes all events at this location." />
    </>
  );
};

export default ManageLocations;