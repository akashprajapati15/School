import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { clubAPI } from '../services/api';
import ClubCard from '../components/ClubCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Compass, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyClubs = () => {
  const { toastError } = useToast();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJoinedClubs = async () => {
    try {
      const res = await clubAPI.getAll();
      if (res.data && res.data.success) {
        // Filter clubs where student is member
        setClubs(res.data.data.filter((c) => c.isMember));
      }
    } catch (err) {
      toastError('Failed to fetch your joined clubs list.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchJoinedClubs();
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          My Joined Clubs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quick access to clubs you are a registered member of.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={2} />
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-slate-400" />}
          title="No Clubs Joined"
          message="You haven't been approved in any school clubs yet. Browse active clubs to apply!"
          actionButton={
            <Link
              to="/clubs"
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/10"
            >
              Browse Active Clubs
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onJoinRequest={() => {}} // No-op since already joined
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClubs;
