import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlarmClock,
  AlertCircle,
  Navigation,
  Calendar,
  MapPinned
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { cn } from '../../lib/utils';

const ManageLocations = ({ groupId, days, onDataChange }) => {
  const [selectedDayId, setSelectedDayId] = useState('');
  const [locations, setLocations] = useState([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationName, setLocationName] = useState('');
  const [orderInDay, setOrderInDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDayId && days) {
      const selectedDay = days.find(d => d.day_id.toString() === selectedDayId);
      setLocations(selectedDay ? selectedDay.locations.sort((a, b) => a.order_in_day - b.order_in_day) : []);
    } else {
      setLocations([]);
    }
  }, [selectedDayId, days]);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationName || !orderInDay) {
      toast.warning('Location details incomplete. Name and Order are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/days/${selectedDayId}/locations`, {
        location_name: locationName,
        order_in_day: parseInt(orderInDay),
        start_time: startTime,
        end_time: endTime,
        reminder_minutes: parseInt(reminderMinutes),
        latitude: null,
        longitude: null,
      });
      toast.success('Location added to the day.');
      setLocationName(''); setOrderInDay(''); setStartTime(''); setEndTime(''); setReminderMinutes('0');
      onDataChange();
    } catch (error) {
      toast.error('Failed to add location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (loc) => {
    setSelectedLocation(loc);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLocation) return;
    try {
      await api.delete(`/tours/locations/${selectedLocation.location_id}`);
      toast.success('Location deleted.');
      onDataChange();
    } catch (error) {
      toast.error('Failed to delete location.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Existing Locations List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Tour Locations
            </h3>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Assign to Day</Label>
            <Select
              className="bg-white/5 border-white/10 text-white"
              value={selectedDayId}
              onChange={(e) => setSelectedDayId(e.target.value)}
            >
              <option value="" className="bg-slate-900">-- Select Day --</option>
              {days.map(day => (
                <option key={day.day_id} value={day.day_id} className="bg-slate-900">Day {day.day_number}: {day.title}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {selectedDayId ? (
            locations.length > 0 ? (
              locations.map(loc => (
                <div key={loc.location_id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {loc.order_in_day}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase tracking-tight">{loc.location_name}</span>
                      {(loc.start_time || loc.end_time) && (
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {loc.start_time || '--:--'} to {loc.end_time || '--:--'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(loc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <p className="text-slate-500 font-medium italic">No locations added for this day.</p>
              </div>
            )
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02] flex flex-col items-center gap-2">
              <Navigation className="h-8 w-8 text-slate-600 opacity-20" />
              <p className="text-slate-600 font-medium">Select a day to manage its locations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Location Form */}
      <div className="lg:col-span-2">
        <Card className={cn(
          "border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden transition-all duration-500 sticky top-8",
          !selectedDayId && "opacity-30 grayscale pointer-events-none"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <MapPinned className="h-5 w-5 text-primary" /> Add Location
            </CardTitle>
            <CardDescription>Add a new stop or destination for this day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLocation} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Location Name</Label>
                <Input
                  className="bg-white/5 border-white/10 text-white"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. North Ridge Lookout"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Visit Order</Label>
                <Input
                  type="number"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={orderInDay}
                  onChange={(e) => setOrderInDay(e.target.value)}
                  placeholder="Order (e.g. 1)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Arrival Time</Label>
                  <Input
                    type="time"
                    className="bg-white/5 border-white/10 text-white"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Departure Time</Label>
                  <Input
                    type="time"
                    className="bg-white/5 border-white/10 text-white"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reminder</Label>
                <Select
                  className="bg-white/5 border-white/10 text-white"
                  value={reminderMinutes.toString()}
                  onChange={(e) => setReminderMinutes(e.target.value)}
                >
                  <option value="0" className="bg-slate-900">No Alert</option>
                  <option value="15" className="bg-slate-900">15m before</option>
                  <option value="30" className="bg-slate-900">30m before</option>
                  <option value="60" className="bg-slate-900">1h before</option>
                </Select>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                <AlarmClock className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-[10px] text-primary/70 font-medium uppercase leading-relaxed tracking-wider">
                  Coordinates can be adjusted via 'Edit' after adding the location.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20"
                disabled={isSubmitting || !selectedDayId || !locationName || !orderInDay}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Location
                    <Plus className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Deletion Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" /> Delete Location?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently remove <span className="text-white font-medium">{selectedLocation?.location_name}</span> and all events assigned to this location.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600">Delete Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLocations;