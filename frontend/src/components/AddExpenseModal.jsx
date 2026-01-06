import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ShoppingCart, Banknote, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/api';
import eventBus from '../services/eventBus';

const AddExpenseModal = ({ isOpen, onClose, event }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!event) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/expenses', {
        event_id: event.event_id,
        quantity: quantity,
      });
      toast.success(`Allocated ${quantity} unit(s) for ${event.event_name}.`);
      eventBus.emit('financeDataChanged');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Confirm Allocation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Registering personal expenditure for <span className="text-white font-medium italic">{event.event_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Base Rate</p>
              <p className="text-lg font-bold text-white font-mono">৳{event.estimated_cost_per_unit?.toFixed(2)}</p>
            </div>
            <Banknote className="h-5 w-5 text-slate-600" />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Hash className="h-3 w-3" /> Required Quantity
            </Label>
            <Input
              type="number"
              min="1"
              className="bg-white/5 border-white/10 text-white font-mono text-lg"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              autoFocus
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 font-medium">Estimated Impact</p>
              <p className="text-2xl font-bold text-primary tracking-tighter italic font-mono">
                ৳{(event.estimated_cost_per_unit * quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-500">
            Abort
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Allocation
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;