import { useState } from "react";
import postService from "../services/post";
import { useAuth } from "../context/AuthContext";

export default function usePostActions(initialPosts = []) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPostId, setEditingPostId] = useState(null);
  const { user } = useAuth();

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(error.message);
    }
  };

  const handleEditPost = (post) => {
    if (post.user.id !== user.id) {
      alert("You do not have permission to modify this post.");
      return;
    }
    setEditingPostId(post.id);
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const updated = await postService.updatePost(updatedPost.id, {
        content: updatedPost.content,
        mediaUrlsToAdd: updatedPost.mediaUrlsToAdd,
        mediaIdsToDelete: updatedPost.mediaIdsToDelete,
      });

      setPosts((prev) =>
        prev.map((post) => (post.id === updated.id ? updated : post))
      );

      setEditingPostId(null);
      alert("Post updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating post:", error);
      alert(error.message || "An error occurred.");
    }
  };

  return {
    posts,
    setPosts,
    editingPostId,
    setEditingPostId,
    handleDeletePost,
    handleEditPost,
    handleUpdatePost,
  };
}
