import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useDashboard } from '@/context/DashboardContext';
import { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    mobile: string;
    position: string;
    auditorId: string;
}

interface AddMemberProps {
    onCancel?: () => void;
    onRefresh?: () => void;
}

const AddMember: React.FC<AddMemberProps> = ({ onCancel, onRefresh }) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { setOpenAddMemberModal } = useDashboard();

    const positions = [
        'Auditor',
        'Counsellor'
    ];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            mobile: '',
            position: '',
            auditorId: ''
        }
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const formData = new URLSearchParams();
            formData.append("name", data.name);
            formData.append("email", data.email);
            formData.append("phone", data.mobile);
            formData.append("role", data.position.toLowerCase());
            if (data.auditorId) formData.append("auditor_id", data.auditorId);

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/add`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                withCredentials: true,
            });

            reset();
            onRefresh?.();
            setOpenAddMemberModal(false);

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'An error occurred while adding the member';
            setErrorMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        reset();
        onCancel?.();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
            <div className="w-md mx-auto p-8 bg-gray-50 rounded-lg border border-gray-200">
                <h1 className="text-3xl font-semibold text-gray-800 mb-8">Add Member</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-700 mb-3">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Name must be at least 2 characters long'
                                },
                                pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: 'Name can only contain letters and spaces'
                                }
                            })}
                            placeholder="Enter the name..."
                            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-500 focus:outline-none ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block font-medium text-gray-700 mb-3">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            placeholder="Enter the email..."
                            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-500 focus:outline-none ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Mobile Number Field */}
                    <div>
                        <label htmlFor="mobile" className="block font-medium text-gray-700 mb-3">
                            Mobile No <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="mobile"
                            type="tel"
                            {...register('mobile', {
                                required: 'Mobile number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Please enter a valid 10-digit mobile number'
                                }
                            })}
                            placeholder="Enter the mobile number..."
                            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-500 focus:outline-none ${errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.mobile && (
                            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                        )}
                    </div>

                    {/* Position Field */}
                    <div>
                        <label htmlFor="position" className="block font-medium text-gray-700 mb-3">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="position"
                            {...register('position', {
                                required: 'Position is required'
                            })}
                            className={`w-48 px-4 py-3 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none appearance-none cursor-pointer ${errors.position ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        >
                            <option value="">Select</option>
                            {positions.map((pos) => (
                                <option key={pos} value={pos}>
                                    {pos}
                                </option>
                            ))}
                        </select>
                        {errors.position && (
                            <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                        )}
                    </div>

                    {/* Auditor ID Field */}
                    <div>
                        <label htmlFor="auditorId" className="block font-medium text-gray-700 mb-3">
                            Auditor ID <span className="text-gray-400 text-sm">(Optional)</span>
                        </label>
                        <input
                            id="auditorId"
                            type="text"
                            placeholder="Enter the auditor ID..."
                            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-500 focus:outline-none ${errors.auditorId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.auditorId && (
                            <p className="mt-1 text-sm text-red-600">{errors.auditorId.message}</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="px-8 py-3 text-sm font-medium text-white bg-gray-600 border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMember;