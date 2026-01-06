import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Settings2,
  Calendar,
  Users as UsersIcon,
  Megaphone,
  ArrowLeft,
  Clock,
  MapPin,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';

import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Sub-components (Will be redesigned next)
import ManageDays from '../components/admin/ManageDays';
import ManageLocations from '../components/admin/ManageLocations';
import ManageEvents from '../components/admin/ManageEvents';
import ManageUsers from '../components/admin/ManageUsers';
import ManageAnnouncements from '../components/admin/ManageAnnouncements';

const AdminGroup = () => {
  const { groupId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('itinerary');

  const fetchItineraryData = useCallback(async () => {
    try {
      const response = await api.get(`/tours/${groupId}`);
      setItinerary(response.data);
    } catch (err) {
      toast.error('Failed to load itinerary data.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchItineraryData();
  }, [fetchItineraryData]);

  return (
    <div className="space-y-8 fade-in">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Tour Management</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-primary" />
              Tour Management Center
            </h1>
            <p className="text-slate-400">Manage tour schedule, members, and announcements.</p>
          </div>
          {itinerary && (
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Days Planned</p>
                <p className="text-xl font-bold text-white">{itinerary.days?.length || 0}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Status</p>
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-none">Ready</Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="itinerary" className="w-full" onValueChange={setActiveMainTab}>
        <TabsList className="w-full grid grid-cols-3 bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-1.5 h-16 border border-white/5 shadow-2xl">
          <TabsTrigger value="itinerary" className="rounded-[1.75rem] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Tour Schedule</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-[1.75rem] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
            <UsersIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Members & Roles</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-[1.75rem] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Announcements</span>
            <span className="sm:hidden">News</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="itinerary" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
            {loading ? (
              <Skeleton className="h-[400px] w-full rounded-[2rem]" />
            ) : (
              <Tabs defaultValue="days" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <TabsList className="bg-white/5 p-1 rounded-xl border border-white/5">
                    <TabsTrigger value="days" className="px-6 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">Days</TabsTrigger>
                    <TabsTrigger value="locations" className="px-6 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">Locations</TabsTrigger>
                    <TabsTrigger value="events" className="px-6 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">Events</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <Zap className="h-3 w-3 text-yellow-500" /> Auto-Sync Active
                  </div>
                </div>

                <TabsContent value="days" className="mt-0 focus-visible:ring-0">
                  <Card className="border-white/5 bg-slate-900/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> Schedule Management
                      </CardTitle>
                      <CardDescription>Manage the itinerary days and dates.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ManageDays days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="locations" className="mt-0 focus-visible:ring-0">
                  <Card className="border-white/5 bg-slate-900/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" /> Location Management
                      </CardTitle>
                      <CardDescription>Manage the main locations visited on these days.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ManageLocations days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="events" className="mt-0 focus-visible:ring-0">
                  <Card className="border-white/5 bg-slate-900/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-primary" /> Event Management
                      </CardTitle>
                      <CardDescription>Manage specific events and costs for each location.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ManageEvents days={itinerary.days} groupId={groupId} onDataChange={fetchItineraryData} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
            <Card className="border-white/5 bg-slate-900/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-primary" /> Group Members
                </CardTitle>
                <CardDescription>Manage tour participants and their roles.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ManageUsers groupId={groupId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
            <Card className="border-white/5 bg-slate-900/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" /> Tour Announcements
                </CardTitle>
                <CardDescription>Send updates and alerts to all group members.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ManageAnnouncements groupId={groupId} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminGroup;