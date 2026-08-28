import { useState, useCallback, useEffect } from "react";
import { roleApi } from "../api/role.api";

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleApi.getAllRoles();
      setRoles(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load roles.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData) => {
    const created = await roleApi.createRole(roleData);
    setRoles((prev) => [...prev, created]);
    return created;
  }, []);

  const updateRole = useCallback(async (id, roleData) => {
    const updated = await roleApi.updateRole(id, roleData);
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const deleteRole = useCallback(async (id) => {
    await roleApi.deleteRole(id);
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole };
}

export function useRolePermissions(roleId) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!roleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await roleApi.getRolePermissions(roleId);
      setPermissions(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load permissions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  const assignPermission = useCallback(async (permissionId) => {
    await roleApi.assignPermission(roleId, permissionId);
    await fetchPermissions();
  }, [roleId, fetchPermissions]);

  const removePermission = useCallback(async (permissionId) => {
    await roleApi.removePermission(roleId, permissionId);
    setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
  }, [roleId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, error, fetchPermissions, assignPermission, removePermission };
}
