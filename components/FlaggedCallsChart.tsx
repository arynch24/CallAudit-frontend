import { FlaggedCallsChartProps } from "@/types/dashboard";

/**
 * FlaggedCallsChart Component - Displays pie chart for flagged vs non-flagged calls
 * @param data - Flagged calls statistics
 */
const FlaggedCallsChart: React.FC<FlaggedCallsChartProps> = ({ data }) => {
    const radius = 150;
    const centerX = 150;
    const centerY = 150;

    // Calculate angles for pie chart segments
    const flaggedAngle = (data.flaggedPercentage / 100) * 360;
    const nonFlaggedAngle = (data.nonFlaggedPercentage / 100) * 360;

    // Create path for flagged segment
    const flaggedPath = `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${flaggedAngle > 180 ? 1 : 0} 1 ${centerX + radius * Math.sin((flaggedAngle * Math.PI) / 180)
        } ${centerY - radius * Math.cos((flaggedAngle * Math.PI) / 180)} Z`;

    return (
        <div className="rounded-lg p-4 sm:p-6 bg-qc-dark/10">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-qc-primary">
                Flagged calls stat
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                    <svg width="300" height="300" viewBox="0 0 300 300" className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                        {/* Non-flagged segment (brand accent) */}
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="#486AA0"
                            stroke="white"
                            strokeWidth="2"
                        />
                        {/* Flagged segment (brand dark) */}
                        <path
                            d={flaggedPath}
                            fill="#1B3A6A"
                            stroke="white"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-qc-accent"></div>
                        <span className="text-qc-dark">Non-flagged calls ({data.nonFlaggedPercentage}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-qc-dark"></div>
                        <span className="text-qc-dark">Flagged calls ({data.flaggedPercentage}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default FlaggedCallsChart;