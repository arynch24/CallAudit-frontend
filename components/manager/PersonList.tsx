import { PersonData } from '@/types/dashboard';
import React, { useState } from 'react';
import PersonCard from './PersonCard';

interface PersonListProps {
    title: string;
    people: PersonData[];
    totalCount: number;
    showMessages?: boolean;
    isLoading?: boolean;
    onRefresh?: () => void;
}

/**
 * PersonList component - displays a list of people with header
 */
const PersonList: React.FC<PersonListProps> = ({
    title,
    people,
    totalCount,
    showMessages = false,
    isLoading = false,
    onRefresh = () => {},
}) => {
    const [showAll, setShowAll] = useState(false);
    const INITIAL_DISPLAY_COUNT = 4;
    
    const displayedPeople = showAll ? people : people.slice(0, INITIAL_DISPLAY_COUNT);
    const hasMorePeople = people.length > INITIAL_DISPLAY_COUNT;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                        {totalCount}
                    </span>
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                                </div>
                                {showMessages && (
                                    <div className="mt-2 ml-14 h-3 bg-gray-200 rounded w-3/4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* People list */}
            {!isLoading && (
                <div className="p-6">
                    {people.length > 0 ? (
                        <>
                            {/* Scrollable container when showing all */}
                            <div 
                                className={`space-y-4 ${
                                    showAll && hasMorePeople 
                                        ? 'max-h-88 overflow-y-auto pr-2' 
                                        : ''
                                }`}
                            >
                                {displayedPeople.map((person) => (
                                    <PersonCard
                                        key={person.id}
                                        person={person}
                                        showMessages={showMessages}
                                        onRefresh={onRefresh}
                                    />
                                ))}
                            </div>
                            
                            {/* View All / Show Less button */}
                            {hasMorePeople && (
                                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-qc-dark hover:text-qc-accent hover:bg-qc-light/10 rounded-md transition-colors duration-200"
                                    >
                                        {showAll ? (
                                            <>
                                                Show Less
                                                <svg className="ml-2 w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                View All {people.length} {title.toLowerCase()}
                                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-2">
                                No {title.toLowerCase()} found
                            </div>
                            <div className="text-sm text-gray-400">
                                Try adjusting your search criteria
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PersonList;