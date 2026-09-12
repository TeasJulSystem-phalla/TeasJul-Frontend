import { useState, useEffect, useCallback, useMemo } from 'react';
import { useContracts } from './useContracts';
import { useTenants } from './useTenants';
import { tenantApi } from '../api/tenant.api';

const fullName = (t) => `${t?.firstName || ''} ${t?.lastName || ''}`.trim() || `Tenant #${t?.id}`;

/**
 * Builds a map of roomId -> list of tenants currently renting that room,
 * derived from ACTIVE contracts and their assigned tenants.
 * Returns { occupants, loading } where occupants = { [roomId]: [{ tenantId, name, isPrimary }] }.
 */
export function useRoomOccupants() {
  const { contracts, loading: cLoading, error: cError } = useContracts();
  const { tenants, loading: tLoading, error: tError } = useTenants();
  const [occupants, setOccupants] = useState({});
  const [loading, setLoading] = useState(false);

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === 'ACTIVE'),
    [contracts]
  );

  const recompute = useCallback(async () => {
    if (activeContracts.length === 0) {
      setOccupants({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const byContract = {};
    for (const c of activeContracts) {
      try {
        byContract[c.id] = await tenantApi.getTenantsByContract(c.id);
      } catch {
        byContract[c.id] = [];
      }
    }
    const mapped = {};
    for (const c of activeContracts) {
      const list = (byContract[c.id] || []).map((ct) => {
        const t = tenants.find((x) => x.id === ct.tenantId);
        return { tenantId: ct.tenantId, name: t ? fullName(t) : `Tenant #${ct.tenantId}`, isPrimary: !!ct.isPrimary };
      });
      if (list.length > 0) mapped[c.roomId] = list;
    }
    setOccupants(mapped);
    setLoading(false);
  }, [activeContracts, tenants]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  return { occupants, loading, recompute };
}
