
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ResetPasswordForm from './ResetPasswordForm';

type AuthView = 'signin' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'signin',
  onSuccess
}) => {
  const [view, setView] = useState<AuthView>(initialView);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
        {view === 'signin' && (
          <SignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => setView('signup')}
            onSwitchToReset={() => setView('reset')}
          />
        )}
        
        {view === 'signup' && (
          <SignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={() => setView('signin')}
          />
        )}
        
        {view === 'reset' && (
          <ResetPasswordForm
            onSuccess={() => setTimeout(() => setView('signin'), 3000)}
            onBack={() => setView('signin')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
