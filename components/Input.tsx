
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-4 py-3 rounded-lg bg-secondary border border-accent focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent text-gray-200 placeholder-gray-400 transition-all duration-300 ${className}`}
            {...props}
        />
    );
};

export default Input;
