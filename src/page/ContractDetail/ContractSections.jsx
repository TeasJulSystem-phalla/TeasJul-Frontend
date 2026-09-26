import {
  formatCurrency,
  formatShortDate,
  CONTRACT_STATUS_LABEL,
  DEPOSIT_STATUS_LABEL,
  genderLabel,
  occupationLabel,
  fullName,
  roomLabel,
} from './format';

/* ---------- Shared Primitives ---------- */

const display = (value) =>
  value === undefined || value === null || value === '' ? '—' : value;

const Field = ({ label, value, span }) => (
  <div className={`min-w-0 ${span === 3 ? 'col-span-3' : span ? 'col-span-2' : ''}`}>
    <span className="font-semibold text-slate-500">{label}: </span>
    <span className="break-words font-bold text-slate-900">{display(value)}</span>
  </div>
);

const SectionBar = ({ number, title }) => (
  <div className="mb-[1.5mm] flex items-center gap-1.5 border-b border-slate-900 pb-[0.8mm]">
    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-900 text-[9px] font-black text-white">
      {number}
    </span>
    <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-900">{title}</h3>
  </div>
);

const Clause = ({ n, children }) => (
  <div className="mb-[1.5mm] break-inside-avoid">
    <span className="font-bold text-slate-900">{n}.</span>{' '}
    <span className="text-slate-700">{children}</span>
  </div>
);

/* ---------- Sections ---------- */

export const KhmerContractHeader = ({ contract, contractTitle }) => (
  <header className="relative border-b-2 border-slate-900 pb-[2.5mm] text-center">
    <div className="absolute right-0 top-0 space-y-[0.5mm] text-right text-[8.5px] leading-tight text-slate-600">
      <div>
        លេខ:{' '}
        <span className="font-bold text-slate-900">
          {contract?.contractNo || `CT-${contract?.id}`}
        </span>
      </div>
      <div>
        ថ្ងៃចេញ:{' '}
        <span className="font-bold text-slate-900">{formatShortDate(contract?.createdAt)}</span>
      </div>
      <div>
        ស្ថានភាព:{' '}
        <span className="font-bold text-slate-900">
          {CONTRACT_STATUS_LABEL[contract?.status] || contract?.status || '—'}
        </span>
      </div>
    </div>

    {/* National emblem */}
    <div className="relative mx-auto mb-[1mm] h-8 w-8">
      <div className="absolute inset-0 rounded-full border border-slate-800" />
      <div className="absolute inset-[3px] rounded-full border border-slate-300" />
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-[1.05]">
        <span className="text-[6.5px] font-bold text-slate-800">ព្រះរាជា</span>
        <span className="text-[6.5px] font-bold text-slate-800">ណាចក្រ</span>
      </div>
    </div>

    <h1 className="text-[15px] font-extrabold leading-tight text-slate-900">
      ព្រះរាជាណាចក្រកម្ពុជា
    </h1>
    <p className="text-[10px] font-bold tracking-wide text-slate-700">
      ជាតិ សាសនា ព្រះមហាក្សត្រ
    </p>

    <div className="mt-[1.5mm] inline-block border-y border-slate-900 px-6 py-[0.8mm]">
      <h2 className="text-[14px] font-black uppercase tracking-[0.12em] text-slate-900">
        {contractTitle || 'កិច្ចសន្យាជួលផ្ទះ'}
      </h2>
    </div>

    <p className="mt-[1.5mm] text-[9.5px] text-slate-600">
      កិច្ចសន្យានេះត្រូវបានធ្វើឡើងរវាងភាគីពីរខាងក្រោម ដោយមានការយល់ព្រមទាំងស្រុង៖
    </p>
  </header>
);

