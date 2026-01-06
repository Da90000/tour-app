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
import { toast } from 'sonner';
import { Edit3, Calendar, Type, AlignLeft, Loader2, Save } from 'lucide-react';
import api from '../../api/api';

const EditDayModal = ({ isOpen, onClose, day, onUpdate }) => {
  const [dayNumber, setDayNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (day) {
      setDayNumber(day.day_number || '');
      setTitle(day.title || '');
      setDayDate(day.day_date ? new Date(day.day_date).toISOString().split('T')[0] : '');
      setDescription(day.description || '');
    }
  }, [day]);

  if (!day) return null;

  const handleSubmit = async () => {
    if (!dayNumber || !title || !dayDate) {
      toast.warning('Phase parameters incomplete. Identification results are mandatory.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/tours/days/${day.day_id}`, {
        day_number: parseInt(dayNumber),
        title,
        day_date: dayDate,
        description
      });
      toast.success('Timeline phase recalibrated successfully.');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error('Sync failed. Recalibration protocols aborted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <Edit3 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Recalibrate Phase</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adjusting metadata for timeline segment <span className="text-white font-medium italic">Day {day.day_number}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Day Index
              </Label>
              <Input
                type="number"
                className="bg-white/5 border-white/10 text-white font-mono"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Launch Date
              </Label>
              <Input
                type="date"
                className="bg-white/5 border-white/10 text-white flex-row-reverse"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Type className="h-3 w-3" /> Phase Codename
            </Label>
            <Input
              className="bg-white/5 border-white/10 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <AlignLeft className="h-3 w-3" /> Operational Summary
            </Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-500">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                Commit Changes
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDayModal;