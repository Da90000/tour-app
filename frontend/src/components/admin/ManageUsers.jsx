// src/components/admin/ManageUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Button, useToast,
  Text, Flex, Spacer, List, ListItem, IconButton, Spinner,
  Alert, AlertIcon, Badge, useDisclosure
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

const ManageUsers = ({ groupId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToRemove, setUserToRemove] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/groups/${groupId}/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch group members.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/groups/${groupId}/users`, { email });
      toast({ title: 'User Added!', status: 'success' });
      setEmail('');
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to add user.', description: error.response?.data?.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClick = (user) => {
    setUserToRemove(user);
    onOpen();
  };

  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await api.delete(`/groups/${groupId}/users/${userToRemove.user_id}`);
      toast({ title: 'User Removed', status: 'success' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to remove user.', description: error.response?.data?.message, status: 'error' });
    } finally {
      onClose();
      setUserToRemove(null);
    }
  };

  return (
    <>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        <Box flex="1.5">
          <Heading size="md" mb={4}>Group Members</Heading>
          {loading && <Spinner />}
          {error && <Alert status="error"><AlertIcon />{error}</Alert>}
          {!loading && !error && (
            <List spacing={3}>
              {/* --- THIS IS THE KEY CHANGE --- */}
              {users
                .filter(member => member.role !== 'admin') // Exclude anyone with the 'admin' role
                .map(member => (
                  <ListItem key={member.user_id} p={3} shadow="sm" borderWidth="1px" borderRadius="md">
                    <Flex align="center">
                      <Box>
                        <Text fontWeight="bold">{member.username}</Text>
                        <Text fontSize="sm" color="gray.600">{member.email}</Text>
                      </Box>
                      <Spacer />
                      <Badge colorScheme='gray'>{member.role}</Badge>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        aria-label="Remove user"
                        ml={4}
                        onClick={() => handleRemoveClick(member)}
                      />
                    </Flex>
                  </ListItem>
              ))}
              {users.filter(member => member.role !== 'admin').length === 0 && (
                <Text>No users have been added to this group yet.</Text>
              )}
            </List>
          )}
        </Box>

        <Box flex="1" p={6} borderWidth="1px" borderRadius="lg" h="fit-content">
          <Heading size="md" mb={6}>Add User by Email</Heading>
          <Text fontSize="sm" mb={4}>The user must have a registered account before they can be added.</Text>
          <VStack as="form" spacing={4} onSubmit={handleAddUser}>
            <FormControl isRequired>
              <FormLabel>User's Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </FormControl>
            <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>
              Add User to Group
            </Button>
          </VStack>
        </Box>
      </Flex>
      <DeleteConfirmationDialog 
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmRemoveUser}
        title="Remove User"
        body={`Are you sure you want to remove ${userToRemove?.username} from this group?`}
      />
    </>
  );
};

export default ManageUsers;