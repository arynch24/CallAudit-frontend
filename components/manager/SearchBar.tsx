
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

/**
 * SearchBar component - handles search functionality with instant filtering
 */
const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Search counsellor or auditor by name...",
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Call onSearch on every keystroke for instant filtering
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    return (
        <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`
                    w-full pl-12 pr-40 py-4 rounded-xl border-0 
                 shadow-sm text-gray-900 bg-qc-dark/10 focus:outline-none focus:ring-1 focus:ring-qc-accent transition-all duration-200 text-base
                `}
            />
            {searchQuery && (
                <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;