const PartyCard = ({ badge, title, rows }) => (
  <div className="overflow-hidden rounded border border-slate-400">
    <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-[1mm]">
      <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-white/20 text-[8px] font-bold text-white">
        {badge}
      </span>
      <span className="text-[10.5px] font-bold text-white">{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-2.5 py-[1.5mm] text-[10px]">
      {rows.map((r, i) => (
        <Field key={i} label={r.label} value={r.value} span={r.span} />
      ))}
    </div>
  </div>
);

export const KhmerPartySection = ({ landlord, primaryTenant }) => {
  const landlordRows = [
    { label: 'ឈ្មោះ', value: landlord?.name },
    { label: 'ភេទ', value: landlord?.gender ? genderLabel(landlord.gender) : 'ប្រុស' },
    { label: 'ថ្ងៃខែឆ្នាំកំណើត', value: landlord?.dob },
    { label: 'សញ្ជាតិ', value: landlord?.nationality || 'ខ្មែរ' },
    { label: 'អត្តសញ្ញាណប័ណ្ណលេខ', value: landlord?.idNumber, span: 2 },
    { label: 'ទីលំនៅបច្ចុប្បន្ន', value: landlord?.address, span: 2 },
    { label: 'ទូរស័ព្ទលេខ', value: landlord?.phone },
    {
      label: 'មុខរបរបច្ចុប្បន្ន',
      value: landlord?.occupation ? occupationLabel(landlord.occupation) : 'អាជីវករ',
    },
  ];

  const tenantRows = primaryTenant
    ? [
        { label: 'ឈ្មោះ', value: fullName(primaryTenant) },
        { label: 'ភេទ', value: genderLabel(primaryTenant.gender) },
        { label: 'ថ្ងៃខែឆ្នាំកំណើត', value: primaryTenant?.dob },
        { label: 'សញ្ជាតិ', value: primaryTenant?.nationality || 'ខ្មែរ' },
        { label: 'អត្តសញ្ញាណប័ណ្ណលេខ', value: primaryTenant?.idNumber, span: 2 },
        { label: 'ទីលំនៅបច្ចុប្បន្ន', value: primaryTenant?.address, span: 2 },
        { label: 'ទូរស័ព្ទលេខ', value: primaryTenant?.phone },
        { label: 'មុខរបរបច្ចុប្បន្ន', value: occupationLabel(primaryTenant.occupationType) },
      ]
    : null;

  return (
    <section className="grid grid-cols-2 gap-[3mm]">
      <PartyCard badge="ក" title="ម្ចាស់ផ្ទះ (ភាគីក)" rows={landlordRows} />
      {tenantRows ? (
        <PartyCard badge="ខ" title="អ្នកទទួលជួលផ្ទះ (ភាគីខ)" rows={tenantRows} />
      ) : (
        <div className="flex items-center justify-center rounded border border-slate-400 px-3 text-[10px] italic text-slate-500">
          មិនទាន់មានអ្នកជួលសម្រាប់កិច្ចសន្យានេះឡើយ។
        </div>
      )}
    </section>
  );
};

export const KhmerPropertySection = ({ contract, room, house, roomType }) => (
  <section>
    <SectionBar number="១" title="ព័ត៌មានអចលនទ្រព្យ" />
    <div className="rounded border border-slate-400 px-2.5 py-[1.5mm]">
      <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[10px]">
        <Field label="ឈ្មោះផ្ទះ" value={house?.name} />
        <Field label="បន្ទប់លេខ" value={room ? roomLabel(room) : null} />
        <Field label="ជាន់" value={room?.floorNumber} />
        <Field label="អាស័យដ្ឋាន" value={house?.address} span={3} />
        <Field label="ប្រភេទបន្ទប់" value={roomType?.name} />
        <Field
          label="តម្លៃបន្ទប់"
          value={roomType?.price ? `$${formatCurrency(roomType.price)}/ខែ` : null}
        />
        <Field
          label="ចំនួនអ្នកស្នាក់នៅ"
          value={contract?.occupants ? `${contract.occupants} នាក់` : null}
        />
        <Field
          label="ថ្លៃជួលប្រចាំខែ"
          value={<span className="text-emerald-700">${formatCurrency(contract?.monthlyRent)}</span>}
        />
        <Field
          label="ប្រាក់កក់"
          value={<span className="text-amber-700">${formatCurrency(contract?.securityDeposit)}</span>}
        />
        <Field
          label="រយៈពេលជួល"
          value={contract?.durationMonths ? `${contract.durationMonths} ខែ` : null}
        />
      </div>
      {contract?.furniture && (
        <p className="mt-[1mm] text-[10px]">
          <span className="font-semibold text-slate-500">គ្រឿងសង្ហារឹម: </span>
          <span className="font-bold text-slate-900">{contract.furniture}</span>
        </p>
      )}
    </div>
  </section>
);

export const KhmerAgreementSection = ({ contract, room, house, roomAmenities }) => (
  <section>
    <SectionBar number="២" title="លក្ខខណ្ឌកិច្ចសន្យា" />
    <div className="columns-2 gap-x-[6mm] rounded border border-slate-400 px-2.5 py-[1.5mm] text-[9px] leading-[1.45]">
      <Clause n="១">
        ម្ចាស់ផ្ទះបានយល់ព្រមជួលផ្ទះ ទៅអោយអ្នកទទួលជួលផ្ទះជាន់ទី {room?.floorNumber || '1'}{' '}
        (ជាន់ / ផ្នែក) នៃផ្ទះដែលមាន អាស័យដ្ឋាន {house?.address || '—'} {room?.name || '—'}{' '}
        សម្រាប់រយៈពេល {contract?.durationMonths || 2} (ពីរ) ឆ្នាំ ដោយគិតចាប់ពីថ្ងៃទី{' '}
        <strong className="text-slate-900">{formatShortDate(contract?.startDate)}</strong> ដល់{' '}
        <strong className="text-slate-900">{formatShortDate(contract?.endDate)}</strong>។
        អ្នកទទួលជួលផ្ទះ នឹងប្រើប្រាស់ផ្ទះដែលបានយល់ព្រមជួលទាំងស្រុង ក្នុងរយៈពេលនៃការជួល
        ឯម្ចាស់ផ្ទះនឹងមានសិទ្ធិចេញចូល ដោយជូនដំណឹងជាមុន។
      </Clause>

      <Clause n="២">
        ថ្ងៃជួលមានតម្លៃ{' '}
        <strong className="text-slate-900">${formatCurrency(contract?.monthlyRent || 270)}</strong>{' '}
        ដុល្លារអាមេរិកក្នុងមួយខែ។
        <span className="mt-[0.8mm] block pl-3 text-[8.5px] text-slate-600">
          ក. អ្នកទទួលជួលផ្ទះត្រូវបង់ថ្លៃជួលផ្ទះជូនម្ចាស់ផ្ទះជា រៀងរាល់ដើមខែ។ ការបង់យឺតយ៉ាវមិនអោយលើសពី១អាទិត្យឡើយ។ (ពីថ្ងៃទី 1 ដល់ ថ្ងៃ 10)
        </span>
        <span className="mt-[0.8mm] block pl-3 text-[8.5px] text-slate-600">
          ខ. ភាគីទាំងពីរត្រូវចរចារគ្នាក៏ការបន្ត ឬ បញ្ចប់កិច្ចសន្យាជួលផ្ទះគិតចាប់ពីថ្ងៃផុត កំណត់កិច្ចសន្យាជួលផ្ទះរយៈពេលមុន២ខែ។
        </span>
        <span className="mt-[0.8mm] block pl-3 text-[8.5px] text-slate-600">
          គ. ក្នុងករណីអ្នកទទួលជួលផ្ទះ ឬ ម្ចាស់ផ្ទះចង់បញ្ឈប់កិច្ចសន្យាជួលផ្ទះមុនពេលកំណត់ ភាគីនោះត្រូវជូនដំណឹងដល់ភាគី ម្ខាងទៀតរយៈពេល ២ ខែ ជាមុន។
        </span>
      </Clause>

      <Clause n="៣">
        អ្នកជួលផ្ទះបានឯកភាពកក់ប្រាក់មុនទៅអោយភាគីម្ចាស់ផ្ទះ ចំនួន ១ ខែ ={' '}
        <strong className="text-slate-900">
          ${formatCurrency(contract?.securityDeposit || 270)}
        </strong>{' '}
        ដុល្លារ ហើយប្រាក់កក់នេះ ភាគីម្ចាស់ផ្ទះនឹងប្រគល់អោយភាគីអ្នកជួលវិញនៅចុងក្រោយនៃកិច្ចសន្យា
        បើភាគីអ្នកជួល ជួលមិនគ្រប់តាមកិច្ចសន្យានោះប្រាក់កក់ត្រូវទុកជាអាសារបង់។
      </Clause>

      <Clause n="៤">
        អ្នកជួលផ្ទះនឹងទទួលខុសត្រូវចំពោះការបង់ប្រាក់ថ្លៃទឹក សំរាម និង អគ្គិសនីដែលខ្លួនប្រើប្រាស់ និង
        បណ្ដាខ្នងចំណាយលើសេវាកម្មផ្សេងៗ ដែលពាក់ព័ន្ធទៅដល់ការស្នាក់នៅរបស់ខ្លួន។ អ្នកជួលផ្ទះ
        ទទួលខុសត្រូវបង់ថ្លៃប្រើប្រាស់អគ្គិសនី និង ទឹក គិតចាប់ពីថ្ងៃផ្ដើមជួលរហូតដល់ថ្ងៃឈប់ជួល
        និងចាកចេញពីផ្ទះ។
      </Clause>

      <Clause n="៥">
        អ្នកជួលផ្ទះមានភារកិច្ចជូនដំណឹងដល់ម្ចាស់ផ្ទះជាបន្ទាន់ ប្រសិនបើផ្ទះនោះមានបាក់បែក ឬ
        ខូចខាតនៅត្រង់ផ្នែកណាមួយ ហើយត្រូវការជួសជុល។ អ្នកជួលផ្ទះមានភារកិច្ចជួសជុល ឬ ជួសជុល
        នូវសំភារៈណាមួយដែលគាត់បានធ្វើឱ្យខូចខាត ដោយចេតនា ឬ ដោយការ តម្រូវការប្រើប្រាស់។
      </Clause>

      <Clause n="៦">
        អ្នកជួលផ្ទះនឹងទទួលខុសត្រូវក្នុងការថែរក្សាផ្ទះឱ្យនៅស្អាត និង មានរបៀប។ ក្រោយពីបញ្ចប់កិច្ចសន្យា
        អ្នកជួលផ្ទះនឹងប្រគល់ផ្ទះជូន ទៅម្ចាស់ផ្ទះវិញក្នុងស្ថានភាពមានសណ្តាប់ធ្នាប់ល្អ
        និងគ្មានអ្វីខូចខាតដោយចេតនាតឡើយ។
      </Clause>

      <Clause n="៧">
        ម្ចាស់ផ្ទះនឹងផ្តល់គ្រឿងសង្ហារឹមមួយចំនួន ទៅតាមការព្រមព្រៀងគ្នារវាងម្ចាស់ជាមួយអ្នកជួលផ្ទះ
        សម្រាប់ឱ្យអ្នកជួលផ្ទះប្រើប្រាស់។
        <span className="mt-[0.8mm] flex flex-wrap gap-x-2 gap-y-[0.5mm] rounded border border-slate-200 bg-slate-50 px-2 py-[1mm] text-[8.5px]">
          {(roomAmenities && roomAmenities.length > 0 ? roomAmenities : []).map((am, idx) => (
            <span
              key={am.id ?? am.amenityId ?? idx}
              className="flex items-center gap-1 text-slate-700"
            >
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {am.name || am.amenityName || `គ្រឿងសង្ហារឹម ${idx + 1}`}
              {am.quantity ? <span className="text-slate-400">×{am.quantity}</span> : null}
            </span>
          ))}
          {(!roomAmenities || roomAmenities.length === 0) && (
            <span className="italic text-slate-500">
              {contract?.furniture || 'មិនមានកំណត់ចំណាំគ្រឿងសង្ហារឹម'}
            </span>
          )}
        </span>
      </Clause>

      <Clause n="៨">
        អ្នកជួលផ្ទះមិនអាចយកផ្ទះជួលធ្វើអាជីវកម្មខុសច្បាប់ អំពើល្មើសសកម្មភាពដែលប្រឆាំងនឹងច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជាឡើយ។
        ដោយឡែក ម្ចាស់ផ្ទះមិនទទួលខុសត្រូវលើសកម្មភាពទាំងឡាយណា ដែលអ្នកជួលប្រព្រឹត្តអំពើល្មើសនឹងច្បាប់
        ដោយផ្ទាល់ ឬដោយប្រយោលក្តី។
      </Clause>

      <Clause n="៩">
        ប្រសិនបើមានភ្លើងឆេះផ្ទះ ការទទួលខុសត្រូវខាងហិរញ្ញវត្ថុ ត្រូវយោងទៅតាមការសម្រេចរបស់ចៅក្រមក្នុងស្រុក។
      </Clause>

      <Clause n="១០">ភាគីអ្នកជួលផ្ទះ មិនអាចជួលផ្ទះបន្តទៅអ្នកដទៃផ្សេងទៀតបានឡើយ។</Clause>

      <Clause n="១១">
        អ្នកជួលមានសមាជិកដែលត្រូវស្នាក់នៅចំនួន{' '}
        <strong className="text-slate-900">{contract?.occupants || '—'}</strong>។
        អ្នកជួលសន្យានឹងមិនធ្វើសកម្មភាពណាដែលរំខានដល់អ្នកជិតខាងឡើយ។
      </Clause>
    </div>
  </section>
);

export const KhmerDepositSection = ({ deposits }) => {
  if (!deposits || deposits.length === 0) return null;

  return (
    <section>
      <SectionBar number="៣" title="ព័ត៌មានប្រាក់កក់" />
      <div className="overflow-hidden rounded border border-slate-400">
        <table className="w-full border-collapse text-left text-[9.5px]">
          <thead>
            <tr className="bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-600">
              <th className="border-b border-slate-300 px-2 py-[0.8mm] font-bold">ល.រ</th>
              <th className="border-b border-slate-300 px-2 py-[0.8mm] font-bold">ចំនួនទឹកប្រាក់</th>
              <th className="border-b border-slate-300 px-2 py-[0.8mm] font-bold">បានបង់</th>
              <th className="border-b border-slate-300 px-2 py-[0.8mm] font-bold">ស្ថានភាព</th>
              <th className="border-b border-slate-300 px-2 py-[0.8mm] font-bold">កាលបរិច្ឆេទ</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep, i) => (
              <tr key={dep.id}>
                <td className="border-b border-slate-200 px-2 py-[0.7mm] text-center">{i + 1}</td>
                <td className="border-b border-slate-200 px-2 py-[0.7mm] font-bold">
                  ${formatCurrency(dep.amount)}
                </td>
                <td className="border-b border-slate-200 px-2 py-[0.7mm] font-bold">
                  ${formatCurrency(dep.paidAmount || 0)}
                </td>
                <td className="border-b border-slate-200 px-2 py-[0.7mm]">
                  {DEPOSIT_STATUS_LABEL[dep.status] || dep.status}
                </td>
                <td className="border-b border-slate-200 px-2 py-[0.7mm] text-slate-500">
                  {formatShortDate(dep.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const KhmerSignatureSection = ({ landlord, primaryTenant, contract }) => {
  const signers = [
    { role: 'ម្ចាស់ផ្ទះ', name: landlord?.name || '—' },
    { role: 'សាក្សី', name: '________________' },
    { role: 'អ្នកជួលផ្ទះ', name: primaryTenant ? fullName(primaryTenant) : '—' },
  ];

  return (
    <section>
      <SectionBar number="៤" title="ហត្ថលេខា និងស្នាមមេដៃ" />
      <div className="rounded border border-slate-400 px-2.5 py-[1.5mm]">
        <p className="text-center text-[9px] text-slate-600">
          កិច្ចសន្យានេះ ត្រូវបានធ្វើឡើងចំនួន ០២ ច្បាប់ ក្នុងមួយច្បាប់មាន ០១ ទំព័រ សម្រាប់ភាគីម្ចាស់ផ្ទះ ០១ ច្បាប់ និងភាគីអ្នកជួល ០១ ច្បាប់។
        </p>
        <p className="mt-[0.5mm] text-center text-[10px] font-semibold text-slate-800">
          ធ្វើនៅរាជធានីភ្នំពេញ, ថ្ងៃទី {formatShortDate(contract?.createdAt)}
        </p>

        <div className="mt-[1.5mm] grid grid-cols-3 gap-[4mm]">
          {signers.map((s) => (
            <div key={s.role} className="text-center">
              <div className="mb-[0.8mm] h-9 border-b-2 border-dotted border-slate-300" />
              <p className="text-[10px] font-bold text-slate-800">{s.role}</p>
              <p className="text-[8.5px] text-slate-500">ស្នាមមេដៃ</p>
              <div className="mt-[1mm] h-px bg-slate-200" />
              <p className="mt-[1mm] text-[9.5px] font-semibold text-slate-700">{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
