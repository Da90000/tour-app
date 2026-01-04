// src/pages/AdminFinances.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, SimpleGrid, Stat,
  StatLabel, StatNumber, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td,
  Divider, Flex, VStack, Badge
} from '@chakra-ui/react';
import api from '../api/api';
import eventBus from '../services/eventBus';

const UserFinanceTable = ({ users }) => (
  <Table variant="simple" size="sm">
    <Thead>
      <Tr><Th>User</Th><Th isNumeric>Deposited</Th><Th isNumeric>Spent</Th><Th isNumeric>Balance</Th></Tr>
    </Thead>
    <Tbody>
      {/* This component now receives a pre-filtered list */}
      {users.map(user => (
        <Tr key={user.user_id} bg={user.balance < 0 ? 'red.50' : 'transparent'}>
          <Td>{user.username}</Td>
          <Td isNumeric color="green.600">৳{user.total_deposited.toFixed(2)}</Td>
          <Td isNumeric color="orange.600">৳{user.total_spent.toFixed(2)}</Td>
          <Td isNumeric fontWeight="bold" color={user.balance < 0 ? 'red.600' : 'inherit'}>৳{user.balance.toFixed(2)}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const AdminFinances = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminSummary = async () => {
    // No setLoading(true) for smoother refetches
    try {
      const response = await api.get('/finances/admin-summary');
      setData(response.data);
    } catch (err) {
      setError('Failed to load financial summary.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    fetchAdminSummary();
    eventBus.on('financeDataChanged', fetchAdminSummary);
    return () => {
      eventBus.off('financeDataChanged', fetchAdminSummary);
    };
  }, []);

  if (loading) return <Spinner size="xl" display="block" mx="auto" my={8} />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;
  if (!data) return <Text>No data available.</Text>;

  const { masterSummary, groupSummaries } = data;

  // Single Group View
  if (groupSummaries && groupSummaries.length === 1) {
    const singleGroup = groupSummaries[0];
    // --- THIS IS THE FIX for Single Group View ---
    const memberUsers = singleGroup.userSummaries.filter(u => u.role !== 'admin');
    return (
      <Box>
        <Heading mb={4}>Financial Overview: {singleGroup.group_name}</Heading>
        <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md" mb={10}>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-around" align="center">
            <Stat flex="2" textAlign={{base: 'center', md: 'left'}}><StatLabel fontSize="xl">Group Balance</StatLabel><StatNumber fontSize="5xl" color={singleGroup.groupSummary.balance < 0 ? 'red.500' : 'blue.500'}>৳{singleGroup.groupSummary.balance.toFixed(2)}</StatNumber></Stat>
            <VStack flex="1" align={{base: 'center', md: 'flex-end'}} spacing={4} mt={{base: 6, md: 0}}>
              <Stat textAlign="right"><StatLabel>Total Deposited</StatLabel><StatNumber color="green.500">৳{singleGroup.groupSummary.total_deposited.toFixed(2)}</StatNumber></Stat>
              <Stat textAlign="right"><StatLabel>Total Spent</StatLabel><StatNumber color="orange.500">৳{singleGroup.groupSummary.total_spent.toFixed(2)}</StatNumber></Stat>
            </VStack>
          </Flex>
        </Box>
        <Heading size="lg" mb={4}>Individual Balances</Heading>
        <UserFinanceTable users={memberUsers} />
      </Box>
    );
  }

  // Multi-Group View
  return (
    <Box>
      <Heading mb={4}>Master Financial Overview</Heading>
      <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md" mb={10}>
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-around" align="center">
          <Stat flex="2" textAlign={{base: 'center', md: 'left'}}><StatLabel fontSize="xl">Master Balance (All Groups)</StatLabel><StatNumber fontSize="5xl" color={masterSummary.balance < 0 ? 'red.500' : 'blue.500'}>৳{masterSummary.balance.toFixed(2)}</StatNumber></Stat>
          <VStack flex="1" align={{base: 'center', md: 'flex-end'}} spacing={4} mt={{base: 6, md: 0}}>
            <Stat textAlign="right"><StatLabel>Total All Deposits</StatLabel><StatNumber color="green.500">৳{masterSummary.total_deposited.toFixed(2)}</StatNumber></Stat>
            <Stat textAlign="right"><StatLabel>Total All Expenses</StatLabel><StatNumber color="orange.500">৳{masterSummary.total_spent.toFixed(2)}</StatNumber></Stat>
          </VStack>
        </Flex>
      </Box>
      <Divider my={10} />
      <Heading size="lg" mb={4}>Breakdown by Group</Heading>
      {groupSummaries.length > 0 ? (
        <Accordion allowMultiple defaultIndex={[0]}>
          {groupSummaries.map(group => {
            // --- THIS IS THE FIX for Multi-Group View ---
            const memberUsers = group.userSummaries.filter(u => u.role !== 'admin');
            return (
              <AccordionItem key={group.group_id}>
                <h2><AccordionButton _expanded={{ bg: 'purple.100' }}><Box flex="1" textAlign="left"><Heading size="md">{group.group_name}</Heading></Box><Badge fontSize="md" p={2} borderRadius="md" colorScheme={group.groupSummary.balance < 0 ? 'red' : 'green'}>Balance: ৳{group.groupSummary.balance.toFixed(2)}</Badge><AccordionIcon ml={4} /></AccordionButton></h2>
                <AccordionPanel pb={4}><UserFinanceTable users={memberUsers} /></AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : <Text>You are not managing any groups with financial data yet.</Text>}
    </Box>
  );
};

export default AdminFinances;