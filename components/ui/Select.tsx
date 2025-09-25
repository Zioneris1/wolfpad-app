import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
    return (
        <select
            className={`ui-input ${className || ''}`}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;

