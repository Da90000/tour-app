// src/pages/Login.jsx
import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Heading, VStack, useToast, Link as ChakraLink
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'All fields are required.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const apiUrl = '/api/auth/login';
      const userData = { email, password };
      const response = await axios.post(apiUrl, userData);

      // Call the global login function from our context
      login(response.data);
      
      // --- ADD THIS LINE FOR DEBUGGING ---
      console.log(`[Login.jsx] Token set in localStorage: ${localStorage.getItem('token')}`);
      // ------------------------------------

      toast({
        title: 'Login Successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect the user to their dashboard
      navigate('/dashboard');

    } catch (error) {
      toast({
        title: 'Login Failed.',
        description: error.response?.data?.message || 'Invalid credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
    >
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Heading>Login</Heading>

          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" width="full">
            Login
          </Button>

          <ChakraLink as={RouterLink} to="/register">
            Don't have an account? Register
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;