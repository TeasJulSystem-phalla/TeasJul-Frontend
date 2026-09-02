import { useCallback, useEffect, useState } from "react";
import { tenantApi } from "../api/tenant.api";

export function useTenantProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantApi.getMe();
      setProfile(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការផ្ទុកព័ត៌មានរបស់អ្នកបានបរាជ័យ។";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, fetchProfile };
}