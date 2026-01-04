// src/components/admin/ManageDays.jsx
import React, { useState } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Button, useToast,
  List, ListItem, Flex, Spacer, IconButton, Text, Select, HStack, useDisclosure, Textarea
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import api from '../../api/api';
import EditDayModal from './EditDayModal';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

const ManageDays = ({ groupId, days, onDataChange }) => {
  const toast = useToast();
  const [dayNumber, setDayNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedDay, setSelectedDay] = useState(null);

  const handleAddDay = async (e) => {
    e.preventDefault();
    if (!dayNumber || !title || !dayDate) {
      toast({ title: 'Day Number, Title, and Date are required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/${groupId}/days`, {
        day_number: parseInt(dayNumber),
        title,
        day_date: dayDate,
        description
      });
      toast({ title: 'Day added!', status: 'success' });
      setDayNumber(''); setTitle(''); setDayDate(''); setDescription('');
      onDataChange();
    } catch (error) {
      toast({ title: 'Failed to add day.', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (day) => {
    setSelectedDay(day);
    onEditOpen();
  };

  const handleDeleteClick = (day) => {
    setSelectedDay(day);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!selectedDay) return;
    try {
      await api.delete(`/tours/days/${selectedDay.day_id}`);
      toast({ title: 'Day Deleted', status: 'success' });
      onDataChange();
    } catch (error) {
      toast({ title: 'Delete Failed', status: 'error' });
    } finally {
      onDeleteClose();
      setSelectedDay(null);
    }
  };

  const handleStatusChange = async (dayId, newStatus) => {
    try {
      await api.put(`/tours/days/${dayId}/status`, { status: newStatus });
      toast({ title: 'Status Updated!', status: 'success' });
      onDataChange();
    } catch (error) {
      toast({ title: 'Update Failed', status: 'error' });
    }
  };

  return (
    <>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        <Box flex="1.5">
          <Heading size="md" mb={4}>Existing Tour Days</Heading>
          <List spacing={3}>
            {days && days.length > 0 ? (
              days.map(day => (
                <ListItem key={day.day_id} p={3} shadow="sm" borderWidth="1px" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Box flex="1">
                      <Text fontWeight="bold" noOfLines={1}>Day {day.day_number}: {day.title}</Text>
                      <Text fontSize="sm" color="gray.600">{new Date(day.day_date).toDateString()}</Text>
                    </Box>
                    <FormControl w="150px">
                      <Select size="sm" value={day.status} onChange={(e) => handleStatusChange(day.day_id, e.target.value)}>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Ended">Ended</option>
                      </Select>
                    </FormControl>
                    <HStack>
                      <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" aria-label="Edit day" onClick={() => handleEditClick(day)} />
                      <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" aria-label="Delete day" onClick={() => handleDeleteClick(day)} />
                    </HStack>
                  </Flex>
                </ListItem>
              ))
            ) : (
              <Text>No days have been created for this tour yet.</Text>
            )}
          </List>
        </Box>
        <Box flex="1" p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={6}>Add a New Day</Heading>
          <VStack as="form" spacing={4} onSubmit={handleAddDay}>
            <FormControl isRequired><FormLabel>Day Number</FormLabel><Input type="number" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} placeholder="e.g., 1" /></FormControl>
            <FormControl isRequired><FormLabel>Title</FormLabel><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Arrival in Dhaka" /></FormControl>
            <FormControl isRequired><FormLabel>Date</FormLabel><Input type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} /></FormControl>
            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of the day's plan..." />
            </FormControl>
            <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>Add Day</Button>
          </VStack>
        </Box>
      </Flex>
      <EditDayModal isOpen={isEditOpen} onClose={onEditClose} day={selectedDay} onUpdate={onDataChange} />
      <DeleteConfirmationDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} title="Delete Tour Day" body="Are you sure? This will also delete all associated locations and events." />
    </>
  );
};

export default ManageDays;