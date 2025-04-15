// src/components/Input.tsx
import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string;
  max?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error,
  disabled = false,
  readOnly = false,
  min,
  max
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        className={`shadow appearance-none border ${error ? 'border-red-500' : 'border-gray-300'} 
                   rounded w-full py-2 px-3 text-gray-700 leading-tight 
                   focus:outline-none focus:shadow-outline
                   ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                   ${readOnly ? 'bg-gray-50' : ''}`}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;