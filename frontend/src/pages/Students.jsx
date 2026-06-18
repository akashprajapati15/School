import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { studentAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { GraduationCap, Search, Trash } from 'lucide-react';
import { formatDate } from '../utils/utils';

const Students = () => {
  const { isSuperAdmin } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll();
      if (res.data && res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch students roster.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStudents();
      setLoading(false);
    };
    init();
  }, []);

  const handleRemoveStudent = async (id) => {
    if (
      window.confirm(
        'Are you absolutely sure you want to delete this student account? This will cascade delete their club memberships, posts (with files on Cloudinary), likes, and notifications. This action is IRREVERSIBLE!'
      )
    ) {
      setActionId(id);
      try {
        const res = await studentAPI.remove(id);
        if (res.data && res.data.success) {
          toastSuccess('Student account and all associated assets deleted successfully.');
          setStudents((prev) => prev.filter((s) => s._id !== id));
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to delete student.');
      } finally {
        setActionId(null);
      }
    }
  };

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Students Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Roster of all registered students, their club memberships, and administrative actions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students by name or email..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm"
        />
      </div>

      {loading ? (
        <SkeletonLoader type="table" />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-10 h-10 text-slate-400" />}
          title="No Students Found"
          message={
            searchQuery
              ? `No student matching "${searchQuery}" was found.`
              : "No students are currently registered in the database."
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Clubs Joined</th>
                  <th className="px-6 py-4">Registered Date</th>
                  {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.profileImage}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {student.fullName}
                          </h4>
                          <span className="text-xs text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {student.phone || <span className="text-xs text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      {student.clubs && student.clubs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {student.clubs.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-md"
                              title={`Joined ${new Date(c.joinedAt).toLocaleDateString()}`}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No clubs joined</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(student.createdAt)}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={actionId === student._id}
                          onClick={() => handleRemoveStudent(student._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          title="Delete Student"
                        >
                          <Trash className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    )}
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

export default Students;
