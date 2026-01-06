import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Loader2,
  AlertCircle,
  Wifi,
  Info,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const ManageAnnouncements = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning('Transmission aborted. Message content required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/announcements', { groupId, message });
      toast.success('Transmission successful! Broadcast deployed to all active operatives.');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signal failure. Broadcast could not be deployed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in py-4">
      <Card className="border-white/5 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-500 via-primary to-violet-600" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
            <Wifi className="h-3 w-3 animate-pulse" /> Live Broadcast Channel
          </div>
          <CardTitle className="text-2xl text-white italic">Emergency Broadcast</CardTitle>
          <CardDescription>
            Deploy an instant, mission-critical notification to all expedition participants currently in theatre.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-4">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Transmissions are pushed via ultra-low latency protocols. Use this channel only for time-sensitive operational updates.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" /> Transmission Payload
              </Label>
              <Textarea
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[160px] focus:ring-yellow-500/30 text-lg italic"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Extraction point relocated. New coordinates synced. ETA 15 minutes."
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold shadow-xl shadow-yellow-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all bg-gradient-to-r from-yellow-600 to-primary hover:from-yellow-500 hover:to-primary/90"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transmitting...
                </>
              ) : (
                <>
                  Deploy Broadcast
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.4em]">
          End-to-End Operational Sync Active
        </p>
      </div>
    </div>
  );
};

export default ManageAnnouncements;