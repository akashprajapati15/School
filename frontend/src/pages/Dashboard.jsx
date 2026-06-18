import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, clubAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Layers,
  Users,
  FileText,
  UserCheck,
  ClipboardList,
  Compass,
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isSuperAdmin, isTeacher, isStudent } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myClubs, setMyClubs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await dashboardAPI.getStats();
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // If teacher or student, also fetch their clubs for display
        if (isTeacher || isStudent) {
          const clubsRes = await clubAPI.getAll();
          if (clubsRes.data && clubsRes.data.success) {
            const allClubs = clubsRes.data.data;
            if (isTeacher) {
              setMyClubs(allClubs.filter((c) => c.assignedTeacher?._id === user.id));
            } else if (isStudent) {
              setMyClubs(allClubs.filter((c) => c.isMember));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isTeacher, isStudent, user.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <SkeletonLoader type="stats" count={3} />
        <SkeletonLoader type="table" />
      </div>
    );
  }

  // --- RENDERING ROLES ---

  // 1. Super Admin
  const renderSuperAdminDashboard = () => {
    const cards = [
      {
        title: 'Total Clubs',
        value: stats?.totalClubs || 0,
        icon: <Layers className="w-6 h-6 text-brand-500" />,
        link: '/clubs',
        color: 'from-brand-500/10 to-indigo-500/10',
      },
      {
        title: 'Total Teachers',
        value: stats?.totalTeachers || 0,
        icon: <Users className="w-6 h-6 text-emerald-500" />,
        link: '/teachers',
        color: 'from-emerald-500/10 to-teal-500/10',
      },
      {
        title: 'Total Students',
        value: stats?.totalStudents || 0,
        icon: <GraduationCap className="w-6 h-6 text-violet-500" />,
        link: '/students',
        color: 'from-violet-500/10 to-purple-500/10',
      },
      {
        title: 'Total Posts',
        value: stats?.totalPosts || 0,
        icon: <FileText className="w-6 h-6 text-sky-500" />,
        link: '/posts',
        color: 'from-sky-500/10 to-blue-500/10',
      },
      {
        title: 'Pending Teachers',
        value: stats?.pendingTeachers || 0,
        icon: <UserCheck className="w-6 h-6 text-amber-500" />,
        link: '/teacher-requests',
        color: 'from-amber-500/10 to-orange-500/10',
        alert: (stats?.pendingTeachers || 0) > 0,
      },
      {
        title: 'Pending Joins',
        value: stats?.pendingJoinRequests || 0,
        icon: <ClipboardList className="w-6 h-6 text-rose-500" />,
        link: '/join-requests',
        color: 'from-rose-500/10 to-pink-500/10',
        alert: (stats?.pendingJoinRequests || 0) > 0,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 flex items-center justify-between hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              {/* Highlight alert indicator */}
              {card.alert && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg"></span>
              )}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                  {card.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </Link>
          ))}
        </div>

        {/* Administration quick options */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
            Super Admin Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/clubs"
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white rounded-xl font-medium transition-all group"
            >
              <span>Manage Clubs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/teacher-requests"
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white rounded-xl font-medium transition-all group"
            >
              <span>Approve Teachers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/join-requests"
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white rounded-xl font-medium transition-all group"
            >
              <span>Review Join Requests</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // 2. Teacher
  const renderTeacherDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned Clubs</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.totalClubs || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Club Members</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.totalMembers || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Posts</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.totalPosts || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Requests</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.pendingRequests || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Managed Clubs list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Clubs You Manage</h3>
            <Link to="/assigned-clubs" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {myClubs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              You are not assigned to manage any clubs yet. Please contact the Principal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClubs.map((club) => (
                <Link
                  key={club._id}
                  to={`/clubs/${club._id}`}
                  className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 rounded-xl transition-all"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{club.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{club.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 3. Student
  const renderStudentDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Available Clubs</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.totalClubs || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <Compass className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Clubs Joined</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.joinedClubs || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">My Posts</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.myPosts || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Unread Messages</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats?.unreadNotifications || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Student clubs list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Clubs You Are In</h3>
            <div className="flex gap-3 text-xs">
              <Link to="/clubs" className="text-brand-600 hover:underline flex items-center gap-1">
                Explore More <Compass className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {myClubs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>You have not joined any clubs yet.</p>
              <Link
                to="/clubs"
                className="mt-3 inline-block bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Find a Club
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClubs.map((club) => (
                <Link
                  key={club._id}
                  to={`/clubs/${club._id}`}
                  className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 rounded-xl transition-all"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{club.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{club.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          System Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Overview and analytics for your account.
        </p>
      </div>

      {isSuperAdmin && renderSuperAdminDashboard()}
      {isTeacher && renderTeacherDashboard()}
      {isStudent && renderStudentDashboard()}
    </div>
  );
};

export default Dashboard;
