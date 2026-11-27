import { forwardRef } from 'react';
import HouseLeaseAgreement from './HouseLeaseAgreement';
import { Button } from '../../components/ui/index.js';
import {
  RotateCcw,
  Printer,
  FileDown,
} from 'lucide-react';
import {
  formatShortDate,
  fullName,
  genderLabel,
  roomPrice,
  ageFromDob,
  resolveAddress,
  durationInYears,
} from './format';

const ContractDetailView = forwardRef(function ContractDetailView(
  { contract, landlord, house, room, roomType, tenantsById, contractTenants, onPrint, onDownload, onRefresh },
  ref
) {
  const sortedTenants = [...(contractTenants || [])].sort((a, b) =>
    a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
  );
  const primaryTenant = sortedTenants[0] ? tenantsById?.[sortedTenants[0].tenantId] : null;

  // Party A: Snapshot with legacy contract.ownerAddress fallback
  const lessorAddress = resolveAddress(
    {
      houseNumber: contract?.ownerHouseNumber,
      streetNumber: contract?.ownerStreetNumber,
      sangkat: contract?.ownerSangkat,
      khan: contract?.ownerKhan,
      cityProvince: contract?.ownerCityProvince,
    },
    contract?.ownerAddress || landlord?.address
  );

  // Party B: Snapshot only; never fall back to live tenant profile
  const lesseeAddress = resolveAddress(
    {
      houseNumber: contract?.tenantHouseNumber,
      streetNumber: contract?.tenantStreetNumber,
      sangkat: contract?.tenantSangkat,
      khan: contract?.tenantKhan,
      cityProvince: contract?.tenantCityProvince,
    },
    null
  );

  // Article 1: Rental property snapshot; never derive from Owner domicile or room/building names
  const propertyAddressResolved = resolveAddress(
    {
      houseNumber: contract?.houseHouseNumber,
      streetNumber: contract?.houseStreetNumber,
      sangkat: contract?.houseSangkat,
      khan: contract?.houseKhan,
      cityProvince: contract?.houseCityProvince,
    },
    null
  );

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
      <HouseLeaseAgreement
        ref={ref}
        documentNumber={contract?.contractNumber ? String(contract.contractNumber) : undefined}
        contractNumber={contract?.contractNumber}
        lessorName={landlord?.name}
        lessorSex={genderLabel(landlord?.gender)}
        lessorAge={ageFromDob(landlord?.dob)}
        lessorHouseNumber={lessorAddress.houseNumber}
        lessorStreetNumber={lessorAddress.streetNumber}
        lessorSangkat={lessorAddress.sangkat}
        lessorKhan={lessorAddress.khan}
        lessorCityProvince={lessorAddress.cityProvince}
        lesseeName={primaryTenant ? fullName(primaryTenant) : undefined}
        lesseeSex={primaryTenant ? genderLabel(primaryTenant.gender) : undefined}
        lesseeAge={ageFromDob(primaryTenant?.dateOfBirth ?? primaryTenant?.dob)}
        lesseeHouseNumber={lesseeAddress.houseNumber}
        lesseeStreetNumber={lesseeAddress.streetNumber}
        lesseeSangkat={lesseeAddress.sangkat}
        lesseeKhan={lesseeAddress.khan}
        lesseeCityProvince={lesseeAddress.cityProvince}
        houseNumber={propertyAddressResolved.houseNumber}
        streetNumber={propertyAddressResolved.streetNumber}
        sangkat={propertyAddressResolved.sangkat}
        khan={propertyAddressResolved.khan}
        houseCityProvince={propertyAddressResolved.cityProvince}
        roomNumber={room?.roomNumber || room?.name}
        floorNumber={room?.floorNumber}
        propertyAddress={house?.address || house?.name}
        roomTypeName={roomType?.name}
        price={roomPrice(room, roomType)}
        durationYears={durationInYears(contract)}
        startDate={formatShortDate(contract?.startDate)}
        endDate={formatShortDate(contract?.endDate)}
      />
    </div>
  );
});

export default ContractDetailView;
