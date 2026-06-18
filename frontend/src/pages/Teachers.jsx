import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { teacherAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Users, Search, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

const Teachers = () => {
  const { toastSuccess, toastError } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchTeachers = async () => {
    try {
      const res = await teacherAPI.getAll();
      if (res.data && res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch teachers directory.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTeachers();
      setLoading(false);
    };
    init();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const confirmMessage =
      currentStatus === 'approved'
        ? 'Are you sure you want to suspend this teacher? This will also unassign them from any clubs they manage.'
        : 'Are you sure you want to activate this teacher account?';

    if (window.confirm(confirmMessage)) {
      setActionId(id);
      try {
        const res = await teacherAPI.updateStatus(id, nextStatus);
        if (res.data && res.data.success) {
          toastSuccess(`Teacher account successfully ${nextStatus === 'approved' ? 'activated' : 'suspended'}.`);
          // Update state locally
          setTeachers((prev) =>
            prev.map((t) => (t._id === id ? { ...t, accountStatus: nextStatus } : t))
          );
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to update teacher account status.');
      } finally {
        setActionId(null);
      }
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Teachers Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor registered teachers, check assigned clubs, and manage status accounts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teachers by name or email..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm"
        />
      </div>

      {loading ? (
        <SkeletonLoader type="table" />
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-400" />}
          title="No Teachers Found"
          message={
            searchQuery
              ? `No teachers match search criteria for "${searchQuery}".`
              : "No teachers are registered in the portal database."
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Managed Clubs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher.profileImage}
                          alt={teacher.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {teacher.fullName}
                          </h4>
                          <span className="text-xs text-slate-400">{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {teacher.managedClubs && teacher.managedClubs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {teacher.managedClubs.map((club) => (
                            <span
                              key={club._id}
                              className="text-[10px] font-bold bg-brand-50 dark:bg-brand-950/35 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-md"
                            >
                              {club.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.accountStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : teacher.accountStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold px-2.5 py-1 rounded-full">
                          <ShieldAlert className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {teacher.accountStatus === 'approved' ? (
                        <button
                          disabled={actionId === teacher._id}
                          onClick={() => handleToggleStatus(teacher._id, 'approved')}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 font-semibold px-3 py-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 transition-colors disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      ) : teacher.accountStatus === 'rejected' ? (
                        <button
                          disabled={actionId === teacher._id}
                          onClick={() => handleToggleStatus(teacher._id, 'rejected')}
                          className="text-xs bg-brand-500 hover:bg-brand-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Go to Activation Requests</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
