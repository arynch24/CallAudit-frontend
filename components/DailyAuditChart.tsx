import { DailyAuditChartProps } from "@/types/dashboard";

/**
 * WeeklyAuditChart Component - Displays bar chart for weekly audit data
 * @param data - Weekly audit data points
 * @param averagePercentage - Average audit percentage to display
 */
const WeeklyAuditChart: React.FC<DailyAuditChartProps> = ({ data, averagePercentage }) => {
    const maxValue = Math.max(...data.map(d => d.percentage));

    return (
        <div className="rounded-lg p-4 sm:p-6 bg-qc-dark/10">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-qc-primary">
                Auditor Weekly audited calls
            </h3>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 text-qc-primary">
                {averagePercentage}%
            </div>
            <p className="text-sm mb-6 text-qc-dark">
                Average auditing of calls
            </p>

            <div className="flex items-end justify-between space-x-1 sm:space-x-2 h-32">
                {data.map((item, index) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center">
                        <div className="w-full rounded-t relative mb-2 bg-qc-dark/20">
                            <div
                                className="rounded-t transition-all duration-300 bg-qc-dark"
                                style={{
                                    height: `${(item.percentage / maxValue) * 120}px`,
                                    minHeight: '8px'
                                }}
                            ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-qc-dark">
                            {item.day}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyAuditChart;