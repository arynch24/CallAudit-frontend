'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/manager/ManSidebar";
import StickyHeader from "@/components/StickyHeader";

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    const pathname = usePathname();

    // Function to get header text based on current path
    const getHeaderText = (path: string): string => {
        switch (path) {
            case '/manager':
                return 'Manager Dashboard';
            case '/manager/flagged-audits':
                return 'Flagged Audits';
            case '/manager/help':
                return 'Help';
            case '/manager/team':
                return 'Team Members';
            default:
                // Handle dynamic routes or fallback
                return 'Manager Dashboard';
        }
    };

    return (
        <div className="h-screen flex">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className=" w-full bg-white">
                {/* Sticky Header */}
                <StickyHeader
                    header={getHeaderText(pathname)}
                    profile={{
                        name: 'sfoshhfj',
                        managerId: 'sfoshhfj',
                        team: 'sfoshhfj',
                        role: 'sfoshhfj'
                    }}
                />
                {/* Main Content */}
                <div className="h-[calc(100vh-73px)] p-2 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;