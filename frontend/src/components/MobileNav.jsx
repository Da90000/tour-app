// src/components/MobileNav.jsx
import React from 'react';
import { IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Flex, MenuDivider, Icon } from '@chakra-ui/react';
import { HamburgerIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faMoneyBillTransfer, faClipboardList, faPlus } from '@fortawesome/free-solid-svg-icons';

const MobileNav = ({ onLogout, isAdmin }) => {
  const { user } = useAuth();

  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="ghost" color="white" _hover={{ bg: 'gray.700' }} _active={{ bg: 'gray.600' }} />
      <MenuList bg="gray.800" borderColor="gray.700" boxShadow="xl">
        {user && (
          <Flex direction="column" p="12px">
            <Text color="white" fontWeight="bold">Welcome, {user.username}!</Text>
          </Flex>
        )}
        <MenuDivider borderColor="gray.600" />
        
        <MenuItem as={RouterLink} to={isAdmin ? "/admin/finances" : "/my-expenses"} bg="gray.800" color="gray.200" icon={<Icon as={FontAwesomeIcon} icon={faCoins} />} _hover={{ bg: 'teal.600', color: 'white' }}>
          {isAdmin ? "Finances" : "My Finances"}
        </MenuItem>
        
        {isAdmin && (
          <>
            <MenuItem as={RouterLink} to="/admin/event-expenses" bg="gray.800" color="gray.200" icon={<Icon as={FontAwesomeIcon} icon={faClipboardList} />} _hover={{ bg: 'teal.600', color: 'white' }}>
              Event Expenses
            </MenuItem>
            <MenuItem as={RouterLink} to="/admin/add-expense" bg="gray.800" color="gray.200" icon={<Icon as={FontAwesomeIcon} icon={faPlus} />} _hover={{ bg: 'teal.600', color: 'white' }}>
              Add Expense
            </MenuItem>
            <MenuItem as={RouterLink} to="/admin/deposit" bg="gray.800" color="gray.200" icon={<Icon as={FontAwesomeIcon} icon={faMoneyBillTransfer} />} _hover={{ bg: 'teal.600', color: 'white' }}>
              Deposit
            </MenuItem>
          </>
        )}
        
        <MenuDivider borderColor="gray.600" />

        <MenuItem onClick={onLogout} bg="gray.800" color="red.300" icon={<ArrowBackIcon />} _hover={{ bg: 'red.500', color: 'white' }}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default MobileNav;