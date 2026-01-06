import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarPlus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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

// We will redesign EditDayModal later, for now we will just use a placeholder or skip it if possible
// Actually, I'll create a simple EditDayDialog inside this component or as a new shadcn component.

const ManageDays = ({ groupId, days, onDataChange }) => {
  const [dayNumber, setDayNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleAddDay = async (e) => {
    e.preventDefault();
    if (!dayNumber || !title || !dayDate) {
      toast.warning('Day details incomplete. Number, Title, and Date are mandatory.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/${groupId}/days`, {
        day_number: parseInt(dayNumber),
        title,
        day_date: dayDate,
        description
      });
      toast.success('New day added to the itinerary.');
      setDayNumber(''); setTitle(''); setDayDate(''); setDescription('');
      onDataChange();
    } catch (error) {
      toast.error('Failed to add the new day.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (day) => {
    setSelectedDay(day);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDay) return;
    try {
      await api.delete(`/tours/days/${selectedDay.day_id}`);
      toast.success('Day deleted from the itinerary.');
      onDataChange();
    } catch (error) {
      toast.error('Failed to remove the day.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDay(null);
    }
  };

  const handleStatusChange = async (dayId, newStatus) => {
    try {
      await api.put(`/tours/days/${dayId}/status`, { status: newStatus });
      toast.success(`Day status updated to ${newStatus}.`);
      onDataChange();
    } catch (error) {
      toast.error('Status sync failed.');
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Existing Days List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Tour Itinerary
          </h3>
          <Badge variant="outline" className="border-white/10 text-slate-500 uppercase tracking-tighter">
            {days?.length || 0} Days
          </Badge>
        </div>

        <div className="space-y-3">
          {days && days.length > 0 ? (
            days.map(day => (
              <div key={day.day_id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {day.day_number}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white uppercase tracking-tight">{day.title}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(day.day_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Select
                    className={cn(
                      "h-9 text-xs font-bold uppercase tracking-widest w-32 border-none",
                      day.status === 'Ongoing' ? "bg-emerald-500/10 text-emerald-400" :
                        day.status === 'Ended' ? "bg-red-500/10 text-red-400" : "bg-white/5 text-slate-400"
                    )}
                    value={day.status}
                    onChange={(e) => handleStatusChange(day.day_id, e.target.value)}
                  >
                    <option value="Upcoming" className="bg-slate-900">Upcoming</option>
                    <option value="Ongoing" className="bg-slate-900">Ongoing</option>
                    <option value="Ended" className="bg-slate-900">Ended</option>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-lg">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      onClick={() => handleDeleteClick(day)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
              <p className="text-slate-500 font-medium italic">No days added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Day Form */}
      <div className="lg:col-span-2">
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden sticky top-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <CalendarPlus className="h-5 w-5 text-primary" /> Add New Day
            </CardTitle>
            <CardDescription>Add a new day to your tour itinerary.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDay} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Day Number</Label>
                  <Input
                    type="number"
                    className="bg-white/5 border-white/10 text-white font-mono"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Start Date</Label>
                  <Input
                    type="date"
                    className="bg-white/5 border-white/10 text-white flex-row-reverse"
                    value={dayDate}
                    onChange={(e) => setDayDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Day Title</Label>
                <Input
                  className="bg-white/5 border-white/10 text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Arrival & Hotel Check-in"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Day Description</Label>
                <div className="relative">
                  <Textarea
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of this day's plan..."
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20"
                disabled={isSubmitting || !dayNumber || !title || !dayDate}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Day
                    <CheckCircle2 className="ml-2 h-4 w-4" />
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
              <AlertCircle className="h-5 w-5" /> Delete Day?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently remove <span className="text-white font-medium">Day {selectedDay?.day_number}: {selectedDay?.title}</span> and all associated locations and events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600">Delete Day</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDays;