import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { clubAPI } from '../services/api';
import ClubCard from '../components/ClubCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Layers } from 'lucide-react';

const AssignedClubs = () => {
  const { user } = useAuth();
  const { toastError } = useToast();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedClubs = async () => {
    try {
      const res = await clubAPI.getAll();
      if (res.data && res.data.success) {
        // Filter clubs managed by this teacher
        setClubs(res.data.data.filter((c) => c.assignedTeacher?._id === user?.id));
      }
    } catch (err) {
      toastError('Failed to fetch assigned clubs.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAssignedClubs();
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Assigned Clubs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Clubs assigned to you for administration. Click on a club to manage members, posts, and requests.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={2} />
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-10 h-10 text-slate-400" />}
          title="No Clubs Assigned"
          message="You are not assigned to manage any clubs at this time. Please contact the Principal."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onJoinRequest={() => {}} // No-op for teacher
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedClubs;
