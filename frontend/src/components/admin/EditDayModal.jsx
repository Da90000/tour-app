// src/components/admin/EditDayModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast, VStack, Textarea
} from '@chakra-ui/react';
import api from '../../api/api';

const EditDayModal = ({ isOpen, onClose, day, onUpdate }) => {
  const [dayNumber, setDayNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (day) {
      setDayNumber(day.day_number || '');
      setTitle(day.title || '');
      setDayDate(day.day_date ? new Date(day.day_date).toISOString().split('T')[0] : '');
      setDescription(day.description || '');
    }
  }, [day]);

  if (!day) return null;

  const handleSubmit = async () => {
    if (!dayNumber || !title || !dayDate) {
      toast({ title: 'All fields are required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    const updatedDay = {
      day_number: parseInt(dayNumber),
      title,
      day_date: dayDate,
      description
    };
    try {
      await api.put(`/tours/days/${day.day_id}`, updatedDay);
      toast({ title: 'Day Updated!', status: 'success', isClosable: true });
      onUpdate();
      onClose();
    } catch (error) {
      toast({ title: 'Update Failed', status: 'error', isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Day {day.day_number}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired><FormLabel>Day Number</FormLabel><Input type="number" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Title</FormLabel><Input value={title} onChange={(e) => setTitle(e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Date</FormLabel><Input type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} /></FormControl>
            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of the day's plan..." />
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

export default EditDayModal;