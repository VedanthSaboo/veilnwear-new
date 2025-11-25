// components/ui/Input.tsx
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...rest }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} {...rest} />
    </div>
  );
};

export default Input;
