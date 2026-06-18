import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { clubAPI, teacherAPI, requestAPI } from '../services/api';
import ClubCard from '../components/ClubCard';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Search, Layers, ShieldAlert } from 'lucide-react';

const Clubs = () => {
  const { isSuperAdmin, isStudent } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [clubs, setClubs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [joiningClubId, setJoiningClubId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchClubs = async () => {
    try {
      const response = await clubAPI.getAll();
      if (response.data && response.data.success) {
        setClubs(response.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch clubs');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherAPI.getAll();
      if (response.data && response.data.success) {
        // Filter only approved teachers
        setTeachers(response.data.data.filter((t) => t.accountStatus === 'approved'));
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchClubs();
      if (isSuperAdmin) {
        await fetchTeachers();
      }
      setLoading(false);
    };
    init();
  }, [isSuperAdmin]);

  // Handle student join request
  const handleJoinRequest = async (clubId) => {
    setJoiningClubId(clubId);
    try {
      const response = await requestAPI.requestToJoin(clubId);
      if (response.data && response.data.success) {
        toastSuccess('Membership request sent successfully!');
        // Update local clubs state to reflect pending status
        setClubs((prev) =>
          prev.map((c) => (c._id === clubId ? { ...c, hasPendingRequest: true } : c))
        );
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit join request.';
      toastError(msg);
    } finally {
      setJoiningClubId(null);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    reset({ name: '', description: '', coverImage: '', assignedTeacher: '' });
    setIsCreateModalOpen(true);
  };

  // Create club submission
  const onCreateSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await clubAPI.create({
        name: data.name,
        description: data.description,
        coverImage: data.coverImage || undefined,
        assignedTeacher: data.assignedTeacher || undefined,
      });

      if (res.data && res.data.success) {
        toastSuccess('Club created successfully!');
        setIsCreateModalOpen(false);
        fetchClubs();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create club.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (club) => {
    setEditingClub(club);
    setValue('name', club.name);
    setValue('description', club.description);
    setValue('coverImage', club.coverImage);
    setValue('assignedTeacher', club.assignedTeacher?._id || '');
    setIsEditModalOpen(true);
  };

  // Edit club submission
  const onEditSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await clubAPI.update(editingClub._id, {
        name: data.name,
        description: data.description,
        coverImage: data.coverImage || undefined,
        assignedTeacher: data.assignedTeacher || null,
      });

      if (res.data && res.data.success) {
        toastSuccess('Club updated successfully!');
        setIsEditModalOpen(false);
        fetchClubs();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update club.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete club
  const handleDeleteClub = async (clubId) => {
    if (window.confirm('Are you absolutely sure you want to delete this club? This will delete all posts, members, and files.')) {
      try {
        const res = await clubAPI.delete(clubId);
        if (res.data && res.data.success) {
          toastSuccess('Club deleted successfully.');
          fetchClubs();
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to delete club.');
      }
    }
  };

  // Filter clubs by search query
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            School Clubs Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover and manage school clubs and organizations.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Club</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clubs by name..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm"
        />
      </div>

      {/* Grid List */}
      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : filteredClubs.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-10 h-10 text-slate-400" />}
          title="No Clubs Available"
          message={
            searchQuery
              ? `No clubs found matching "${searchQuery}".`
              : "No clubs have been registered yet. Check back later!"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onJoinRequest={handleJoinRequest}
              onEdit={openEditModal}
              onDelete={handleDeleteClub}
              isJoining={joiningClubId === club._id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Club">
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Club name is required' })}
              placeholder="Coding Club"
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <span className="text-rose-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="4"
              {...register('description', { required: 'Club description is required' })}
              placeholder="A space to discuss programming, algorithms, and build cool projects..."
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
            {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Cover Image URL (Optional)
            </label>
            <input
              type="text"
              {...register('coverImage')}
              placeholder="https://images.unsplash.com/..."
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Assign Teacher (Optional)
            </label>
            <select
              {...register('assignedTeacher')}
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {submitting ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Club Details">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Club name is required' })}
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <span className="text-rose-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="4"
              {...register('description', { required: 'Club description is required' })}
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
            {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Cover Image URL
            </label>
            <input
              type="text"
              {...register('coverImage')}
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Assign Teacher (Optional)
            </label>
            <select
              {...register('assignedTeacher')}
              className="w-full border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Clubs;
