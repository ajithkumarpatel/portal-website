
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
    return (
        <select
            className={`w-full px-4 py-3 rounded-lg bg-secondary border border-accent focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent text-gray-200 placeholder-gray-400 transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;
