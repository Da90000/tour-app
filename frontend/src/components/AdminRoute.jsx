// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Box } from '@chakra-ui/react';

// This component simply checks if the logged-in user has the global 'admin' role.
// A React component CANNOT be async.
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // If we are still figuring out if the user is authenticated, show a spinner.
  // The useAuth hook handles the initial loading state.
  if (!isAuthenticated && user === null) {
     return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // If authentication is resolved and the user is an admin, render the requested component.
  if (isAuthenticated && user && user.role === 'admin') {
    return children;
  }

  // If the user is logged in but not an admin, or not logged in at all, redirect.
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;