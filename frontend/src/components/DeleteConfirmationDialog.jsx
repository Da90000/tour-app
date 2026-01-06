import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, title, body, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px] border-red-500/20 bg-slate-950">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">
            {title || 'Confirm Redaction'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {body || 'Are you absolutely certain? This operation is irreversible and will purge data from the active registry.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-500 hover:text-white hover:bg-white/5"
          >
            Abort
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Execute Purge
                <Trash2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;