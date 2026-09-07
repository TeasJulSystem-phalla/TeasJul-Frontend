import { useState, useCallback, useEffect } from "react";
import { contractApi } from "../api/contract.api";
import { tenantApi } from "../api/tenant.api";
import { useAuthStore } from "../store/auth.store";

export function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerId = useAuthStore.getState().user?.id;
      const data = await contractApi.getContractsByOwner(ownerId, { page: 0, size: 200 });
      setContracts(data.content || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load contracts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getContract = useCallback(async (id) => {
    return await contractApi.getContractById(id);
  }, []);

  const createContract = useCallback(async (data) => {
    const created = await contractApi.createContract(data);
    setContracts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateContract = useCallback(async (id, data) => {
    const updated = await contractApi.updateContract(id, data);
    setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const updateContractStatus = useCallback(async (id, status) => {
    const updated = await contractApi.updateContractStatus(id, status);
    setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteContract = useCallback(async (id) => {
    await contractApi.deleteContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    getContract,
    createContract,
    updateContract,
    updateContractStatus,
    deleteContract,
  };
}

export function useContractDeposits(contractId) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeposits = useCallback(async () => {
    if (!contractId) {
      setDeposits([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDeposits(await contractApi.getDepositsByContract(contractId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load deposits."
      );
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const createDeposit = useCallback(
    async (data) => {
      const created = await contractApi.createDeposit({ ...data, contractId });
      setDeposits((prev) => [created, ...prev]);
      return created;
    },
    [contractId]
  );

  const markPaid = useCallback(
    async (id, paidAmount) => {
      const updated = await contractApi.markDepositPaid(id, paidAmount);
      setDeposits((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    },
    []
  );

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  return { deposits, loading, error, fetchDeposits, createDeposit, markPaid };
}

export function useContractRenewals(contractId) {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRenewals = useCallback(async () => {
    if (!contractId) {
      setRenewals([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRenewals(await contractApi.getRenewalsByContract(contractId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load renewals."
      );
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const createRenewal = useCallback(
    async (data) => {
      const created = await contractApi.createRenewal({ ...data, contractId });
      setRenewals((prev) => [created, ...prev]);
      return created;
    },
    [contractId]
  );

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  return { renewals, loading, error, fetchRenewals, createRenewal };
}

export function useContractTenants(contractId) {
  const [contractTenants, setContractTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContractTenants = useCallback(async () => {
    if (!contractId) {
      setContractTenants([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setContractTenants(await tenantApi.getTenantsByContract(contractId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load contract tenants."
      );
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const addTenant = useCallback(
    async (data) => {
      const created = await tenantApi.addTenantToContract({ ...data, contractId });
      setContractTenants((prev) => [...prev, created]);
      return created;
    },
    [contractId]
  );

  const updateTenant = useCallback(
    async (id, data) => {
      const updated = await tenantApi.updateContractTenant(id, { ...data, contractId });
      setContractTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [contractId]
  );

  const removeTenant = useCallback(
    async (id) => {
      await tenantApi.removeTenantFromContract(id);
      setContractTenants((prev) => prev.filter((t) => t.id !== id));
    },
    []
  );

  useEffect(() => {
    fetchContractTenants();
  }, [fetchContractTenants]);

  return { contractTenants, loading, error, fetchContractTenants, addTenant, updateTenant, removeTenant };
}
