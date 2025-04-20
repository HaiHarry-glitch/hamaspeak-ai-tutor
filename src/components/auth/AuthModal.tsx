
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';
import SupabaseAuth from './SupabaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="sm:max-w-md p-6 bg-white">
        <SupabaseAuth onSuccess={handleSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
