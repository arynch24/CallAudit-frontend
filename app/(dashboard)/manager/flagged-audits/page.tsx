"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

/**
 * Interface for individual flagged review data structure
 * Represents the processed data format used by the UI components
 */
interface FlaggedReview {
  id: string;
  callNumber: string;
  counsellor: string;
  auditorComment: string;
  linkedAuditor: string;
  flagReason: string;
}

/**
 * Interface for the processed flagged reviews data
 * Contains the total count and array of review records
 */
interface FlaggedReviewsData {
  totalFlaggedReviews: number;
  reviews: FlaggedReview[];
}

/**
 * Interface for the raw API response from the flagged audits endpoint
 * Represents the exact structure returned by the backend API
 */
interface FlaggedAuditsResponse {
  success: boolean;
  message: string;
  flagged_audits: {
    id: string;
    call_id: string;
    auditor_id: string;
    auditor_name: string;
    score: number;
    comments: string;
    flag_reason: string;
    client_number: string;
    counsellor_name: string;
    updated_at: string;
    created_at: string;
  }[];
}

/**
 * Interface for the global cache structure
 * Manages cached data, timestamp, loading state, and error state
 */
interface FlaggedReviewsCache {
  data: FlaggedReviewsData | null;
  timestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Global cache object that persists across component re-renders and navigation
 * This ensures data is not refetched unnecessarily when navigating back to the flagged reviews
 */
const flaggedReviewsCache: FlaggedReviewsCache = {
  data: null,
  timestamp: null,
  isLoading: false,
  error: null
};

/**
 * Cache duration in milliseconds (5 minutes)
 * Data will be considered stale after this duration and will be refetched
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Transforms raw API response data into the format expected by UI components
 * 
 * @param {FlaggedAuditsResponse} apiData - Raw data from the API
 * @returns {FlaggedReviewsData} Transformed data ready for component consumption
 */
const transformedApiResponse = (apiData: FlaggedAuditsResponse): FlaggedReviewsData => {
  const { flagged_audits } = apiData;

  const totalFlaggedReviews = flagged_audits.length;
  const reviews: FlaggedReview[] = flagged_audits.map((audit) => ({
    id: audit.id, // Use audit id instead of auditor_id for uniqueness
    callNumber: audit.client_number,
    counsellor: audit.counsellor_name,
    auditorComment: audit.comments,
    linkedAuditor: audit.auditor_name,
    flagReason: audit.flag_reason,
  }));

  return {
    totalFlaggedReviews,
    reviews
  };
};

/**
 * Flag Badge Component
 * Displays a colored badge with the flag reason
 * 
 * @param {Object} props - Component props
 * @param {string} props.flagReason - The reason for flagging the review
 * @returns {JSX.Element} The rendered flag badge
 */
const FlagBadge: React.FC<{ flagReason: string }> = ({ flagReason }) => {
  return (
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
      <span className="text-sm font-medium text-qc-primary">
        {flagReason}
      </span>
    </div>
  );
};

/**
 * Table Row Component for Desktop View
 * Renders a single flagged review as a table row
 * 
 * @param {Object} props - Component props
 * @param {FlaggedReview} props.review - The review data to display
 * @returns {JSX.Element} The rendered table row
 */
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
      <FlagBadge flagReason={review.flagReason} />
    </td>
  </tr>
);

/**
 * Mobile Card Component for Mobile View
 * Renders a single flagged review as a card for mobile devices
 * 
 * @param {Object} props - Component props
 * @param {FlaggedReview} props.review - The review data to display
 * @returns {JSX.Element} The rendered mobile card
 */
