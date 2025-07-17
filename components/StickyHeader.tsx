import { StickyHeaderProps } from "@/types/dashboard";
import React, { useState } from "react";
import ProfileCard from "./ProfileCard";
import { User, ChevronDown } from "lucide-react";

/**
 * StickyHeader Component - Displays sticky header with profile section
 * @param profile - User profile data
 */
const StickyHeader: React.FC<StickyHeaderProps> = ({ profile, header }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const closeProfile = () => {
        setIsProfileOpen(false);
    };

    return (
        <header className="sticky top-0 bg-white border-b shadow-sm border-gray-200 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex items-center justify-between">
                    {/* Dashboard Title */}
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-qc-primary">
                            {header}
                        </h1>
                    </div>

                    {/* Profile Section */}
                    <div className="relative">
                        <button
                            onClick={toggleProfile}
                            className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isProfileOpen ? 'bg-gray-50' : 'bg-transparent'
                                }`}
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-qc-accent" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-qc-primary">
                                    {profile.name}
                                </p>
                                <p className="text-xs text-qc-accent">
                                    {profile.role.replace(/\b\w/g, char => char.toUpperCase())}
                                </p>
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform text-qc-accent ${isProfileOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        <ProfileCard
                            profile={profile}
                            isOpen={isProfileOpen}
                            onClose={closeProfile}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StickyHeader;