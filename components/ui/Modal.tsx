// components/ui/Modal.tsx
import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div>
      <div>
        <header>
          {title && <h2>{title}</h2>}
          <button onClick={onClose}>Close</button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
