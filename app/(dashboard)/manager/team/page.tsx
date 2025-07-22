"use client";

import React, { useState, useEffect } from 'react';
import { Phone, Users, UserCheck, Plus } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import PersonList from '@/components/manager/PersonList';
import { PersonData, StatsCardData } from '@/types/dashboard';
import StatsCard from '@/components/manager/StatCard';
import SearchBar from '@/components/manager/SearchBar';
import AddMember from '@/components/manager/AddMember';
import { useDashboard } from '@/context/DashboardContext';

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
        is_active: boolean;
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
        is_active: boolean;
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
        role: "auditor",
        callCount: apiAuditor.total_assigned_leads,
        messageCount: apiAuditor.total_audited_leads,
        isActive: apiAuditor.is_active
    };
}

function transformCounsellor(apiCounsellor: CounsellorsApiResponse['counsellors'][0]): PersonData {
    return {
        id: apiCounsellor.id,
        name: apiCounsellor.name,
        role: "counsellor",
        callCount: apiCounsellor.total_calls,
        isActive: apiCounsellor.is_active
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
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/auditors`, {
                withCredentials: true
            }),
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/counsellor`, {
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
    const { openAddMemberModal, setOpenAddMemberModal } = useDashboard();

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

        // Instantly filter the data
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

                            <div className='flex justify-between items-center gap-4'>
                                {/* Search Bar */}
                                <SearchBar onSearch={handleSearch} />
                                {/* Add Button */}
                                <div className='relative -top-4 bg-gray-300 p-2 rounded-full text-qc-dark/80 hover:text-qc-dark hover:bg-gray-400 transition-all duration-200 cursor-pointer'>
                                    <Plus size={36} onClick={() => setOpenAddMemberModal(true)} />
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                {/* Auditors Section */}
                                <PersonList
                                    title="Auditors"
                                    people={displayAuditors}
                                    totalCount={dashboardData.totalAuditors}
                                    showMessages={true}
                                    isLoading={false}
                                    onRefresh={() => fetchData(true)}
                                />

                                {/* Counsellors Section */}
                                <PersonList
                                    title="Counsellors"
                                    people={displayCounsellors}
                                    totalCount={dashboardData.totalCounsellors}
                                    showMessages={false}
                                    isLoading={false}
                                    onRefresh={() => fetchData(true)}
                                />
                            </div>
                        </>
                    )}

                    {
                        openAddMemberModal && (
                            <AddMember
                                onCancel={() => setOpenAddMemberModal(false)}
                                onRefresh={() => fetchData(true)}
                            />
                        )
                    }

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