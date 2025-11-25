import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;