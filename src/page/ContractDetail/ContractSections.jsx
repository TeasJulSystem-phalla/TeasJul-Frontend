import {
  formatCurrency,
  formatShortDate,
  formatDateTime,
  CONTRACT_STATUS_LABEL,
  DEPOSIT_STATUS_LABEL,
  genderLabel,
  occupationLabel,
  fullName,
  roomLabel,
} from './format';

/* ---------- Shared primitives ---------- */

const DocLabel = ({ children }) => (
  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{children}</span>
);

const DocValue = ({ children, emphasize }) => (
  <span className={`text-[13px] leading-snug text-slate-900 ${emphasize ? 'text-[14px] font-bold' : ''}`}>
    {children === '' || children == null ? '—' : children}
  </span>
);

const Field = ({ label, value, emphasize }) => (
  <div className="flex flex-col gap-0.5">
    <DocLabel>{label}</DocLabel>
    <DocValue emphasize={emphasize}>{value}</DocValue>
  </div>
);

const SectionTitle = ({ number, title, subtitle }) => (
  <div className="mb-2.5 flex items-end justify-between border-b-2 border-slate-900 pb-1.5">
    <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-900">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-black text-white">{number}</span>
      {title}
    </h3>
    {subtitle && <span className="text-[10px] text-slate-500">{subtitle}</span>}
  </div>
);

