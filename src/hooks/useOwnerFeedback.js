import { useCallback, useEffect, useState } from "react";
import { ownerFeedbackApi } from "../api/feedback.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

/**
 * Owner feedback about the TeasJul system. Fetches the current owner's own
 * submissions and exposes a submit mutation that refreshes the list.
 */
export function useOwnerFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await ownerFeedbackApi.listMyFeedback({ page: 0, size: 50 });
      setFeedback(page?.content || []);
    } catch (err) {
      setError(toErrorMessage(err, "មិនអាចផ្ទុកមតិរបស់អ្នកបានទេ។"));
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFeedback = useCallback(
    async ({ rating, comment }) => {
      const created = await ownerFeedbackApi.submitFeedback({ rating, comment });
      await fetchFeedback();
      return created;
    },
    [fetchFeedback]
  );

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return { feedback, loading, error, submitFeedback, refetch: fetchFeedback };
}