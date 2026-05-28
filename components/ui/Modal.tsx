import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmLabel }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card w-full max-w-md shadow-2xl animate-in scale-in duration-200 origin-center">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text-primary text-2xl leading-none transition-colors duration-150"
          >
            ×
          </button>
        </div>
        <div className="p-6 text-text-secondary">
          {children}
        </div>
        {(onConfirm || confirmLabel) && (
          <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-bg-tertiary/50">
            <button 
              onClick={onClose}
              className="btn btn-secondary px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="btn btn-primary px-4 py-2.5 text-sm"
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
