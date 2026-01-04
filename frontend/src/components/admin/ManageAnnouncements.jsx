// src/components/admin/ManageAnnouncements.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  FormControl, 
  FormLabel, 
  Textarea, 
  Button, 
  useToast, 
  Text 
} from '@chakra-ui/react';
import api from '../../api/api';

const ManageAnnouncements = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: 'Message cannot be empty.', status: 'warning', isClosable: true });
      return;
    }
    setIsSubmitting(true);
    try {
      // We assume the AdminRoute has already verified permissions
      await api.post('/announcements', { groupId, message });
      toast({ 
        title: 'Announcement Sent!', 
        description: 'All currently online users in this group have been notified.', 
        status: 'success',
        isClosable: true,
      });
      setMessage('');
    } catch (error) {
      toast({ 
        title: 'Failed to send announcement.', 
        description: error.response?.data?.message || 'Please try again.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={4}>
      <Heading size="md" mb={4}>Send Instant Announcement</Heading>
      <Text color="gray.600" mb={4}>
        This message will be pushed instantly as a pop-up notification to all currently online users in this group.
      </Text>
      <VStack as="form" spacing={4} onSubmit={handleSend}>
        <FormControl isRequired>
          <FormLabel>Message</FormLabel>
          <Textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="E.g., The bus will be leaving 15 minutes late due to traffic."
            rows={4}
          />
        </FormControl>
        <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>
          Send Notification to Group
        </Button>
      </VStack>
    </Box>
  );
};

export default ManageAnnouncements;