const InvoiceTable = ({ headers, rows, emptyText = 'No records' }) => {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-300 px-3 py-2.5 text-[11px] italic text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <table className="w-full border-collapse text-left text-[12px] text-slate-900">
      <thead>
        <tr className="bg-slate-100">
          {headers.map((h, i) => (
            <th
              key={h}
              className={`border-b-2 border-slate-300 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 ${i === headers.length - 1 ? 'text-right' : ''}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i} className="align-top odd:bg-white">
            {cells.map((c, j) => (
              <td
                key={j}
                className={`border-b border-slate-200 px-2.5 py-1.5 ${j === cells.length - 1 ? 'text-right' : ''}`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      status === 'ACTIVE'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
        : status === 'DRAFT'
          ? 'border-slate-300 bg-slate-50 text-slate-600'
          : status === 'EXPIRED'
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : status === 'TERMINATED'
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-rose-300 bg-rose-50 text-rose-700'
    }`}
  >
    {CONTRACT_STATUS_LABEL[status] || status || '—'}
  </span>
);

/* ---------- Sections ---------- */

export const InvoiceHeader = ({ contract, landlord }) => (
  <>
    <div className="flex flex-col gap-6 border-b-4 border-slate-900 pb-5 sm:flex-row sm:items-start sm:justify-between">
      {/* Brand / from */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded bg-slate-900 text-lg font-black text-white">RH</span>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">RentalHub</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Property Management</p>
          </div>
        </div>
        <div className="mt-3 space-y-0.5 border-l-2 border-slate-200 pl-3 text-[11px] text-slate-600">
          <p className="font-semibold text-slate-800">{landlord?.name || 'Property Owner'}</p>
          {landlord?.email && <p>{landlord.email}</p>}
          {landlord?.phone && <p>{landlord.phone}</p>}
        </div>
      </div>

      {/* Title / meta */}
      <div className="sm:text-right">
        <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-slate-900">Rental Agreement</h2>
        <div className="mt-3 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-left sm:text-right">
          <DocLabel>Invoice No.</DocLabel>
          <DocValue>{contract?.contractNo || `CT-${contract?.id}`}</DocValue>
          <DocLabel>Status</DocLabel>
          <span className="justify-self-end"><StatusPill status={contract?.status} /></span>
          <DocLabel>Issued</DocLabel>
          <DocValue>{formatShortDate(contract?.createdAt)}</DocValue>
          <DocLabel>Updated</DocLabel>
          <DocValue>{formatShortDate(contract?.updatedAt)}</DocValue>
        </div>
      </div>
    </div>
  </>
);

export const PartyBoxes = ({ landlord, primaryTenant, house }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">From / Landlord</span>
      </div>
      <div className="space-y-2 p-3">
        <Field label="Name" value={landlord?.name || '—'} emphasize />
        {house?.name && <Field label="Property" value={house.name} />}
        {landlord?.email && <Field label="Email" value={landlord.email} />}
        {landlord?.phone && <Field label="Phone" value={landlord.phone} />}
      </div>
    </div>
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">To / Tenant</span>
      </div>
      <div className="space-y-2 p-3">
        {primaryTenant ? (
          <>
            <Field label="Name" value={fullName(primaryTenant)} emphasize />
            {primaryTenant.phone && <Field label="Phone" value={primaryTenant.phone} />}
            {primaryTenant.email && <Field label="Email" value={primaryTenant.email} />}
            {primaryTenant.idNumber && <Field label="ID Number" value={primaryTenant.idNumber} />}
          </>
        ) : (
          <p className="text-[12px] italic text-slate-500">No tenant assigned to this contract yet.</p>
        )}
      </div>
    </div>
  </div>
);

export const PremisesSection = ({ room, house, roomType }) => {
  const rows = [
    ['House / Building', house?.name || '—', 'Address', house?.address || '—'],
    ['Room', room ? roomLabel(room) : '—', 'Room Type', roomType?.name || '—'],
    ['Floor', room?.floorNumber ?? '—', 'Capacity', room?.capacity ?? '—'],
  ];
  return (
    <section>
      <SectionTitle number="01" title="Premises" />
      <InvoiceTable headers={['Detail', 'Value', 'Detail', 'Value']} rows={rows} />
    </section>
  );
};

export const ChargesSection = ({ contract }) => {
  const rows = [
    ['Monthly Rent', 'Payable on day ' + (contract?.dueDay ?? '—') + ' of each month', '1', formatCurrency(contract?.monthlyRent)],
    ['Security Deposit', 'Refundable deposit', '1', formatCurrency(contract?.securityDeposit)],
  ];
  const total = (Number(contract?.monthlyRent) || 0) + (Number(contract?.securityDeposit) || 0);
  return (
    <section>
      <SectionTitle number="02" title="Charges" subtitle="Summary of charges" />
      <InvoiceTable headers={['Description', 'Details', 'Qty', 'Amount']} rows={rows} emptyText="No financial details recorded." />
      <div className="mt-1 flex justify-end">
        <div className="w-full max-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-2.5 py-1 text-[12px] text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 text-[13px] font-bold text-white">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const TenantsSection = ({ contractTenants, tenantsById }) => {
  const rows = (contractTenants || []).map((ct) => {
    const t = tenantsById?.[ct.tenantId];
    return [
      fullName(t),
      ct.isPrimary ? 'Primary' : 'Additional',
      formatShortDate(ct.joinedAt),
      ct.leftAt ? formatShortDate(ct.leftAt) : '—',
      `${genderLabel(t?.gender)} · ${occupationLabel(t?.occupationType)}`,
    ];
  });
  return (
    <section>
      <SectionTitle number="03" title="Occupants" subtitle="All tenants bound by this agreement" />
      <InvoiceTable headers={['Name', 'Role', 'Joined', 'Left', 'Profile']} rows={rows} emptyText="No tenants assigned to this contract." />
    </section>
  );
};

export const DepositsSection = ({ deposits }) => {
  const rows = (deposits || []).map((d) => [
    formatCurrency(d.amount),
    formatCurrency(d.paidAmount),
    DEPOSIT_STATUS_LABEL[d.status] || d.status || '—',
    d.status === 'PAID' ? formatDateTime(d.paidAt) : formatDateTime(d.createdAt),
  ]);
  return (
    <section>
      <SectionTitle number="04" title="Deposits" />
      <InvoiceTable headers={['Amount', 'Paid', 'Status', 'Recorded']} rows={rows} emptyText="No deposits recorded for this contract." />
    </section>
  );
};

export const RenewalsSection = ({ renewals }) => {
  const rows = (renewals || []).map((r) => [
    formatCurrency(r.previousRent),
    formatCurrency(r.newRent),
    formatShortDate(r.previousEndDate),
    formatShortDate(r.newEndDate),
    formatDateTime(r.renewedAt),
  ]);
  return (
    <section>
      <SectionTitle number="05" title="Renewal History" />
      <InvoiceTable
        headers={['Previous Rent', 'New Rent', 'Previous End', 'New End', 'Renewed']}
        rows={rows}
        emptyText="This contract has not been renewed."
      />
    </section>
  );
};

export const TermsSection = ({ contract }) => (
  <section>
    <SectionTitle number="06" title="Terms & Conditions" subtitle="Notes & special clauses" />
    <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11.5px] leading-relaxed text-slate-700">
      {contract?.notes ? contract.notes : 'No additional terms or notes recorded for this agreement.'}
    </div>
  </section>
);

export const SignaturesSection = ({ landlord, tenantName }) => (
  <section>
    <SectionTitle number="07" title="Signatures" subtitle="By signing, the parties agree to the terms above" />
    <div className="grid grid-cols-2 gap-8">
      <div>
        <div className="mb-1 h-10 border-b-2 border-dotted border-slate-300" />
        <p className="text-[12px] font-bold text-slate-900">{landlord?.name || 'Landlord'}</p>
        <p className="text-[10px] text-slate-500">Signature &amp; date</p>
      </div>
      <div>
        <div className="mb-1 h-10 border-b-2 border-dotted border-slate-300" />
        <p className="text-[12px] font-bold text-slate-900">{tenantName || 'Tenant'}</p>
        <p className="text-[10px] text-slate-500">Signature &amp; date</p>
      </div>
    </div>
  </section>
);

export const InvoiceFooter = ({ contract }) => (
  <div className="flex flex-col items-center gap-1 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
    <p className="text-[11px] font-medium text-slate-500">Thank you for your business</p>
    <p>{contract?.contractNo || `Contract #${contract?.id}`} · Generated on {formatShortDate(new Date().toISOString())} via RentalHub</p>
  </div>
);
