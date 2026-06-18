import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash, User, ShieldAlert, ArrowRight } from 'lucide-react';

const ClubCard = ({ club, onJoinRequest, onEdit, onDelete, isJoining }) => {
  const { user, isSuperAdmin } = useAuth();

  const isAssignedTeacher =
    club.assignedTeacher && club.assignedTeacher._id === user?.id;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* Cover Image */}
      <div className="h-44 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
        <img
          src={club.coverImage}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop';
          }}
        />
        {/* Assigned Teacher overlay banner */}
        {isAssignedTeacher && (
          <span className="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            Your Club
          </span>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors truncate">
            {club.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 line-clamp-3">
            {club.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          {/* Teacher Info */}
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            {club.assignedTeacher ? (
              <>
                <img
                  src={club.assignedTeacher.profileImage}
                  alt={club.assignedTeacher.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                  {club.assignedTeacher.fullName}
                </span>
              </>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Unassigned
              </span>
            )}
          </div>

          {/* Role specific Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(club)}
                  className="p-2 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Club"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(club._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Club"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}

            {user?.role === 'student' && (
              <>
                {club.isMember ? (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full">
                    Member
                  </span>
                ) : club.hasPendingRequest ? (
                  <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full">
                    Pending
                  </span>
                ) : (
                  <button
                    disabled={isJoining}
                    onClick={() => onJoinRequest(club._id)}
                    className="text-xs bg-brand-500 text-white font-medium hover:bg-brand-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                )}
              </>
            )}

            {/* General view details page link */}
            <Link
              to={`/clubs/${club._id}`}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Club Details"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
