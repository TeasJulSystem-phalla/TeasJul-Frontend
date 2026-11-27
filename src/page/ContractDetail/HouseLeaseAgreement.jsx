import { forwardRef } from 'react';
import { MISSING_INFO_LABEL, isBlank } from './format';

const HouseLeaseAgreement = forwardRef(function HouseLeaseAgreement(
  {
    documentNumber = '3',
    contractNumber,
    place = 'រាជធានីភ្នំពេញ',
    placeEnglish = 'Phnom Penh capital',

    // Party A — first lessor
    lessorName,
    lessorSex,
    lessorAge,
    lessorHouseNumber,
    lessorStreetNumber,
    lessorSangkat,
    lessorKhan,
    lessorCityProvince,

    // Party A — second lessor (same layout as the first one). Rendered only
    // when a name is actually supplied; no data is invented for this party.
    coLessorName,
    coLessorSex,
    coLessorAge,
    coLessorHouseNumber,
    coLessorStreetNumber,
    coLessorSangkat,
    coLessorKhan,
    coLessorCityProvince,

    // Party B — lessee
    lesseeName,
    lesseeSex,
    lesseeAge,
    lesseeHouseNumber,
    lesseeStreetNumber,
    lesseeSangkat,
    lesseeKhan,
    lesseeCityProvince,

    // Terms
    houseNumber,
    streetNumber,
    sangkat,
    khan,
    houseCityProvince,
    roomNumber,
    floorNumber,
    propertyAddress,
    roomTypeName,
    price,
    durationYears,
    startDate,
    endDate,

    className = '',
  },
  ref
) {
  const hasCoLessor = !isBlank(coLessorName);
  const hasRoomDetails = [roomNumber, floorNumber, propertyAddress, roomTypeName].some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  return (
    <article
      ref={ref}
      id="contract-document"
      className={`mx-auto w-full max-w-[210mm] bg-white p-[10mm] text-black shadow-lg print:max-w-none print:shadow-none print:border-none print:bg-white ${className}`}
    >
      <div>
        {/* ---------- Header ---------- */}
        <header className="text-center">
          <p className="khmer-moul-header text-[16px] font-semibold leading-[1.6]">
            ព្រះរាជាណាចក្រកម្ពុជា
          </p>
          <p className="khmer-moul-header text-[15px] leading-[1.6]">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
          <p className="english-doc mt-[1mm] text-[14px] leading-[1.5]">
            KINGDOM OF CAMBODIA
          </p>
          <p className="english-doc text-[14px] leading-[1.5]">
            NATION RELIGION KING
          </p>

          <p className="doc-number mt-[4mm] text-[36px] font-bold leading-none">
            {contractNumber ? String(contractNumber) : documentNumber}
          </p>

          <h1 className="khmer-moul-header mt-[3mm] text-[16px] font-bold leading-[1.5]">
            {contractNumber ? `កិច្ចសន្យាជួលផ្ទះ លេខ ${contractNumber}` : 'កិច្ចសន្យាជួលផ្ទះ'}
          </h1>
          <p className="english-doc text-[14px] leading-[1.5]">
            HOUSE LEASE AGREEMENT
          </p>
        </header>

        {/* ---------- Parties ---------- */}
        <div className="mt-[6mm] space-y-[4mm]">
          <LessorPartyBlock
            party={{
              name: lessorName,
              sex: lessorSex,
              age: lessorAge,
              houseNumber: lessorHouseNumber,
              streetNumber: lessorStreetNumber,
              sangkat: lessorSangkat,
              khan: lessorKhan,
            }}
            place={lessorCityProvince || place}
            placeEnglish={placeEnglish}
          />

          {hasCoLessor && (
            <>
              <LessorPartyBlock
                party={{
                  name: coLessorName,
                  sex: coLessorSex,
                  age: coLessorAge,
                  houseNumber: coLessorHouseNumber,
                  streetNumber: coLessorStreetNumber,
                  sangkat: coLessorSangkat,
                  khan: coLessorKhan,
                }}
                place={coLessorCityProvince || place}
                placeEnglish={placeEnglish}
              />
              {/* Any co-lessor signature block must remain inside this guard. */}
            </>
          )}

          <PartyBlock
            party={{
              name: lesseeName,
              sex: lesseeSex,
              age: lesseeAge,
              houseNumber: lesseeHouseNumber,
              streetNumber: lesseeStreetNumber,
              sangkat: lesseeSangkat,
              khan: lesseeKhan,
            }}
            partyLetter="ខ"
            roleKhmer="ជាអ្នកជួលផ្ទះ"
            roleEnglish='Party "B", the lessee'
            place={lesseeCityProvince || place}
            placeEnglish={placeEnglish}
          />
        </div>

        {/* ---------- Terms & conditions ---------- */}
        <p className="khmer-doc mt-[6mm] text-center text-[15px] font-semibold leading-[1.7]">
          ភាគីទាំងពីរបានព្រមព្រៀងគ្នាចូលក្នុងកិច្ចសន្យាតាមលក្ខខណ្ឌដូចខាងក្រោម៖
        </p>

        <div className="mt-[3mm] space-y-[3mm]">
          <section>
            <p className="khmer-doc text-[15px] leading-[1.9]">
              <span className="font-bold">ប្រការ១៖</span> ភាគី «ក» យល់ព្រមជួលផ្ទះលេខ{' '}
              <Blank value={houseNumber} width="w-[80px]" /> ផ្លូវលេខ{' '}
              <Blank value={streetNumber} width="w-[80px]" /> សង្កាត់{' '}
              <Blank value={sangkat} width="w-[120px]" /> ខណ្ឌ{' '}
              <Blank value={khan} width="w-[100px]" /> {houseCityProvince || place}
              {hasRoomDetails && (
                <>
                  {' '}បន្ទប់លេខ <Blank value={roomNumber} width="w-[110px]" /> ជាន់{' '}
                  <Blank value={floorNumber} width="w-[50px]" /> អាស័យដ្ឋាន{' '}
                  <Blank value={propertyAddress} width="w-[160px]" /> ប្រភេទបន្ទប់{' '}
                  <Blank value={roomTypeName} width="w-[110px]" />
                </>
              )}{' '}
              ទៅឱ្យភាគី «ខ» ដោយតម្លៃជួល{' '}
              <Blank value={price} width="w-[110px]" /> ដុល្លារអាមេរិក ក្នុងមួយខែ។
            </p>
            <p className="english-doc mt-[1mm] text-[14px] leading-[1.6]">
              Article 1: Party "A" agrees to lease house No.{' '}
              <Blank value={houseNumber} width="w-[80px]" />, street No.{' '}
              <Blank value={streetNumber} width="w-[80px]" />, Sangkat{' '}
              <Blank value={sangkat} width="w-[120px]" />, Khan{' '}
              <Blank value={khan} width="w-[100px]" />, {placeEnglish}
              {hasRoomDetails && (
                <>
                  , room No. <Blank value={roomNumber} width="w-[110px]" />, floor{' '}
                  <Blank value={floorNumber} width="w-[50px]" />, address{' '}
                  <Blank value={propertyAddress} width="w-[160px]" />, room type{' '}
                  <Blank value={roomTypeName} width="w-[110px]" />
                </>
              )}
              , to Party "B" at a monthly rent of{' '}
              <Blank value={price} width="w-[110px]" /> US dollars.
            </p>
          </section>

          <section>
            <p className="khmer-doc text-[15px] leading-[1.9]">
              <span className="font-bold">ប្រការ២៖</span> កិច្ចសន្យានេះមានរយៈពេល{' '}
              <Blank value={durationYears} width="w-[60px]" /> ឆ្នាំ ចាប់ផ្ដើមពីថ្ងៃទី{' '}
              <Blank value={startDate} width="w-[130px]" /> ដល់ថ្ងៃទី{' '}
              <Blank value={endDate} width="w-[130px]" />។
            </p>
            <p className="english-doc mt-[1mm] text-[14px] leading-[1.6]">
              Article 2: This agreement shall remain in force for a period of{' '}
              <Blank value={durationYears} width="w-[60px]" /> year(s), commencing on{' '}
              <Blank value={startDate} width="w-[130px]" /> and ending on{' '}
              <Blank value={endDate} width="w-[130px]" />.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
});

/** An inline dotted fill-in field: blank when no value is supplied. */
function Blank({ value, width = 'w-24' }) {
  const text = isBlank(value) ? MISSING_INFO_LABEL : String(value);
  return <span className={`fill-blank ${width}`}>{text}</span>;
}

/** Lessor paragraph in the exact bilingual wording used by the lease template. */
function LessorPartyBlock({ party, place, placeEnglish }) {
  return (
    <section>
      <p className="khmer-doc text-[15px] leading-[1.9]">
        អ្នកផ្តល់ (ម្ចាស់ផ្ទះ) ឈ្មោះ{' '}
        <Blank value={party.name} width="w-[180px]" /> ភេទ{' '}
        <Blank value={party.sex} width="w-[70px]" /> អាយុ{' '}
        <Blank value={party.age} width="w-[48px]" /> ឆ្នាំ សញ្ជាតិខ្មែរ អាសយដ្ឋានបច្ចុប្បន្ន ផ្ទះលេខ{' '}
        <Blank value={party.houseNumber} width="w-[80px]" /> ផ្លូវលេខ{' '}
        <Blank value={party.streetNumber} width="w-[80px]" /> សង្កាត់{' '}
        <Blank value={party.sangkat} width="w-[120px]" /> ខណ្ឌ{' '}
        <Blank value={party.khan} width="w-[100px]" /> {place} ហៅកាត់ថាភាគី «ក»។
      </p>
      <p className="english-doc mt-[1mm] text-[14px] leading-[1.6]">
        The lessor (landlord), Name:{' '}
        <Blank value={party.name} width="w-[180px]" />, Sex:<Blank value={party.sex} width="w-[70px]" />, Age{' '}
        <Blank value={party.age} width="w-[48px]" />years, Khmer national, Current address: House number{' '}
        <Blank value={party.houseNumber} width="w-[80px]" />, Street number{' '}
        <Blank value={party.streetNumber} width="w-[80px]" />, Sangkat{' '}
        <Blank value={party.sangkat} width="w-[120px]" />, Khan{' '}
        <Blank value={party.khan} width="w-[100px]" />, {placeEnglish}, hereinafter referred to as Party (A).
      </p>
    </section>
  );
}

/** One party paragraph in Khmer followed by its English translation. */
function PartyBlock({
  party,
  partyLetter = 'ក',
  roleKhmer,
  roleEnglish,
  place,
  placeEnglish,
}) {
  return (
    <section>
      <p className="khmer-doc text-[15px] leading-[1.9]">
        ខ្ញុំព្រះករុណា ខ្ញុំឈ្មោះ <Blank value={party.name} width="w-[180px]" /> ភេទ{' '}
        <Blank value={party.sex} width="w-[70px]" /> អាយុ{' '}
        <Blank value={party.age} width="w-[48px]" /> ឆ្នាំ សញ្ជាតិខ្មែរ មានទីលំនៅបច្ចុប្បន្ន ផ្ទះលេខ{' '}
        <Blank value={party.houseNumber} width="w-[80px]" /> ផ្លូវលេខ{' '}
        <Blank value={party.streetNumber} width="w-[80px]" /> សង្កាត់{' '}
        <Blank value={party.sangkat} width="w-[120px]" /> ខណ្ឌ{' '}
        <Blank value={party.khan} width="w-[100px]" /> {place}។ ហៅថាភាគី «{partyLetter}»{' '}
        {roleKhmer}។
      </p>
      <p className="english-doc mt-[1mm] text-[14px] leading-[1.6]">
        I, <Blank value={party.name} width="w-[180px]" />, sex{' '}
        <Blank value={party.sex} width="w-[70px]" />, aged{' '}
        <Blank value={party.age} width="w-[48px]" /> years, Cambodian nationality, currently
        residing at house No. <Blank value={party.houseNumber} width="w-[80px]" />, street No.{' '}
        <Blank value={party.streetNumber} width="w-[80px]" />, Sangkat{' '}
        <Blank value={party.sangkat} width="w-[120px]" />, Khan{' '}
        <Blank value={party.khan} width="w-[100px]" />, {placeEnglish}, hereinafter referred to as{' '}
        {roleEnglish}.
      </p>
    </section>
  );
}

export default HouseLeaseAgreement;
