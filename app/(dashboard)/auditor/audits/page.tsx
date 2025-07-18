"use client";

import React, { useState, useEffect } from 'react';
import { Play, Flag, Check, X, ChevronRight } from 'lucide-react';

/**
 * Type definitions for AI Audit data structures
 */
interface AuditItem {
  id: string;
  callId: string;
  duration: number;
  confidence: number;
  tags: string[];
  type: 'Voice Assistant' | 'Intermediate' | string;
  summary?: string;
  sentiments?: 'Positive' | 'Negative' | 'Neutral';
  anomalies?: string[];
  comments?: string;
  callRecording?: {
    duration: string;
    url?: string;
  };
}

interface AuditQueueResponse {
  audits: AuditItem[];
  totalCompleted: number;
  totalPending: number;
  flaggedCount: number;
}

interface AuditDetailsResponse extends AuditItem {
  detailedSummary: string;
  transcript?: string;
  analysisDetails?: {
    keyPoints: string[];
    riskFactors: string[];
    recommendations: string[];
  };
}

/**
 * Props for the main AI Audits Dashboard component
 */
interface AiAuditsDashboardProps {
  onAuditSelect?: (auditId: string) => void;
  onAuditApprove?: (auditId: string) => void;
  onAuditReject?: (auditId: string) => void;
  onAuditFlag?: (auditId: string, reason: string) => void;
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
  onApprove: (auditId: string) => void;
  onReject: (auditId: string) => void;
  onFlag: (auditId: string, reason: string) => void;
}

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
      className={`p-4 mb-3 rounded-lg border transition-all  duration-200 cursor-pointer ${isSelected
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

        <div className='flex flex-col gap-4 items-end'>
          <div className={`w-fit px-2 py-1 text-xs rounded-full ${getConfidenceBg(audit.confidence)} ${getConfidenceColor(audit.confidence)}`}>
            AI Confidence: {audit.confidence}%
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickApprove(audit.id);
              }}
              className="px-3 py-1 bg-qc-accent text-white rounded-md hover:bg-[--color-qc-dark] transition-colors text-sm"
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
  onReject,
  onFlag
}) => {
  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);

  const handleFlag = () => {
    if (flagReason.trim() && audit) {
      onFlag(audit.id, flagReason.trim());
      setFlagReason('');
      setShowFlagInput(false);
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <button className="w-8 h-8 bg-qc-accent text-white rounded-full flex items-center justify-center hover:bg-[--color-qc-dark] transition-colors">
              <Play className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-gray-300 rounded-full h-2">
              <div className="bg-qc-accent h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <span className="text-sm text-gray-600">
              {audit.callRecording?.duration || '8.3 min'}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {audit.summary || 'The customer called to inquire about a billing discrepancy. The agent clarified the charges and offered a 10% discount as a goodwill gesture. The call ended with the customer expressing satisfaction.'}
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
            {audit.sentiments || 'Positive'}
          </span>
        </div>

        {/* Anomalies */}
        <div className="mb-6">
          <h3 className="font-semibold text-qc-primary mb-3">Anomalies</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {audit.anomalies?.[0] || 'Agent briefly interrupted the customer twice. Slight background noise was present throughout the call.'}
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
            defaultValue={audit.comments || ''}
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
            {showFlagInput && (
              <input
                type="text"
                placeholder="write reason for flag..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-accent focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleFlag()}
              />
            )}
          </div>
          {showFlagInput && (
            <button
              onClick={handleFlag}
              disabled={!flagReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Flag
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onApprove(audit.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-qc-accent text-white rounded-lg hover:bg-[--color-qc-dark] transition-colors"
        >
          <Check className="w-4 h-4" />
          Approve Audit
        </button>
        <button
          onClick={() => onReject(audit.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Reject Audit
        </button>
      </div>
    </div>
  );
};

/**
 * Main AI Audits Dashboard Component
 * 
 * This component manages the entire audit review workflow including:
 * - Displaying audit queue with pagination
 * - Handling audit selection and preview
 * - Managing audit actions (approve, reject, flag)
 * - Responsive design for mobile and desktop
 */
const AiAuditsDashboard: React.FC<AiAuditsDashboardProps> = ({
  onAuditSelect,
  onAuditApprove,
  onAuditReject,
  onAuditFlag
}) => {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCompleted: 39,
    totalPending: 80,
    flaggedCount: 23
  });

  /**
   * Simulates API call to fetch audit queue
   */
  const fetchAuditQueue = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAudits: AuditItem[] = [
        {
          id: '1',
          callId: 'PWS01',
          duration: 12.5,
          confidence: 50,
          tags: ['Voice Assistant'],
          type: 'Voice Assistant',
          summary: 'Customer inquiry about billing discrepancy with satisfactory resolution.',
          sentiments: 'Positive'
        },
        {
          id: '2',
          callId: 'PWS01',
          duration: 12.5,
          confidence: 69,
          tags: ['Intermediate'],
          type: 'Intermediate',
          summary: 'Technical support call with complex troubleshooting steps.',
          sentiments: 'Neutral'
        },
        {
          id: '3',
          callId: 'PWS01',
          duration: 12.5,
          confidence: 79,
          tags: ['Sales'],
          type: 'Sales',
          summary: 'Product inquiry leading to successful conversion.',
          sentiments: 'Positive'
        },
        {
          id: '4',
          callId: 'PWS01',
          duration: 19.2,
          confidence: 89,
          tags: ['Support', 'Escalation'],
          type: 'Support',
          summary: 'Customer complaint requiring supervisor intervention.',
          sentiments: 'Negative'
        }
      ];

      setAudits(mockAudits);
      if (mockAudits.length > 0) {
        setSelectedAudit(mockAudits[0]);
      }
    } catch (error) {
      console.error('Error fetching audit queue:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles audit selection
   */
  const handleAuditSelect = (auditId: string): void => {
    const audit = audits.find(a => a.id === auditId);
    if (audit) {
      setSelectedAudit(audit);
      onAuditSelect?.(auditId);
    }
  };

  /**
   * Handles quick approval of an audit
   */
  const handleQuickApprove = (auditId: string): void => {
    // Update audit status locally
    setAudits(prev => prev.filter(a => a.id !== auditId));

    // If this was the selected audit, select the next one
    if (selectedAudit?.id === auditId) {
      const remainingAudits = audits.filter(a => a.id !== auditId);
      setSelectedAudit(remainingAudits.length > 0 ? remainingAudits[0] : null);
    }

    onAuditApprove?.(auditId);
  };

  /**
   * Handles audit approval
   */
  const handleApprove = (auditId: string): void => {
    handleQuickApprove(auditId);
  };

  /**
   * Handles audit rejection
   */
  const handleReject = (auditId: string): void => {
    setAudits(prev => prev.filter(a => a.id !== auditId));

    if (selectedAudit?.id === auditId) {
      const remainingAudits = audits.filter(a => a.id !== auditId);
      setSelectedAudit(remainingAudits.length > 0 ? remainingAudits[0] : null);
    }

    onAuditReject?.(auditId);
  };

  /**
   * Handles audit flagging
   */
  const handleFlag = (auditId: string, reason: string): void => {
    setStats(prev => ({ ...prev, flaggedCount: prev.flaggedCount + 1 }));
    onAuditFlag?.(auditId, reason);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAuditQueue();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-qc-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-scree p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="w-fit mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
            <span className="text-sm font-medium">Flagged audits</span>
            <span className="bg-red-200 text-red-900 px-2 py-1 rounded text-sm font-bold">
              {stats.flaggedCount}
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
                <span className="text-sm text-gray-600">
                  <span className="font-semibold">{stats.totalCompleted}</span>/
                  <span className="font-semibold">{stats.totalPending}</span>
                  <span className="ml-1">completed vs pending</span>
                </span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {audits.map((audit) => (
                  <AuditQueueItem
                    key={audit.id}
                    audit={audit}
                    isSelected={selectedAudit?.id === audit.id}
                    onSelect={handleAuditSelect}
                    onQuickApprove={handleQuickApprove}
                  />
                ))}

                {audits.length === 0 && (
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
              onReject={handleReject}
              onFlag={handleFlag}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAuditsDashboard;