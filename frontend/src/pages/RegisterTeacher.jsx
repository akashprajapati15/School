import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import { UserPlus, User, Mail, Key, Phone } from 'lucide-react';

const RegisterTeacher = () => {
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.registerTeacher({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (response.data && response.data.success) {
        toastSuccess('Registration requested! Please wait for Super Admin approval.');
        navigate('/login');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1 text-center">
        Teacher Registration
      </h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center">
        Access is subject to approval by the school Principal.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              placeholder="Dr. Sarah Jenkins"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm ${
                errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.fullName && (
            <span className="text-rose-500 text-xs mt-1 block font-medium">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address address',
                },
              })}
              placeholder="sjenkins@school.edu"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm ${
                errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.email && (
            <span className="text-rose-500 text-xs mt-1 block font-medium">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm ${
                errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.password && (
            <span className="text-rose-500 text-xs mt-1 block font-medium">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              {...register('phone')}
              placeholder="+1234567890"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 dark:bg-slate-800/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-500/10 hover:opacity-95 hover:shadow-brand-500/20 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Submit Registration</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-xs text-slate-400">Already registered? </span>
        <Link to="/login" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterTeacher;
