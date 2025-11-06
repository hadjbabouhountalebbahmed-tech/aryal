
import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`}>
            <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">{title}</h3>
                {children}
            </div>
        </div>
    );
};

export default Card;