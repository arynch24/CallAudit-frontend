"use client";

import { AuditItem } from '@/types/dashboard';

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

export default AuditQueueItem;