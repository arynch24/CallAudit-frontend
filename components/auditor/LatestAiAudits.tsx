import { LatestAiAuditsProps } from "@/types/dashboard";
import { MoveUpRight } from 'lucide-react'
import { useRouter } from "next/navigation";


/**
 * LatestAiAudits Component - Displays list of recent ai audits
 * @param audits - Array of ai audit entries
 */
const LatestAiAudits: React.FC<LatestAiAuditsProps> = ({ audits }) => {

    const router = useRouter();
    return (
        <div className="rounded-lg p-4 sm:p-6 bg-qc-dark/10">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-qc-primary">
                Latest Ai Audits
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
                                New AI Audit updated of {audit.clientNumber} at {audit.callStart}
                            </p>
                        </div>
                        <MoveUpRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0 text-qc-accent" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LatestAiAudits;