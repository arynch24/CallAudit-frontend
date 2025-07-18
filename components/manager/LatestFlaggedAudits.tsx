import { LatestFlaggedAuditsProps } from "@/types/dashboard";
import { MoveUpRight } from 'lucide-react'
import { useRouter } from "next/navigation";


/**
 * LatestFlaggedAudits Component - Displays list of recent flagged audits
 * @param audits - Array of flagged audit entries
 */
const LatestFlaggedAudits: React.FC<LatestFlaggedAuditsProps> = ({ audits }) => {

    const router = useRouter();
    return (
        <div className="rounded-lg p-4 sm:p-6 bg-qc-dark/10">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-qc-primary">
                Latest Flagged Audits
            </h3>
            <div className="space-y-3">
                {audits.map((audit) => (
                    <div
                        key={audit.id}
                        className="bg-white rounded-lg p-3 sm:p-4 flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-qc-accent"
                        onClick={()=>router.push('/manager/team')}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium truncate text-qc-primary">
                                {audit.auditorName} flagged {audit.clientNumber} at {audit.timestamp}
                            </p>
                        </div>
                        <MoveUpRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0 text-qc-accent" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LatestFlaggedAudits;