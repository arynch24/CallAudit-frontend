"use client";

import React, { useState, useEffect } from 'react';
import { Search, Phone, MessageCircle } from 'lucide-react';
import StickyHeader from '@/components/StickyHeader';

/**
 * Interface for individual person data
 */
interface PersonData {
    id: string;
    name: string;
    role: string;
    callCount: number;
    messageCount?: number;
}

/**
 * Interface for stats card data
 */
interface StatsCardData {
    value: number;
    label: string;
    isHighlighted?: boolean;
}

/**
 * Raw API response interfaces - represents the actual API structure
 */
interface ApiAuditorResponse {
    auditor_id: string;
    full_name: string;
    employee_id: string;
    total_calls_audited: number;
    total_messages_sent: number;
    department: string;
    status: 'active' | 'inactive';
}

interface ApiCounsellorResponse {
    counsellor_id: string;
    name: string;
    employee_code: string;
    calls_made: number;
    department: string;
    status: 'active' | 'inactive';
}

interface ApiStatsResponse {
    total_auditors: number;
    total_audited_calls: number;
    total_counsellors: number;
    total_calls_made: number;
    last_updated: string;
}

interface ApiDashboardResponse {
    stats: ApiStatsResponse;
    auditors: ApiAuditorResponse[];
    counsellors: ApiCounsellorResponse[];
    success: boolean;
    message?: string;
}

interface DashboardProps {
    // No props needed for now, can be extended later
}

/**
 * Data transformation utilities
 */
class DataTransformer {
    /**
     * Transforms API auditor response to PersonData format
     */
    static transformAuditor(apiAuditor: ApiAuditorResponse): PersonData {
        return {
            id: apiAuditor.auditor_id,
            name: apiAuditor.full_name,
            role: `ID: ${apiAuditor.employee_id}`,
            callCount: apiAuditor.total_calls_audited,
            messageCount: apiAuditor.total_messages_sent
        };
    }

    /**
     * Transforms API counsellor response to PersonData format
     */
    static transformCounsellor(apiCounsellor: ApiCounsellorResponse): PersonData {
        return {
            id: apiCounsellor.counsellor_id,
            name: apiCounsellor.name,
            role: `ID: ${apiCounsellor.employee_code}`,
            callCount: apiCounsellor.calls_made
        };
    }

    /**
     * Transforms API stats response to StatsCardData format
     */
    static transformStats(apiStats: ApiStatsResponse): StatsCardData[] {
        return [
            { value: apiStats.total_auditors, label: 'Auditors' },
            { value: apiStats.total_audited_calls, label: 'Total audited calls', isHighlighted: true },
            { value: apiStats.total_counsellors, label: 'Counsellors' },
            { value: apiStats.total_calls_made, label: 'Total calls made', isHighlighted: true }
        ];
    }
}

/**
 * Mock API service - simulates real API calls
 */
class MockApiService {
    /**
     * Simulates API delay
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Mock dashboard data - simulates API response structure
     */
    private static mockDashboardData: ApiDashboardResponse = {
        success: true,
        stats: {
            total_auditors: 2,
            total_audited_calls: 200,
            total_counsellors: 30,
            total_calls_made: 300,
            last_updated: new Date().toISOString()
        },
        auditors: [
            {
                auditor_id: '1',
                full_name: 'Rishit Kumar',
                employee_id: 'PW80815',
                total_calls_audited: 123,
                total_messages_sent: 60,
                department: 'Quality Assurance',
                status: 'active'
            },
            {
                auditor_id: '2',
                full_name: 'Anuj Kumar',
                employee_id: 'PW80816',
                total_calls_audited: 120,
                total_messages_sent: 30,
                department: 'Quality Assurance',
                status: 'active'
            },
            {
                auditor_id: '3',
                full_name: 'Pushkar Kumar',
                employee_id: 'PW80817',
                total_calls_audited: 60,
                total_messages_sent: 20,
                department: 'Quality Assurance',
                status: 'active'
            },
            {
                auditor_id: '4',
                full_name: 'Ayush Gautam',
                employee_id: 'PW80818',
                total_calls_audited: 100,
                total_messages_sent: 45,
                department: 'Quality Assurance',
                status: 'active'
            }
        ],
        counsellors: [
            {
                counsellor_id: '5',
                name: 'Rishit Kumar',
                employee_code: 'PW80815',
                calls_made: 60,
                department: 'Customer Support',
                status: 'active'
            },
            {
                counsellor_id: '6',
                name: 'Anuj Kumar',
                employee_code: 'PW80816',
                calls_made: 56,
                department: 'Customer Support',
                status: 'active'
            },
            {
                counsellor_id: '7',
                name: 'Raman Pandey',
                employee_code: 'PW80817',
                calls_made: 54,
                department: 'Customer Support',
                status: 'active'
            },
            {
                counsellor_id: '8',
                name: 'Aryan Kohli',
                employee_code: 'PW80818',
                calls_made: 45,
                department: 'Customer Support',
                status: 'active'
            },
            {
                counsellor_id: '9',
                name: 'Shoyeb Ansari',
                employee_code: 'PW80819',
                calls_made: 40,
                department: 'Customer Support',
                status: 'active'
            },
            {
                counsellor_id: '10',
                name: 'Shivam Kumar',
                employee_code: 'PW80820',
                calls_made: 35,
                department: 'Customer Support',
                status: 'active'
            }
        ]
    };

