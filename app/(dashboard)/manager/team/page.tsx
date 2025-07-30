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
        email: string;
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
 * Data transformation utilities
 */
function transformAuditor(apiAuditor: AuditorsApiResponse['auditors'][0]): PersonData {
    return {
        id: apiAuditor.id,
        name: apiAuditor.name,
        role: "auditor",
        callCount: apiAuditor.total_assigned_leads,
        messageCount: apiAuditor.total_audited_leads,
        isActive: apiAuditor.is_active,
        email: apiAuditor.email
    };
}

function transformCounsellor(apiCounsellor: CounsellorsApiResponse['counsellors'][0]): PersonData {
    return {
        id: apiCounsellor.id,
        name: apiCounsellor.name,
        role: "counsellor",
        callCount: apiCounsellor.total_calls,
        isActive: apiCounsellor.is_active,
        email: apiCounsellor.email
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
 * Fetches dashboard data from API endpoints
 * 
 * @returns {Promise<DashboardData>} Combined dashboard data
 */
async function fetchDashboardData(): Promise<DashboardData> {
    try {
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

        return dashboardData;
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Failed to fetch dashboard data';
        throw errorMsg;
    }
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
 * Main Dashboard component
 * 
 * Features:
 * - Real-time data fetching from API
 * - Instant search filtering
 * - Error handling with retry functionality
 */
const ManagerTeamDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [displayAuditors, setDisplayAuditors] = useState<PersonData[]>([]);
    const [displayCounsellors, setDisplayCounsellors] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const { openAddMemberModal, setOpenAddMemberModal } = useDashboard();

    /**
     * Fetches dashboard data from API
     * 
     * @returns {Promise<void>}
     */
    const fetchData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError('');

            const data = await fetchDashboardData();

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
     * Fetches dashboard data from API
     */
    useEffect(() => {
        fetchData();
    }, []);

    // Show loading spinner while fetching data
    if (isLoading) {
        return (
            <Loader
                text='Loading Teams'
            />
        );
    }

    // Show error page if there's an error
    if (error) {
        return (
            <Error
                title='Something went wrong'
                message={error}
                onRetry={fetchData}
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
                                    onRefresh={fetchData}
                                />

                                {/* Counsellors Section */}
                                <PersonList
                                    title="Counsellors"
                                    people={displayCounsellors}
                                    totalCount={dashboardData.totalCounsellors}
                                    showMessages={false}
                                    isLoading={false}
                                    onRefresh={fetchData}
                                />
                            </div>
                        </>
                    )}

                    {
                        openAddMemberModal && (
                            <AddMember
                                onCancel={() => setOpenAddMemberModal(false)}
                                onRefresh={fetchData}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default ManagerTeamDashboard;