import { useState, useCallback, useEffect } from "react";
import { maintenanceCommentApi } from "../api/maintenanceComment.api";

export function useMaintenanceComments(requestId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!requestId) {
      setComments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setComments(await maintenanceCommentApi.getComments(requestId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const createComment = useCallback(
    async (data) => {
      const created = await maintenanceCommentApi.createComment(requestId, data);
      setComments((prev) => [...prev, created]);
      return created;
    },
    [requestId]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      await maintenanceCommentApi.deleteComment(requestId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [requestId]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    deleteComment,
  };
}
