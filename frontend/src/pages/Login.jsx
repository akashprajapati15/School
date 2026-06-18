import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Warn if redirected due to expired token session
  useEffect(() => {
    if (searchParams.get('expired')) {
      toastWarning('Your session has expired. Please log in again.');
    }
  }, [searchParams, toastWarning]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      if (response.data && response.data.success) {
        toastSuccess('Welcome! Logged in successfully.');
        login(response.data.token, response.data.data);
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
        Account Sign In
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address */}
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
              placeholder="you@school.edu"
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
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </>
          )}
        </button>
      </form>

      {/* Register Links */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
        <span className="text-xs text-slate-400">Don't have an account?</span>
        <div className="flex gap-4 text-xs font-semibold text-brand-600 dark:text-brand-400">
          <Link to="/register/student" className="hover:underline">
            Register as Student
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link to="/register/teacher" className="hover:underline">
            Register as Teacher
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
