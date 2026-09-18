import { useState, useCallback, useEffect } from "react";
import { userApi } from "../api/user.api";

const ROLE_OWNER = "OWNER";
const ROLE_MANAGER = "MANAGER";
const ROLE_TENANT = "TENANT";
const ROLE_SUPER_ADMIN = "SUPER_ADMIN";

export function useMyRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getMyRoles();
      setRoles(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load your roles.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const codes = roles.map((r) => r.code);
  const isOwner = codes.includes(ROLE_OWNER);
  const isManager = codes.includes(ROLE_MANAGER);
  const isTenant = codes.includes(ROLE_TENANT);
  const isSuperAdmin = codes.includes(ROLE_SUPER_ADMIN);
  const hasAdminAccess = isOwner || isManager;

  return {
    roles,
    codes,
    isOwner,
    isManager,
    isTenant,
    isSuperAdmin,
    hasAdminAccess,
    loading,
    error,
    fetchRoles,
  };
}
