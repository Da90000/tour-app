import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { Loader2, Banknote, UserPlus } from 'lucide-react';
import api from '../../api/api';
import eventBus from '../../services/eventBus';

const AddDepositModal = ({ isOpen, onClose, groupId, users, onDepositSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedUserId || !amount || parseFloat(amount) <= 0) {
      toast.warning('Member selection and a valid amount are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/finances/deposits', {
        user_id: parseInt(selectedUserId),
        group_id: parseInt(groupId),
        amount: parseFloat(amount)
      });
      toast.success('Funds successfully added to the member balance.');

      eventBus.emit('financeDataChanged');

      if (onDepositSuccess) {
        onDepositSuccess();
      }

      onClose();
      setAmount('');
      setSelectedUserId('');
    } catch (error) {
      toast.error('Financial transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/90 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white italic flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" /> Add Deposit
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Allocate funds to a specific member's account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <UserPlus className="h-3 w-3" /> Select Member
            </Label>
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Deposit Amount (৳)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">৳</span>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white h-12 pl-8 font-mono text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-600 italic">This transaction will be recorded in the general ledger.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-400">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-8 font-bold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Deposit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepositModal;