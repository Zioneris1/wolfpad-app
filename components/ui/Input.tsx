import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return <input className={`ui-input ${className || ''}`} {...props} />;
};

export default Input;