    /**
     * Fetches dashboard data - simulates API call
     */
    static async fetchDashboardData(): Promise<ApiDashboardResponse> {
        await this.delay(800); // Simulate network delay

        // Simulate potential API error (uncomment to test error handling)
        // if (Math.random() < 0.1) {
        //   throw new Error('Failed to fetch dashboard data');
        // }

        return this.mockDashboardData;
    }

    /**
     * Searches people by query - simulates search API call
     */
    static async searchPeople(query: string): Promise<{
        auditors: ApiAuditorResponse[];
        counsellors: ApiCounsellorResponse[];
    }> {
        await this.delay(300); // Simulate network delay

        if (!query.trim()) {
            return {
                auditors: this.mockDashboardData.auditors,
                counsellors: this.mockDashboardData.counsellors
            };
        }

        const searchTerm = query.toLowerCase();

        const filteredAuditors = this.mockDashboardData.auditors.filter(auditor =>
            auditor.full_name.toLowerCase().includes(searchTerm) ||
            auditor.employee_id.toLowerCase().includes(searchTerm)
        );

        const filteredCounsellors = this.mockDashboardData.counsellors.filter(counsellor =>
            counsellor.name.toLowerCase().includes(searchTerm) ||
            counsellor.employee_code.toLowerCase().includes(searchTerm)
        );

        return {
            auditors: filteredAuditors,
            counsellors: filteredCounsellors
        };
    }
}

interface StatsCardProps {
    data: StatsCardData;
}

/**
 * Props for PersonCard component
 */
interface PersonCardProps {
    person: PersonData;
    showMessages?: boolean;
}

/**
 * Props for PersonList component
 */
interface PersonListProps {
    title: string;
    people: PersonData[];
    totalCount: number;
    showMessages?: boolean;
    isLoading?: boolean;
}

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

/**
 * StatsCard component - displays metric cards at the top
 */
const StatsCard: React.FC<StatsCardProps> = ({ data }) => {
    const { value, label, isHighlighted = false } = data;

    return (
        <div
            className={`
        rounded-xl p-6 transition-all duration-200
        ${isHighlighted
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }
      `}
            style={{
                backgroundColor: isHighlighted ? 'rgba(118, 149, 205, 0.1)' : 'rgba(156, 163, 175, 0.2)',
                borderColor: isHighlighted ? 'rgba(118, 149, 205, 0.3)' : 'transparent'
            }}
        >
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-qc-primary)' }}>
                {value}
            </div>
            <div className="text-sm md:text-base font-medium" style={{ color: 'var(--color-qc-dark)' }}>
                {label}
            </div>
        </div>
    );
};

/**
 * SearchBar component - handles search functionality
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
        onSearch(value);
    };

    return (
        <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                    className={`h-5 w-5 transition-all ${isLoading ? 'animate-pulse' : ''}`}
                    style={{ color: 'var(--color-qc-accent)' }}
                />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-4 rounded-xl border-0 text-qc-primary focus:outline-none focus:ring-2 transition-all duration-200 text-base ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            />
        </div>
    );
};

/**
 * PersonCard component - displays individual person information
 */
