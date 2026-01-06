import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '../api/api';

const GroupAdminRoute = ({ children }) => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !groupId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/groups');
        const currentGroup = response.data.find(
          (group) => group.group_id.toString() === groupId
        );

        if (currentGroup && currentGroup.role === 'admin') {
          setIsGroupAdmin(true);
        }
      } catch (error) {
        console.error("Failed to verify group admin status", error);
        setIsGroupAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, groupId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
          Analyzing Sector Rights...
        </p>
      </div>
    );
  }

  if (isGroupAdmin) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export default GroupAdminRoute;