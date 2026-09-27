import { forwardRef } from 'react';
import {
  KhmerContractHeader,
  KhmerPartySection,
  KhmerPropertySection,
  KhmerAgreementSection,
  KhmerDepositSection,
  KhmerSignatureSection,
} from './ContractSections';

const ContractDocument = forwardRef(function ContractDocument(
  { contract, landlord, house, room, roomType, roomAmenities, tenantsById, contractTenants, deposits, settings },
  ref
) {
  const primary = [...(contractTenants || [])].sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))[0];
  const primaryTenant = primary ? tenantsById?.[primary.tenantId] : null;

  return (
    <div
      id="contract-document"
      ref={ref}
      className="mx-auto h-[297mm] w-full max-w-[210mm] overflow-hidden bg-white p-[8mm] text-slate-900 shadow-lg print:shadow-none font-khmer"
    >
      <div className="contract-body w-full [transform-origin:top_left]">
        <KhmerContractHeader contract={contract} contractTitle={settings?.contractTitle} primaryTenant={primaryTenant} />

        <div className="mt-[2.5mm] space-y-[2.5mm]">
          <KhmerPartySection landlord={landlord} primaryTenant={primaryTenant} />
          <KhmerPropertySection
            contract={contract}
            room={room}
            house={house}
            roomType={roomType}
            occupantCount={contractTenants ? contractTenants.length : null}
          />
          <KhmerAgreementSection contract={contract} room={room} house={house} roomAmenities={roomAmenities} />
          <KhmerDepositSection deposits={deposits} />
          <KhmerSignatureSection landlord={landlord} primaryTenant={primaryTenant} contract={contract} />
        </div>
      </div>
    </div>
  );
});

export default ContractDocument;
