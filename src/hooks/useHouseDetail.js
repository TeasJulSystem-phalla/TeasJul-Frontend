import { useState, useCallback, useEffect } from "react";
import { houseApi } from "../api/house.api";

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function useHouseDetail(houseId) {
  const [house, setHouse] = useState(null);
  const [summary, setSummary] = useState(null);

  // Rooms
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [roomsPage, setRoomsPage] = useState(0);
  const [roomsTotalPages, setRoomsTotalPages] = useState(0);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");

  // Tenants
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantsError, setTenantsError] = useState(null);
  const [tenantsPage, setTenantsPage] = useState(0);
  const [tenantsTotalPages, setTenantsTotalPages] = useState(0);
  const [tenantSearch, setTenantSearch] = useState("");

  // Contracts
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState(null);
  const [contractsPage, setContractsPage] = useState(0);
  const [contractsTotalPages, setContractsTotalPages] = useState(0);
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatus, setContractStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const size = 10;

  const debouncedRoomSearch = useDebounced(roomSearch);
  const debouncedRoomTypeFilter = useDebounced(roomTypeFilter);
  const debouncedTenantSearch = useDebounced(tenantSearch);
  const debouncedContractSearch = useDebounced(contractSearch);

  const loadHouse = useCallback(async () => {
    if (!houseId) return;
    setLoading(true);
    setError(null);
    try {
      const [h, s] = await Promise.all([
        houseApi.getHouseById(houseId),
        houseApi.getHouseSummary(houseId),
      ]);
      setHouse(h);
      setSummary(s);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load house details."
      );
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  const fetchRooms = useCallback(async () => {
    if (!houseId) return;
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const data = await houseApi.getHouseRooms(houseId, {
        page: roomsPage,
        size,
        search: debouncedRoomSearch || undefined,
        status: roomStatus || undefined,
        roomTypeId: debouncedRoomTypeFilter || undefined,
      });
      setRooms(data.content || []);
      setRoomsTotalPages(data.totalPages || 0);
    } catch (err) {
      setRoomsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load rooms."
      );
    } finally {
      setRoomsLoading(false);
    }
  }, [
    houseId,
    roomsPage,
    debouncedRoomSearch,
    roomStatus,
    debouncedRoomTypeFilter,
  ]);

  const fetchTenants = useCallback(async () => {
    if (!houseId) return;
    setTenantsLoading(true);
    setTenantsError(null);
    try {
      const data = await houseApi.getHouseTenants(houseId, {
        page: tenantsPage,
        size,
        search: debouncedTenantSearch || undefined,
      });
      setTenants(data.content || []);
      setTenantsTotalPages(data.totalPages || 0);
    } catch (err) {
      setTenantsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load tenants."
      );
    } finally {
      setTenantsLoading(false);
    }
  }, [houseId, tenantsPage, debouncedTenantSearch]);

  const fetchContracts = useCallback(async () => {
    if (!houseId) return;
    setContractsLoading(true);
    setContractsError(null);
    try {
      const data = await houseApi.getHouseContracts(houseId, {
        page: contractsPage,
        size,
        search: debouncedContractSearch || undefined,
        status: contractStatus || undefined,
      });
      setContracts(data.content || []);
      setContractsTotalPages(data.totalPages || 0);
    } catch (err) {
      setContractsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load contracts."
      );
    } finally {
      setContractsLoading(false);
    }
  }, [houseId, contractsPage, debouncedContractSearch, contractStatus]);

  useEffect(() => {
    loadHouse();
  }, [loadHouse]);

  // Reset to first page whenever a filter/search changes, then refetch.
  useEffect(() => {
    if (!houseId) return;
    setRoomsPage(0);
  }, [houseId, debouncedRoomSearch, roomStatus, debouncedRoomTypeFilter]);

  useEffect(() => {
    if (!houseId) return;
    setTenantsPage(0);
  }, [houseId, debouncedTenantSearch]);

  useEffect(() => {
    if (!houseId) return;
    setContractsPage(0);
  }, [houseId, debouncedContractSearch, contractStatus]);

  // Fetch whenever page or filters change.
  useEffect(() => {
    if (houseId) fetchRooms();
  }, [fetchRooms, houseId]);

  useEffect(() => {
    if (houseId) fetchTenants();
  }, [fetchTenants, houseId]);

  useEffect(() => {
    if (houseId) fetchContracts();
  }, [fetchContracts, houseId]);

  const refreshAll = useCallback(() => {
    loadHouse();
    fetchRooms();
    fetchTenants();
    fetchContracts();
  }, [loadHouse, fetchRooms, fetchTenants, fetchContracts]);

  return {
    house,
    summary,
    loading,
    error,
    refreshAll,

    rooms,
    roomsLoading,
    roomsError,
    roomsPage,
    roomsTotalPages,
    setRoomsPage,
    roomSearch,
    setRoomSearch,
    roomStatus,
    setRoomStatus,
    roomTypeFilter,
    setRoomTypeFilter,

    tenants,
    tenantsLoading,
    tenantsError,
    tenantsPage,
    tenantsTotalPages,
    setTenantsPage,
    tenantSearch,
    setTenantSearch,

    contracts,
    contractsLoading,
    contractsError,
    contractsPage,
    contractsTotalPages,
    setContractsPage,
    contractSearch,
    setContractSearch,
    contractStatus,
    setContractStatus,
  };
}
