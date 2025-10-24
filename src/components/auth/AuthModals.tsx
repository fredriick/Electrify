'use client';

import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModals({ isOpen, onClose, defaultMode = 'login' }: AuthModalsProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  const handleClose = () => {
    setMode(defaultMode);
    onClose();
  };

  return (
    <>
      <LoginModal
        isOpen={isOpen && mode === 'login'}
        onClose={handleClose}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isOpen && mode === 'register'}
        onClose={handleClose}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
} 