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
      className="mx-auto w-full max-w-[794px] bg-white px-6 py-8 text-slate-900 shadow-lg print:shadow-none sm:px-10 font-khmer"
    >
      <KhmerContractHeader contract={contract} contractTitle={settings?.contractTitle} primaryTenant={primaryTenant} />

      <div className="mt-6 space-y-6">
        <KhmerPartySection landlord={landlord} primaryTenant={primaryTenant} />
        <KhmerPropertySection contract={contract} room={room} house={house} roomType={roomType} />
        <KhmerAgreementSection contract={contract} room={room} house={house} roomAmenities={roomAmenities} />
        <KhmerDepositSection deposits={deposits} />
        <KhmerSignatureSection landlord={landlord} primaryTenant={primaryTenant} contract={contract} />
      </div>
    </div>
  );
});

export default ContractDocument;
