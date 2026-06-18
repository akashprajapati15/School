import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { activityAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { ClipboardList, User, Terminal, Calendar } from 'lucide-react';
import { formatDate } from '../utils/utils';

const ActivityLogs = () => {
  const { toastError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await activityAPI.getAll();
        if (res.data && res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toastError('Failed to fetch activity logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          System Activity Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audit trails showing administrative and user actions performed across the portal.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="table" />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Terminal className="w-10 h-10 text-slate-400" />}
          title="No Logs Available"
          message="System logs are currently empty. Actions will be logged as users interact with the portal."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/70">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Audit Trail (Top 100 Entries)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Performed By</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-300 block">
                            {log.performedBy?.fullName || 'System Seed'}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {log.performedBy?.role || 'SYSTEM'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(log.timestamp)}
                      </span>
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

export default ActivityLogs;
