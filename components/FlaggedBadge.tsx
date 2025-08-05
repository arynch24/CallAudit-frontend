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

export default FlagBadge;