"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Flag, Check, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

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

/**
 * Interface for transformed audit data structures
 */
interface AuditItem {
  id: string;
  callId: string;
  duration: number;
  confidence: number;
  tags: string[];
  type: string;
  summary: string;
  sentiments: 'Positive' | 'Negative' | 'Neutral';
  anomalies: string;
  recordingUrl?: string;
  callRecording?: {
    duration: string;
    url?: string;
  };
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
 * Props for the main AI Audits Dashboard component
 */
interface AiAuditsDashboardProps {
  onAuditSelect?: (auditId: string) => void;
  onAuditApprove?: (auditId: string) => void;
}

/**
 * Props for individual audit queue item
 */
interface AuditQueueItemProps {
  audit: AuditItem;
  isSelected: boolean;
  onSelect: (auditId: string) => void;
  onQuickApprove: (auditId: string) => void;
}

/**
 * Props for the audit details panel
 */
interface AuditDetailsProps {
  audit: AuditItem | null;
  onApprove: (auditId: string, comments?: string, isFlag?: boolean, flagReasons?: string) => void;
  onApproveLoading: boolean;
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

/**
 * Individual audit item component for the queue
 */
const AuditQueueItem: React.FC<AuditQueueItemProps> = ({
  audit,
  isSelected,
  onSelect,
  onQuickApprove
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 51) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100';
    if (confidence >= 51) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <div
      className={`p-4 mb-3 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
        ? 'border-qc-accent bg-qc-light/15'
        : 'border-qc-primary/40 hover:border-qc-light hover:bg-qc-light/5'
        }`}
      onClick={() => onSelect(audit.id)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-qc-primary truncate">
              Call ID: {audit.callId}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Duration: {audit.duration} minutes</span>
            <span className="hidden sm:inline">•</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {audit.type}
            </span>
          </div>

          {audit.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {audit.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-qc-light/20 text-[--color-qc-dark] rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className={`w-fit px-2 py-1 text-xs rounded-full ${getConfidenceBg(audit.confidence)} ${getConfidenceColor(audit.confidence)}`}>
            AI Confidence: {audit.confidence}%
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickApprove(audit.id);
              }}
              className="px-3 py-1 bg-qc-accent text-white rounded-md hover:bg-qc-dark transition-colors text-sm"
            >
              Quick Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(audit.id);
              }}
              className="px-3 py-1 border border-qc-accent text-qc-accent rounded-md hover:bg-qc-accent hover:text-white transition-colors text-sm"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Audit details panel component
 */
const AuditDetails: React.FC<AuditDetailsProps> = ({
  audit,
  onApprove,
  onApproveLoading
}) => {
  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [comments, setComments] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setComments('');
    setFlagReason('');
    setShowFlagInput(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioDuration(0);
    setAudioError('');

    // Reset audio if audit changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audit]);

  // Initialize audio when audit changes
  useEffect(() => {
    if (audit?.recordingUrl) {
      const audio = new Audio();
      audioRef.current = audio;

      audio.addEventListener('loadstart', () => {
        setAudioLoading(true);
        setAudioError('');
      });

      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
        setAudioLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener('error', () => {
        setAudioLoading(false);
        setAudioError('Failed to load audio');
        setIsPlaying(false);
      });

      audio.src = audit.recordingUrl;
      audio.preload = 'metadata';

      return () => {
        audio.pause();
        audio.remove();
      };
    }
  }, [audit?.recordingUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          setAudioError('Failed to play audio');
          setIsPlaying(false);
        });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * audioDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleApproveClick = () => {
    if (audit) {
      onApprove(audit.id, comments.trim() || undefined, showFlagInput, flagReason.trim());
    }
  };

  if (!audit) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChevronRight className="w-8 h-8 text-gray-400" />
          </div>
          <p>Select an audit to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-semibold text-qc-primary">
              Current Review
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Call ID:</span>
              <span className="font-medium text-qc-primary">{audit.callId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">AI Confidence:</span>
            <span className="font-medium text-qc-accent">{audit.confidence}%</span>
          </div>
        </div>

        {/* Call Recording */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Call Recording</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            {audioError ? (
              <div className="text-red-600 text-sm mb-2">{audioError}</div>
            ) : null}

            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={togglePlayPause}
                disabled={audioLoading || !!audioError || !audit.recordingUrl}
                className="w-8 h-8 bg-qc-accent text-white rounded-full flex items-center justify-center hover:bg-qc-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {audioLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <div className="flex-1">
                <div
                  className="bg-gray-300 rounded-full h-2 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="bg-qc-accent h-2 rounded-full transition-all duration-100"
                    style={{
                      width: audioDuration > 0 ? `${(currentTime / audioDuration) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>

              <span className="text-sm text-gray-600 min-w-[80px] text-right">
                {formatTime(currentTime)} / {formatTime(audioDuration || audit.duration * 60)}
              </span>
            </div>

            {!audit.recordingUrl && (
              <div className="text-gray-500 text-sm">No recording URL available</div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {audit.summary}
            </p>
          </div>
        </div>

        {/* Sentiments */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Sentiments</h3>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${audit.sentiments === 'Positive'
            ? 'bg-green-100 text-green-800'
            : audit.sentiments === 'Negative'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
            }`}>
            {audit.sentiments}
          </span>
        </div>

        {/* Anomalies */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Anomalies</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {audit.anomalies}
            </p>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Comments</h3>
          <textarea
            placeholder="Write comment on audit..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-qc-accent focus:border-transparent"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Flag Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowFlagInput(!showFlagInput)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Flag
            </button>
          </div>
          {showFlagInput && (
            <div className="space-y-3">
              <textarea
                placeholder="Write reason for flag..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-qc-accent focus:border-transparent"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex pt-4 border-t border-gray-200">
        <button
          onClick={handleApproveClick}
          disabled={onApproveLoading}
          className={`
      flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors
      ${onApproveLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-qc-accent hover:bg-qc-dark text-white'}
    `}
        >
          <Check className="w-4 h-4" />
          {onApproveLoading ? (
            <span className="animate-pulse">Approving...</span>
          ) : (
            <span>Approve</span>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Main AI Audits Dashboard Component
 */
const AiAuditsDashboard: React.FC<AiAuditsDashboardProps> = ({
  onAuditSelect,
  onAuditApprove
}) => {
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
      onAuditSelect?.(auditId);
    }
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

      onAuditApprove?.(auditId);

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
    <div className="min-h-screen p-4">
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

                  <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
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