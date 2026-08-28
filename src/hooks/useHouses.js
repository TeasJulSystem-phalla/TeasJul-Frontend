import { useState, useCallback, useEffect } from "react";
import { houseApi } from "../api/house.api";

export function useHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await houseApi.getMyHouses();
      setHouses(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load properties. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createHouse = useCallback(async (formData) => {
    const data = await houseApi.createHouse(formData);
    setHouses((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateHouse = useCallback(async (id, formData) => {
    const data = await houseApi.updateHouse(id, formData);
    setHouses((prev) => prev.map((h) => (h.id === id ? data : h)));
    return data;
  }, []);

  const deleteHouse = useCallback(async (id) => {
    await houseApi.deleteHouse(id);
    setHouses((prev) => prev.filter((h) => h.id !== id));
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return { houses, loading, error, fetchHouses, createHouse, updateHouse, deleteHouse };
}
