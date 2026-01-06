import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { toast } from 'sonner';
import { Zap, Clock, AlarmClock, Loader2, Save, Banknote, Type, MessageSquareQuote } from 'lucide-react';
import api from '../../api/api';

const EditEventModal = ({ isOpen, onClose, event, onUpdate }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setEventName(event.event_name || '');
      setDescription(event.description || '');
      setCost(event.estimated_cost_per_unit || '');
      setEventTime(event.event_time || '');
      setReminderMinutes(event.reminder_minutes?.toString() || '0');
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = async () => {
    if (!eventName || cost === '') {
      toast.warning('Operational parameters incomplete. Name and Estimated Cost are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/tours/events/${event.event_id}`, {
        event_name: eventName,
        description,
        estimated_cost_per_unit: parseFloat(cost),
        event_time: eventTime,
        reminder_minutes: parseInt(reminderMinutes)
      });
      toast.success('Operation tactical parameters updated.');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error('Sync failed. Tactical record recalibration aborted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <Zap className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Calibrate Operation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifying tactical parameters for <span className="text-white font-medium italic">{event.event_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Type className="h-3 w-3" /> Operation Codename
            </Label>
            <Input
              className="bg-white/5 border-white/10 text-white"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Clock className="h-3 w-3" /> Execute Time
              </Label>
              <Input
                type="time"
                className="bg-white/5 border-white/10 text-white"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <AlarmClock className="h-3 w-3" /> Proximity Alert
              </Label>
              <Select
                className="bg-white/5 border-white/10 text-white"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
                disabled={!eventTime}
              >
                <option value="0" className="bg-slate-900">Off</option>
                <option value="15" className="bg-slate-900">15m Pre</option>
                <option value="30" className="bg-slate-900">30m Pre</option>
                <option value="60" className="bg-slate-900">1h Pre</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Banknote className="h-3 w-3" /> Estimated Unit Cost (৳)
            </Label>
            <Input
              type="number"
              className="bg-white/5 border-white/10 text-white font-mono"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <MessageSquareQuote className="h-3 w-3" /> Briefing Directive
            </Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-white/5 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-500">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calibrating...
              </>
            ) : (
              <>
                Save Operations
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;