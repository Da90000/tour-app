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
import { Edit3, Banknote, Hash, Loader2, Save } from 'lucide-react';
import api from '../api/api';

const EditExpenseModal = ({ isOpen, onClose, expense, onUpdate }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setQuantity(expense.quantity);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/expenses/${expense.expense_id}`, { quantity });
      toast.success('Transaction record updated.');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync updates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newTotal = (expense.estimated_cost_per_unit * quantity).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <Edit3 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Update Allocation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifying the quantity for <span className="text-white font-medium italic">{expense.event_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Base Rate</p>
              <p className="text-lg font-bold text-white font-mono">৳{expense.estimated_cost_per_unit?.toFixed(2)}</p>
            </div>
            <Banknote className="h-5 w-5 text-slate-600" />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Hash className="h-3 w-3" /> Update Quantity
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
              <p className="text-slate-400 font-medium">Revised Impact</p>
              <p className="text-2xl font-bold text-primary tracking-tighter italic font-mono">
                ৳{newTotal}
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
                Syncing...
              </>
            ) : (
              <>
                Save Changes
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;