const MobileReviewCard: React.FC<{ review: FlaggedReview }> = ({ review }) => (
  <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
    <div className="flex justify-between items-start mb-2">
      <span className="font-medium text-sm text-qc-primary">
        {review.callNumber}
      </span>
      <FlagBadge flagReason={review.flagReason} />
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

/**
 * Flagged Reviews Component
 * 
 * This component displays a list of flagged audit reviews with key information including:
 * - Total count of flagged reviews
 * - Call numbers and counsellor names
 * - Auditor comments and linked auditors
 * - Flag reasons with visual indicators
 * 
 * Features:
 * - Automatic caching to prevent unnecessary API calls
 * - Cache expiration after 5 minutes
 * - Graceful error handling with fallback to cached data
 * - Responsive design with table view for desktop and card view for mobile
 * - Pagination with "View more/View less" functionality
 * - Loading states and error handling
 * 
 * @returns {JSX.Element} The rendered flagged reviews component
 */
const FlaggedReviewsComponent: React.FC = () => {
  // State for controlling how many reviews to display
  const [showAll, setShowAll] = useState(false);

  // Initialize component state with cached values if available
  const [data, setData] = useState<FlaggedReviewsData | null>(flaggedReviewsCache.data);
  const [error, setError] = useState<string>(flaggedReviewsCache.error || '');
  const [isLoading, setIsLoading] = useState<boolean>(flaggedReviewsCache.isLoading);

  /**
   * Checks if the cached data is still valid based on the cache duration
   * 
   * @returns {boolean} True if cache is valid, false if expired or no cache exists
   */
  const isCacheValid = (): boolean => {
    if (!flaggedReviewsCache.timestamp) return false;
    return Date.now() - flaggedReviewsCache.timestamp < CACHE_DURATION;
  };

  /**
   * Fetches flagged reviews data from the API with intelligent caching
   * 
   * @param {boolean} force - If true, bypasses cache and forces a fresh API call
   * @returns {Promise<void>}
   */
  const fetchFlaggedReviewsData = async (force: boolean = false): Promise<void> => {
    // Prevent multiple simultaneous API calls
    if (flaggedReviewsCache.isLoading) return;

    // Skip API call if we have valid cached data (unless forced)
    if (!force && flaggedReviewsCache.data && isCacheValid()) {
      return;
    }

    try {
      // Update loading state in both cache and component
      flaggedReviewsCache.isLoading = true;
      setIsLoading(true);
      setError('');

      // Make API call to fetch flagged reviews data
      const response = await axios.get<FlaggedAuditsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/flagged-audits`,
        {
          withCredentials: true,
        }
      );

      // Transform the raw API response
      const transformedData = transformedApiResponse(response.data);

      // Update global cache with fresh data
      flaggedReviewsCache.data = transformedData;
      flaggedReviewsCache.timestamp = Date.now();
      flaggedReviewsCache.error = null;

      // Update component state
      setData(transformedData);
    } catch (err: any) {
      // Handle API errors
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      flaggedReviewsCache.error = errorMsg;
      setError(errorMsg);
    } finally {
      // Reset loading state
      flaggedReviewsCache.isLoading = false;
      setIsLoading(false);
    }
  };

  /**
   * Effect hook that runs on component mount
   * Checks for cached data and fetches fresh data if needed
   */
  useEffect(() => {
    // Check if we have valid cached data
    if (flaggedReviewsCache.data && isCacheValid()) {
      // Use cached data immediately for faster rendering
      setData(flaggedReviewsCache.data);
      setError(flaggedReviewsCache.error || '');
      setIsLoading(false);
    } else {
      // Cache is stale or doesn't exist, fetch fresh data
      fetchFlaggedReviewsData();
    }
  }, []);

  // Show loading spinner only if we don't have any data to display
  if (isLoading && !data) {
    return <Loader text='Loading Flagged Reviews' />;
  }

  // Show error page only if we have an error and no cached data to fall back to
  if (error && !data) {
    return <Error
      message={error}
      onRetry={() => fetchFlaggedReviewsData(true)}
    />;
  }

  // Don't render anything if we still don't have data
  if (!data) {
    return null;
  }

  // Determine which reviews to display based on showAll state
  const displayedReviews = showAll ? data.reviews : data.reviews.slice(0, 7);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header Card - Shows total count of flagged reviews */}
      <div className="rounded-lg p-6 mb-6 shadow-sm bg-qc-light/10">
        <div className="text-3xl font-bold mb-2 text-qc-primary">
          {data.totalFlaggedReviews}
        </div>
        <div className="text-sm text-qc-accent">
          Total flagged reviews
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile devices */}
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

      {/* Mobile Cards View - Hidden on desktop */}
      <div className="md:hidden">
        {displayedReviews.map((review) => (
          <MobileReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* View More/Less Button - Only shown if there are more than 7 reviews */}
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

      {/* Warning message if there's an error but we have cached data to show */}
      {error && data && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Warning: Failed to refresh data. Showing cached data. Error: {error}
        </div>
      )}
    </div>
  );
};

export default FlaggedReviewsComponent;