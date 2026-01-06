import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Type,
  AlignLeft,
  ArrowLeft,
  Loader2,
  Sparkles,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const NewGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName) {
      toast.warning('Please provide a compelling name for your expedition.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/groups', {
        group_name: groupName,
        description: description,
      });
      toast.success('Your new expedition has been charted!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'The tour could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="text-slate-400 gap-2 hover:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4 animate-bounce">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white italic">Create a New Trip</h1>
        <p className="text-slate-400">Set the details for your next big adventure.</p>
      </div>

      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Globe className="h-24 w-24 text-primary" />
        </div>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-white">Tour Details</CardTitle>
          <CardDescription>All great tours start with a solid foundation.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" /> Tour Name
                </Label>
                <Input
                  placeholder="e.g. The Alpine Ascent 2026"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-primary/50"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">This is how your group will be identified.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-primary" /> Description & Vision
                </Label>
                <Textarea
                  placeholder="Describe the objective, spirit, and goals of this tour..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[120px] focus:ring-primary/50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-500"
              disabled={isSubmitting || !groupName}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initialising...
                </>
              ) : (
                <>
                  Create Tour
                  <PlusCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em]">
          Premium Planning Protocol Active
        </p>
      </div>
    </div>
  );
};

export default NewGroup;