import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { clubAPI, postAPI, requestAPI, likeAPI } from '../services/api';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { useForm } from 'react-hook-form';
import {
  Layers,
  Users,
  ClipboardList,
  Upload,
  UserX,
  FileText,
  Bookmark,
  Calendar,
  AlertTriangle,
  Image,
  Video,
  FileText as PdfIcon,
  MessageSquare
} from 'lucide-react';

const ClubDetails = () => {
  const { id: clubId } = useParams();
  const { user, isSuperAdmin } = useAuth();
  const { toastSuccess, toastError, toastWarning } = useToast();

  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [uploadType, setUploadType] = useState('announcement'); // announcement, image, video, pdf

  // Action loaders
  const [submittingPost, setSubmittingPost] = useState(false);
  const [likingPostId, setLikingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [memberLoadingId, setMemberLoadingId] = useState(null);
  const [requestLoadingId, setRequestLoadingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fileWatch = watch('file');

  const isClubAdmin =
    isSuperAdmin || (club && club.assignedTeacher && club.assignedTeacher._id === user?.id);

  const isMember = isSuperAdmin || isClubAdmin || (club && club.isMember);

  const fetchClubDetails = async () => {
    try {
      const res = await clubAPI.getById(clubId);
      if (res.data && res.data.success) {
        setClub(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch club metadata.');
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await postAPI.getClubPosts(clubId);
      if (res.data && res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await requestAPI.getClubMembers(clubId);
      if (res.data && res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await requestAPI.getAllPending();
      if (res.data && res.data.success) {
        // Filter requests matching this club
        setRequests(res.data.data.filter((r) => r.clubId?._id === clubId));
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchClubDetails();
      await fetchPosts();
      await fetchMembers();
      setLoading(false);
    };
    init();
  }, [clubId]);

  // Dynamic tab load triggers
  useEffect(() => {
    if (activeTab === 'requests' && isClubAdmin) {
      fetchRequests();
    }
    if (activeTab === 'members') {
      fetchMembers();
    }
    if (activeTab === 'feed') {
      fetchPosts();
    }
  }, [activeTab, club]);

  // --- ACTIONS ---

  // Liking a post
  const handleLikePost = async (postId) => {
    setLikingPostId(postId);
    try {
      const res = await likeAPI.toggle(postId);
      if (res.data && res.data.success) {
        return res.data.data; // Return updated state
      }
    } catch (err) {
      toastError('Failed to toggle like.');
    } finally {
      setLikingPostId(null);
    }
  };

  // Deleting a post
  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post? If this post has media files, they will be removed from Cloudinary.')) {
      setDeletingPostId(postId);
      try {
        const res = await postAPI.delete(postId);
        if (res.data && res.data.success) {
          toastSuccess('Post deleted successfully.');
          setPosts((prev) => prev.filter((p) => p._id !== postId));
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to delete post.');
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  // Approving join request
  const handleApproveRequest = async (requestId) => {
    setRequestLoadingId(requestId);
    try {
      const res = await requestAPI.updateStatus(requestId, 'approved');
      if (res.data && res.data.success) {
        toastSuccess('Join request approved!');
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        fetchMembers();
      }
    } catch (err) {
      toastError('Failed to approve join request.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  // Rejecting join request
  const handleRejectRequest = async (requestId) => {
    setRequestLoadingId(requestId);
    try {
      const res = await requestAPI.updateStatus(requestId, 'rejected');
      if (res.data && res.data.success) {
        toastSuccess('Join request rejected.');
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      toastError('Failed to reject join request.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  // Removing club member
  const handleRemoveMember = async (studentId) => {
    if (window.confirm('Remove this member from the club?')) {
      setMemberLoadingId(studentId);
      try {
        const res = await requestAPI.removeMember(clubId, studentId);
        if (res.data && res.data.success) {
          toastSuccess('Member removed successfully.');
          setMembers((prev) => prev.filter((m) => m._id !== studentId));
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to remove member.');
      } finally {
        setMemberLoadingId(null);
      }
    }
  };

  // Uploading post
  const onUploadPost = async (data) => {
    setSubmittingPost(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('fileType', uploadType);

    if (uploadType !== 'announcement') {
      const file = data.file[0];
      if (!file) {
        toastError('Please select a file to upload.');
        setSubmittingPost(false);
        return;
      }

      // Check size limits inside client JS for immediate responsiveness
      const sizeMB = file.size / (1024 * 1024);
      if (uploadType === 'image' && sizeMB > 5) {
        toastError('Image size exceeds 5MB limit.');
        setSubmittingPost(false);
        return;
      }
      if (uploadType === 'video' && sizeMB > 25) {
        toastError('Video size exceeds 25MB limit.');
        setSubmittingPost(false);
        return;
      }
      if (uploadType === 'pdf' && sizeMB > 10) {
        toastError('PDF size exceeds 10MB limit.');
        setSubmittingPost(false);
        return;
      }

      formData.append('file', file);
    }

    try {
      const res = await postAPI.create(clubId, formData);
      if (res.data && res.data.success) {
        toastSuccess(`New ${uploadType} posted successfully!`);
        reset({ title: '', description: '', file: null });
        setActiveTab('feed');
        fetchPosts();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <SkeletonLoader count={2} />
      </div>
    );
  }

  if (!club) {
    return <EmptyState title="Club not found" message="The requested club could not be loaded." />;
  }

  return (
    <div className="space-y-6">
      {/* Club Banner Header */}
      <div className="relative rounded-2xl overflow-hidden h-72 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
        <img
          src={club.coverImage}
          alt={club.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop';
          }}
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"></div>

        {/* Text Details Overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {club.name}
            </h1>
            <p className="text-sm text-slate-200 drop-shadow-sm line-clamp-2">
              {club.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {club.assignedTeacher && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <img
                  src={club.assignedTeacher.profileImage}
                  alt={club.assignedTeacher.fullName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-semibold">{club.assignedTeacher.fullName} (Admin)</span>
              </div>
            )}
            <div className="text-xs text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Created {new Date(club.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'feed'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" /> Feed
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4.5 h-4.5" /> Members ({members.length})
        </button>

        {isClubAdmin && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors relative ${
              activeTab === 'requests'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList className="w-4.5 h-4.5" /> Requests
            {requests.length > 0 && (
              <span className="absolute top-[-2px] right-[-10px] w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold">
                {requests.length}
              </span>
            )}
          </button>
        )}

        {isMember && (
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4.5 h-4.5" /> Upload Content
          </button>
        )}
      </div>

      {/* View Panel Content */}
      <div className="py-2">
        {/* TAB 1: FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {!isMember ? (
              <div className="p-8 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 rounded-2xl text-center max-w-lg mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-white">Feed Restricted</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  You must be a member of this club to view the posts feed and download documents.
                </p>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8 text-slate-400" />}
                title="No Posts Yet"
                message="Be the first to share an announcement, image, or document with the club members!"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLikePost}
                    onDelete={handleDeletePost}
                    isLiking={likingPostId === post._id}
                    isDeleting={deletingPostId === post._id}
                    isClubAdmin={isClubAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/70">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Club Roster</span>
            </div>

            {members.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                This club does not have any members registered yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {members.map((member) => (
                  <div key={member._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.profileImage}
                        alt={member.fullName}
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-white">
                          {member.fullName}
                        </h5>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{member.email}</span>
                      </div>
                    </div>

                    {isClubAdmin && member._id !== user.id && (
                      <button
                        disabled={memberLoadingId === member._id}
                        onClick={() => handleRemoveMember(member._id)}
                        className="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REQUESTS */}
        {activeTab === 'requests' && isClubAdmin && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/70">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Pending Student Membership Requests</span>
            </div>

            {requests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No pending join requests for this club.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {requests.map((req) => (
                  <div key={req._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.studentId?.profileImage}
                        alt={req.studentId?.fullName}
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-white">
                          {req.studentId?.fullName}
                        </h5>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{req.studentId?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={requestLoadingId === req._id}
                        onClick={() => handleApproveRequest(req._id)}
                        className="text-xs bg-brand-500 hover:bg-brand-600 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={requestLoadingId === req._id}
                        onClick={() => handleRejectRequest(req._id)}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border dark:border-slate-800 font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: UPLOAD */}
        {activeTab === 'upload' && isMember && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">
              Share Content with Club Members
            </h3>

            {/* Select Content Type Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: 'announcement', label: 'Announcement', icon: <Bookmark className="w-4.5 h-4.5" /> },
                { id: 'image', label: 'Image', icon: <Image className="w-4.5 h-4.5" /> },
                { id: 'video', label: 'Video', icon: <Video className="w-4.5 h-4.5" /> },
                { id: 'pdf', label: 'PDF Document', icon: <PdfIcon className="w-4.5 h-4.5" /> },
              ].map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setUploadType(type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all gap-1.5 ${
                    uploadType === type.id
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-slate-200/60 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {type.icon}
                  <span className="text-[10px] sm:text-xs">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onUploadPost)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Post Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Post title is required' })}
                  placeholder={
                    uploadType === 'announcement'
                      ? 'Weekly Meeting details'
                      : uploadType === 'image'
                      ? 'Field trip photos'
                      : uploadType === 'video'
                      ? 'Science Experiment recording'
                      : 'Resource Syllabus PDF'
                  }
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.title && <span className="text-rose-500 text-xs mt-1 block">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description / Content body
                </label>
                <textarea
                  rows="4"
                  {...register('description', { required: 'Post description is required' })}
                  placeholder="Share detail context, notes, or instructions for this post..."
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
                {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
              </div>

              {/* File Upload Selector */}
              {uploadType !== 'announcement' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select File ({uploadType.toUpperCase()})
                  </label>
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center bg-slate-50/40 dark:bg-slate-900/10">
                    <input
                      type="file"
                      {...register('file', { required: 'File upload is required' })}
                      accept={
                        uploadType === 'image'
                          ? 'image/png, image/jpeg, image/jpg, image/webp'
                          : uploadType === 'video'
                          ? 'video/mp4'
                          : 'application/pdf'
                      }
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 dark:file:bg-slate-800 dark:file:text-brand-400 dark:hover:file:bg-slate-700/80 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-2.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {uploadType === 'image'
                          ? 'Max image size: 5 MB. Formats: JPG, PNG, WEBP'
                          : uploadType === 'video'
                          ? 'Max video size: 25 MB. Formats: MP4'
                          : 'Max document size: 10 MB. Formats: PDF'}
                      </span>
                    </div>
                  </div>
                  {errors.file && <span className="text-rose-500 text-xs mt-1 block">{errors.file.message}</span>}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingPost}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 disabled:opacity-50"
              >
                {submittingPost ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Uploading to Cloud Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Post</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetails;
