// components/ui/Button.tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading, ...rest }) => {
  return (
    <button {...rest}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
