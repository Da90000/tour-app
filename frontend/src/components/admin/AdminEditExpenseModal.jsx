// src/components/admin/AdminEditExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, NumberInput, NumberInputField, useToast, VStack, Text,
  HStack
} from '@chakra-ui/react';
import api from '../../api/api';
import eventBus from '../../services/eventBus';

const AdminEditExpenseModal = ({ isOpen, onClose, expense, onUpdate }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (expense) {
      setQuantity(expense.quantity);
      setTotalCost(expense.total_cost);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/expenses/admin/${expense.expense_id}`, { 
        quantity: parseInt(quantity),
        total_cost: parseFloat(totalCost)
      });
      toast({ title: 'Expense Updated!', status: 'success', isClosable: true });
      eventBus.emit('financeDataChanged'); // Refresh all finance views
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      toast({ title: 'Update Failed', description: error.response?.data?.message, status: 'error', isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Expense for {expense.username}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <HStack w="100%">
              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <NumberInput value={quantity} min={1} onChange={(val) => setQuantity(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Total Cost (৳)</FormLabel>
                <NumberInput value={totalCost} min={0} onChange={(val) => setTotalCost(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Note: Changing the total cost will not affect the cost per unit for other expenses.
            </Text>
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

export default AdminEditExpenseModal;