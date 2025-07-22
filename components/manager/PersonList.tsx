
import { PersonData } from '@/types/dashboard';
import React from 'react';
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
    return (
        <div className="rounded-xl p-6 bg-qc-dark/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {title}
                    </h2>
                    <span className="bg-qc-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                        {totalCount}
                    </span>
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50">
                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-300 rounded w-8"></div>
                                    {showMessages && <div className="h-6 bg-gray-300 rounded w-8"></div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* People list */}
            {!isLoading && (
                <div className="space-y-2">
                    {people.length > 0 ? (
                        people.map((person) => (
                            <PersonCard
                                key={person.id}
                                person={person}
                                showMessages={showMessages}
                                onRefresh={onRefresh}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-lg">No {title.toLowerCase()} found</p>
                            <p className="text-sm opacity-70">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PersonList;