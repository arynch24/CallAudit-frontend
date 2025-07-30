"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, Pause, Play, ChevronRight, Maximize2, ChevronDown } from 'lucide-react';
import ExpandableDialog from './ExpandableDialog';
import { MarkdownContent } from '../../utils/parseMarkdown';

// Mock type for demonstration
interface AuditItem {
    id: string;
    callId: string;
    confidence: number;
    recordingUrl?: string;
    duration: number;
    summary: string;
    sentiments: string;
    anomalies: string;
}

/**
 * Props for the audit details panel
 */
interface AuditDetailsProps {
    audit: AuditItem | null;
    onApprove: (auditId: string, comments?: string, flagType?: string, flagReasons?: string) => void;
    onApproveLoading: boolean;
}

/**
 * Audit details panel component
 */
const AuditDetails: React.FC<AuditDetailsProps> = ({
    audit,
    onApprove,
    onApproveLoading
}) => {
    const [flagReason, setFlagReason] = useState('');
    const [comments, setComments] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState('');
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    const [showAnomaliesDialog, setShowAnomaliesDialog] = useState(false);
    const [flagType, setFlagType] = useState('Normal');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setComments('');
        setFlagReason('');
        setIsPlaying(false);
        setCurrentTime(0);
        setAudioDuration(0);
        setAudioError('');
        setShowSummaryDialog(false);
        setShowAnomaliesDialog(false);

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
            onApprove(audit.id, comments.trim() || undefined, flagType, flagReason.trim());
        }
    };

    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
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
        <>
            <div className="h-[calc(100vh-180px)] overflow-y-auto bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
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
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-qc-primary">Summary</h3>
                            <button
                                onClick={() => setShowSummaryDialog(true)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Click to expand"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div
                            className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setShowSummaryDialog(true)}
                        >
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {audit.summary.length > 150 ? (
                                    <>
                                        <MarkdownContent content={truncateText(audit.summary)} />
                                        <button className="text-qc-accent text-xs mt-1 hover:underline">
                                            Click to read more
                                        </button>
                                    </>
                                ) : (
                                    <MarkdownContent content={audit.summary} />
                                )}
                            </div>
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
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-qc-primary">Anomalies</h3>
                            <button
                                onClick={() => setShowAnomaliesDialog(true)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Click to expand"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div
                            className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setShowAnomaliesDialog(true)}
                        >
                            <div className="text-sm text-gray-700">
                                {audit.anomalies.length > 150 ? (
                                    <>
                                        <MarkdownContent content={truncateText(audit.anomalies)} />
                                        <button className="text-qc-accent text-xs mt-1 hover:underline">
                                            Click to read more
                                        </button>
                                    </>
                                ) : (
                                    <MarkdownContent content={audit.anomalies} />
                                )}
                            </div>
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
                    <div className="flex gap-6 items-start mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="relative">
                                <select
                                    value={flagType}
                                    onChange={(e) => setFlagType(e.target.value)}
                                    className="appearance-none px-3 py-2 pr-8 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors focus:outline-none cursor-pointer"
                                >
                                    <option value="Normal">Flag</option>
                                    <option value="Concern">Concern</option>
                                    <option value="Fatal">Fatal</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-700 pointer-events-none" />
                            </div>
                        </div>
                        <div className="w-full">
                            <textarea
                                placeholder="Write reason for flag..."
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-qc-accent focus:border-transparent"
                                rows={3}
                            />
                        </div>
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

            {/* Dialogs */}
            <ExpandableDialog
                isOpen={showSummaryDialog}
                onClose={() => setShowSummaryDialog(false)}
                title="Call Summary"
                content={audit.summary}
                isMarkdown={true}
            />

            <ExpandableDialog
                isOpen={showAnomaliesDialog}
                onClose={() => setShowAnomaliesDialog(false)}
                title="Anomalies Detected"
                content={audit.anomalies}
                isMarkdown={true}
            />
        </>
    );
};

export default AuditDetails;