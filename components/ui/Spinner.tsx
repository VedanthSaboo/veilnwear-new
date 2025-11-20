// components/ui/Spinner.tsx
import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  return (
    <div>
      <span>Loading ({size})...</span>
    </div>
  );
};

export default Spinner;
