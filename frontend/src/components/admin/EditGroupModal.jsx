// src/components/admin/EditGroupModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, useToast, VStack
} from '@chakra-ui/react';
import api from '../../api/api';

const EditGroupModal = ({ isOpen, onClose, group, onUpdate }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (group) {
      setGroupName(group.group_name || '');
      setDescription(group.description || '');
    }
  }, [group]);

  if (!group) return null;

  const handleSubmit = async () => {
    if (!groupName) {
      toast({ title: 'Group name is required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/groups/${group.group_id}`, {
        group_name: groupName,
        description: description
      });
      toast({ title: 'Group Updated!', status: 'success' });
      onUpdate(); // Refresh the dashboard list
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
        <ModalHeader>Edit Group: {group.group_name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Group Name</FormLabel>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
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

export default EditGroupModal;