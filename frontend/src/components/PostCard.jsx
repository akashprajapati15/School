import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/utils';
import { Heart, Trash, FileText, Download, Play, MessageSquare, Megaphone } from 'lucide-react';

const PostCard = ({ post, onLike, onDelete, isLiking, isDeleting, isClubAdmin: isParentClubAdmin }) => {
  const { user } = useAuth();
  const [localLiked, setLocalLiked] = useState(post.likedByUser);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);

  const isOwner = post.uploadedBy?._id === (user?.id || user?._id);
  const isSuperAdmin = user?.role === 'super_admin';

  // Respect parent-passed club admin flags or fall back to role checks
  const isClubAdmin = isParentClubAdmin !== undefined ? isParentClubAdmin : (user?.role === 'teacher');

  const showDelete = isOwner || isSuperAdmin || isClubAdmin;

  const handleLikeToggle = async () => {
    if (isLiking) return;
    // Optimistic UI update
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev) => (localLiked ? prev - 1 : prev + 1));

    try {
      const likedState = await onLike(post._id);
      if (likedState !== undefined) {
        setLocalLiked(likedState.liked);
        setLocalLikeCount(likedState.likeCount);
      }
    } catch (err) {
      // Rollback
      setLocalLiked(post.likedByUser);
      setLocalLikeCount(post.likeCount || 0);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header section: Author, date, delete */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <img
            src={post.uploadedBy?.profileImage}
            alt={post.uploadedBy?.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                {post.uploadedBy?.fullName}
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded capitalize">
                {post.uploadedBy?.role}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                {post.clubId?.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {showDelete && (
          <button
            disabled={isDeleting}
            onClick={() => onDelete(post._id)}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors disabled:opacity-50"
            title="Delete Post"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body section: Title and Description */}
      <div className="py-4">
        <h4 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
          {post.fileType === 'announcement' && <Megaphone className="w-4.5 h-4.5 text-brand-500 shrink-0" />}
          {post.title}
        </h4>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 whitespace-pre-line leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* Content Preview */}
      {post.fileType !== 'announcement' && post.fileUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-96 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          {post.fileType === 'image' && (
            <img
              src={post.fileUrl}
              alt={post.title}
              className="w-full h-full object-contain max-h-96"
            />
          )}

          {post.fileType === 'video' && (
            <video
              src={post.fileUrl}
              controls
              className="w-full max-h-96 object-contain"
              poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800"
            />
          )}

          {post.fileType === 'pdf' && (
            <div className="p-6 w-full flex flex-col items-center justify-center gap-4 bg-slate-100/50 dark:bg-slate-900/40">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/20 flex items-center justify-center text-rose-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs block">
                  {post.title}.pdf
                </span>
                <span className="text-xs text-slate-400">PDF Document</span>
              </div>
              <a
                href={post.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
            </div>
          )}
        </div>
      )}

      {/* Footer: Likes */}
      <div className="flex items-center pt-3 border-t border-slate-100 dark:border-slate-800/40">
        <button
          onClick={handleLikeToggle}
          disabled={isLiking}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            localLiked
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/20'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${localLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
          <span>{localLikeCount} {localLikeCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
