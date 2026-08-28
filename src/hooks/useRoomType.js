import { useState, useCallback, useEffect } from "react";
import { roomTypeApi } from "../api/roomType.api";

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all room types
  const fetchAllRoomTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.getAllRoomTypes();
      setRoomTypes(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load room types. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch room types by owner
  const fetchRoomTypesByOwner = useCallback(async (ownerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.getRoomTypesByOwner(ownerId);
      setRoomTypes(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load room types for this owner. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single room type by ID
  const getRoomType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.getRoomTypeById(id);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load room type details. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create room type
  const createRoomType = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.createRoomType(formData);
      setRoomTypes((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create room type. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update room type
  const updateRoomType = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.updateRoomType(id, formData);
      setRoomTypes((prev) => prev.map((rt) => (rt.id === id ? data : rt)));
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update room type. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete room type
  const deleteRoomType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await roomTypeApi.deleteRoomType(id);
      setRoomTypes((prev) => prev.filter((rt) => rt.id !== id));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete room type. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - fetch all room types
  useEffect(() => {
    fetchAllRoomTypes();
  }, [fetchAllRoomTypes]);

  return {
    roomTypes,
    loading,
    error,
    fetchAllRoomTypes,
    fetchRoomTypesByOwner,
    getRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  };
}