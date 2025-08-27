import { useState } from "react";
import postService from "../services/post";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "./useNotification";

export default function usePostActions(initialPosts = []) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPostId, setEditingPostId] = useState(null);
  const { user } = useAuth();

  const { showNotification } = useNotification();

  const handleDeletePost = async (post) => {
    if (post.user.id !== user.id) {
      showNotification("Bạn không có quyền xoá bài viết này!", "error");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const newPost = await postService.deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      showNotification("Xoá bài viết thành công!", "susses");
      return newPost;
    } catch (error) {
      console.error("Failed to delete post:", error);
      showNotification("Không thể xoá bài viết. Vui lòng thử lại.", "error");
    }
  };

  const handleEditPost = (post) => {
    if (post.user.id !== user.id) {
      showNotification("Bạn không có quyền cập nhật bài viết!", "error");
      return;
    }
    setEditingPostId(post.id);
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const updated = await postService.updatePost(updatedPost.id, {
        content: updatedPost.content,
        mediaFilesToAdd: updatedPost.mediaFilesToAdd,
        mediaIdsToDelete: updatedPost.mediaIdsToDelete,
      });

      setPosts((prev) =>
        prev.map((post) => (post.id === updated.id ? updated : post))
      );

      setEditingPostId(null);
      showNotification("Cập nhật bài viết thành công!", "success");
      return updated;
    } catch (error) {
      console.error("Error updating post:", error);
      showNotification(
        "Không thể cập nhật bài viết. Vui lòng thử lại.",
        "error"
      );
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
