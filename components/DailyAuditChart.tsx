import { DailyAuditChartProps } from "@/types/dashboard";

/**
 * WeeklyAuditChart Component - Displays bar chart for weekly audit data
 * @param data - Weekly audit data points
 * @param averagePercentage - Average audit percentage to display
 */
const WeeklyAuditChart: React.FC<DailyAuditChartProps> = ({ data, averagePercentage }) => {
    const maxValue = 100; // Set max value to 100 for proper scaling

    return (
        <div className="rounded-lg p-4 sm:p-6 bg-gray-100">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
                Auditor daywise audited calls
            </h3>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 text-gray-800">
                {averagePercentage}%
            </div>
            <p className="text-sm mb-6 text-gray-600">
                Average auditing of calls
            </p>

            <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 -top-2 h-35 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>
                
                {/* Grid lines */}
                <div className="absolute left-8 top-0 right-0 h-32">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300"></div>
                    <div className="absolute top-2/4 left-0 right-0 h-px bg-gray-300"></div>
                    <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                </div>

                {/* Chart area */}
                <div className="ml-8 flex items-end justify-between space-x-1 sm:space-x-2 h-32">
                    {data.map((item, index) => (
                        <div key={item.day} className="flex-1 flex flex-col items-center">
                            <div className="w-full rounded-t relative flex items-end justify-center">
                                <div
                                    className="w-full rounded-t transition-all duration-300 bg-blue-900"
                                    style={{
                                        height: `${(item.percentage / maxValue) * 128}px`,
                                        minHeight: '8px'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* X-axis labels */}
                <div className="ml-8 flex justify-between mt-2">
                    {data.map((item, index) => (
                        <div key={item.day} className="flex-1 text-center">
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {item.day}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};



export default WeeklyAuditChart;