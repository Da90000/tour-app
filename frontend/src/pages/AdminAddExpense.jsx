// src/pages/AdminAddExpense.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Button, useToast, Select, Container,
  NumberInput, NumberInputField, Text, Spinner, Checkbox, CheckboxGroup, Stack,
  HStack, SimpleGrid
} from '@chakra-ui/react';
import api from '../api/api';
import eventBus from '../services/eventBus';

const AdminAddExpense = () => {
  const [groups, setGroups] = useState([]);
  const [itineraries, setItineraries] = useState({});
  const [users, setUsers] = useState({});
  
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDayId, setSelectedDayId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [actualCost, setActualCost] = useState('');

  const [loading, setLoading] = useState({ groups: true, itinerary: false, users: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchAdminGroups = async () => {
      try {
        const response = await api.get('/groups');
        const adminGroups = response.data.filter(g => g.role === 'admin');
        setGroups(adminGroups);
      } catch (error) { toast({ title: 'Could not load groups.', status: 'error' }); }
      finally { setLoading(prev => ({ ...prev, groups: false })); }
    };
    fetchAdminGroups();
  }, [toast]);

  const handleGroupChange = useCallback(async (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedDayId(''); setSelectedLocationId(''); setSelectedEventId(''); setSelectedUserIds([]);
    if (!groupId) return;

    setLoading(prev => ({ ...prev, itinerary: true, users: true }));
    try {
      if (!itineraries[groupId]) {
        const itineraryRes = await api.get(`/tours/${groupId}`);
        setItineraries(prev => ({ ...prev, [groupId]: itineraryRes.data }));
      }
      if (!users[groupId]) {
        const usersRes = await api.get(`/groups/${groupId}/users`);
        setUsers(prev => ({ ...prev, [groupId]: usersRes.data.filter(u => u.role !== 'admin') }));
      }
    } catch (error) { toast({ title: 'Could not load group data.', status: 'error' }); }
    finally { setLoading(prev => ({ ...prev, itinerary: false, users: false })); }
  }, [itineraries, users, toast]);

  const availableDays = itineraries[selectedGroupId]?.days || [];
  const availableLocations = availableDays.find(d => d.day_id.toString() === selectedDayId)?.locations || [];
  const availableEvents = availableLocations.find(l => l.location_id.toString() === selectedLocationId)?.events || [];
  const availableUsers = users[selectedGroupId] || [];

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(availableUsers.map(u => u.user_id.toString()));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId || selectedUserIds.length === 0 || !quantity || !actualCost) {
      toast({ title: "Please complete all fields.", status: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/expenses/admin', {
        event_id: parseInt(selectedEventId),
        user_ids: selectedUserIds.map(id => parseInt(id)),
        quantity: parseInt(quantity),
        actual_cost_per_unit: parseFloat(actualCost),
      });
      toast({ title: "Expense(s) added successfully!", status: 'success' });
      eventBus.emit('financeDataChanged');
      // Reset form partially for convenience
      setSelectedEventId('');
      setSelectedUserIds([]);
      setQuantity(1);
      setActualCost('');
    } catch (error) { toast({ title: 'Submission failed.', description: error.response?.data?.message, status: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Container maxW="container.lg">
      <Box p={8} borderWidth="1px" borderRadius="lg" shadow="md">
        <Heading mb={6}>Add Expense for Users</Heading>
        <VStack as="form" spacing={6} align="stretch" onSubmit={handleSubmit}>
          {loading.groups ? <Spinner /> : (
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl isRequired><FormLabel>1. Group</FormLabel><Select placeholder="Select Group" value={selectedGroupId} onChange={e => handleGroupChange(e.target.value)}>{groups.map(g => <option key={g.group_id} value={g.group_id}>{g.group_name}</option>)}</Select></FormControl>
              <FormControl isRequired isDisabled={!selectedGroupId || loading.itinerary}><FormLabel>2. Day</FormLabel><Select placeholder="Select Day" value={selectedDayId} onChange={e => setSelectedDayId(e.target.value)}>{availableDays.map(d => <option key={d.day_id} value={d.day_id}>Day {d.day_number}: {d.title}</option>)}</Select></FormControl>
              <FormControl isRequired isDisabled={!selectedDayId}><FormLabel>3. Location</FormLabel><Select placeholder="Select Location" value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)}>{availableLocations.map(l => <option key={l.location_id} value={l.location_id}>{l.location_name}</option>)}</Select></FormControl>
              <FormControl isRequired isDisabled={!selectedLocationId}><FormLabel>4. Event</FormLabel><Select placeholder="Select Event" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>{availableEvents.map(ev => <option key={ev.event_id} value={ev.event_id}>{ev.event_name}</option>)}</Select></FormControl>
            </SimpleGrid>
          )}

          <FormControl isRequired isDisabled={!selectedGroupId || loading.users}>
            <FormLabel>5. Select Users</FormLabel>
            {loading.users ? <Spinner/> : (
                <Box p={4} borderWidth="1px" borderRadius="md" maxH="200px" overflowY="auto">
                    <Checkbox isChecked={availableUsers.length > 0 && selectedUserIds.length === availableUsers.length} onChange={handleSelectAllUsers} mb={2}>Select All</Checkbox>
                    <CheckboxGroup value={selectedUserIds} onChange={setSelectedUserIds}>
                        <Stack>
                            {availableUsers.map(u => <Checkbox key={u.user_id} value={u.user_id.toString()}>{u.username}</Checkbox>)}
                        </Stack>
                    </CheckboxGroup>
                </Box>
            )}
          </FormControl>
          
          <HStack>
            <FormControl isRequired><FormLabel>Quantity</FormLabel><NumberInput min={1} value={quantity} onChange={(val) => setQuantity(val)}><NumberInputField /></NumberInput></FormControl>
            <FormControl isRequired><FormLabel>Actual Cost Per Unit</FormLabel><NumberInput min={0} value={actualCost} onChange={(val) => setActualCost(val)}><NumberInputField placeholder="e.g., 550.50" /></NumberInput></FormControl>
          </HStack>

          <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting} isDisabled={selectedUserIds.length === 0 || !selectedEventId}>
            Add Expense
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default AdminAddExpense;