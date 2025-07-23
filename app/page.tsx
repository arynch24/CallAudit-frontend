'use client';

import { useState } from 'react';
import { Eye, EyeOff, CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useAuthContext } from '@/context/AuthenticationContext';

/**
 * QC Audit Sign-In Page Component
 * Minimal design with email/password authentication and role selection
 * Includes form validation and secure credential management
 */
const QCAuditSignIn = () => {
  // State management for form data and UI states
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'manager' as 'manager' | 'auditor'
  });
  const [error, setError] = useState(''); // Error message from sign-in process
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const [loading, setLoading] = useState(false); // Loading state during authentication
  const router = useRouter();
  const { user, setUser } = useAuthContext();

  /**
   * Handle input changes for form fields
   * Updates form state and clears previous error messages
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing to improve UX
    if (error) setError('');
  };

  /**
   * Handle role selection change
   * Updates the selected role in form state
   */
  const handleRoleChange = (role: 'manager' | 'auditor') => {
    setForm(prev => ({ ...prev, role }));
  };

  /**
   * Handle sign-in process using credentials authentication
   * Validates form data, makes API call, and handles response
   */
  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    // Client-side validation to ensure all fields are filled
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        email: form.email,
        password: form.password,
        role: form.role
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const userData = res.data;

      setUser(userData.user);

      // Redirect to dashboard on successful authentication
      if (userData.user.role === 'manager') {
        router.push('/manager');
      }
      else if (userData.user.role === 'auditor') {
        router.push('/auditor');
      } else {
        setError('Invalid role selected');
      }

    } catch (error:any) {
      const errorMsg = error.response?.data?.message;
      setError(errorMsg || 'Something went wrong. Please try again.');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qc-accent/10 flex">
      {/* Left side - Welcome content */}
      <div className="hidden lg:flex lg:w-2/3 items-center justify-center p-12">
        <div>
          {/* Welcome message */}
          <h1 className="text-6xl font-bold text-qc-primary mb-4">
            Welcome to QC Audit
          </h1>
          <p className="text-lg text-qc-primary mb-8">
            Enhance your quality control with AI-powered insights.
          </p>

          {/* Learn more button */}
          <button className="bg-qc-dark/90 text-white px-6 py-2 rounded-lg hover:bg-qc-dark transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Login form header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-qc-primary mb-2">
              Welcome Back
            </h2>
            <p className="text-qc-primary">
              Please log in to continue
            </p>
          </div>

          {/* Login form */}
          <div className="space-y-6">
            {/* Email input field */}
            <div>
              <label className="block text-sm font-medium text-qc-primary mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-qc-dark/9 rounded-xl text-sm focus:outline-none focus:ring-1"
                required
              />
            </div>

            {/* Password input field with visibility toggle */}
            <div>
              <label className="block text-sm font-medium text-qc-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 bg-qc-dark/9 rounded-xl text-sm focus:outline-none focus:ring-1"
                  required
                />
                {/* Password visibility toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-qc-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-qc-primary mb-3">
                Role
              </label>
              <div className="flex gap-4">
                {/* Manager role option */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={form.role === 'manager'}
                    onChange={() => handleRoleChange('manager')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-2 ${form.role === 'manager'
                    ? 'bg-qc-dark border-qc-dark'
                    : 'border-gray-300'
                    }`}>
                    {form.role === 'manager' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-sm text-qc-primary">Manager</span>
                </label>

                {/* Auditor role option */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="auditor"
                    checked={form.role === 'auditor'}
                    onChange={() => handleRoleChange('auditor')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-2 ${form.role === 'auditor'
                    ? 'bg-qc-dark border-qc-dark'
                    : 'border-gray-300'
                    }`}>
                    {form.role === 'auditor' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-sm text-qc-primary">Auditor</span>
                </label>
              </div>
            </div>

            {/* Error message display */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 rounded-md">
                <CircleAlert size={16} />
                <p>{error}</p>
              </div>
            )}

            {/* Login submit button */}
            <button
              type="button"
              onClick={handleSignIn}
              disabled={!form.email || !form.password || loading}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${form.email && form.password
                ? 'bg-qc-dark/90 text-white hover:bg-qc-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCAuditSignIn;