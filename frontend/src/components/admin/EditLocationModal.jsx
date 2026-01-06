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
import { Select } from '../ui/select';
import { toast } from 'sonner';
import { Edit3, MapPin, Clock, AlarmClock, Loader2, Save, MapPinned } from 'lucide-react';
import api from '../../api/api';
import LocationPickerMap from './LocationPickerMap';

const EditLocationModal = ({ isOpen, onClose, location, onUpdate }) => {
  const [locationName, setLocationName] = useState('');
  const [orderInDay, setOrderInDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0');
  const [coords, setCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && location) {
      setLocationName(location.location_name || '');
      setOrderInDay(location.order_in_day || '');
      setStartTime(location.start_time || '');
      setEndTime(location.end_time || '');
      setReminderMinutes(location.reminder_minutes?.toString() || '0');
      if (location.latitude != null && location.longitude != null) {
        setCoords({ lat: location.latitude, lng: location.longitude });
      } else {
        setCoords(null);
      }
    }
  }, [isOpen, location]);

  if (!location) return null;

  const handleLocationSelect = (newCoords) => {
    setCoords(newCoords);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/tours/locations/${location.location_id}`, {
        location_name: locationName,
        order_in_day: parseInt(orderInDay),
        start_time: startTime,
        end_time: endTime,
        reminder_minutes: parseInt(reminderMinutes),
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
      });
      toast.success('Waypoint calibration synced.');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error('Calibration protocol failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[800px] overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <MapPinned className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Calibrate Waypoint</DialogTitle>
              <DialogDescription className="text-slate-400">
                Synchronizing spatial and temporal parameters for <span className="text-white font-medium italic">{location.location_name}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-8 py-4 px-1 max-h-[70vh] overflow-y-auto pr-2 scrollbar-none">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Waypoint Name
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                  <Edit3 className="h-3 w-3" /> Grid Rank
                </Label>
                <Input
                  type="number"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={orderInDay}
                  onChange={(e) => setOrderInDay(e.target.value)}
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
                >
                  <option value="0" className="bg-slate-900">Off</option>
                  <option value="15" className="bg-slate-900">15m Pre</option>
                  <option value="30" className="bg-slate-900">30m Pre</option>
                  <option value="60" className="bg-slate-900">1h Pre</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Start Time
                </Label>
                <Input
                  type="time"
                  className="bg-white/5 border-white/10 text-white"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                  <Clock className="h-3 w-3" /> End Time
                </Label>
                <Input
                  type="time"
                  className="bg-white/5 border-white/10 text-white"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Selected Coordinates</p>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 font-mono text-xs">
                <div className="flex-1 px-3 py-1 bg-black/20 rounded">LAT: {coords?.lat.toFixed(6) || '---'}</div>
                <div className="flex-1 px-3 py-1 bg-black/20 rounded">LNG: {coords?.lng.toFixed(6) || '---'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Satellite Positioning</Label>
            <div className="border border-white/10 rounded-3xl overflow-hidden bg-black/40">
              <LocationPickerMap
                onLocationSelect={handleLocationSelect}
                initialPosition={coords}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-white/5 pt-4">
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
                Syncing...
              </>
            ) : (
              <>
                Commit Waypoint
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationModal;