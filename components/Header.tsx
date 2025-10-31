
import React from 'react';

interface HeaderProps {
    onRefresh: () => void;
    isLoading: boolean;
}

const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4a12.042 12.042 0 011.81-6.32M20 20c-1.892 1.892-4.406 3-7 3a12.006 12.006 0 01-8.75-3.87M20 4a12.042 12.042 0 00-1.81 6.32" />
        <path d="M4 11a9 9 0 0114.18-5.35M20 13a9 9 0 01-14.18 5.35" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
    return (
        <header className="bg-dark-card shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-brand-secondary p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-dark-text-primary tracking-tight">Lenawee County Events</h1>
                </div>
                 <button 
                    onClick={onRefresh} 
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     <RefreshIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}/>
                     <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                 </button>
            </div>
        </header>
    );
};

export default Header;
