// src/components/admin/EditEventModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, Textarea,
  NumberInput, NumberInputField, useToast, VStack, Select
} from '@chakra-ui/react';
import api from '../../api/api';

const EditEventModal = ({ isOpen, onClose, event, onUpdate }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0'); // New state for reminder
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (event) {
      setEventName(event.event_name || '');
      setDescription(event.description || '');
      setCost(event.estimated_cost_per_unit || '');
      setEventTime(event.event_time || '');
      setReminderMinutes(event.reminder_minutes?.toString() || '0'); // Set reminder state
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = async () => {
    if (!eventName || cost === '') {
      toast({ title: 'Event name and cost are required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/tours/events/${event.event_id}`, { 
        event_name: eventName, 
        description, 
        estimated_cost_per_unit: parseFloat(cost),
        event_time: eventTime,
        reminder_minutes: parseInt(reminderMinutes) // Pass reminder data
      });
      toast({ title: 'Event Updated!', status: 'success' });
      onUpdate();
      onClose();
    } catch (error) {
      toast({ title: 'Update Failed', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack as="form" spacing={4}>
            <FormControl isRequired><FormLabel>Event Name</FormLabel><Input value={eventName} onChange={(e) => setEventName(e.target.value)} /></FormControl>
            <FormControl><FormLabel>Time (Optional)</FormLabel><Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></FormControl>
            <FormControl isDisabled={!eventTime}>
              <FormLabel>Reminder</FormLabel>
              <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(e.target.value)}>
                <option value="0">No Reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </Select>
            </FormControl>
            <FormControl><FormLabel>Description</FormLabel><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Estimated Cost</FormLabel><NumberInput value={cost} onChange={(val) => setCost(val)}><NumberInputField /></NumberInput></FormControl>
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

export default EditEventModal;