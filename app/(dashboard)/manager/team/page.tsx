"use client";

import React, { useState, useEffect } from 'react';
import { Search, Phone, MessageCircle, Users, UserCheck } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox'

/**
 * Interface for individual person data displayed in the UI
 */
interface PersonData {
    id: string;
    name: string;
    role: string;
    callCount: number;
    messageCount?: number;
    email?: string;
}

/**
 * Interface for stats card data
 */
interface StatsCardData {
    value: number;
    label: string;
    icon: React.ComponentType<any>;
    isHighlighted?: boolean;
}   

/**
 * API Response interface for auditors endpoint
 */
interface AuditorsApiResponse {
    success: boolean;
    message: string;
    number_of_auditors: number;
    total_audited_calls: number;
    auditors: {
        id: string;
        name: string;
        total_assigned_leads: number;
        total_audited_leads: number;
    }[];
}

/**
 * API Response interface for counsellors endpoint  
 */
interface CounsellorsApiResponse {
    success: boolean;
    message: string;
    total_counsellors: number;
    total_calls_made: number;
    counsellors: {
        id: string;
        name: string;
        email: string;
        total_calls: number;
    }[];
}

/**
 * Combined dashboard data structure
 */
interface DashboardData {
    stats: StatsCardData[];
    auditors: PersonData[];
    counsellors: PersonData[];
    totalAuditors: number;
    totalCounsellors: number;
}

/**
 * Interface for the global cache structure
 * Manages cached data, timestamp, loading state, and error state
 */
