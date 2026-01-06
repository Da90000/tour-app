import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  Receipt,
  AlertTriangle,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const MyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchData = async () => {
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        api.get('/expenses/my-expenses'),
        api.get('/finances/my-summary')
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      toast.error('Failed to load your financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    eventBus.on('financeDataChanged', fetchData);
    return () => eventBus.off('financeDataChanged', fetchData);
  }, []);

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await api.delete(`/expenses/${selectedExpense.expense_id}`);
      toast.success('Expense record removed.');
      fetchData();
      eventBus.emit('financeDataChanged');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense.');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredExpenses = expenses.filter(e =>
    e.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic">My Wallet</h1>
          <p className="text-slate-400">Track your personal tour contributions and spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 w-full md:w-64 bg-white/5 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Banknote className="h-16 w-16 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Net Balance</CardDescription>
              <CardTitle className={cn(
                "text-4xl font-bold font-mono tracking-tighter",
                summary.balance < 0 ? "text-red-400" : "text-primary"
              )}>
                ৳{summary.balance.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                {summary.balance < 0 ? (
                  <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-none flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </Badge>
                ) : (
                  <Badge variant="success" className="bg-primary/10 text-primary border-none">
                    In Good Standing
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Total Funding</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono tracking-tighter text-emerald-400">
                ৳{summary.total_deposited.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ArrowUpCircle className="h-3 w-3 text-emerald-500" />
                All time deposits
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Total Outflow</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono tracking-tighter text-orange-400">
                ৳{summary.total_spent.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ArrowDownCircle className="h-3 w-3 text-orange-500" />
                Confirmed expenditures
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Log */}
      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>A detailed history of your tour costs.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const isModifiable = expense.day_status === 'Ongoing';
                return (
                  <div
                    key={expense.expense_id}
                    className="group p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Receipt className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{expense.event_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <span className="text-sm text-slate-400 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {expense.location_name}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(expense.expense_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono text-white tracking-tighter">
                          ৳{expense.total_cost.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {expense.quantity} unit{expense.quantity > 1 ? 's' : ''} × ৳{expense.estimated_cost_per_unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isModifiable && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="gap-2 text-primary focus:text-primary">
                                <Edit3 className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-red-400 focus:text-red-400"
                                onClick={() => handleDeleteClick(expense)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {!isModifiable && (
                          <Badge variant="secondary" className="bg-slate-800 text-slate-500 border-none py-1">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-4 bg-white/5 rounded-full text-slate-600 mb-2">
                <Receipt className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-medium text-slate-400">No expenses recorded</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Once you start adding expenses from the itinerary, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deletion Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Expense?</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the expense for <span className="text-white font-medium">{selectedExpense?.event_name}</span>? This will affect your current balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600">
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyExpenses;