
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent"></div>
            <p className="ml-4 text-lg text-dark-text-secondary">Finding Events...</p>
        </div>
    );
};

export default LoadingSpinner;
