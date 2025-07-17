/**
 * Interface for user profile data
 */
export interface UserProfile {
    name: string;
    managerId: string;
    team: string;
    role: string;
}

/**
 * Props interface for StickyHeader component
 */
export interface StickyHeaderProps {
    profile: UserProfile;
    header?: string;
}


/**
 * Props interface for ProfileCard component
 */
export interface ProfileCardProps {
    profile: UserProfile;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Base interface for dashboard statistics
 */
export interface DashboardStat {
    value: number;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props interface for StatCard component
 */
export interface StatCardProps {
    stat: DashboardStat;
}

/**
 * Props interface for FlaggedCallsChart component
 */
export interface FlaggedCallsChartProps {
    data: FlaggedCallsStats;
}

/**
 * Interface for flagged calls statistics
 */
export interface FlaggedCallsStats {
    flaggedPercentage: number;
    nonFlaggedPercentage: number;
    totalCalls: number;
}


/**
 * Interface for flagged audit entries
 */
export interface FlaggedAudit {
    id: string;
    auditorName: string;
    callId: string;
    timestamp: string;
    flaggedAt: string;
}

/**
 * Props interface for LatestFlaggedAudits component
 */
export interface LatestFlaggedAuditsProps {
    audits: FlaggedAudit[];
}

/**
 * Props interface for WeeklyAuditChart component
 */
export interface DailyAuditChartProps {
    data: DailyAuditData[];
    averagePercentage: number;
}

/**
 * Interface for weekly audit data points
 */
export interface DailyAuditData {
    day: string;
    percentage: number;
}
