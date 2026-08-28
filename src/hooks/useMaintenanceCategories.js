import { useState, useCallback, useEffect } from "react";
import { maintenanceCategoryApi } from "../api/maintenanceCategory.api";

export function useMaintenanceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await maintenanceCategoryApi.getMyCategories());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load maintenance categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data) => {
    const created = await maintenanceCategoryApi.createCategory(data);
    setCategories((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    const updated = await maintenanceCategoryApi.updateCategory(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deactivateCategory = useCallback(async (id) => {
    await maintenanceCategoryApi.deactivateCategory(id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "INACTIVE" } : c))
    );
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
  };
}
