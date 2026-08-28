import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Printer,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.js';
import ContractDocument from './ContractDocument';
import { CONTRACT_STATUS_LABEL } from './format';

const STATUS_VARIANT = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  TERMINATED: 'warning',
  EXPIRED: 'info',
  CANCELLED: 'danger',
};

const ContractDetailView = forwardRef(function ContractDetailView(
  { contract, landlord, house, room, roomType, tenantsById, contractTenants, deposits, renewals, onPrint, onDownload, onRefresh },
  ref
) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/contracts"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Contracts
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
              {contract?.contractNo || `Contract #${contract?.id}`}
            </h1>
            <Badge variant={STATUS_VARIANT[contract?.status] || 'default'}>
              {CONTRACT_STATUS_LABEL[contract?.status] || contract?.status || '—'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View, print, or download a shareable copy of this rental agreement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRefresh}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />} onClick={onPrint}>
            Print
          </Button>
          <Button variant="primary" size="sm" leftIcon={<FileDown className="h-4 w-4" />} onClick={onDownload}>
            Download PDF
          </Button>
          <Link to={`/contracts/${contract?.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Document preview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 py-6 dark:border-gray-800 dark:bg-gray-900 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:py-0 sm:py-10">
        <ContractDocument
          ref={ref}
          contract={contract}
          landlord={landlord}
          house={house}
          room={room}
          roomType={roomType}
          tenantsById={tenantsById}
          contractTenants={contractTenants}
          deposits={deposits}
          renewals={renewals}
        />
      </div>
    </div>
  );
});

export default ContractDetailView;
