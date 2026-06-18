import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { teacherAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { UserCheck, Check, X, Calendar, Phone } from 'lucide-react';
import { formatDate } from '../utils/utils';

const TeacherRequests = () => {
  const { toastSuccess, toastError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const res = await teacherAPI.getPending();
      if (res.data && res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch pending teacher requests.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPendingRequests();
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionId(id);
    try {
      const res = await teacherAPI.updateStatus(id, status);
      if (res.data && res.data.success) {
        toastSuccess(`Teacher registration request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update teacher status.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Teacher Activation Requests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review and approve newly registered teacher accounts before they can login.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="table" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-10 h-10 text-slate-400" />}
          title="All Caught Up!"
          message="There are no pending teacher registration requests at this time."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Teacher Name</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {requests.map((teacher) => (
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
                          <span className="text-xs text-slate-400">Teacher Application</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <span className="block font-medium text-slate-700 dark:text-slate-300">{teacher.email}</span>
                      {teacher.phone && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="w-3.5 h-3.5" /> {teacher.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(teacher.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionId === teacher._id}
                          onClick={() => handleUpdateStatus(teacher._id, 'approved')}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          disabled={actionId === teacher._id}
                          onClick={() => handleUpdateStatus(teacher._id, 'rejected')}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl border dark:border-slate-800 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
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

export default TeacherRequests;
