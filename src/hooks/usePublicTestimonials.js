import { useCallback, useEffect, useState } from "react";
import { publicFeedbackApi } from "../api/feedback.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

/**
 * Published owner testimonials for the public Register Business page.
 * The backend only exposes PUBLISHED feedback, so no unpublished rows can
 * ever reach this hook.
 */
export function usePublicTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicFeedbackApi.listTestimonials();
      setTestimonials(data || []);
    } catch (err) {
      setError(toErrorMessage(err, "មិនអាចផ្ទុកមតិអ្នកប្រើបានទេ។"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, loading, error, refetch: fetchTestimonials };
}