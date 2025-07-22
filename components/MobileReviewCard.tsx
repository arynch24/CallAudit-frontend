import { FlaggedReview } from '@/types/dashboard';
import { Loader2, X, CheckLine } from 'lucide-react';
import FlagBadge from './FlaggedBadge';

/**
 * Mobile Card Component for Mobile View
 * Renders a single flagged review as a card for mobile devices
 * 
 * @param {Object} props - Component props
 * @param {FlaggedReview} props.review - The review data to display
 * @param {Function} props.onUnflagReview - Function to handle unflagging
 * @param {boolean} props.isUnflagging - Whether this review is currently being unflagged
 * @returns {JSX.Element} The rendered mobile card
 */
const MobileReviewCard: React.FC<{
    review: FlaggedReview,
    onUnflagReview: (id: string) => void,
    isUnflagging: boolean,
    role?: string
}> = ({ review, onUnflagReview, isUnflagging, role }) => (
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
            {
                role === 'manager' && (
                    <div className="flex justify-between">
                        <span className="text-qc-accent">Linked Auditor:</span>
                        <span className="text-qc-primary">{review.linkedAuditor}</span>
                    </div>
                )
            }
            <div className="flex justify-between mt-4">
                <span className="text-qc-accent">Action:</span>
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
            </div>
        </div>
    </div>
);

export default MobileReviewCard;