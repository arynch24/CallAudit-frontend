import React from 'react';
import { User } from 'lucide-react';
import { ProfileCardProps } from '@/types/dashboard';

/**
 * ProfileCard Component - Displays user profile information in a dropdown card
 * @param profile - User profile data
 * @param isOpen - Whether the profile card is open
 * @param onClose - Function to close the profile card
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay to close dropdown when clicking outside */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Profile Card */}
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-md border-1 border-gray-300 z-50 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-qc-accent" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-qc-primary">
                                {profile.name}
                            </h3>
                            <p className="text-sm text-qc-accent">
                                {profile.role.replace(/\b\w/g, char => char.toUpperCase())}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-qc-dark">
                                {profile.role === 'manager' ? "Manager ID:" : "Auditor ID"}
                            </span>
                            <span className="text-sm text-qc-primary">
                                {profile.id}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-qc-dark">
                                Team:
                            </span>
                            <span className="text-sm text-qc-primary">
                                {profile.team}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileCard;