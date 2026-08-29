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

const SectionTitle = ({ number, title, subtitle }) => (
  <div className="mb-3 flex items-end justify-between border-b-2 border-slate-900 pb-2">
    <h3 className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-900 font-khmer">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-black text-white">{number}</span>
      {title}
    </h3>
    {subtitle && <span className="text-[12px] text-slate-500 font-khmer">{subtitle}</span>}
  </div>
);

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide font-khmer ${
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

export const KhmerContractHeader = ({ contract }) => (
  <div className="text-center border-b-[3px] border-slate-900 pb-5 mb-6">
    {/* National-style header */}
    <div className="relative mx-auto mb-3 h-16 w-16">
      <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
      <div className="absolute inset-[5px] rounded-full border border-slate-400"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[10px] font-bold text-slate-800 font-khmer">ព្រះរាជា</span>
        <span className="text-[10px] font-bold text-slate-800 font-khmer">ណាចក្រ</span>
      </div>
      <div className="absolute inset-x-2 bottom-1 border-b border-slate-400"></div>
    </div>

    <h1 className="text-[22px] font-extrabold text-slate-900 font-khmer leading-tight">
      ព្រះរាជាណាចក្រកម្ពុជា
    </h1>
    <p className="text-[15px] font-bold text-slate-700 font-khmer mt-0.5 tracking-wide">
      ជាតិ សាសនា ព្រះមហាក្សត្រ
    </p>

    <div className="mt-4 inline-block border-t-2 border-b-2 border-slate-900 px-8 py-2">
      <h2 className="text-[20px] font-black uppercase tracking-[0.2em] text-slate-900 font-khmer">
        កិច្ចសន្យាជួលផ្ទះ
      </h2>
    </div>

    <p className="text-[15px] text-slate-600 mt-3 font-khmer">
      កិច្ចសន្យានេះត្រូវបានធ្វើឡើងរវាងភាគីពីរខាងក្រោម៖
    </p>

    {/* Contract meta row */}
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[14px] text-slate-600 font-khmer">
      <span>លេខកិច្ចសន្យា: <strong className="text-slate-900">{contract?.contractNo || `CT-${contract?.id}`}</strong></span>
      <span>•</span>
      <span>ស្ថានភាព: <StatusPill status={contract?.status} /></span>
      <span>•</span>
      <span>ថ្ងៃចេញ: <strong className="text-slate-900">{formatShortDate(contract?.createdAt)}</strong></span>
    </div>
  </div>
);

export const KhmerPartySection = ({ landlord, primaryTenant }) => (
  <div className="space-y-4 mb-6">
    {/* Landlord */}
    <div className="rounded-lg border border-slate-300 overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-800 px-4 py-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-[10px] font-bold text-white font-khmer">ក</span>
        <h4 className="text-[14.5px] font-bold text-white font-khmer">ម្ចាស់ផ្ទះ (ភាគីក)</h4>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14.5px]">
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ឈ្មោះ: </span>
            <span className="font-bold text-slate-900">{landlord?.name || '—'}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ភេទ: </span>
            <span className="font-bold text-slate-900">{landlord?.gender ? genderLabel(landlord.gender) : 'ប្រុស'}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ថ្ងៃខែឆ្នាំកំណើត: </span>
            <span className="font-bold text-slate-900">{landlord?.dob || '—'}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">សញ្ជាតិ: </span>
            <span className="font-bold text-slate-900">{landlord?.nationality || 'ខ្មែរ'}</span>
          </div>
          <div className="col-span-2 font-khmer">
            <span className="font-semibold text-slate-500">អត្តសញ្ញាណប័ណ្ណលេខ: </span>
            <span className="font-bold text-slate-900">{landlord?.idNumber || '—'}</span>
          </div>
          <div className="col-span-2 font-khmer">
            <span className="font-semibold text-slate-500">ទីលំនៅបច្ចុប្បន្ន: </span>
            <span className="font-bold text-slate-900">{landlord?.address || '—'}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ទូរស័ព្ទលេខ: </span>
            <span className="font-bold text-slate-900">{landlord?.phone || '—'}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">មុខរបរបច្ចុប្បន្ន: </span>
            <span className="font-bold text-slate-900">{landlord?.occupation ? occupationLabel(landlord.occupation) : 'អាជីវករ'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Tenant */}
    <div className="rounded-lg border border-slate-300 overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-800 px-4 py-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-[10px] font-bold text-white font-khmer">ខ</span>
        <h4 className="text-[14.5px] font-bold text-white font-khmer">អ្នកទទួលជួលផ្ទះ (ភាគីខ)</h4>
      </div>
      <div className="p-4">
        {primaryTenant ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14.5px]">
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ឈ្មោះ: </span>
              <span className="font-bold text-slate-900">{fullName(primaryTenant)}</span>
            </div>
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ភេទ: </span>
              <span className="font-bold text-slate-900">{genderLabel(primaryTenant.gender)}</span>
            </div>
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ថ្ងៃខែឆ្នាំកំណើត: </span>
              <span className="font-bold text-slate-900">{primaryTenant?.dob || '—'}</span>
            </div>
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">សញ្ជាតិ: </span>
              <span className="font-bold text-slate-900">{primaryTenant?.nationality || 'ខ្មែរ'}</span>
            </div>
            <div className="col-span-2 font-khmer">
              <span className="font-semibold text-slate-500">អត្តសញ្ញាណប័ណ្ណលេខ: </span>
              <span className="font-bold text-slate-900">{primaryTenant?.idNumber || '—'}</span>
            </div>
            <div className="col-span-2 font-khmer">
              <span className="font-semibold text-slate-500">ទីលំនៅបច្ចុប្បន្ន: </span>
              <span className="font-bold text-slate-900">{primaryTenant?.address || '—'}</span>
            </div>
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ទូរស័ព្ទលេខ: </span>
              <span className="font-bold text-slate-900">{primaryTenant?.phone || '—'}</span>
            </div>
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">មុខរបរបច្ចុប្បន្ន: </span>
              <span className="font-bold text-slate-900">{occupationLabel(primaryTenant.occupationType)}</span>
            </div>
          </div>
        ) : (
          <p className="text-[14.5px] italic text-slate-500 font-khmer">មិនទាន់មានអ្នកជួលសម្រាប់កិច្ចសន្យានេះឡើយ។</p>
        )}
      </div>
    </div>
  </div>
);

