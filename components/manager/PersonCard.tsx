
import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { PersonData } from '@/types/dashboard';


interface PersonCardProps {
    person: PersonData;
    showMessages?: boolean;
}

/**
 * PersonCard component - displays individual person information
 */
const PersonCard: React.FC<PersonCardProps> = ({ person, showMessages = false }) => {
    const { name, role, callCount, messageCount } = person;

    return (
        <div className="flex items-center justify-between p-4 rounded-xl mb-3 transition-all duration-200 hover:shadow-md bg-gray-50">
            {/* Left side - Avatar and info */}
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-qc-accent flex items-center justify-center text-white font-semibold">
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="font-medium text-base text-gray-800">
                        {name}
                    </div>
                    <div className="text-sm text-gray-600">
                        {role}
                    </div>
                </div>
            </div>

            {/* Right side - Call and message counts */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4 text-qc-dark" />
                    <span className="text-sm font-medium text-gray-800">
                        {callCount}
                    </span>
                </div>
                {showMessages && messageCount !== undefined && (
                    <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4 text-qc-dark" />
                        <span className="text-sm font-medium text-gray-800">
                            {messageCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonCard;