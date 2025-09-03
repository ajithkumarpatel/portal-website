
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-gray-800/30 backdrop-blur-md border border-gray-500/30 rounded-2xl shadow-2xl p-6 md:p-8 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
