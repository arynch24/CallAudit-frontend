"use client";

import React, { useState } from 'react';

// Types
interface FlaggedReview {
  id: string;
  callNumber: string;
  counsellor: string;
  auditorComment: string;
  linkedAuditor: string;
  flagReason: string;
  flagType: 'script-deviation' | 'long-silence' | 'objection-ignored' | 'tone-mismatch';
}

interface FlaggedReviewsData {
  totalFlaggedReviews: number;
  reviews: FlaggedReview[];
}

// Mock data
const mockData: FlaggedReviewsData = {
  totalFlaggedReviews: 10,
  reviews: [
    {
      id: '1',
      callNumber: '+91 1234567879',
      counsellor: 'Aryan Choudhary',
      auditorComment: 'Missed introduction',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Script deviation',
      flagType: 'script-deviation'
    },
    {
      id: '2',
      callNumber: '+91 1234567896',
      counsellor: 'Nisha Singh',
      auditorComment: '6-second silent gap',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Long silence',
      flagType: 'long-silence'
    },
    {
      id: '3',
      callNumber: '+91 1234567879',
      counsellor: 'Nisha Singh',
      auditorComment: '6-second silent gap',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Long silence',
      flagType: 'long-silence'
    },
    {
      id: '4',
      callNumber: '+91 1234567898',
      counsellor: 'Nisha Singh',
      auditorComment: '6-second silent gap',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Long silence',
      flagType: 'long-silence'
    },
    {
      id: '5',
      callNumber: '+91 1234567898',
      counsellor: 'Nisha Singh',
      auditorComment: '6-second silent gap',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Long silence',
      flagType: 'long-silence'
    },
    {
      id: '6',
      callNumber: '+91 1234567898',
      counsellor: 'Ritesh Bhandari',
      auditorComment: 'Did not handle query',
      linkedAuditor: 'Saloni Jain',
      flagReason: 'Objection ignored',
      flagType: 'objection-ignored'
    },
    {
      id: '7',
      callNumber: '+91 1234567898',
      counsellor: 'Aryan Choudhary',
      auditorComment: 'Negative tone detected',
      linkedAuditor: 'Deepak Joshi',
      flagReason: 'Tone mismatch',
      flagType: 'tone-mismatch'
    }
  ]
};

// Flag Badge Component
const FlagBadge: React.FC<{ flagType: FlaggedReview['flagType']; flagReason: string }> = ({ flagType, flagReason }) => {
  return (
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
      <span className="text-sm font-medium text-qc-primary">
        {flagReason}
      </span>
    </div>
  );
};

// Table Row Component
const ReviewTableRow: React.FC<{ review: FlaggedReview }> = ({ review }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="px-4 py-4 text-sm font-medium text-qc-primary">
      {review.callNumber}
    </td>
    <td className="px-4 py-4 text-sm text-qc-primary">
      {review.counsellor}
    </td>
    <td className="px-4 py-4 text-sm text-qc-primary">
      {review.auditorComment}
    </td>
    <td className="px-4 py-4 text-sm text-qc-primary">
      {review.linkedAuditor}
    </td>
    <td className="px-4 py-4">
      <FlagBadge flagType={review.flagType} flagReason={review.flagReason} />
    </td>
  </tr>
);

// Mobile Card Component
const MobileReviewCard: React.FC<{ review: FlaggedReview }> = ({ review }) => (
  <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
    <div className="flex justify-between items-start mb-2">
      <span className="font-medium text-sm text-qc-primary">
        {review.callNumber}
      </span>
      <FlagBadge flagType={review.flagType} flagReason={review.flagReason} />
    </div>
    
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-qc-accent">Counsellor:</span>
        <span className="text-qc-primary">{review.counsellor}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-qc-accent">Auditor Comment:</span>
        <span className="text-qc-primary">{review.auditorComment}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-qc-accent">Linked Auditor:</span>
        <span className="text-qc-primary">{review.linkedAuditor}</span>
      </div>
    </div>
  </div>
);

// Main Component
const FlaggedReviewsComponent: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [data] = useState<FlaggedReviewsData>(mockData);

  const displayedReviews = showAll ? data.reviews : data.reviews.slice(0, 7);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header Card */}
      <div className="rounded-lg p-6 mb-6 shadow-sm bg-qc-light/10">
        <div className="text-3xl font-bold mb-2 text-qc-primary">
          {data.totalFlaggedReviews}
        </div>
        <div className="text-sm text-qc-accent">
          Total flagged reviews
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-qc-light/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                Call Number
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                Counsellor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                Auditor Comment
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                Linked Auditor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                Flag Reason
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedReviews.map((review) => (
              <ReviewTableRow key={review.id} review={review} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {displayedReviews.map((review) => (
          <MobileReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* View More Button */}
      {data.reviews.length > 7 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 rounded-md border border-qc-accent text-sm font-medium text-qc-accent bg-transparent transition-colors hover:opacity-80"
          >
            {showAll ? 'View less' : 'View more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FlaggedReviewsComponent;