const PersonCard: React.FC<PersonCardProps> = ({ person, showMessages = false }) => {
    const { name, role, callCount, messageCount } = person;

    return (
        <div
            className="flex items-center justify-between p-4 rounded-xl mb-3 transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: 'rgba(156, 163, 175, 0.1)' }}
        >
            {/* Left side - Avatar and info */}
            <div className="flex items-center space-x-3">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: 'var(--color-qc-accent)' }}
                >
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="font-medium text-base" style={{ color: 'var(--color-qc-primary)' }}>
                        {name}
                    </div>
                    <div className="text-sm opacity-70" style={{ color: 'var(--color-qc-dark)' }}>
                        {role}
                    </div>
                </div>
            </div>

            {/* Right side - Call and message counts */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" style={{ color: 'var(--color-qc-accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-qc-primary)' }}>
                        {callCount}
                    </span>
                </div>
                {showMessages && messageCount !== undefined && (
                    <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" style={{ color: 'var(--color-qc-accent)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-qc-primary)' }}>
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
        <div
            className="rounded-xl p-6"
            style={{ backgroundColor: 'rgba(118, 149, 205, 0.08)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-qc-primary)' }}>
                        {title}
                    </h2>
                    <span
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: 'var(--color-qc-accent)',
                            color: 'white'
                        }}
                    >
                        {totalCount}
                    </span>
                </div>
                <button
                    className="text-sm font-medium hover:opacity-75 transition-opacity underline"
                    style={{ color: 'var(--color-qc-accent)' }}
                >
                    View more
                </button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="flex items-center space-x-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(156, 163, 175, 0.1)' }}>
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
                        <div className="text-center py-8" style={{ color: 'var(--color-qc-dark)' }}>
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
 * Main Dashboard component
 */
const Dashboard: React.FC<DashboardProps> = () => {
    // State management
    const [statsData, setStatsData] = useState<StatsCardData[]>([]);
    const [auditors, setAuditors] = useState<PersonData[]>([]);
    const [counsellors, setCounsellors] = useState<PersonData[]>([]);
    const [originalAuditors, setOriginalAuditors] = useState<PersonData[]>([]);
    const [originalCounsellors, setOriginalCounsellors] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches initial dashboard data on component mount
     */
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await MockApiService.fetchDashboardData();

                if (response.success) {
                    // Transform API data to component format
                    const transformedStats = DataTransformer.transformStats(response.stats);
                    const transformedAuditors = response.auditors.map(DataTransformer.transformAuditor);
                    const transformedCounsellors = response.counsellors.map(DataTransformer.transformCounsellor);

                    // Update state
                    setStatsData(transformedStats);
                    setAuditors(transformedAuditors);
                    setCounsellors(transformedCounsellors);
                    setOriginalAuditors(transformedAuditors);
                    setOriginalCounsellors(transformedCounsellors);
                } else {
                    setError(response.message || 'Failed to fetch dashboard data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                console.error('Dashboard data fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    /**
     * Handles search functionality with API call
     */
    const handleSearch = async (query: string) => {
        try {
            setIsSearching(true);
            setError(null);

            const response = await MockApiService.searchPeople(query);

            // Transform API response to component format
            const transformedAuditors = response.auditors.map(DataTransformer.transformAuditor);
            const transformedCounsellors = response.counsellors.map(DataTransformer.transformCounsellor);

            // Update filtered data
            setAuditors(transformedAuditors);
            setCounsellors(transformedCounsellors);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: '#f8fafc' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Stats Cards Loading */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="rounded-xl p-6 bg-gray-200 h-24"></div>
                            </div>
                        ))}
                    </div>

                    {/* Search Bar Loading */}
                    <div className="animate-pulse mb-8">
                        <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
                    </div>

                    {/* Content Loading */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {[...Array(2)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="rounded-xl p-6 bg-gray-200 h-96"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-qc-primary)' }}>
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--color-qc-accent)' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: '#f8fafc' }}>
            <div className="max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {statsData.map((stat, index) => (
                        <StatsCard key={index} data={stat} />
                    ))}
                </div>

                {/* Search Bar */}
                <SearchBar onSearch={handleSearch} isLoading={isSearching} />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Auditors Section */}
                    <PersonList
                        title="Auditors"
                        people={auditors}
                        totalCount={originalAuditors.length}
                        showMessages={true}
                        isLoading={isSearching}
                    />

                    {/* Counsellors Section */}
                    <PersonList
                        title="Counsellor"
                        people={counsellors}
                        totalCount={originalCounsellors.length}
                        showMessages={false}
                        isLoading={isSearching}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;