import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import { User, Phone, Key, Image, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Clear password field if empty to avoid changing it
      const payload = {
        fullName: data.fullName,
        phone: data.phone,
        profileImage: data.profileImage,
      };

      if (data.password) {
        payload.password = data.password;
      }

      const res = await authAPI.updateProfile(payload);

      if (res.data && res.data.success) {
        toastSuccess('Profile updated successfully!');
        updateUserInfo(res.data.data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile settings.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          My Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Edit your profile information, change avatars, or update security credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60 mb-6">
          <img
            src={user?.profileImage}
            alt={user?.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-md"
            onError={(e) => {
              e.target.src =
                'https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883334/person-1_rfzshl.jpg';
            }}
          />
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
              {user?.fullName}
            </h3>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider block mt-0.5">
              {user?.role.replace('_', ' ')} Account
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Registered email: {user?.email}
            </span>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {errors.fullName && (
              <span className="text-rose-500 text-xs mt-1 block">{errors.fullName.message}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                {...register('phone')}
                placeholder="+1234567890"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <Image className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                {...register('profileImage')}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              New Password (Leave blank to keep current)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                {...register('password', {
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {errors.password && (
              <span className="text-rose-500 text-xs mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 disabled:opacity-50"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
