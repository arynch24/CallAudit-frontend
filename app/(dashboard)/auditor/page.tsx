"use client"

import { Stamp, FileClock, Phone, Flag } from 'lucide-react';
import { UserProfile, DashboardStat, FlaggedCallsStats, FlaggedAudit, DailyAuditData } from '@/types/dashboard';
import StatCard from '@/components/StatCard';
import FlaggedCallsChart from '@/components/FlaggedCallsChart';
import LatestFlaggedAudits from '@/components/LatestFlaggedAudits';
import DailyAuditChart from '@/components/DailyAuditChart';

/**
 * Main dashboard data interface
 */
interface DashboardData {
  stats: DashboardStat[];
  flaggedCallsStats: FlaggedCallsStats;
  dailyAuditData: DailyAuditData[];
  averageAuditPercentage: number;
  latestFlaggedAudits: FlaggedAudit[];
  userProfile: UserProfile;
}

/**
 * Mock data for dashboard - simulates API response
 */
const mockDashboardData: DashboardData = {
  stats: [
    { value: 34, label: 'Total audit calls', icon: Stamp },
    { value: 66, label: 'Pending Audits', icon: FileClock },
    { value: 100, label: 'Total Leads Assigned', icon: Phone },
    { value: 10, label: 'Flagged Calls', icon: Flag }
  ],
  flaggedCallsStats: {
    flaggedPercentage: 12.8,
    nonFlaggedPercentage: 87.2,
    totalCalls: 34
  },
  dailyAuditData: [
    { day: 'd-1', percentage: 45 },
    { day: 'd-2', percentage: 65 },
    { day: 'd-3', percentage: 85 },
    { day: 'd-4', percentage: 90 },
    { day: 'd-5', percentage: 80 },
    { day: 'd-6', percentage: 95 }
  ],
  averageAuditPercentage: 75,
  latestFlaggedAudits: [
    {
      id: '1',
      auditorName: 'Deepak Joshi',
      callId: 'CALL_3245',
      timestamp: '3:34PM',
      flaggedAt: '2024-01-15T15:34:00Z'
    },
    {
      id: '2',
      auditorName: 'Deepak Joshi',
      callId: 'CALL_3229',
      timestamp: '2:34PM',
      flaggedAt: '2024-01-15T14:34:00Z'
    }
  ],
  userProfile: {
    name: 'Aryan Chauhan',
    managerId: 'PWSKL001',
    team: 'Alpha A1',
    role: 'Manager'
  }
};


/**
 * Main ManagerDashboard Component - Root component that orchestrates all dashboard sections
 * In a real application, this would fetch data from an API
 */
const ManagerDashboard: React.FC = () => {
  // In a real app, this would be an API call
  const dashboardData = mockDashboardData;

  return (
    <div className="flex flex-col bg-white">
      {/* Main Content - Scrollable */}
      <div className="flex-1 ">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {dashboardData.stats.map((stat, index) => (
                <StatCard key={index} stat={stat} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <FlaggedCallsChart data={dashboardData.flaggedCallsStats} />
              <DailyAuditChart
                data={dashboardData.dailyAuditData}
                averagePercentage={dashboardData.averageAuditPercentage}
              />
            </div>

            {/* Latest Flagged Audits */}
            <LatestFlaggedAudits audits={dashboardData.latestFlaggedAudits} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;