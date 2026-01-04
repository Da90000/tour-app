// src/pages/AdminGroup.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Heading, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import api from '../api/api';

import ManageDays from '../components/admin/ManageDays';
import ManageLocations from '../components/admin/ManageLocations';
import ManageEvents from '../components/admin/ManageEvents';
import ManageUsers from '../components/admin/ManageUsers';
import ManageAnnouncements from '../components/admin/ManageAnnouncements'; // Import the new component

const AdminGroup = () => {
  const { groupId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItineraryData = useCallback(async () => {
    try {
      const response = await api.get(`/tours/${groupId}`);
      setItinerary(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load itinerary data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    fetchItineraryData();
  }, [fetchItineraryData]);

  return (
    <Box>
      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">Manage Group</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Heading mt={4}>Group Management</Heading>
      <Text color="gray.600" mb={6}>Use the tabs below to manage the tour.</Text>
      
      <Tabs isFitted variant="enclosed-colored" colorScheme="purple">
        <TabList mb="1em">
          <Tab>Itinerary</Tab>
          <Tab>Users</Tab>
          <Tab>Announcements</Tab> {/* <-- NEW TAB */}
        </TabList>
        <TabPanels>
          <TabPanel>
            {loading && <Spinner size="xl" display="block" mx="auto" my={8} />}
            {error && <Alert status="error"><AlertIcon />{error}</Alert>}
            {itinerary && !loading && (
              <Tabs isFitted variant="soft-rounded">
                <TabList mb="1em">
                  <Tab>Days</Tab>
                  <Tab>Locations</Tab>
                  <Tab>Events</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p={0}><ManageDays days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData}/></TabPanel>
                  <TabPanel p={0}><ManageLocations days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData}/></TabPanel>
                  <TabPanel p={0}><ManageEvents days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData}/></TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </TabPanel>
          <TabPanel>
            <ManageUsers groupId={groupId} />
          </TabPanel>
          <TabPanel>
            <ManageAnnouncements groupId={groupId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminGroup;