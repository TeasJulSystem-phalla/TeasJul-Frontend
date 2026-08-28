import { forwardRef } from 'react';
import { formatShortDate } from './format';
import {
  InvoiceHeader,
  PartyBoxes,
  PremisesSection,
  ChargesSection,
  TenantsSection,
  DepositsSection,
  RenewalsSection,
  TermsSection,
  SignaturesSection,
  InvoiceFooter,
} from './ContractSections';

const LeasePeriod = ({ contract }) => (
  <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-[12px]">
    <span className="font-semibold uppercase tracking-wide text-slate-500">Lease Period</span>
    <span className="font-bold text-slate-900">{formatShortDate(contract?.startDate)}</span>
    <span className="text-slate-400">→</span>
    <span className="font-bold text-slate-900">
      {contract?.endDate ? formatShortDate(contract.endDate) : 'Open-ended'}
    </span>
  </div>
);

const ContractDocument = forwardRef(function ContractDocument(
  { contract, landlord, house, room, roomType, tenantsById, contractTenants, deposits, renewals },
  ref
) {
  const primary = [...(contractTenants || [])].sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))[0];
  const primaryTenant = primary ? tenantsById?.[primary.tenantId] : null;

  return (
    <div
      id="contract-document"
      ref={ref}
      className="mx-auto w-full max-w-[794px] bg-white px-8 py-9 text-slate-900 shadow-sm sm:px-10"
    >
      <InvoiceHeader contract={contract} landlord={landlord} />

      <div className="mt-5 space-y-5">
        <PartyBoxes landlord={landlord} primaryTenant={primaryTenant} house={house} />
        <LeasePeriod contract={contract} />
        <PremisesSection room={room} house={house} roomType={roomType} />
        <ChargesSection contract={contract} />
        <TenantsSection contractTenants={contractTenants} tenantsById={tenantsById} />
        <DepositsSection deposits={deposits} />
        <RenewalsSection renewals={renewals} />
        <TermsSection contract={contract} />
        <SignaturesSection landlord={landlord} tenantName={primaryTenant ? `${primaryTenant.firstName || ''} ${primaryTenant.lastName || ''}`.trim() : null} />
      </div>

      <div className="mt-8">
        <InvoiceFooter contract={contract} />
      </div>
    </div>
  );
});

export default ContractDocument;
