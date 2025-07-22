import { FlaggedReview } from '@/types/dashboard';
import { Loader2, X, CheckLine } from 'lucide-react';
import FlagBadge from './FlaggedBadge';

/**
 * Table Row Component for Desktop View
 * Renders a single flagged review as a table row
 * 
 * @param {Object} props - Component props
 * @param {FlaggedReview} props.review - The review data to display
 * @param {Function} props.onUnflagReview - Function to handle unflagging
 * @param {boolean} props.isUnflagging - Whether this review is currently being unflagged
 * @returns {JSX.Element} The rendered table row
 */
const ReviewTableRow: React.FC<{
    review: FlaggedReview,
    onUnflagReview: (id: string) => void,
    isUnflagging: boolean,
    role?: string
}> = ({ review, onUnflagReview, isUnflagging, role }) => (
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
        {role === 'manager' && (
            <td className="px-4 py-4 text-sm text-qc-primary">
                {review.linkedAuditor}
            </td>
        )}
        <td className="px-4 py-4">
            <FlagBadge flagReason={review.flagReason} />
        </td>
        <td className="px-4 py-4">
            <button
                onClick={() => onUnflagReview(review.id)}
                disabled={isUnflagging}
                className="w-fit flex items-center justify-center text-qc-accent cursor-pointer hover:text-qc-primary hover:bg-qc-dark/10 rounded-sm p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUnflagging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (role === 'manager' ? (
                    <CheckLine className="h-4 w-4" />
                ) : (
                    <X className="h-4 w-4" />)
                )}
            </button>
        </td>
    </tr>
);

export default ReviewTableRow;