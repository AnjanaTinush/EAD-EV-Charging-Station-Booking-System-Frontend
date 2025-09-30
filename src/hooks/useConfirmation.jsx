import { useState } from 'react';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Custom hook for using confirmation dialogs
export function useConfirmation() {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmButtonClass: 'bg-blue-500 hover:bg-blue-600',
    onConfirm: null,
    onCancel: null
  });

  const showConfirmation = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'bg-blue-500 hover:bg-blue-600',
    onConfirm
  }) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        confirmButtonClass,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
          if (onConfirm) onConfirm();
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog {...dialog} />
  );

  return { showConfirmation, ConfirmationComponent };
}