import { useState, useCallback, useEffect } from "react";
import { roomApi } from "../api/room.api";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRooms(await roomApi.getAllRooms());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load rooms. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomsByHouse = useCallback(async (houseId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomApi.getRoomsByHouse(houseId);
      setRooms(data);
      return data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load rooms for this house. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoom = useCallback(async (id) => {
    return await roomApi.getRoomById(id);
  }, []);

  const createRoom = useCallback(async (formData) => {
    const data = await roomApi.createRoom(formData);
    setRooms((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateRoom = useCallback(async (id, formData) => {
    const data = await roomApi.updateRoom(id, formData);
    setRooms((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  }, []);

  const deleteRoom = useCallback(async (id) => {
    await roomApi.deleteRoom(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    fetchRoomsByHouse,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}

export function useRoomAmenities(roomId) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAmenities = useCallback(async () => {
    if (!roomId) {
      setAmenities([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAmenities(await roomApi.getRoomAmenities(roomId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load room amenities."
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const assignAmenity = useCallback(
    async (amenityId) => {
      await roomApi.assignAmenity(roomId, amenityId);
      await fetchAmenities();
    },
    [roomId, fetchAmenities]
  );

  const removeAmenity = useCallback(
    async (amenityId) => {
      await roomApi.removeAmenity(roomId, amenityId);
      setAmenities((prev) => prev.filter((a) => a.amenityId !== amenityId));
    },
    [roomId]
  );

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  return { amenities, loading, error, fetchAmenities, assignAmenity, removeAmenity };
}
