import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import {
  useContracts,
  useContractTenants,
  useContractDeposits,
  useContractRenewals,
} from '../../hooks/useContracts';
import { useTenants } from '../../hooks/useTenants';
import { useRooms } from '../../hooks/useRooms';
import { useHouses } from '../../hooks/useHouses';
import { useRoomTypes } from '../../hooks/useRoomType';
import { useAuthStore } from '../../store/auth.store';
import { EmptyState, Button, Skeleton } from '../../components/ui/index.js';
import ContractDetailView from './ContractDetailView';

const docTitle = (contract, ext = '') =>
  `${contract?.contractNo || `Contract-${contract?.id}`}-Rental-Agreement${ext}`;

export default function ContractDetailPage() {
  const { id } = useParams();
  const contractId = Number(id);

  const { getContract } = useContracts();
  const { tenants } = useTenants();
  const { getRoom } = useRooms();
  const { houses } = useHouses();
  const { roomTypes } = useRoomTypes();
  const user = useAuthStore((s) => s.user);

  const { contractTenants, fetchContractTenants } = useContractTenants(contractId);
  const { deposits, fetchDeposits } = useContractDeposits(contractId);
  const { renewals, fetchRenewals } = useContractRenewals(contractId);

  const [contract, setContract] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const documentRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const c = await getContract(contractId);
      setContract(c);
      let r = null;
      if (c.roomId) {
        try {
          r = await getRoom(c.roomId);
        } catch {
          r = null;
        }
      }
      setRoom(r);
    } catch (err) {
      setLoadError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to load contract.'
      );
    } finally {
      setLoading(false);
    }
  }, [contractId, getContract, getRoom]);

  const handlePrint = useCallback(() => {
    const prev = document.title;
    document.title = docTitle(contract);
    window.print();
    document.title = prev;
  }, [contract]);

  const handleDownloadPdf = useCallback(() => {
    const prev = document.title;
    document.title = docTitle(contract, '.pdf');
    window.print();
    document.title = prev;
  }, [contract]);

  const handleRefresh = useCallback(() => {
    load();
    fetchContractTenants();
    fetchDeposits();
    fetchRenewals();
  }, [load, fetchContractTenants, fetchDeposits, fetchRenewals]);

  useEffect(() => {
    load();
  }, [load]);

  const landlord = useMemo(() => {
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return { name: name || user?.username || 'Property Owner', email: user?.email, phone: user?.phone };
  }, [user]);

  const tenantsById = useMemo(
    () => Object.fromEntries((tenants || []).map((t) => [t.id, t])),
    [tenants]
  );

  const house = useMemo(
    () => (room?.houseId ? houses.find((h) => h.id === room.houseId) : null),
    [room, houses]
  );

  const roomType = useMemo(
    () => (room?.roomTypeId ? roomTypes.find((rt) => rt.id === room.roomTypeId) : null),
    [room, roomTypes]
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-100 py-8 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="mx-auto h-[700px] w-full max-w-[794px] bg-white" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <Link
          to="/contracts"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Contracts
        </Link>
        <EmptyState
          icon={FileText}
          title="Unable to load contract"
          description={loadError}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={load}>Retry</Button>
              <Link to="/contracts">
                <Button variant="primary" size="sm">Go to Contracts</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <ContractDetailView
      ref={documentRef}
      contract={contract}
      landlord={landlord}
      house={house}
      room={room}
      roomType={roomType}
      tenantsById={tenantsById}
      contractTenants={contractTenants}
      deposits={deposits}
      renewals={renewals}
      onPrint={handlePrint}
      onDownload={handleDownloadPdf}
      onRefresh={handleRefresh}
    />
  );
}
