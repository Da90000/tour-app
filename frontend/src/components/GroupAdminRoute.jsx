// src/components/GroupAdminRoute.jsx
import React, { useState, useEffect } from 'react'; // <-- THIS LINE IS NOW CORRECT
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Box } from '@chakra-ui/react'; // Alert and AlertIcon were not used
import api from '../api/api';

// This component checks if a user is an admin for a SPECIFIC group.
const GroupAdminRoute = ({ children }) => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // If there's no logged-in user or no groupId in the URL, we can stop early.
      if (!user || !groupId) {
        setLoading(false);
        return;
      }
      try {
        // Fetch all groups the user belongs to
        const response = await api.get('/groups');
        // Find the specific group we're trying to access from the URL
        const currentGroup = response.data.find(
          (group) => group.group_id.toString() === groupId
        );
        
        // If the group is found AND the user's role in that group is 'admin', set isGroupAdmin to true
        if (currentGroup && currentGroup.role === 'admin') {
          setIsGroupAdmin(true);
        }
      } catch (error) {
        console.error("Failed to verify group admin status", error);
        // Ensure we stop loading even if the API call fails
        setIsGroupAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, groupId]);

  // While checking, show a full-page spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // If the check is complete and they are a group admin, show the protected page
  if (isGroupAdmin) {
    return children;
  }

  // Otherwise, redirect them away to the main dashboard
  return <Navigate to="/dashboard" replace />;
};

export default GroupAdminRoute;