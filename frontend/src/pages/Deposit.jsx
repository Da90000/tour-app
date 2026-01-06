import React, { useState, useEffect } from 'react';
import {
  Coins,
  User,
  ArrowRightCircle,
  Loader2,
  CheckCircle2,
  Building,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

const Deposit = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdminGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await api.get('/groups');
        const adminGroups = response.data.filter(g => g.role === 'admin');
        setGroups(adminGroups);
        if (adminGroups.length === 1) {
          setSelectedGroupId(adminGroups[0].group_id.toString());
        }
      } catch (error) {
        toast.error('Could not retrieve managed groups.');
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchAdminGroups();
  }, []);

  useEffect(() => {
    const fetchUsersForGroup = async () => {
      if (!selectedGroupId) {
        setUsers([]);
        setSelectedUserId('');
        return;
      }
      setLoadingUsers(true);
      try {
        const response = await api.get(`/groups/${selectedGroupId}/users`);
        setUsers(response.data.filter(u => u.role !== 'admin'));
      } catch (error) {
        toast.error('Could not load members for the selected group.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsersForGroup();
  }, [selectedGroupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !amount || parseFloat(amount) <= 0) {
      toast.warning("Please ensure all fields are correctly filled.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/finances/deposits', {
        group_id: parseInt(selectedGroupId),
        user_id: parseInt(selectedUserId),
        amount: parseFloat(amount)
      });
      toast.success("Deposit successful! Group balance updated.");
      eventBus.emit('financeDataChanged');
      setSelectedGroupId(groups.length === 1 ? selectedGroupId : '');
      setSelectedUserId('');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'The deposit could not be processed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in py-8">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white italic">Member Deposit</h1>
        <p className="text-slate-400">Record a manual deposit from a group member to the tour fund.</p>
      </div>

      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-violet-500 to-emerald-500" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-white">Transaction Details</CardTitle>
          <CardDescription>Verify the member and amount before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> 1. Select Group
                </Label>
                {loadingGroups ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : groups.length > 1 ? (
                  <Select
                    className="bg-white/5 border-white/10 text-white"
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    required
                  >
                    <option value="" className="bg-slate-900">-- Select Group --</option>
                    {groups.map(g => (
                      <option key={g.group_id} value={g.group_id} className="bg-slate-900">{g.group_name}</option>
                    ))}
                  </Select>
                ) : groups.length === 1 ? (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-md text-white font-medium">
                    {groups[0].group_name}
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm italic">
                    No managed groups found.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> 2. Tour Member
                </Label>
                {loadingUsers ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Select
                    className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    disabled={!selectedGroupId}
                    required
                  >
                    <option value="" className="bg-slate-900">-- Select Member --</option>
                    {users.map(u => (
                      <option key={u.user_id} value={u.user_id} className="bg-slate-900">{u.username}</option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" /> 3. Deposit Amount (৳)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter amount (e.g. 5000)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 font-mono text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!selectedUserId}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              disabled={isSubmitting || !selectedUserId || !amount}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Deposit...
                </>
              ) : (
                <>
                  Confirm Deposit
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
        <div className="h-px w-8 bg-white/5" />
        Secure Transaction Channel
        <div className="h-px w-8 bg-white/5" />
      </div>
    </div>
  );
};

export default Deposit;