import { StatCardProps } from "@/types/dashboard";

/**
 * StatCard Component - Displays individual dashboard statistics
 * @param stat - Statistical data with value, label, and icon
 */
const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    const IconComponent = stat.icon;

    return (
        <div className="rounded-lg p-4 sm:p-6 bg-qc-dark/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-qc-primary">
                    {stat.value}
                </span>
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-qc-accent" />
            </div>
            <p className="text-xs sm:text-sm lg:text-base leading-tight text-qc-dark">
                {stat.label}
            </p>
        </div>
    );
};

export default StatCard;