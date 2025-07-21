import { useState } from 'react';
import axios from 'axios';
import { on } from 'events';

interface FormData {
    name: string;
    email: string;
    mobile: string;
    position: string;
    auditorId: string;
}

interface AddMemberProps {
    onCancel?: () => void;
}

const AddMember: React.FC<AddMemberProps> = ({ onCancel }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile: '',
        position: '',
        auditorId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const positions = [
        'Auditor',
        'Counsellor'
    ];

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            mobile: '',
            position: '',
            auditorId: ''
        });
    };

    const handleAdd = async () => {
        if (!formData.name || !formData.email || !formData.mobile || !formData.position) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.mobile.trim(),
                role: formData.position.toLowerCase(),
                ...(formData.auditorId && { auditor_id: formData.auditorId.trim() })
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/manager/add`,
                JSON.stringify(payload)
                , {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    withCredentials: true
                });

            const result = response.data;
            setErrorMessage(null);
            resetForm();

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'An error occurred while adding the member';
                setErrorMessage(errorMessage);
            } else {
                setErrorMessage('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        onCancel?.();
    };

    const isFormValid = formData.name && formData.email && formData.mobile && formData.position;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
            <div className="w-md mx-auto p-8 bg-gray-50 rounded-lg border border-gray-200">
                <h1 className="text-3xl font-semibold text-gray-800 mb-8">Add Member</h1>

                <div className="space-y-2">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-700 mb-3">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter the name..."
                            required
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block font-medium text-gray-700 mb-3">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter the email..."
                            required
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Mobile Number Field */}
                    <div>
                        <label htmlFor="mobile" className="block font-medium text-gray-700 mb-3">
                            Mobile No <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="mobile"
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => handleInputChange('mobile', e.target.value)}
                            placeholder="Enter the mobile number..."
                            required
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Position Field */}
                    <div>
                        <label htmlFor="position" className="block font-medium text-gray-700 mb-3">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="position"
                            value={formData.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            required
                            className="w-48 px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Select</option>
                            {positions.map((pos) => (
                                <option key={pos} value={pos}>
                                    {pos}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Auditor ID Field */}
                    <div>
                        <label htmlFor="auditorId" className="block font-medium text-gray-700 mb-3">
                            Auditor ID <span className="text-gray-400 text-sm">(Optional)</span>
                        </label>
                        <input
                            id="auditorId"
                            type="text"
                            value={formData.auditorId}
                            onChange={(e) => handleInputChange('auditorId', e.target.value)}
                            placeholder="Enter the auditor ID..."
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mt-4 text-red-600 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!isFormValid || isSubmitting}
                            className="px-8 py-3 text-sm font-medium text-white bg-gray-600 border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMember;