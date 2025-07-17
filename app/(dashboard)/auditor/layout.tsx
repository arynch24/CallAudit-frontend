'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/auditor/AudSidebar";
import StickyHeader from "@/components/StickyHeader";
import { useAuthContext } from '@/context/AuthenticationContext';

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    const pathname = usePathname();
    const { user } = useAuthContext();

    // Function to get header text based on current path
    const getHeaderText = (path: string): string => {
        switch (path) {
            case '/auditor':
                return 'Auditor Dashboard';
            case '/auditor/audits':
                return 'AI Audits';
            case '/auditor/help':
                return 'Help';
            default:
                // Handle dynamic routes or fallback
                return 'Auditor Dashboard';
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
                        name: user?.name || '',
                        id: user?.id || '',
                        team: 'teamname',
                        role: user?.role || ''
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