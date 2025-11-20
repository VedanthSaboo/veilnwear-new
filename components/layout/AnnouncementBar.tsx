// components/layout/AnnouncementBar.tsx
import React from 'react';

export interface AnnouncementBarProps {
  message?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'Free shipping on orders over ₹999',
  isVisible = true,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-neutral-900 text-xs sm:text-sm text-neutral-200 px-4 py-2 flex items-center justify-center gap-4">
      <span className="text-center">{message}</span>
      {onClose && (
        <button
          type="button"
          className="text-neutral-400 hover:text-neutral-200 text-xs"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;
