import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { requestAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { ClipboardList, Check, X, Calendar } from 'lucide-react';
import { formatDate } from '../utils/utils';

const JoinRequests = () => {
  const { toastSuccess, toastError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await requestAPI.getAllPending();
      if (res.data && res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch pending join requests.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionId(id);
    try {
      const res = await requestAPI.updateStatus(id, status);
      if (res.data && res.data.success) {
        toastSuccess(`Join request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Club Join Requests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review pending requests from students seeking to join your clubs.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="table" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-10 h-10 text-slate-400" />}
          title="No Pending Requests"
          message="There are no student join requests awaiting review right now."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Target Club</th>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.studentId?.profileImage}
                          alt={req.studentId?.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {req.studentId?.fullName}
                          </h4>
                          <span className="text-xs text-slate-400">{req.studentId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {req.clubId?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(req.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionId === req._id}
                          onClick={() => handleUpdateStatus(req._id, 'approved')}
                          className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          disabled={actionId === req._id}
                          onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-lg border dark:border-slate-800 transition-colors disabled:opacity-50"
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

export default JoinRequests;
