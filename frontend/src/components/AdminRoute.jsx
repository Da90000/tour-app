import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated && user === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  if (isAuthenticated && user && user.role === 'admin') {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;