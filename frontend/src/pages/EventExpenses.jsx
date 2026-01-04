// src/pages/EventExpenses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, Flex, Badge, Table,
  Thead, Tbody, Tr, Th, Td, TableContainer, useToast, IconButton, HStack, useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../api/api';
import AdminEditExpenseModal from '../components/admin/AdminEditExpenseModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import eventBus from '../services/eventBus';

const EventExpenses = () => {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDetailsEventId, setLoadingDetailsEventId] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/finances/admin/event-summary');
      setSummary(response.data);
    } catch (err) {
      setError('Failed to load event expense summary.');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    eventBus.on('financeDataChanged', fetchSummary); // Listen for global updates
    return () => eventBus.off('financeDataChanged', fetchSummary);
  }, [fetchSummary]);

  const handleAccordionChange = useCallback(async (eventId) => {
    if (details[eventId]) return;
    setLoadingDetailsEventId(eventId);
    try {
      const response = await api.get(`/finances/event/${eventId}/details`);
      setDetails(prev => ({ ...prev, [eventId]: response.data }));
    } catch (err) { toast({ title: `Could not load details for event ${eventId}`, status: 'error' }); } 
    finally { setLoadingDetailsEventId(null); }
  }, [details, toast]);
  
  const refreshDetailsForEvent = useCallback(async (eventId) => {
    setLoadingDetailsEventId(eventId);
    try {
        const response = await api.get(`/finances/event/${eventId}/details`);
        setDetails(prev => ({ ...prev, [eventId]: response.data }));
    } catch(err) { console.error(err); }
    finally { setLoadingDetailsEventId(null); }
  }, []);

  const handleEditClick = (expense) => { setSelectedExpense(expense); onEditOpen(); };
  const handleDeleteClick = (expense) => { setSelectedExpense(expense); onDeleteOpen(); };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await api.delete(`/expenses/admin/${selectedExpense.expense_id}`);
      toast({ title: 'Expense Deleted', status: 'success' });
      refreshDetailsForEvent(selectedExpense.event_id);
      fetchSummary(); // Also refetch summary totals
    } catch (error) { toast({ title: 'Delete Failed', status: 'error' }); } 
    finally { onClose(); }
  };

  if (loadingSummary) return <Spinner size="xl" display="block" mx="auto" my={8} />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <>
      <Box>
        <Heading mb={6}>Event Expense Report</Heading>
        {summary.length === 0 ? (<Text>No expenses have been recorded for any events yet.</Text>) : (
          <Accordion allowToggle>
            {summary.map(event => (
              <AccordionItem key={event.event_id}>
                <h2>
                  <AccordionButton onClick={() => handleAccordionChange(event.event_id)} _expanded={{ bg: 'purple.100' }} py={4}>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">{event.event_name}</Heading>
                      <Text fontSize="xs" color="gray.500">{event.group_name} / {event.location_name}</Text>
                    </Box>
                    <Flex gap={4} align="center">
                      <Badge colorScheme="orange">Qty: {event.total_quantity}</Badge>
                      <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md">Total: ৳{event.total_expense.toFixed(2)}</Badge>
                      <AccordionIcon />
                    </Flex>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {loadingDetailsEventId === event.event_id && <Spinner size="md" />}
                  {details[event.event_id] && (
                    details[event.event_id].length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr><Th>User</Th><Th isNumeric>Qty</Th><Th isNumeric>Cost</Th><Th>Date</Th><Th>Actions</Th></Tr>
                          </Thead>
                          <Tbody>
                            {details[event.event_id].map((detail) => (
                              <Tr key={detail.expense_id}>
                                <Td>{detail.username}</Td>
                                <Td isNumeric>{detail.quantity}</Td>
                                <Td isNumeric>৳{detail.total_cost.toFixed(2)}</Td>
                                <Td fontSize="xs">{new Date(detail.expense_timestamp).toLocaleDateString()}</Td>
                                <Td>
                                  <HStack>
                                    <IconButton size="sm" icon={<EditIcon/>} onClick={() => handleEditClick({ ...detail, event_id: event.event_id })}/>
                                    <IconButton size="sm" icon={<DeleteIcon/>} colorScheme="red" onClick={() => handleDeleteClick({ ...detail, event_id: event.event_id })}/>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (<Text>No individual expenses recorded for this event.</Text>)
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Box>
      <AdminEditExpenseModal isOpen={isEditOpen} onClose={onEditClose} expense={selectedExpense} onUpdate={() => {
          refreshDetailsForEvent(selectedExpense.event_id);
          fetchSummary();
      }} />
      <DeleteConfirmationDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} title="Delete Expense" body="Are you sure you want to permanently delete this expense record?" />
    </>
  );
};

export default EventExpenses;