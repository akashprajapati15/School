import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to home dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-slate-100 via-slate-50 to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 relative overflow-hidden transition-colors duration-200">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-400/10 blur-[120px] dark:bg-brand-500/5"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/5"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Hub Title Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 text-white font-extrabold text-xl">
            SC
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            School Club Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect, Collaborate & Create
          </p>
        </div>

        {/* Form Wrap */}
        <div className="glass-card rounded-2xl p-8 border shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
