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
    dailyAuditData: DailyAuditData[];
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
 * - Real-time data fetching from API
 * - Graceful error handling with retry functionality
 * - Responsive design for mobile and desktop
 * 
 * @returns {JSX.Element} The rendered manager dashboard
 */
const ManagerDashboard: React.FC = () => {
    const [managerDashboardData, setManagerDashboardData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
        const dailyAuditData: DailyAuditData[] = last_7_days_data.map((d, idx) => ({
            day: new Date(d.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            percentage: Math.floor((d.audited_calls / total_assigned_leads) * 100)
        }));

        // Calculate average audit percentage across the week
        const averageAuditPercentage =
            Math.trunc(
                (dailyAuditData.reduce((sum, d) => sum + d.percentage, 0) / dailyAuditData.length) * 100
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
            dailyAuditData,
            averageAuditPercentage,
            latestFlaggedAudits
        };
    };

    /**
     * Fetches dashboard data from the API
     * 
     * @returns {Promise<void>}
     */
    const fetchDashboardData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError('');

            // Make API call to fetch dashboard data
            const response = await axios.get<DashboardAPIResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/`, {
                withCredentials: true, // Include cookies for authentication
            });

            // Transform the raw API response
            const transformedData = transformDashboardData(response.data);

            // Update component state
            setManagerDashboardData(transformedData);
        } catch (err: any) {
            // Handle API errors
            const errorMsg = err.response?.data?.message || 'Something went wrong';
            setError(errorMsg);
        } finally {
            // Reset loading state
            setIsLoading(false);
        }
    };

    /**
     * Effect hook that runs on component mount
     * Fetches dashboard data from API
     */
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Show loading spinner while fetching data
    if (isLoading) {
        return <Loader text='Loading Manager Dashboard' />;
    }

    // Show error page if there's an error
    if (error) {
        return <Error message={error}
            onRetry={fetchDashboardData}
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
                                        data={managerDashboardData.dailyAuditData}
                                        averagePercentage={managerDashboardData.averageAuditPercentage}
                                    />
                                </div>

                                {/* Latest Flagged Audits Table */}
                                <LatestFlaggedAudits audits={managerDashboardData.latestFlaggedAudits} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;