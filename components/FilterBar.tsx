import React from 'react';

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    searchTerm,
    setSearchTerm,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    return (
        <div className="bg-dark-card p-4 rounded-lg mb-8 shadow-lg border border-dark-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                {/* Search Input */}
                <div className="flex flex-col">
                    <label htmlFor="search" className="text-sm font-medium text-dark-text-secondary mb-1">Search Events</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="e.g., Summer Festival, Art Fair..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition"
                    />
                </div>
                
                {/* Date Range Picker */}
                <div className="flex flex-col">
                     <label className="text-sm font-medium text-dark-text-secondary mb-1">Date Range</label>
                     <div className="flex items-center space-x-2">
                         <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition"
                            aria-label="Start Date"
                         />
                         <span className="text-dark-text-secondary">-</span>
                         <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition disabled:opacity-50"
                            aria-label="End Date"
                            disabled={!startDate}
                         />
                     </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
