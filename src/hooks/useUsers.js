import { useState, useCallback, useEffect } from "react";
import { userApi } from "../api/user.api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load users.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    await userApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers, deleteUser };
}
