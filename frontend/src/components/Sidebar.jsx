import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Compass,
  FileSpreadsheet,
  UserCheck,
  ClipboardList,
  FileText,
  User,
  LogOut,
  Bell,
  Layers,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isSuperAdmin, isTeacher, isStudent } = useAuth();

  const getLinks = () => {
    if (isSuperAdmin) {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: '/clubs', label: 'Clubs', icon: <Layers className="w-5 h-5" /> },
        { to: '/teacher-requests', label: 'Teacher Requests', icon: <UserCheck className="w-5 h-5" /> },
        { to: '/teachers', label: 'Teachers', icon: <Users className="w-5 h-5" /> },
        { to: '/students', label: 'Students', icon: <GraduationCap className="w-5 h-5" /> },
        { to: '/join-requests', label: 'Join Requests', icon: <ClipboardList className="w-5 h-5" /> },
        { to: '/posts', label: 'All Posts', icon: <FileText className="w-5 h-5" /> },
        { to: '/activity-logs', label: 'Activity Logs', icon: <FileSpreadsheet className="w-5 h-5" /> },
      ];
    }

    if (isTeacher) {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: '/assigned-clubs', label: 'Assigned Clubs', icon: <Layers className="w-5 h-5" /> },
        { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
      ];
    }

    if (isStudent) {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: '/clubs', label: 'Explore Clubs', icon: <Compass className="w-5 h-5" /> },
        { to: '/my-clubs', label: 'My Clubs', icon: <BookOpen className="w-5 h-5" /> },
        { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
        { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
      ];
    }

    return [];
  };

  const links = getLinks();

  const activeClass =
    'flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500 text-white font-medium shadow-md shadow-brand-500/10 transition-all duration-200';
  const inactiveClass =
    'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 transition-all duration-200';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Node */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-brand-500/10">
                SC
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">
                Club Portal
              </span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-800/20 flex items-center gap-3">
            <img
              src={user?.profileImage}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                {user?.fullName}
              </h4>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium capitalize">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="px-4 py-2 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