interface DashboardCache {
    data: DashboardData | null;
    timestamp: number | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Global cache object that persists across component re-renders and navigation
 * This ensures data is not refetched unnecessarily when navigating back to the dashboard
 */
const dashboardCache: DashboardCache = {
    data: null,
    timestamp: null,
    isLoading: false,
    error: null
};

/**
 * Cache duration in milliseconds (5 minutes)
 * Data will be considered stale after this duration and will be refetched
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Data transformation utilities
 */
function transformAuditor(apiAuditor: AuditorsApiResponse['auditors'][0]): PersonData {
    return {
        id: apiAuditor.id,
        name: apiAuditor.name,
        role: `Assigned: ${apiAuditor.total_assigned_leads}`,
        callCount: apiAuditor.total_audited_leads,
        messageCount: Math.floor(apiAuditor.total_audited_leads * 0.3) // Mock message count
    };
}

function transformCounsellor(apiCounsellor: CounsellorsApiResponse['counsellors'][0]): PersonData {
    return {
        id: apiCounsellor.id,
        name: apiCounsellor.name,
        role: apiCounsellor.email,
        callCount: apiCounsellor.total_calls
    };
}

function createStatsData(
    auditorsResponse: AuditorsApiResponse,
    counsellorsResponse: CounsellorsApiResponse
): StatsCardData[] {
    return [
        {
            value: auditorsResponse.number_of_auditors,
            label: 'Auditors',
            icon: UserCheck
        },
        {
            value: auditorsResponse.total_audited_calls,
            label: 'Total audited calls',
            icon: Phone,
            isHighlighted: true
        },
        {
            value: counsellorsResponse.total_counsellors,
            label: 'Counsellors',
            icon: Users
        },
        {
            value: counsellorsResponse.total_calls_made,
            label: 'Total calls made',
            icon: Phone,
            isHighlighted: true
        }
    ];
}

/**
 * Fetches dashboard data from API endpoints with intelligent caching
 * 
 * @param {boolean} force - If true, bypasses cache and forces a fresh API call
 * @returns {Promise<DashboardData>} Combined dashboard data
 */
async function fetchDashboardData(force: boolean = false): Promise<DashboardData> {
    // Prevent multiple simultaneous API calls
    if (dashboardCache.isLoading) {
        // Wait for ongoing request to complete
        while (dashboardCache.isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Return cached data if available after waiting
        if (dashboardCache.data) {
            return dashboardCache.data;
        }
    }

    // Skip API call if we have valid cached data (unless forced)
    if (!force && dashboardCache.data && isCacheValid()) {
        return dashboardCache.data;
    }

    try {
        // Update loading state in cache
        dashboardCache.isLoading = true;

        // Make parallel API calls for better performance
        const [audResponse, counResponse] = await Promise.all([
            axios.get('http://localhost:8000/api/v1/manager/auditors', {
                withCredentials: true
            }),
            axios.get('http://localhost:8000/api/v1/manager/counsellor', {
                withCredentials: true
            })
        ]);

        const auditorsResponse: AuditorsApiResponse = audResponse.data;
        const counsellorsResponse: CounsellorsApiResponse = counResponse.data;

        // Transform API responses
        const transformedAuditors = auditorsResponse.auditors.map(transformAuditor);
        const transformedCounsellors = counsellorsResponse.counsellors.map(transformCounsellor);
        const statsData = createStatsData(auditorsResponse, counsellorsResponse);

        const dashboardData: DashboardData = {
            stats: statsData,
            auditors: transformedAuditors,
            counsellors: transformedCounsellors,
            totalAuditors: auditorsResponse.number_of_auditors,
            totalCounsellors: counsellorsResponse.total_counsellors
        };

        // Update global cache with fresh data
        dashboardCache.data = dashboardData;
        dashboardCache.timestamp = Date.now();
        dashboardCache.error = null;

        return dashboardData;
    } catch (error: any) {
        // Handle API errors
        const errorMsg = error.message || 'Failed to fetch dashboard data';
        dashboardCache.error = errorMsg;
        throw error;
    } finally {
        // Reset loading state
        dashboardCache.isLoading = false;
    }
}

/**
 * Checks if the cached data is still valid based on the cache duration
 * 
 * @returns {boolean} True if cache is valid, false if expired or no cache exists
 */
function isCacheValid(): boolean {
    if (!dashboardCache.timestamp) return false;
    return Date.now() - dashboardCache.timestamp < CACHE_DURATION;
}

function filterPeople(query: string, dashboardData: DashboardData): {
    auditors: PersonData[];
    counsellors: PersonData[];
} {
    if (!query.trim()) {
        return {
            auditors: dashboardData.auditors,
            counsellors: dashboardData.counsellors
        };
    }

    const searchTerm = query.toLowerCase();

    const filteredAuditors = dashboardData.auditors.filter(auditor =>
        auditor.name.toLowerCase().includes(searchTerm)
    );

    const filteredCounsellors = dashboardData.counsellors.filter(counsellor =>
        counsellor.name.toLowerCase().includes(searchTerm)
    );

    return {
        auditors: filteredAuditors,
        counsellors: filteredCounsellors
    };
}

// Component interfaces
interface StatsCardProps {
    data: StatsCardData;
}

interface PersonCardProps {
    person: PersonData;
    showMessages?: boolean;
}

interface PersonListProps {
    title: string;
    people: PersonData[];
    totalCount: number;
    showMessages?: boolean;
    isLoading?: boolean;
}

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

/**
 * StatsCard component - displays metric cards at the top
 */
const StatsCard: React.FC<StatsCardProps> = ({ data }) => {
    const { value, label, icon: Icon } = data;

    return (
        <div
            className={`
                rounded-xl p-6 bg-qc-dark/10
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
                        {value}
                    </div>
                    <div className="text-sm md:text-base font-medium text-gray-600">
                        {label}
                    </div>
                </div>
                <div className="ml-3">
                    <Icon className="h-6 w-6 text-qc-accent" />
                </div>
            </div>
        </div>
    );
};

/**
 * SearchBar component - handles search functionality with instant filtering
 */
const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Search counsellor or auditor by name...",
    isLoading = false
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
                disabled={isLoading}
                className={`
                    w-full pl-12 pr-16 py-4 rounded-xl border-0 
                 shadow-sm text-gray-900 bg-qc-dark/10 focus:outline-none focus:ring-1 focus:ring-qc-accent transition-all duration-200 text-base
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
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

/**
 * PersonCard component - displays individual person information
 */
const PersonCard: React.FC<PersonCardProps> = ({ person, showMessages = false }) => {
    const { name, role, callCount, messageCount } = person;

    return (
        <div className="flex items-center justify-between p-4 rounded-xl mb-3 transition-all duration-200 hover:shadow-md bg-gray-50">
            {/* Left side - Avatar and info */}
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-qc-accent flex items-center justify-center text-white font-semibold">
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="font-medium text-base text-gray-800">
                        {name}
                    </div>
                    <div className="text-sm text-gray-600">
                        {role}
                    </div>
                </div>
            </div>

            {/* Right side - Call and message counts */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4 text-qc-dark" />
                    <span className="text-sm font-medium text-gray-800">
                        {callCount}
                    </span>
                </div>
                {showMessages && messageCount !== undefined && (
                    <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4 text-qc-dark" />
                        <span className="text-sm font-medium text-gray-800">
                            {messageCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * PersonList component - displays a list of people with header
 */
const PersonList: React.FC<PersonListProps> = ({
    title,
    people,
    totalCount,
    showMessages = false,
    isLoading = false
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
                <button className="text-sm font-medium text-qc-dark hover:text-blue-700 transition-colors underline">
                    View more
                </button>
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

/**
 * Main Dashboard component with intelligent caching
 * 
 * Features:
 * - Automatic caching to prevent unnecessary API calls
 * - Cache expiration after 5 minutes
 * - Graceful error handling with fallback to cached data
 * - Instant search filtering without API calls
 * - Optimistic UI updates for better user experience
 */
const ManagerTeamDashboard: React.FC = () => {
    // Initialize component state with cached values if available
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(dashboardCache.data);
    const [displayAuditors, setDisplayAuditors] = useState<PersonData[]>(dashboardCache.data?.auditors || []);
    const [displayCounsellors, setDisplayCounsellors] = useState<PersonData[]>(dashboardCache.data?.counsellors || []);
    const [isLoading, setIsLoading] = useState<boolean>(dashboardCache.isLoading);
    const [error, setError] = useState<string>(dashboardCache.error || '');

    /**
     * Fetches dashboard data with intelligent caching
     * 
     * @param {boolean} force - If true, bypasses cache and forces a fresh API call
     * @returns {Promise<void>}
     */
    const fetchData = async (force: boolean = false): Promise<void> => {
        // Skip if we have valid cached data (unless forced)
        if (!force && dashboardData && isCacheValid()) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const data = await fetchDashboardData(force);

            setDashboardData(data);
            setDisplayAuditors(data.auditors);
            setDisplayCounsellors(data.counsellors);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch dashboard data';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles search functionality with instant filtering
     * Filters data locally without making API calls
     * 
     * @param {string} query - Search query string
     */
    const handleSearch = (query: string) => {
        if (!dashboardData) return;

        // Instantly filter the data without API calls
        const filteredData = filterPeople(query, dashboardData);

        setDisplayAuditors(filteredData.auditors);
        setDisplayCounsellors(filteredData.counsellors);
    };

    /**
     * Effect hook that runs on component mount
     * Checks for cached data and fetches fresh data if needed
     */
    useEffect(() => {
        // Check if we have valid cached data
        if (dashboardCache.data && isCacheValid()) {
            // Use cached data immediately for faster rendering
            setDashboardData(dashboardCache.data);
            setDisplayAuditors(dashboardCache.data.auditors);
            setDisplayCounsellors(dashboardCache.data.counsellors);
            setError(dashboardCache.error || '');
            setIsLoading(false);
        } else {
            // Cache is stale or doesn't exist, fetch fresh data
            fetchData();
        }
    }, []);

    // Show loading spinner only if we don't have any data to display
    if (isLoading && !dashboardData) {
        return (
            <Loader
                text='Loading Teams'
            />
        );
    }

    // Show error page only if we have an error and no cached data to fall back to
    if (error && !dashboardData) {
        return (
            <Error
                title='Something went wrong'
                message={error}
                onRetry={() => fetchData(true)}
            />
        );
    }

    return (
        <div className="min-h-screen">
            <div className="p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {dashboardData && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                {dashboardData.stats.map((stat, index) => (
                                    <StatsCard key={index} data={stat} />
                                ))}
                            </div>

                            {/* Search Bar */}
                            <SearchBar onSearch={handleSearch} isLoading={false} />

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                {/* Auditors Section */}
                                <PersonList
                                    title="Auditors"
                                    people={displayAuditors}
                                    totalCount={dashboardData.totalAuditors}
                                    showMessages={true}
                                    isLoading={false}
                                />

                                {/* Counsellors Section */}
                                <PersonList
                                    title="Counsellors"
                                    people={displayCounsellors}
                                    totalCount={dashboardData.totalCounsellors}
                                    showMessages={false}
                                    isLoading={false}
                                />
                            </div>
                        </>
                    )}

                    {/* Warning message if there's an error but we have cached data to show */}
                    {error && dashboardData && (
                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                            Warning: Failed to refresh data. Showing cached data. Error: {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerTeamDashboard;