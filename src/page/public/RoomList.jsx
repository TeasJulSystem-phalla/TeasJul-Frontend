// src/page/public/RoomList.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  List,
  X,
  Bed,
  Check,
  TrendingUp,
  Building2,
  Home,
  Hotel,
  DoorOpen,
  DollarSign,
  RotateCcw,
  UsersRound,
  SearchX,
} from 'lucide-react';
import { publicRoomApi } from '../../api/public.api';
import PublicHeader from '../../components/public/PublicHeader';
import { RoomCard, SkeletonCard } from '../../components/room/RoomCard';
const PAGE_SIZE = 12;

const CATEGORY_ALL = 'ALL';
const CATEGORIES = [CATEGORY_ALL, 'APARTMENT', 'HOUSE', 'VILLA', 'ROOM', 'CONDO'];

const propertyTypeForCategory = (cat) =>
  cat === CATEGORY_ALL ? undefined : cat;

const RoomList = () => {
  const { t } = useTranslation();
  const [view, setView] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);

  // ---- Filters that the public API actually supports (server-side) ----
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationApplied, setLocationApplied] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [roomTypeId, setRoomTypeId] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [sort] = useState('NEWEST');
  const [roomTypes, setRoomTypes] = useState([]);

  // ---- Filters that the public API currently does NOT support ----
  // Kept as local UI state only so the existing design keeps working.
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState(null);

  const [searchParams] = useSearchParams();

  // Read URL search params on mount (e.g. from the Home page hero search)
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const cityProvince = searchParams.get('cityProvince') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const minRent = searchParams.get('minRent') || '';
    const maxRent = searchParams.get('maxRent') || '';

    const category = CATEGORIES.includes(propertyType) ? propertyType : null;

    setSearchInput(search);
    setSearchApplied(search);
    setLocationInput(cityProvince);
    setLocationApplied(cityProvince);
    if (category) setActiveCategory(category);
    setPriceRange({ min: minRent, max: maxRent });
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    publicRoomApi
      .listRoomTypes()
      .then(setRoomTypes)
      .catch(() => setRoomTypes([]));
  }, []);

  // ---- Room data from the API ----
  const [rooms, setRooms] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const toggleFav = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleType = (t) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSearchInput('');
    setSearchApplied('');
    setLocationInput('');
    setLocationApplied('');
    setRoomTypeId('');
    setMinCapacity('');
    setSelectedTypes([]);
    setSelectedBeds(null);
    setActiveCategory(CATEGORY_ALL);
    setCurrentPage(1);
  };

  const activeCount =
    (priceRange.min ? 1 : 0) +
    (priceRange.max ? 1 : 0) +
    (searchApplied ? 1 : 0) +
    (locationApplied ? 1 : 0) +
    (roomTypeId ? 1 : 0) +
    (minCapacity ? 1 : 0) +
    selectedTypes.length +
    (selectedBeds ? 1 : 0);

  const categories = CATEGORIES;

  const typeOptions = [
    { id: 'APARTMENT', icon: Building2 },
    { id: 'HOUSE', icon: Home },
    { id: 'VILLA', icon: Hotel },
    { id: 'ROOM', icon: DoorOpen },
    { id: 'CONDO', icon: Building2 },
  ];

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setLoading(true);
        setError(null);

        const typeFilter =
          selectedTypes.length > 0
            ? propertyTypeForCategory(selectedTypes[0])
            : propertyTypeForCategory(activeCategory);

        publicRoomApi
          .listRooms({
            search: searchApplied.trim() || undefined,
            cityProvince: locationApplied.trim() || undefined,
            propertyType: typeFilter || undefined,
            roomTypeId: roomTypeId || undefined,
            bedrooms: selectedBeds ? parseInt(selectedBeds, 10) || undefined : undefined,
            minRent: priceRange.min || undefined,
            maxRent: priceRange.max || undefined,
            capacity: minCapacity || undefined,
            sort,
            page: Math.max((currentPage || 1) - 1, 0),
            size: PAGE_SIZE,
          })
          .then((res) => {
            setRooms(res?.content || []);
            setTotalElements(res?.totalElements ?? 0);
            setTotalPages(res?.totalPages ?? 0);
          })
          .catch((err) => {
            setRooms([]);
            setTotalElements(0);
            setTotalPages(0);
            setError(
              err?.response?.data?.message ||
                err?.message ||
                t('roomsList.loadError')
            );
          })
          .finally(() => setLoading(false));
      },
      searchApplied.trim() || locationApplied.trim() || priceRange.min || priceRange.max
        ? 300
        : 0
    );
    return () => clearTimeout(timer);
  }, [searchApplied, locationApplied, activeCategory, selectedTypes, selectedBeds, priceRange.min, priceRange.max, roomTypeId, minCapacity, sort, currentPage, retryKey, t]);

  const applySearch = () => {
    setSearchApplied(searchInput.trim());
    setCurrentPage(1);
  };

  const applyLocation = () => {
    setLocationApplied(locationInput.trim());
    setCurrentPage(1);
  };

  const updatePrice = (key, value) => {
    setPriceRange((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const pageItems = useMemo(() => {
    const total = totalPages || 1;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => ({ type: 'page', value: i + 1 }));
    }
    const current = Math.min(currentPage, total);
    const nums = [...new Set([1, 2, total - 1, total, current - 1, current, current + 1])]
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);
    const items = [];
    let prev = 0;
    nums.forEach((n) => {
      if (n - prev > 1) items.push({ type: 'ellipsis', key: `e${n}` });
      items.push({ type: 'page', value: n });
      prev = n;
    });
    return items;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15,41,66,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,41,66,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative">
        <PublicHeader active="rooms" />

        {/* ================= HEADER SECTION ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1500px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <div className="mb-4 flex items-center gap-1.5 text-[12px] text-slate-500">
              <a href="#" className="khmer hover:text-[#0f2942]">
                {t('roomsList.breadcrumbHome')}
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="khmer font-medium text-slate-700">
                {t('roomsList.breadcrumbRooms')}
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="khmer text-[26px] font-bold leading-tight text-[#0f2942] sm:text-[34px]">
                  {t('roomsList.title')}
                </h1>
                <p className="khmer mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  {t('roomsList.foundResults', { count: totalElements })}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 transition-colors focus-within:border-[#0f2942]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applySearch();
                    }
                  }}
                  placeholder={t('roomsList.searchPlaceholder')}
                  className="khmer flex-1 bg-transparent px-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button className="khmer hidden items-center gap-1 border-l border-slate-200 pl-3 text-[13px] font-medium text-slate-600 sm:flex">
                  <MapPin className="h-3.5 w-3.5" />
                  {t('roomsList.locationButton')}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="khmer relative flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('roomsList.filters')}
                  {activeCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0f2942] px-1.5 text-[10px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={applySearch}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#0f2942] px-5 py-2.5 text-white transition-colors hover:bg-[#1a3d5f]"
                >
                  <Search className="h-4 w-4" />
                  <span className="khmer hidden text-[13px] font-medium sm:inline">
                    {t('roomsList.searchButton')}
                  </span>
                </button>
              </div>
            </div>

            <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`khmer shrink-0 rounded-md border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                    activeCategory === cat
                      ? 'border-[#0f2942] bg-[#0f2942] text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-[#0f2942] hover:text-[#0f2942]'
                  }`}
                >
                  {t(`propertyType.${cat}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MAIN ================= */}
        <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* ========== SIDEBAR ========== */}
            <aside className="hidden w-[260px] shrink-0 lg:block">
              <div className="sticky top-24 space-y-3">
                {/* Filter header — card style */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f2942]">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <h2 className="khmer text-[13.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.filterHeading')}
                      </h2>
                        <p className="khmer text-[10.5px] text-slate-500">
                          {activeCount > 0
                            ? t('roomsList.countSelected', {
                                count: activeCount,
                              })
                            : t('roomsList.nothingSelected')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price section */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-[#0f2942]" />
                        <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                          {t('roomsList.pricePerMonth')}
                        </h3>
                      </div>
                      {(priceRange.min || priceRange.max) && (
                        <span className="khmer rounded bg-[#e8f0f7] px-2 py-0.5 text-[10.5px] font-semibold text-[#0f2942]">
                          ${priceRange.min || 0} – ${priceRange.max || '∞'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={priceRange.min}
                          onChange={(e) => updatePrice('min', e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-6 pr-2 text-[12.5px] font-medium text-slate-800 transition-colors focus:border-[#0f2942] focus:outline-none"
                        />
                      </div>
                      <span className="text-[11px] text-slate-300">—</span>
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="2000"
                          value={priceRange.max}
                          onChange={(e) => updatePrice('max', e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-6 pr-2 text-[12.5px] font-medium text-slate-800 transition-colors focus:border-[#0f2942] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {[
                        { label: '< $200', min: '', max: '200' },
                        { label: '$200–400', min: '200', max: '400' },
                        { label: '$400–600', min: '400', max: '600' },
                        { label: '$600+', min: '600', max: '' },
                      ].map((opt) => {
                        const active =
                          priceRange.min === opt.min && priceRange.max === opt.max;
                        return (
                          <button
                            key={opt.label}
                            onClick={() => {
                              setPriceRange({ min: opt.min, max: opt.max });
                              setCurrentPage(1);
                            }}
                            className={`khmer rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                              active
                                ? 'border-[#0f2942] bg-[#0f2942] text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#0f2942] hover:bg-white hover:text-[#0f2942]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Type section */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#0f2942]" />
                      <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.type')}
                      </h3>
                      {selectedTypes.length > 0 && (
                        <span className="khmer ml-auto rounded bg-[#e8f0f7] px-1.5 py-0.5 text-[10px] font-semibold text-[#0f2942]">
                          {selectedTypes.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {typeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const checked = selectedTypes.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleType(opt.id)}
                            className={`group flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-all ${
                              checked
                                ? 'border-[#0f2942] bg-[#e8f0f7]'
                                : 'border-transparent bg-transparent hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                checked
                                  ? 'border-[#0f2942] bg-[#0f2942]'
                                  : 'border-slate-300 bg-white group-hover:border-[#0f2942]'
                              }`}
                            >
                              {checked && (
                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                              )}
                            </span>
                            <Icon
                              className={`h-3.5 w-3.5 ${
                                checked ? 'text-[#0f2942]' : 'text-slate-400'
                              }`}
                              strokeWidth={1.75}
                            />
                            <span
                              className={`khmer flex-1 text-[12.5px] font-medium ${
                                checked ? 'text-[#0f2942]' : 'text-slate-700'
                              }`}
                            >
                              {t(`propertyType.${opt.id}`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <Bed className="h-3.5 w-3.5 text-[#0f2942]" />
                      <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.bedrooms')}
                      </h3>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['1', '2', '3', '4+'].map((n) => {
                        const active = selectedBeds === n;
                        return (
                          <button
                            key={n}
                            onClick={() => setSelectedBeds(active ? null : n)}
                            className={`khmer flex h-9 items-center justify-center rounded-md border text-[12.5px] font-semibold transition-all ${
                              active
                                ? 'border-[#0f2942] bg-[#0f2942] text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-[#0f2942] hover:text-[#0f2942]'
                            }`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#0f2942]" />
                      <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.location')}
                      </h3>
                    </div>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onBlur={applyLocation}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyLocation();
                          }
                        }}
                        placeholder={t('roomsList.locationPlaceholder')}
                        className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-2 text-[12.5px] font-medium text-slate-800 transition-colors focus:border-[#0f2942] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <DoorOpen className="h-3.5 w-3.5 text-[#0f2942]" />
                      <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.roomType')}
                      </h3>
                    </div>
                    <select
                      value={roomTypeId}
                      onChange={(e) => {
                        setRoomTypeId(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="khmer w-full cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-2 text-[12.5px] font-medium text-slate-700 transition-colors focus:border-[#0f2942] focus:outline-none"
                    >
                      <option value="">{t('roomsList.allRoomTypes')}</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="px-4 py-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <UsersRound className="h-3.5 w-3.5 text-[#0f2942]" />
                      <h3 className="khmer text-[12.5px] font-semibold text-[#0f2942]">
                        {t('roomsList.capacity')}
                      </h3>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: t('roomsList.anyCapacity'), value: '' },
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '4+', value: '4' },
                      ].map((opt) => {
                        const active = minCapacity === opt.value;
                        return (
                          <button
                            key={opt.label}
                            onClick={() => {
                              setMinCapacity(active ? '' : opt.value);
                              setCurrentPage(1);
                            }}
                            className={`khmer flex h-9 items-center justify-center rounded-md border text-[12.5px] font-semibold transition-all ${
                              active
                                ? 'border-[#0f2942] bg-[#0f2942] text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-[#0f2942] hover:text-[#0f2942]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Clear all button */}
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="khmer flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-[12.5px] font-medium text-slate-600 transition-colors hover:border-[#0f2942] hover:text-[#0f2942]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('roomsList.clearAll', { count: activeCount })}
                  </button>
                )}
              </div>
            </aside>

            {/* ========== ROOMS ========== */}
            <div className="min-w-0 flex-1">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="hidden items-center gap-2 text-[13px] text-slate-500 sm:flex">
                  <span className="khmer">{t('roomsList.showing')}</span>
                  <span className="khmer font-semibold text-[#0f2942]">
                    {t('roomsList.foundResults', { count: totalElements })}
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button className="khmer hidden items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-[#0f2942] sm:flex">
                    {t('roomsList.sortBy')}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  <div className="hidden items-center gap-0.5 rounded-md border border-slate-300 bg-white p-0.5 lg:flex">
                    <button
                      onClick={() => setView('grid')}
                      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                        view === 'grid'
                          ? 'bg-[#0f2942] text-white'
                          : 'text-slate-500 hover:text-[#0f2942]'
                      }`}
                    >
                      <Grid2x2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                        view === 'list'
                          ? 'bg-[#0f2942] text-white'
                          : 'text-slate-500 hover:text-[#0f2942]'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
                      : 'flex flex-col gap-3'
                  }
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} view={view} />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-center">
                  <Building2 className="h-10 w-10 text-slate-300" />
                  <p className="khmer mt-3 max-w-sm text-[13.5px] leading-relaxed text-slate-600">
                    {error}
                  </p>
                  <button
                    onClick={() => setRetryKey((k) => k + 1)}
                    className="khmer mt-4 flex items-center gap-2 rounded-md bg-[#0f2942] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('common.tryAgain')}
                  </button>
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-center">
                  <SearchX className="h-10 w-10 text-slate-300" />
                  <p className="khmer mt-3 text-[14px] font-medium text-[#0f2942]">
                    {t('roomsList.noRoomsFound')}
                  </p>
                  <p className="khmer mt-1 text-[12.5px] text-slate-500">
                    {t('roomsList.noRoomsSub')}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="khmer mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-[#0f2942] hover:text-[#0f2942]"
                  >
                    {t('roomsList.clearFilters')}
                  </button>
                </div>
              ) : (
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
                      : 'flex flex-col gap-3'
                  }
                >
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      to={`/rooms/${room.id}`}
                      className="block"
                    >
                      <RoomCard
                        room={room}
                        isFav={favorites.includes(room.id)}
                        onToggleFav={() => toggleFav(room.id)}
                        view={view}
                      />
                    </Link>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:border-[#0f2942] hover:text-[#0f2942] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageItems.map((item) =>
                    item.type === 'ellipsis' ? (
                      <span
                        key={item.key}
                        className="khmer px-1 text-[13px] text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item.value}
                        onClick={() => setCurrentPage(item.value)}
                        className={`khmer h-9 min-w-[36px] rounded-md border px-2 text-[13px] font-medium transition-colors ${
                          currentPage === item.value
                            ? 'border-[#0f2942] bg-[#0f2942] text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-[#0f2942]'
                        }`}
                      >
                        {item.value}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:border-[#0f2942] hover:text-[#0f2942] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 44 44" className="h-9 w-9" fill="none">
                    <path
                      d="M22 3 L25.5 18.5 L41 22 L25.5 25.5 L22 41 L18.5 25.5 L3 22 L18.5 18.5 Z"
                      fill="#0f2942"
                    />
                    <path
                      d="M22 12 L23.5 20.5 L32 22 L23.5 23.5 L22 32 L20.5 23.5 L12 22 L20.5 20.5 Z"
                      fill="#fff"
                    />
                  </svg>
                  <div className="leading-tight">
                    <p className="khmer text-[13px] font-bold text-[#0f2942]">
                      {t('footer.brandName')}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      {t('footer.brandSub')}
                    </p>
                  </div>
                </div>
                <p className="khmer mt-4 text-[12.5px] leading-relaxed text-slate-500">
                  {t('footer.tagline')}
                </p>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  {t('footer.pages')}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {[t('footer.about'), t('footer.allRooms'), t('footer.whyTeasJul'), t('footer.contact')].map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  {t('footer.support')}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {[t('footer.faq'), t('footer.privacy'), t('footer.terms')].map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  {t('footer.contactTitle')}
                </h4>
                <ul className="mt-4 space-y-2.5 text-[12.5px] text-slate-500">
                  <li className="khmer">+855 12 345 678</li>
                  <li className="khmer">hello@rooms.kh</li>
                  <li className="khmer">{t('footer.location')}</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="khmer text-center text-[12px] text-slate-400">
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ================= MOBILE FILTER ================= */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="khmer text-[16px] font-semibold text-[#0f2942]">
                {t('roomsList.filters')}
              </h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <h4 className="khmer mb-3 text-[13px] font-medium text-[#0f2942]">
                  {t('roomsList.pricePerMonth')}
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="$0"
                    value={priceRange.min}
                    onChange={(e) => updatePrice('min', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-[#0f2942] focus:outline-none"
                  />
                  <span className="text-slate-300">–</span>
                  <input
                    type="number"
                    placeholder="$2000"
                    value={priceRange.max}
                    onChange={(e) => updatePrice('max', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-[#0f2942] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="khmer mb-3 text-[13px] font-medium text-[#0f2942]">
                  {t('roomsList.type')}
                </h4>
                <div className="space-y-2.5">
                  {typeOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-300" />
                      <span className="khmer text-[13px] text-slate-700">
                        {t(`propertyType.${opt.id}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="khmer mb-3 text-[13px] font-medium text-[#0f2942]">
                  {t('roomsList.bedrooms')}
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1', '2', '3', '4+'].map((n) => (
                    <button
                      key={n}
                      className="khmer h-9 rounded-md border border-slate-300 text-[13px] font-semibold text-slate-700"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white p-4">
              <button
                onClick={clearFilters}
                className="khmer flex-1 rounded-md border border-slate-300 py-2.5 text-[13.5px] font-medium text-slate-700"
              >
                {t('roomsList.clear')}
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="khmer flex-1 rounded-md bg-[#0f2942] py-2.5 text-[13.5px] font-medium text-white"
              >
                {t('roomsList.showResults')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');
        .khmer { font-family: 'Kantumruy Pro', sans-serif; }
        html, body { margin: 0; padding: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RoomList;