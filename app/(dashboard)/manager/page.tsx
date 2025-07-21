"use client"

import { Phone, Users, ClipboardList, Flag } from 'lucide-react';
import { DashboardStat, FlaggedCallsStats, FlaggedAudit, DailyAuditData } from '@/types/dashboard';
import StatCard from '@/components/StatCard';
import FlaggedCallsChart from '@/components/FlaggedCallsChart';
import LatestFlaggedAudits from '@/components/manager/LatestFlaggedAudits';
import WeeklyAuditChart from '@/components/DailyAuditChart';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

/**
 * Interface for the main dashboard data structure
 * Contains all the processed data needed to render the dashboard
 */
interface DashboardData {
    stats: DashboardStat[];
    flaggedCallsStats: FlaggedCallsStats;
    weeklyAuditData: DailyAuditData[];
    averageAuditPercentage: number;
    latestFlaggedAudits: FlaggedAudit[];
}

/**
 * Interface for the raw API response from the manager dashboard endpoint
 * Represents the exact structure returned by the backend API
 */
export interface DashboardAPIResponse {
    success: boolean;
    message: string;
    total_assigned_leads: number;
    total_audited_calls: number;
    flagged_calls: number;
    latest_flagged_audit: {
        id: string;
        call_id: string;
        auditor_id: string;
        auditor_name: string;
        score: number;
        comments: string;
        flag_reason: string;
        client_number: string;
        counsellor_name: string;
        updated_at: string;
        created_at: string;
    }[];
    last_7_days_data: {
        date: string;
        audited_calls: number;
    }[];
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
 * Manager Dashboard Component
 * 
 * This component displays the main dashboard for managers with key metrics including:
 * - Total leads assigned
 * - Total audited calls  
 * - Pending audits
 * - Flagged audits
 * - Charts for flagged calls distribution and weekly audit trends
 * - List of latest flagged audits
 * 
 * Features:
 * - Automatic caching to prevent unnecessary API calls
 * - Cache expiration after 5 minutes
 * - Graceful error handling with fallback to cached data
 * - Responsive design for mobile and desktop
 * 
 * @returns {JSX.Element} The rendered manager dashboard
 */
const ManagerDashboard: React.FC = () => {
    // Initialize component state with cached values if available
    const [managerDashboardData, setManagerDashboardData] = useState<DashboardData | null>(dashboardCache.data);
    const [error, setError] = useState<string>(dashboardCache.error || '');
    const [isLoading, setIsLoading] = useState<boolean>(dashboardCache.isLoading);

    /**
     * Transforms raw API response data into the format expected by dashboard components
     * 
     * @param {DashboardAPIResponse} apiData - Raw data from the API
     * @returns {DashboardData} Transformed data ready for component consumption
     */
    const transformDashboardData = (apiData: DashboardAPIResponse): DashboardData => {
        const { total_assigned_leads, total_audited_calls, flagged_calls, latest_flagged_audit, last_7_days_data } = apiData;

        // Calculate pending audits (difference between assigned and audited)
        const pending_audits = total_assigned_leads - total_audited_calls;

        // Create stats array for the stat cards
        const stats: DashboardStat[] = [
            { value: total_assigned_leads, label: 'Total leads assigned', icon: Phone },
            { value: total_audited_calls, label: 'Total audited calls', icon: Users },
            { value: pending_audits, label: 'Pending audits', icon: ClipboardList },
            { value: flagged_calls, label: 'Flagged audit', icon: Flag }
        ];

        // Calculate flagged calls percentages for the pie chart
        const flaggedCallsStats: FlaggedCallsStats = {
            flaggedPercentage: Number(((flagged_calls / total_audited_calls) * 100).toFixed(1)),
            nonFlaggedPercentage: Number((100 - (flagged_calls / total_audited_calls) * 100).toFixed(1)),
            totalCalls: total_audited_calls
        };

        // Transform weekly data for the line chart
        const weeklyAuditData: DailyAuditData[] = last_7_days_data.map((d, idx) => ({
            day: new Date(d.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            percentage: Math.floor((d.audited_calls / total_assigned_leads) * 100)
        }));

        // Calculate average audit percentage across the week
        const averageAuditPercentage =
            Math.trunc(
                (weeklyAuditData.reduce((sum, d) => sum + d.percentage, 0) / weeklyAuditData.length) * 100
            ) / 100;

        // Transform flagged audits data for the table
        const latestFlaggedAudits: FlaggedAudit[] = latest_flagged_audit.map((audit) => ({
            id: audit.id,
            auditorName: audit.auditor_name,
            callId: audit.call_id,
            timestamp: new Date(audit.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            flaggedAt: audit.updated_at,
            clientNumber: audit.client_number
        }));

        return {
            stats,
            flaggedCallsStats,
            weeklyAuditData,
            averageAuditPercentage,
            latestFlaggedAudits
        };
    };

    /**
     * Checks if the cached data is still valid based on the cache duration
     * 
     * @returns {boolean} True if cache is valid, false if expired or no cache exists
     */
    const isCacheValid = (): boolean => {
        if (!dashboardCache.timestamp) return false;
        return Date.now() - dashboardCache.timestamp < CACHE_DURATION;
    };

    /**
     * Fetches dashboard data from the API with intelligent caching
     * 
     * @param {boolean} force - If true, bypasses cache and forces a fresh API call
     * @returns {Promise<void>}
     */
    const fetchDashboardData = async (force: boolean = false): Promise<void> => {
        // Prevent multiple simultaneous API calls
        if (dashboardCache.isLoading) return;

        // Skip API call if we have valid cached data (unless forced)
        if (!force && dashboardCache.data && isCacheValid()) {
            return;
        }

        try {
            // Update loading state in both cache and component
            dashboardCache.isLoading = true;
            setIsLoading(true);
            setError('');

            // Make API call to fetch dashboard data
            const response = await axios.get<DashboardAPIResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/`, {
                withCredentials: true, // Include cookies for authentication
            });

            // Transform the raw API response
            const transformedData = transformDashboardData(response.data);

            // Update global cache with fresh data
            dashboardCache.data = transformedData;
            dashboardCache.timestamp = Date.now();
            dashboardCache.error = null;

            // Update component state
            setManagerDashboardData(transformedData);
        } catch (err: any) {
            // Handle API errors
            const errorMsg = err.message || 'Something went wrong';
            dashboardCache.error = errorMsg;
            setError(errorMsg);
        } finally {
            // Reset loading state
            dashboardCache.isLoading = false;
            setIsLoading(false);
        }
    };

    /**
     * Effect hook that runs on component mount
     * Checks for cached data and fetches fresh data if needed
     */
    useEffect(() => {
        // Check if we have valid cached data
        if (dashboardCache.data && isCacheValid()) {
            // Use cached data immediately for faster rendering
            setManagerDashboardData(dashboardCache.data);
            setError(dashboardCache.error || '');
            setIsLoading(false);
        } else {
            // Cache is stale or doesn't exist, fetch fresh data
            fetchDashboardData();
        }
    }, []);

    // Show loading spinner only if we don't have any data to display
    if (isLoading && !managerDashboardData) {
        return <Loader text='Loading Manager Dashboard' />;
    }

    // Show error page only if we have an error and no cached data to fall back to
    if (error && !managerDashboardData) {
        return <Error message={error}
            onRetry={() => fetchDashboardData(true)}
        />;
    }

    return (
        <div className="flex flex-col bg-white">
            <div className="flex-1">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {managerDashboardData && (
                            <>
                                {/* Stats Grid - Key metrics displayed as cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                                    {managerDashboardData.stats.map((stat, index) => (
                                        <StatCard key={index} stat={stat} />
                                    ))}
                                </div>

                                {/* Charts Section - Visual representations of data */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                                    {/* Flagged calls distribution pie chart */}
                                    <FlaggedCallsChart data={managerDashboardData.flaggedCallsStats} />

                                    {/* Weekly audit trend line chart */}
                                    <WeeklyAuditChart
                                        data={managerDashboardData.weeklyAuditData}
                                        averagePercentage={managerDashboardData.averageAuditPercentage}
                                    />
                                </div>

                                {/* Latest Flagged Audits Table */}
                                <LatestFlaggedAudits audits={managerDashboardData.latestFlaggedAudits} />
                            </>
                        )}

                        {/* Warning message if there's an error but we have cached data to show */}
                        {error && managerDashboardData && (
                            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                                Warning: Failed to refresh data. Showing cached data. Error: {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;