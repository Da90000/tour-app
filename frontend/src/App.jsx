// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Itinerary from './pages/Itinerary';
import MyExpenses from './pages/MyExpenses';
import AdminGroup from './pages/AdminGroup';
import NewGroup from './pages/NewGroup';
import AdminFinances from './pages/AdminFinances';
import Deposit from './pages/Deposit';
import EventExpenses from './pages/EventExpenses';
import AdminAddExpense from './pages/AdminAddExpense'; // <-- IMPORT

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GroupAdminRoute from './components/GroupAdminRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={ <ProtectedRoute> <AppLayout /> </ProtectedRoute> }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="group/:groupId/itinerary" element={<Itinerary />} />
        <Route path="my-expenses" element={<MyExpenses />} />
        <Route path="groups/new" element={ <AdminRoute> <NewGroup /> </AdminRoute> } />
      </Route>

      <Route path="/admin" element={ <ProtectedRoute> <AppLayout /> </ProtectedRoute> }>
        <Route 
          path="group/:groupId" 
          element={ <GroupAdminRoute> <AdminGroup /> </GroupAdminRoute> } 
        />
        <Route 
          path="finances" 
          element={ <AdminRoute> <AdminFinances /> </AdminRoute> } 
        />
        <Route 
          path="deposit" 
          element={ <AdminRoute> <Deposit /> </AdminRoute> } 
        />
        <Route 
          path="event-expenses" 
          element={ <AdminRoute> <EventExpenses /> </AdminRoute> } 
        />
        <Route 
          path="add-expense" 
          element={ <AdminRoute> <AdminAddExpense /> </AdminRoute> } 
        />
      </Route>
    </Routes>
  );
}

export default App;