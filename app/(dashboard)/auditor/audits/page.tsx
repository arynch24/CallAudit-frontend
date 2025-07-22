"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import { AuditItem } from '@/types/dashboard';
import AuditDetails from '@/components/auditor/AuditDetails';
import AuditQueueItem from '@/components/auditor/AuditQueueItem';

/**
 * Interface for the raw API response from the auditor calls endpoint
 */
interface AuditorCallsApiResponse {
  success: boolean;
  message: string;
  calls: {
    id: string;
    client_number: string;
    duration: number;
    tags: string;
    ai_confidence: number;
    recording_url: string;
    summary: string;
    sentiment_score: number;
    anomalies: string;
  }[];
  call_stats: {
    audited: number;
    unaudited: number;
    flagged: number;
  };
}

/**
 * Interface for approve audit API response
 */
interface ApproveAuditResponse {
  success: boolean;
  message: string;
}

interface AuditStats {
  totalCompleted: number;
  totalPending: number;
  flaggedCount: number;
}

interface AuditsDashboardData {
  audits: AuditItem[];
  stats: AuditStats;
}

/**
 * Global cache object that persists across component re-renders
 */
interface AuditDashboardCache {
  data: AuditsDashboardData | null;
  timestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

const auditDashboardCache: AuditDashboardCache = {
  data: null,
  timestamp: null,
  isLoading: false,
  error: null
};

/**
 * Cache duration in milliseconds (2 minutes for more frequent updates)
 */
const CACHE_DURATION = 2 * 60 * 1000;

const AiAuditsDashboard: React.FC = () => {
  const [auditsDashboardData, setAuditsDashboardData] = useState<AuditsDashboardData | null>(auditDashboardCache.data);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [error, setError] = useState<string>(auditDashboardCache.error || '');
  const [isLoading, setIsLoading] = useState<boolean>(auditDashboardCache.isLoading);
  const [isApproveLoading, setIsApproveLoading] = useState<boolean>(false);

  /**
   * Transforms raw API response data into the format expected by dashboard components
   */
  const transformAuditData = (apiData: AuditorCallsApiResponse): AuditsDashboardData => {
    const { calls, call_stats } = apiData;

    // Transform calls to audit items
    const transformedAudits: AuditItem[] = calls ? calls.map(call => ({
      id: call.id,
      callId: call.client_number,
      duration: call.duration,
      confidence: call.ai_confidence,
      tags: call.tags ? call.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      type: (() => {
        if (!call.tags) return 'General';
        const tagLower = call.tags.toLowerCase();
        if (tagLower.includes('voice assistant')) return 'Voice Assistant';
        if (tagLower.includes('support')) return 'Support';
        if (tagLower.includes('sales')) return 'Sales';
        if (tagLower.includes('intermediate')) return 'Intermediate';
        return 'General';
      })(),
      summary: call.summary || 'No summary available',
      sentiments: call.sentiment_score > 0 ? 'Positive' : call.sentiment_score < 0 ? 'Negative' : 'Neutral',
      anomalies: call.anomalies || 'No anomalies detected',
      recordingUrl: call.recording_url,
      callRecording: {
        duration: `${call.duration} min`,
        url: call.recording_url,
      },
    })) : [];

    // Transform stats
    const transformedStats: AuditStats = {
      totalCompleted: call_stats?.audited || 0,
      totalPending: call_stats?.unaudited || 0,
      flaggedCount: call_stats?.flagged || 0,
    };

    return {
      audits: transformedAudits,
      stats: transformedStats
    };
  };

  /**
   * Checks if the cached data is still valid
   */
  const isCacheValid = (): boolean => {
    if (!auditDashboardCache.timestamp) return false;
    return Date.now() - auditDashboardCache.timestamp < CACHE_DURATION;
  };

  /**
   * Fetches audit data from the API with intelligent caching
   */
  const fetchAuditData = async (force: boolean = false): Promise<void> => {
    if (auditDashboardCache.isLoading) return;

    if (!force && auditDashboardCache.data && isCacheValid()) {
      return;
    }

    try {
      auditDashboardCache.isLoading = true;
      setIsLoading(true);
      setError('');

      const response = await axios.get<AuditorCallsApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auditor/calls`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const transformedData = transformAuditData(response.data);

      auditDashboardCache.data = transformedData;
      auditDashboardCache.timestamp = Date.now();
      auditDashboardCache.error = null;

      setAuditsDashboardData(transformedData);

      // Auto-select first audit if available and no audit is currently selected
      if (transformedData.audits.length > 0 && !selectedAudit) {
        setSelectedAudit(transformedData.audits[0]);
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch audit data';
      auditDashboardCache.error = errorMsg;
      setError(errorMsg);
    } finally {
      auditDashboardCache.isLoading = false;
      setIsLoading(false);
    }
  };

  /**
   * Handles audit selection
   */
  const handleAuditSelect = (auditId: string) => {
    if (!auditsDashboardData) return;

    const audit = auditsDashboardData.audits.find(a => a.id === auditId);
    if (audit) {
      setSelectedAudit(audit);
      // You can add additional logic here if needed, like updating URL params
      console.log('Audit selected:', auditId);
    }
  };

  /**
   * Handle audit approve callback
   */
  const handleAuditApprove = (auditId: string) => {
    // You can add additional logic here if needed
    console.log('Audit approved:', auditId);
  };

  /**
   * Unified handler for both approve and flag operations
   */
  const handleApprove = async (auditId: string, comments?: string, isFlag: boolean = false, flagReasons: string = '') => {
    try {
      const requestData = {
        call_id: auditId,
        comments: comments || '',
        is_flag: isFlag,
        flag_reasons: flagReasons,
      };
      setIsApproveLoading(true);

      const response = await axios.post<ApproveAuditResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auditor/approve-audit`,
        requestData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Update local state
      if (auditsDashboardData) {
        const updatedAudits = auditsDashboardData.audits.filter(a => a.id !== auditId);
        const updatedStats = {
          ...auditsDashboardData.stats,
          totalCompleted: auditsDashboardData.stats.totalCompleted + 1,
          totalPending: Math.max(0, auditsDashboardData.stats.totalPending - 1),
          flaggedCount: isFlag
            ? auditsDashboardData.stats.flaggedCount + 1
            : auditsDashboardData.stats.flaggedCount
        };

        const updatedData = {
          audits: updatedAudits,
          stats: updatedStats
        };

        setAuditsDashboardData(updatedData);
        auditDashboardCache.data = updatedData;

        // Select next audit if current one was processed
        if (selectedAudit?.id === auditId) {
          setSelectedAudit(updatedAudits.length > 0 ? updatedAudits[0] : null);
        }
      }

      handleAuditApprove(auditId);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${isFlag ? 'flag' : 'approve'} audit`;
      setError(errorMsg);
    } finally {
      setIsApproveLoading(false);
    }
  };

  useEffect(() => {
    if (auditDashboardCache.data && isCacheValid()) {
      setAuditsDashboardData(auditDashboardCache.data);
      setError(auditDashboardCache.error || '');
      setIsLoading(false);

      // Auto-select first audit if available
      if (auditDashboardCache.data.audits.length > 0 && !selectedAudit) {
        setSelectedAudit(auditDashboardCache.data.audits[0]);
      }
    } else {
      fetchAuditData();
    }
  }, []);

  // Show loading spinner only if we don't have any data to display
  if (isLoading && !auditsDashboardData) {
    return <Loader text='Loading AI Audits Dashboard' />;
  }

  // Show error page only if we have an error and no cached data to fall back to
  if (error && !auditsDashboardData) {
    return <Error message={error} onRetry={() => fetchAuditData(true)} />;
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {auditsDashboardData && (
          <>
            {/* Header */}
            <div className="w-fit mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                <span className="text-sm font-medium">Flagged audits</span>
                <span className="bg-red-200 text-red-900 px-2 py-1 rounded text-sm font-bold">
                  {auditsDashboardData.stats.flaggedCount}
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Panel - Audit Queue */}
              <div className="lg:col-span-3">
                <div className="bg-qc-light/10 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-xl font-semibold text-qc-primary mb-2 sm:mb-0">
                      AI Audits Queue
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">{auditsDashboardData.stats.totalCompleted}</span>/
                        <span className="font-semibold">{auditsDashboardData.stats.totalPending}</span>
                        <span className="ml-1">completed vs pending</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[calc(100vh-270px)] scrollbar-hide overflow-y-auto">
                    {auditsDashboardData.audits.map((audit) => (
                      <AuditQueueItem
                        key={audit.id}
                        audit={audit}
                        isSelected={selectedAudit?.id === audit.id}
                        onSelect={handleAuditSelect}
                        onQuickApprove={handleApprove}
                      />
                    ))}

                    {auditsDashboardData.audits.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No audits in queue</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Audit Details */}
              <div className="lg:col-span-2">
                <AuditDetails
                  audit={selectedAudit}
                  onApprove={handleApprove}
                  onApproveLoading={isApproveLoading}
                />
              </div>
            </div>

            {/* Warning message if there's an error but we have cached data to show */}
            {error && auditsDashboardData && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                Warning: Failed to refresh data. Showing cached data. Error: {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AiAuditsDashboard;