export const KhmerPropertySection = ({ contract, room, house, roomType }) => (
  <div className="mb-6">
    <SectionTitle number="១" title="ព័ត៌មានអចលនទ្រព្យ" subtitle="ព័ត៌មានលម្អិតអំពីអចលនទ្រព្យ" />
    <div className="rounded-lg border border-slate-300 overflow-hidden">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14.5px]">
          {house && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ឈ្មោះផ្ទះ: </span>
              <span className="font-bold text-slate-900">{house.name || '—'}</span>
            </div>
          )}
          {house?.address && (
            <div className="col-span-2 font-khmer">
              <span className="font-semibold text-slate-500">អាស័យដ្ឋាន: </span>
              <span className="font-bold text-slate-900">{house.address}</span>
            </div>
          )}
          {room && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">បន្ទប់លេខ: </span>
              <span className="font-bold text-slate-900">{roomLabel(room)}</span>
            </div>
          )}
          {room?.floorNumber && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ជាន់: </span>
              <span className="font-bold text-slate-900">{room.floorNumber}</span>
            </div>
          )}
          {roomType && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ប្រភេទបន្ទប់: </span>
              <span className="font-bold text-slate-900">{roomType.name || '—'}</span>
            </div>
          )}
          {roomType?.price && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">តម្លៃបន្ទប់: </span>
              <span className="font-bold text-slate-900">${formatCurrency(roomType.price)}/ខែ</span>
            </div>
          )}
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ថ្លៃជួលប្រចាំខែ: </span>
            <span className="font-bold text-emerald-700 text-[15.5px]">${formatCurrency(contract?.monthlyRent)}</span>
          </div>
          <div className="font-khmer">
            <span className="font-semibold text-slate-500">ប្រាក់កក់: </span>
            <span className="font-bold text-amber-700 text-[15.5px]">${formatCurrency(contract?.securityDeposit)}</span>
          </div>
          {contract?.furniture && (
            <div className="col-span-2 font-khmer">
              <span className="font-semibold text-slate-500">គ្រឿងសង្ហារឹម: </span>
              <span className="font-bold text-slate-900">{contract.furniture}</span>
            </div>
          )}
          {contract?.occupants && (
            <div className="font-khmer">
              <span className="font-semibold text-slate-500">ចំនួនអ្នកស្នាក់នៅ: </span>
              <span className="font-bold text-slate-900">{contract.occupants} នាក់</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const KhmerAgreementSection = ({ contract, room, house, roomAmenities }) => (
  <div className="mb-6">
    <SectionTitle number="២" title="លក្ខខណ្ឌកិច្ចសន្យា" subtitle="លក្ខខណ្ឌ និងលក្ខខ័ន្ត" />
    <div className="rounded-lg border border-slate-300 p-5">
      <div className="space-y-3.5 text-[15px] leading-relaxed font-khmer">
        <div>
          <span className="font-bold text-slate-900">១.</span>{' '}
          <span className="text-slate-700">
            ម្ចាស់ផ្ទះបានយល់ព្រមជួលផ្ទះ ទៅអោយអ្នកទទួលជួលផ្ទះជាន់ទី {room?.floorNumber || '1'} (ជាន់ / ផ្នែក) នៃផ្ទះដែលមាន អាស័យដ្ឋាន {house?.address || '—'} {room?.name || '—'} សម្រាប់រយៈពេល {contract?.durationMonths || 2} (ពីរ) ឆ្នាំ ដោយគិតចាប់ពីថ្ងៃទី <strong className="text-slate-900">{formatShortDate(contract?.startDate)}</strong> ដល់ <strong className="text-slate-900">{formatShortDate(contract?.endDate)}</strong>។ អ្នកទទួលជួលផ្ទះ នឹងប្រើប្រាស់ផ្ទះដែលបានយល់ព្រមជួលទាំងស្រុង ក្នុងរយៈពេលនៃការជួល ឯម្ចាស់ផ្ទះនឹងមានសិទ្ធិចេញចូល ដោយជូនដំណឹងជាមុន។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">២.</span>{' '}
          <span className="text-slate-700">
            ថ្ងៃជួលមានតម្លៃ <strong className="text-slate-900">${formatCurrency(contract?.monthlyRent || 270)}</strong> ដុល្លារអាមេរិកក្នុងមួយខែ។
          </span>
          <div className="ml-5 mt-1.5 space-y-1 text-[14px]">
            <div className="text-slate-600">ក. អ្នកទទួលជួលផ្ទះត្រូវបង់ថ្លៃជួលផ្ទះជូនម្ចាស់ផ្ទះជា រៀងរាល់ដើមខែ។ ការបង់យឺតយ៉ាវមិនអោយលើសពី១អាទិត្យឡើយ។ (ពីថ្ងៃទី 1 ដល់ ថ្ងៃ 10)</div>
            <div className="text-slate-600">ខ. ភាគីទាំងពីរត្រូវចរចារគ្នាក៏ការបន្ត ឬ បញ្ចប់កិច្ចសន្យាជួលផ្ទះគិតចាប់ពីថ្ងៃផុត កំណត់កិច្ចសន្យាជួលផ្ទះរយៈពេលមុន២ខែ។</div>
            <div className="text-slate-600">គ. ក្នុងករណីអ្នកទទួលជួលផ្ទះ ឬ ម្ចាស់ផ្ទះចង់បញ្ឈប់កិច្ចសន្យាជួលផ្ទះមុនពេលកំណត់ ភាគីនោះត្រូវជូនដំណឹងដល់ភាគី ម្ខាងទៀតរយៈពេល ២ ខែ ជាមុន។</div>
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-900">៣.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលផ្ទះបានឯកភាពកក់ប្រាក់មុនទៅអោយភាគីម្ចាស់ផ្ទះ ចំនួន ១ ខែ = <strong className="text-slate-900">${formatCurrency(contract?.securityDeposit || 270)}</strong> ដុល្លារ ហើយប្រាក់កក់នេះ ភាគីម្ចាស់ផ្ទះនឹងប្រគល់អោយភាគីអ្នកជួលវិញនៅចុងក្រោយនៃកិច្ចសន្យា បើភាគីអ្នកជួល ជួលមិនគ្រប់តាមកិច្ចសន្យានោះប្រាក់កក់ត្រូវទុកជាអាសារបង់។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">៤.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលផ្ទះនឹងទទួលខុសត្រូវចំពោះការបង់ប្រាក់ថ្លៃទឹក សំរាម និង អគ្គិសនីដែលខ្លួនប្រើប្រាស់ និង បណ្ដាខ្នងចំណាយលើសេវាកម្មផ្សេងៗ ដែលពាក់ព័ន្ធទៅដល់ការស្នាក់នៅរបស់ខ្លួន។ អ្នកជួលផ្ទះ ទទួលខុសត្រូវបង់ថ្លៃប្រើប្រាស់អគ្គិសនី និង ទឹក គិតចាប់ពីថ្ងៃផ្ដើមជួលរហូតដល់ថ្ងៃឈប់ជួល និងចាកចេញពីផ្ទះ។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">៥.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលផ្ទះមានភារកិច្ចជូនដំណឹងដល់ម្ចាស់ផ្ទះជាបន្ទាន់ ប្រសិនបើផ្ទះនោះមានបាក់បែក ឬ ខូចខាតនៅត្រង់ផ្នែកណាមួយ ហើយត្រូវការជួសជុល។ អ្នកជួលផ្ទះមានភារកិច្ចជួសជុល ឬ ជួសជុល នូវសំភារៈណាមួយដែលគាត់បានធ្វើឱ្យខូចខាត ដោយចេតនា ឬ ដោយការ តម្រូវការប្រើប្រាស់។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">៦.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលផ្ទះនឹងទទួលខុសត្រូវក្នុងការថែរក្សាផ្ទះឱ្យនៅស្អាត និង មានរបៀប។ ក្រោយពីបញ្ចប់កិច្ចសន្យា អ្នកជួលផ្ទះនឹងប្រគល់ផ្ទះជូន ទៅម្ចាស់ផ្ទះវិញក្នុងស្ថានភាពមានសណ្តាប់ធ្នាប់ល្អ និងគ្មានអ្វីខូចខាតដោយចេតនាតឡើយ។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">៧.</span>{' '}
          <span className="text-slate-700">
            ម្ចាស់ផ្ទះនឹងផ្តល់គ្រឿងសង្ហារឹមមួយចំនួន ទៅតាមការព្រមព្រៀងគ្នារវាងម្ចាស់ជាមួយអ្នកជួលផ្ទះ សម្រាប់ឱ្យអ្នកជួលផ្ទះប្រើប្រាស់។
          </span>
          <div className="ml-5 mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded border border-slate-200 bg-slate-50 px-3 py-2">
            {(roomAmenities && roomAmenities.length > 0 ? roomAmenities : []).map((am, idx) => (
              <div key={am.id ?? am.amenityId ?? idx} className="flex items-center gap-1.5 text-[14px] text-slate-700 font-khmer">
                <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>
                {am.name || am.amenityName || `គ្រឿងសង្ហារឹម ${idx + 1}`}
                {am.quantity ? <span className="text-slate-400">×{am.quantity}</span> : null}
              </div>
            ))}
            {(!roomAmenities || roomAmenities.length === 0) && (
              <span className="col-span-2 text-[14px] italic text-slate-500 font-khmer">
                {contract?.furniture || 'មិនមានកំណត់ចំណាំគ្រឿងសង្ហារឹម'}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-900">៨.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលផ្ទះមិនអាចយកផ្ទះជួលធ្វើអាជីវកម្មខុសច្បាប់ អំពើល្មើសសកម្មភាពដែលប្រឆាំងនឹងច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជាឡើយ។ ដោយឡែក ម្ចាស់ផ្ទះមិនទទួលខុសត្រូវលើសកម្មភាពទាំងឡាយណា ដែលអ្នកជួលប្រព្រឹត្តអំពើល្មើសនឹងច្បាប់ ដោយផ្ទាល់ ឬដោយប្រយោលក្តី។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">៩.</span>{' '}
          <span className="text-slate-700">
            ប្រសិនបើមានភ្លើងឆេះផ្ទះ ការទទួលខុសត្រូវខាងហិរញ្ញវត្ថុ ត្រូវយោងទៅតាមការសម្រេចរបស់ចៅក្រមក្នុងស្រុក។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">១០.</span>{' '}
          <span className="text-slate-700">
            ភាគីអ្នកជួលផ្ទះ មិនអាចជួលផ្ទះបន្តទៅអ្នកដទៃផ្សេងទៀតបានឡើយ។
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-900">១១.</span>{' '}
          <span className="text-slate-700">
            អ្នកជួលមានសមាជិកដែលត្រូវស្នាក់នៅចំនួន <strong className="text-slate-900">{contract?.occupants || '—'}</strong>។ អ្នកជួលសន្យានឹងមិនធ្វើសកម្មភាពណាដែលរំខានដល់អ្នកជិតខាងឡើយ។
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const KhmerDepositSection = ({ deposits }) => {
  if (!deposits || deposits.length === 0) return null;

  return (
    <div className="mb-6">
      <SectionTitle number="៣" title="ព័ត៌មានប្រាក់កក់" subtitle="ព័ត៌មានអំពីប្រាក់កក់" />
      <div className="rounded-lg border border-slate-300 overflow-hidden">
        <table className="w-full border-collapse text-left text-[13.5px] font-khmer">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-b-2 border-slate-300 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">ល.រ</th>
              <th className="border-b-2 border-slate-300 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">ចំនួនទឹកប្រាក់</th>
              <th className="border-b-2 border-slate-300 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">បានបង់</th>
              <th className="border-b-2 border-slate-300 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">ស្ថានភាព</th>
              <th className="border-b-2 border-slate-300 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">កាលបរិច្ឆេទ</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep, i) => (
              <tr key={dep.id} className="odd:bg-white">
                <td className="border-b border-slate-200 px-3 py-2 text-center">{i + 1}</td>
                <td className="border-b border-slate-200 px-3 py-2 font-bold">${formatCurrency(dep.amount)}</td>
                <td className="border-b border-slate-200 px-3 py-2 font-bold">${formatCurrency(dep.paidAmount || 0)}</td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[12px] font-bold ${
                    dep.status === 'PAID' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
                    dep.status === 'REFUNDED' ? 'border-sky-300 bg-sky-50 text-sky-700' :
                    dep.status === 'FORFEITED' ? 'border-rose-300 bg-rose-50 text-rose-700' :
                    'border-slate-300 bg-slate-50 text-slate-600'
                  }`}>
                    {DEPOSIT_STATUS_LABEL[dep.status] || dep.status}
                  </span>
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-500">{formatShortDate(dep.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const KhmerSignatureSection = ({ landlord, primaryTenant, contract }) => (
  <div>
    <SectionTitle number="៤" title="ហត្ថលេខា និង ស្នាមមេដៃ" subtitle="ហត្ថលេខា" />

    <div className="rounded-lg border border-slate-300 p-5">
      <p className="text-[14px] text-center mb-2 font-khmer text-slate-600">
        កិច្ចសន្យានេះ ត្រូវបានធ្វើឡើងចំនួន ០២ ច្បាប់ ក្នុងមួយច្បាប់មាន ០២ ទំព័រ សម្រាប់ភាគីម្ចាស់ផ្ទះ ០១ ច្បាប់ និងភាគីអ្នកជួល ០១ ច្បាប់។
      </p>
      <p className="text-[14px] text-center mb-8 font-khmer font-semibold text-slate-800">
        ធ្វើនៅរាជធានីភ្នំពេញ, ថ្ងៃទី {formatShortDate(contract?.createdAt)}
      </p>

      <div className="grid grid-cols-3 gap-6">
        {/* Landlord Signature */}
        <div className="text-center">
          <div className="h-20 border-b-2 border-dotted border-slate-300 mb-3"></div>
          <p className="text-[14.5px] font-bold font-khmer text-slate-800">ម្ចាស់ផ្ទះ</p>
          <p className="text-[12px] text-slate-500 font-khmer mt-0.5">ស្នាមមេដៃ</p>
          <div className="mt-2 h-px bg-slate-200"></div>
          <p className="text-[13.5px] font-semibold mt-2 font-khmer text-slate-700">{landlord?.name || '—'}</p>
        </div>

        {/* Witness */}
        <div className="text-center">
          <div className="h-20 border-b-2 border-dotted border-slate-300 mb-3"></div>
          <p className="text-[14.5px] font-bold font-khmer text-slate-800">សាក្សី</p>
          <p className="text-[12px] text-slate-500 font-khmer mt-0.5">ស្នាមមេដៃ</p>
          <div className="mt-2 h-px bg-slate-200"></div>
          <p className="text-[13.5px] font-semibold mt-2 font-khmer text-slate-700">________________</p>
        </div>

        {/* Tenant Signature */}
        <div className="text-center">
          <div className="h-20 border-b-2 border-dotted border-slate-300 mb-3"></div>
          <p className="text-[14.5px] font-bold font-khmer text-slate-800">អ្នកជួលផ្ទះ</p>
          <p className="text-[12px] text-slate-500 font-khmer mt-0.5">ស្នាមមេដៃ</p>
          <div className="mt-2 h-px bg-slate-200"></div>
          <p className="text-[13.5px] font-semibold mt-2 font-khmer text-slate-700">{primaryTenant ? fullName(primaryTenant) : '—'}</p>
        </div>
      </div>
    </div>
  </div>
);
