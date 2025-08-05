import React from 'react';
import { Phone, MessageCircle, Ellipsis, X, AlertTriangle } from 'lucide-react';
import { PersonData } from '@/types/dashboard';
import { useEffect } from 'react';
import axios from 'axios';

interface PersonCardProps {
    person: PersonData;
    showMessages?: boolean;
    onRefresh?: () => void;
}

/**
 * PersonCard component - displays individual person information
 */
const PersonCard: React.FC<PersonCardProps> = ({ person, showMessages = false, onRefresh }) => {
    const { name, id, role, email, callCount, messageCount, isActive } = person;
    const [openList, setOpenList] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (event.target instanceof Element && !event.target.closest('.relative')) {
            setOpenList(false);
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleShowDialog = () => {
        setShowDialog(true);
        setOpenList(false);
        setError(null);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setError(null);
        setIsLoading(false);
    };

    const handleDeactivate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/deactivate`, {
                role: role,
                counsellor_id: id,
                auditor_id: id,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });

            handleCloseDialog();
            onRefresh?.();

        } catch (err: any) {
            setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/activate`, {
                role: role,
                counsellor_id: id,
                auditor_id: id,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });

            handleCloseDialog();
            onRefresh?.();

        } catch (err: any) {
            setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-xl mb-3 transition-all duration-200 hover:shadow-md bg-gray-50">
                {/* Left side - Avatar and info */}
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-qc-accent flex items-center justify-center text-white font-semibold">
                        {name.charAt(0)}
                    </div>

                    <div>
                        <div className="flex gap-2 font-medium text-base text-gray-800">
                            {name}
                            <div>
                                <div className={`text-xs ${isActive ? "bg-green-300" : "bg-red-300"}  rounded-full px-2 py-1`}>
                                    {isActive ? "Active" : "Inactive"}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            {email}
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
                    <div className='relative'
                        onClick={() => setOpenList(!openList)}>
                        <Ellipsis className=" text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                        {
                            openList && (
                                <div className="absolute right-0 border-1 border-gray-400 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                                    <ul className='p-1 rounded-xl'>
                                        {isActive && (
                                            <li
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={handleShowDialog}
                                            >
                                                Deactivate
                                            </li>
                                        )}
                                        {!isActive && (
                                            <li
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={handleShowDialog}
                                            >
                                                Activate
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        {/* Dialog Header */}
                        <div className="flex items-center justify-between p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isActive ? 'Deactivate' : 'Activate'} User
                            </h3>
                            <button
                                onClick={handleCloseDialog}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isLoading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Dialog Content */}
                        <div className="px-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                                <span className="font-semibold">{name}</span>?
                            </p>

                            {isActive && (
                                <p className="text-sm text-gray-600 mb-4">
                                    This user will no longer have access to the system until reactivated.
                                </p>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-red-800">Error</p>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dialog Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 ">
                            <button
                                onClick={handleCloseDialog}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isActive ? handleDeactivate : handleActivate}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isActive
                                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `${isActive ? 'Deactivate' : 'Activate'}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonCard;