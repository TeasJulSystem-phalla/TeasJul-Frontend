import { useState, useCallback, useEffect } from "react";
import { tenantApi } from "../api/tenant.api";

export function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTenants(await tenantApi.getMyTenants());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load tenants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getTenant = useCallback(async (id) => {
    return await tenantApi.getTenantById(id);
  }, []);

  const createTenant = useCallback(async (data) => {
    const created = await tenantApi.createTenant(data);
    setTenants((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTenant = useCallback(async (id, data) => {
    const updated = await tenantApi.updateTenant(id, data);
    setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deactivateTenant = useCallback(async (id) => {
    await tenantApi.deactivateTenant(id);
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "INACTIVE" } : t))
    );
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    getTenant,
    createTenant,
    updateTenant,
    deactivateTenant,
  };
}

export function useEmergencyContacts(tenantId) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!tenantId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setContacts(await tenantApi.getEmergencyContacts(tenantId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load emergency contacts."
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createContact = useCallback(
    async (data) => {
      const created = await tenantApi.createEmergencyContact(tenantId, data);
      setContacts((prev) => [...prev, created]);
      return created;
    },
    [tenantId]
  );

  const updateContact = useCallback(
    async (contactId, data) => {
      const updated = await tenantApi.updateEmergencyContact(tenantId, contactId, data);
      setContacts((prev) => prev.map((c) => (c.id === contactId ? updated : c)));
      return updated;
    },
    [tenantId]
  );

  const deleteContact = useCallback(
    async (contactId) => {
      await tenantApi.deleteEmergencyContact(tenantId, contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    },
    [tenantId]
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, fetchContacts, createContact, updateContact, deleteContact };
}
