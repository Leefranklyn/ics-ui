import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel: string;
}

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmLabel }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-textBase">{title}</h2>
          <button onClick={onClose} className="text-textMuted hover:text-textBase text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 text-textMuted">
          {children}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium text-textBase bg-surface2 hover:bg-border transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-medium text-white bg-accent hover:bg-accentDim transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
