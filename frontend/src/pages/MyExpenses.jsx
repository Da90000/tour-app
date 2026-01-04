// src/pages/MyExpenses.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, Stat, StatLabel, StatNumber, StatHelpText,
  Flex, useToast, Button, HStack, useDisclosure, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Badge, VStack, Divider, Spacer
} from '@chakra-ui/react';
import api from '../api/api';
import EditExpenseModal from '../components/EditExpenseModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import eventBus from '../services/eventBus';

const MyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();

  const fetchData = async () => {
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        api.get('/expenses/my-expenses'),
        api.get('/finances/my-summary')
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError('Failed to fetch your financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    eventBus.on('financeDataChanged', fetchData);
    return () => {
      eventBus.off('financeDataChanged', fetchData);
    };
  }, []);

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    onEditOpen();
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await api.delete(`/expenses/${selectedExpense.expense_id}`);
      toast({ title: 'Expense Deleted', status: 'success' });
      fetchData();
    } catch (error) {
      toast({ title: 'Delete Failed', description: error.response?.data?.message, status: 'error' });
    } finally {
      onDeleteClose();
    }
  };

  if (loading) return <Spinner size="xl" display="block" mx="auto" my={8} />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <>
      <Box>
        <Heading as="h1" size="xl" mb={6}>My Finances</Heading>
        {summary && (
          <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md" mb={10}>
            <Heading size="lg" mb={4}>Summary</Heading>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-around" align="center">
              <Stat flex="2" textAlign={{base: 'center', md: 'left'}}>
                <StatLabel fontSize="xl">Your Balance</StatLabel>
                <StatNumber fontSize="5xl" color={summary.balance < 0 ? 'red.500' : 'blue.500'}>
                  ৳{summary.balance.toFixed(2)}
                </StatNumber>
                {summary.balance <= 0 && <StatHelpText color="red.500" fontWeight="bold">Warning: Negative or zero balance!</StatHelpText>}
              </Stat>
              <VStack flex="1" align={{base: 'center', md: 'flex-end'}} spacing={4} mt={{base: 6, md: 0}}>
                <Stat textAlign="right"><StatLabel>Total Deposited</StatLabel><StatNumber color="green.500">৳{summary.total_deposited.toFixed(2)}</StatNumber></Stat>
                <Stat textAlign="right"><StatLabel>Total Spent</StatLabel><StatNumber color="orange.500">৳{summary.total_spent.toFixed(2)}</StatNumber></Stat>
              </VStack>
            </Flex>
          </Box>
        )}
        <Divider my={10} />
        <Heading size="lg" mb={6}>Expense Log</Heading>
        {expenses.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {expenses.map((expense) => (
              <Box key={expense.expense_id} p={5} borderWidth="1px" borderRadius="lg" shadow="sm">
                <Flex align="center">
                  <Box>
                    <Heading size="md">{expense.event_name}</Heading>
                    <Text fontSize="sm" color="gray.500">{expense.location_name} - {new Date(expense.expense_timestamp).toLocaleDateString()}</Text>
                  </Box>
                  <Spacer />
                  <VStack align="flex-end" spacing={0}>
                    <Text fontSize="xl" fontWeight="bold">৳{expense.total_cost.toFixed(2)}</Text>
                    <Text fontSize="xs" color="gray.600">{expense.quantity} x ৳{expense.estimated_cost_per_unit.toFixed(2)}</Text>
                  </VStack>
                </Flex>
                <Divider my={3} />
                <Flex justify="space-between" align="center">
                    <Badge colorScheme={expense.day_status === 'Ongoing' ? 'green' : 'gray'}>{expense.day_status}</Badge>
                    <HStack spacing={2}>
                        <Button colorScheme="blue" size="sm" onClick={() => handleEditClick(expense)} isDisabled={expense.day_status !== 'Ongoing'}>Edit</Button>
                        <Button colorScheme="red" size="sm" onClick={() => handleDeleteClick(expense)} isDisabled={expense.day_status !== 'Ongoing'}>Delete</Button>
                    </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        ) : <Text>You have not submitted any expenses yet.</Text>}
      </Box>
      <EditExpenseModal isOpen={isEditOpen} onClose={onEditClose} expense={selectedExpense} onUpdate={fetchData} />
      <DeleteConfirmationDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} title="Delete Expense"/>
    </>
  );
};

export default MyExpenses;