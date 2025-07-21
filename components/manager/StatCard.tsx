"use client";

import { StatsCardData } from '@/types/dashboard';

interface StatsCardProps {
    data: StatsCardData;
}

/**
 * StatsCard component - displays metric cards at the top
 */
const StatsCard: React.FC<StatsCardProps> = ({ data }) => {
    const { value, label, icon: Icon } = data;

    return (
        <div
            className={`
                rounded-xl p-6 bg-qc-dark/10
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
                        {value}
                    </div>
                    <div className="text-sm md:text-base font-medium text-gray-600">
                        {label}
                    </div>
                </div>
                <div className="ml-3">
                    <Icon className="h-6 w-6 text-qc-accent" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;