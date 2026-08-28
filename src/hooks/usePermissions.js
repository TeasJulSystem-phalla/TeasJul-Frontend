import { useState, useCallback, useEffect } from "react";
import { permissionApi } from "../api/permission.api";

export function usePermissions(module) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permissionApi.getAllPermissions(module);
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
  }, [module]);

  const createPermission = useCallback(async (permData) => {
    const created = await permissionApi.createPermission(permData);
    setPermissions((prev) => [...prev, created]);
    return created;
  }, []);

  const updatePermission = useCallback(async (id, permData) => {
    const updated = await permissionApi.updatePermission(id, permData);
    setPermissions((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deletePermission = useCallback(async (id) => {
    await permissionApi.deletePermission(id);
    setPermissions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, error, fetchPermissions, createPermission, updatePermission, deletePermission };
}
