import { useState, useCallback, useEffect } from 'react';
import { invoiceApi } from '../api/invoice.api.js';

/**
 * Data source for the "Create Invoice" page. Owns the shared billing period and
 * property filter, the searchable eligible-contract list (server-side,
 * debounced, pageable) and the bulk-generation preview counts.
 */
export function useInvoiceGeneration() {
  const now = new Date();
  const [propertyId, setPropertyId] = useState('');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  // Eligible contracts (serverside search + pagination)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [contractsError, setContractsError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Bulk preview counts
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContracts = useCallback(async () => {
    setContractsLoading(true);
    setContractsError(null);
    try {
      const data = await invoiceApi.getEligibleContracts({
        propertyId: propertyId || undefined,
        search: debouncedSearch.trim() || undefined,
        billingMonth: String(month),
        billingYear: String(year),
        page,
        size,
      });
      setContracts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setContractsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'មិនអាចផ្ទុកកិច្ចសន្យាបានទេ។ សូមព្យាយាមម្តងទៀត។'
      );
    } finally {
      setContractsLoading(false);
    }
  }, [propertyId, debouncedSearch, month, year, page, size]);

  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await invoiceApi.getGeneratePreview({
        propertyId: propertyId || undefined,
        billingMonth: String(month),
        billingYear: String(year),
      });
      setPreview(data);
    } catch (err) {
      setPreviewError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'មិនអាចផ្ទុកចំនួនវិក្កយបត្របានទេ។ សូមព្យាយាមម្តងទៀត។'
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [propertyId, month, year]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const refresh = () => {
    fetchPreview();
    fetchContracts();
  };

  const handlePropertyChange = (value) => {
    setPropertyId(value);
    setPage(0);
  };

  const handleMonthChange = (value) => {
    setMonth(value);
    setPage(0);
  };

  const handleYearChange = (value) => {
    setYear(value);
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  return {
    propertyId,
    month,
    year,
    handlePropertyChange,
    handleMonthChange,
    handleYearChange,
    searchTerm,
    handleSearchChange,
    contracts,
    contractsLoading,
    contractsError,
    page,
    totalPages,
    totalElements,
    setSize,
    handlePageChange,
    preview,
    previewLoading,
    previewError,
    refresh,
  };
}