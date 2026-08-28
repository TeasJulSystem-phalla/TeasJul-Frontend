import { forwardRef } from 'react';
import ContractDocument from './ContractDocument';
import { Button } from '../../components/ui/index.js';
import {
  RotateCcw,
  Printer,
  FileDown,
} from 'lucide-react';

const ContractDetailView = forwardRef(function ContractDetailView(
  { contract, landlord, house, room, roomType, roomAmenities, tenantsById, contractTenants, deposits, renewals, onPrint, onDownload, onRefresh },
  ref
) {
  return (
    <div className="space-y-4 print:space-y-0">
      {/* Toolbar - hidden on print */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 print:hidden sm:px-8">
        <p className="text-xs text-slate-400">
          {contract?.contractNo || `CT-${contract?.id}`}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={onRefresh}>
            ធ្វើស្រស់
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={onPrint}>
            បោះពុម្ភ
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<FileDown className="h-3.5 w-3.5" />} onClick={onDownload}>
            ទាញយក
          </Button>
        </div>
      </div>

      {/* Document */}
      <ContractDocument
        ref={ref}
        contract={contract}
        landlord={landlord}
        house={house}
        room={room}
        roomType={roomType}
        roomAmenities={roomAmenities}
        tenantsById={tenantsById}
        contractTenants={contractTenants}
        deposits={deposits}
        renewals={renewals}
      />
    </div>
  );
});

export default ContractDetailView;
