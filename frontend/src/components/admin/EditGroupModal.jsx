import React, { useState, useEffect } from 'react';
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
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Loader2, Settings2, FileText, Info } from 'lucide-react';
import api from '../../api/api';

const EditGroupModal = ({ isOpen, onClose, group, onUpdate }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupName(group.group_name || '');
      setDescription(group.description || '');
    }
  }, [group]);

  if (!group) return null;

  const handleSubmit = async () => {
    if (!groupName) {
      toast.warning('Group name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/groups/${group.group_id}`, {
        group_name: groupName,
        description: description
      });
      toast.success('Group settings updated successfully.');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update group settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/90 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white italic flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" /> Edit Trip Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Modify the core details of your tour group.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <FileText className="h-3 w-3" /> Trip Name
            </Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-12"
              placeholder="e.g. Summer Vacation 2024"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Info className="h-3 w-3" /> Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none"
              placeholder="Provide a brief summary of this trip..."
            />
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
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;