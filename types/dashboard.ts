/**
 * Interface for user profile data
 */
export interface UserProfile {
    name: string;
    id: string;
    team: string;
    role: string;
    email: string;
    manager?:string;
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
    clientNumber: string;
}

export interface LatestCalls {
    id: string;
    callStart: string;
    clientNumber: string;
}

/**
 * Props interface for LatestFlaggedAudits component
 */
export interface LatestFlaggedAuditsProps {
    audits: FlaggedAudit[];
}

export interface LatestAiAuditsProps{
    audits:LatestCalls[];
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

export /**
* Interface for transformed audit data structures
*/
interface AuditItem {
 id: string;
 callId: string;
 duration: number;
 confidence: number;
 tags: string[];
 summary: string;
 sentiments: 'Positive' | 'Negative' | 'Neutral';
 anomalies: string;
 recordingUrl?: string;
 callRecording?: {
   duration: string;
   url?: string;
 };
}

 /**
 * Interface for individual person data displayed in the UI
 */
 export interface PersonData {
    id: string;
    name: string;
    role: string;
    callCount: number;
    messageCount?: number;
    email?: string;
    isActive: boolean;
}

/**
 * Interface for stats card data
 */
export interface StatsCardData {
    value: number;
    label: string;
    icon: React.ComponentType<any>;
    isHighlighted?: boolean;
}

/**
 * Interface for individual flagged review data structure
 * Represents the processed data format used by the UI components
 */
export interface FlaggedReview {
    id: string;
    callDateTime: string;
    callNumber: string;
    counsellor: string;
    auditorComment: string;
    linkedAuditor: string;
    flagReason: string;
  }