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
import { toast } from 'sonner';
import { Edit3, Banknote, Hash, Loader2, Save, ShieldAlert } from 'lucide-react';
import api from '../../api/api';
import eventBus from '../../services/eventBus';

const AdminEditExpenseModal = ({ isOpen, onClose, expense, onUpdate }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setQuantity(expense.quantity);
      setTotalCost(expense.total_cost);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/expenses/admin/${expense.expense_id}`, {
        quantity: parseInt(quantity),
        total_cost: parseFloat(totalCost)
      });
      toast.success('Strategic record manual override successful.');
      eventBus.emit('financeDataChanged');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Manual override protocol failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Admin Record Override</DialogTitle>
          <DialogDescription className="text-slate-400">
            Manually adjusting historical expense record for <span className="text-white font-medium italic">{expense.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Hash className="h-3 w-3" /> Quantity
              </Label>
              <Input
                type="number"
                min="1"
                className="bg-white/5 border-white/10 text-white font-mono"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <Banknote className="h-3 w-3" /> Total Cost (৳)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="bg-white/5 border-white/10 text-white font-mono"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-orange-500 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-medium">
              Manual overrides bypass standard cost calculations. The treasury will be adjusted based on the new total cost provided.
            </p>
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
                Overriding...
              </>
            ) : (
              <>
                Commit Override
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditExpenseModal;