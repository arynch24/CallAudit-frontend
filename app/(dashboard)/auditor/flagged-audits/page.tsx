"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import MobileReviewCard from '@/components/MobileReviewCard';
import { FlaggedReview } from '@/types/dashboard';
import ReviewTableRow from '@/components/ReviewTableRow';

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
 * Interface for grouped reviews by date
 */
interface GroupedReviews {
  [date: string]: FlaggedReview[];
}

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
    id: audit.id,
    callDateTime: new Date(audit.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    callNumber: audit.client_number,
    counsellor: audit.counsellor_name,
    auditorComment: audit.comments,
    linkedAuditor: audit.auditor_name,
    flagReason: audit.flag_reason,
    createdAt: audit.created_at, // Keep original timestamp for filtering
  }));

  return {
    totalFlaggedReviews,
    reviews
  };
};

/**
 * Groups reviews by date and sorts them by time within each date
 * 
 * @param {FlaggedReview[]} reviews - Array of reviews to group
 * @returns {GroupedReviews} Reviews grouped by date
 */
const groupReviewsByDate = (reviews: FlaggedReview[]): GroupedReviews => {
  const grouped: GroupedReviews = {};

  reviews.forEach(review => {
    const date = new Date( review.callDateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(review);
  });

  // Sort reviews within each date by time (newest first)
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeA = new Date(a.callDateTime).getTime();
      const timeB = new Date(b.callDateTime).getTime();
      return timeB - timeA; // Newest first
    });
  });

  return grouped;
};

/**
 * Filters reviews based on date range
 * 
 * @param {FlaggedReview[]} reviews - Array of reviews to filter
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {FlaggedReview[]} Filtered reviews
 */
const filterReviewsByDateRange = (reviews: FlaggedReview[], startDate: string, endDate: string): FlaggedReview[] => {
  if (!startDate && !endDate) return reviews;

  return reviews.filter(review => {
    const reviewDate = new Date( review.callDateTime);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null; // Include the entire end date

    if (start && reviewDate < start) return false;
    if (end && reviewDate > end) return false;

    return true;
  });
};

/**
 * Flagged Reviews Component
 * 
 * This component displays a list of flagged audit reviews with key information including:
 * - Total count of flagged reviews
 * - Call numbers and counsellor names
 * - Auditor comments
 * - Flag reasons with visual indicators
 * - Date range filtering
 * - Reviews grouped by date and sorted by time
 * 
 * Features:
 * - Date range filter with start and end date inputs
 * - Reviews organized by date with time-based sorting within each date
 * - Responsive design with table view for desktop and card view for mobile
 * - Pagination with "View more/View less" functionality
 * - Loading states and error handling
 * - Individual loading states for unflag actions
 * 
 * @returns {JSX.Element} The rendered flagged reviews component
 */
const FlaggedReviewsComponent: React.FC = () => {
  // State for controlling how many reviews to display
  const [showAll, setShowAll] = useState(false);
  // State to track which review is currently being unflagged
  const [unflaggingId, setUnflaggingId] = useState<string | null>(null);
  // State for date range filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Component state
  const [data, setData] = useState<FlaggedReviewsData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Fetches flagged reviews data from the API
   * 
   * @returns {Promise<void>}
   */
  const fetchFlaggedReviewsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      // Make API call to fetch flagged reviews data
      const response = await axios.get<FlaggedAuditsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auditor/flagged-audits`,
        {
          withCredentials: true,
        }
      );

      // Transform the raw API response
      const transformedData = transformedApiResponse(response.data);
      setData(transformedData);
    } catch (err: any) {
      // Handle API errors
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnflagReview = async (reviewId: string) => {
    setUnflaggingId(reviewId);

    try {
      await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auditor/unflag?audit_id=${reviewId}`,
        { withCredentials: true }
      );

      await fetchFlaggedReviewsData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unflag review');
    } finally {
      setUnflaggingId(null);
    }
  };

  /**
   * Effect hook that runs on component mount
   */
  useEffect(() => {
    fetchFlaggedReviewsData();
  }, []);

  // Show loading spinner
  if (isLoading && !data) {
    return <Loader text='Loading Flagged Reviews' />;
  }

  // Show error page
  if (error && !data) {
    return <Error
      message={error}
      onRetry={fetchFlaggedReviewsData}
    />;
  }

  // Don't render anything if we still don't have data
  if (!data) {
    return null;
  }

  // Filter reviews based on date range
  const filteredReviews = filterReviewsByDateRange(data.reviews, startDate, endDate);

  // Group filtered reviews by date
  const groupedReviews = groupReviewsByDate(filteredReviews);
  const dates = Object.keys(groupedReviews).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort dates newest first

  // Determine which dates to display based on showAll state
  const displayedDates = showAll ? dates : dates.slice(0, 7);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header Card - Shows total count of flagged reviews and date filters */}
      <div className="rounded-lg p-6 mb-6 shadow-sm bg-qc-light/10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <div className="text-3xl font-bold mb-2 text-qc-primary">
              {filteredReviews.length}
            </div>
            <div className="text-sm text-qc-accent">
              {startDate || endDate ? 'Filtered flagged reviews' : 'Total flagged reviews'}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-qc-accent mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-qc-accent/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-qc-primary focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-qc-accent mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-qc-accent/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-qc-primary focus:border-transparent"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 rounded-md border border-qc-accent text-sm font-medium text-qc-accent bg-transparent transition-colors hover:opacity-80"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews organized by date */}
      {displayedDates.length === 0 ? (
        <div className="text-center py-8 text-qc-accent">
          No flagged reviews found for the selected date range.
        </div>
      ) : (
        displayedDates.map(date => (
          <div key={date} className="mb-8">
            {/* Date Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-qc-primary border-b border-qc-light/30 pb-2">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} ({groupedReviews[date].length} reviews)
              </h3>
            </div>

            {/* Desktop Table View - Hidden on mobile devices */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-qc-light/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                      Time
                    </th>
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
                      Flag Reason
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-qc-accent">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedReviews[date].map((review) => (
                    <ReviewTableRow
                      key={review.id}
                      review={review}
                      onUnflagReview={handleUnflagReview}
                      isUnflagging={unflaggingId === review.id}
                      showTimeOnly={true}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View - Hidden on desktop */}
            <div className="md:hidden space-y-4">
              {groupedReviews[date].map((review) => (
                <MobileReviewCard
                  key={review.id}
                  review={review}
                  onUnflagReview={handleUnflagReview}
                  isUnflagging={unflaggingId === review.id}
                  showTimeOnly={true}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* View More/Less Button - Only shown if there are more than 7 dates */}
      {dates.length > 7 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-6 py-2 border-1 border-qc-dark/20 text-sm font-medium text-qc-dark hover:text-qc-accent hover:bg-qc-light/10 rounded-md transition-colors duration-200"
          >
            {showAll ? 'View less' : 'View more'}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default FlaggedReviewsComponent;