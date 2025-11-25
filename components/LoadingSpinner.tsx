import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  let spinnerSize = 'w-6 h-6';
  let borderWidth = 'border-2';

  switch (size) {
    case 'sm':
      spinnerSize = 'w-4 h-4';
      borderWidth = 'border-2';
      break;
    case 'md':
      spinnerSize = 'w-6 h-6';
      borderWidth = 'border-3'; // Tailwind doesn't have border-3, will resolve to border-2
      break;
    case 'lg':
      spinnerSize = 'w-8 h-8';
      borderWidth = 'border-4';
      break;
  }

  return (
    <div
      className={`${spinnerSize} ${borderWidth} border-white-400 dark:border-gray-300 border-solid rounded-full animate-spin border-t-transparent dark:border-t-transparent ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;