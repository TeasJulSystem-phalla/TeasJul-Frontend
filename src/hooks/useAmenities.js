import { useState, useCallback, useEffect } from "react";
import { roomApi } from "../api/room.api";

export function useAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmenities = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      setAmenities(await roomApi.getMyAmenities(status));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load amenities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createAmenity = useCallback(async (data) => {
    const created = await roomApi.createAmenity(data);
    setAmenities((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateAmenity = useCallback(async (id, data) => {
    const updated = await roomApi.updateAmenity(id, data);
    setAmenities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const deleteAmenity = useCallback(async (id) => {
    await roomApi.deleteAmenity(id);
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  return {
    amenities,
    loading,
    error,
    fetchAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
  };
}
