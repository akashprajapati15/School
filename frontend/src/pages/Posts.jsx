import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { postAPI, likeAPI } from '../services/api';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { FileText } from 'lucide-react';

const Posts = () => {
  const { toastSuccess, toastError } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likingPostId, setLikingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const fetchAllPosts = async () => {
    try {
      const res = await postAPI.getAll();
      if (res.data && res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch posts feed.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAllPosts();
      setLoading(false);
    };
    init();
  }, []);

  const handleLikePost = async (postId) => {
    setLikingPostId(postId);
    try {
      const res = await likeAPI.toggle(postId);
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      toastError('Failed to like post.');
    } finally {
      setLikingPostId(null);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This will delete any file storage assets from Cloudinary.')) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          System Posts Feed
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Super Admin view to audit, moderate, and manage posts uploaded across all school clubs.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={2} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-slate-400" />}
          title="No Posts Uploaded"
          message="Clubs have not uploaded any announcements or media posts yet."
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
