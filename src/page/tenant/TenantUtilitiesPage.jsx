// src/page/tenant/TenantUtilitiesPage.jsx
import { useEffect, useState } from 'react';
import { Zap, Droplets, Gauge, Ruler, CalendarDays, RefreshCw } from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import { useTenantProfile } from '../../hooks/useTenantProfile';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Skeleton,
  IconButton,
} from '../../components/ui/index.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-CA') : '—';

const typeIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('water') || lower.includes('ទឹក')) return Droplets;
  return Zap;
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function TenantUtilitiesPage() {
  const { profile, loading: profileLoading } = useTenantProfile();
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUtilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantApi.getMyUtilities();
      setUtilities(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'ការផ្ទុកទិន្នន័យប្រើប្រាស់ទឹកភ្លើងបានបរាជ័យ។'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && profile.contract) {
      fetchUtilities();
    } else {
      setLoading(false);
    }
  }, [profile]);

  if (profileLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ទឹក និងភ្លើង</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ម៉ែត្រប្រើប្រាស់ និងការអានបច្ចុប្បន្ននៃបន្ទប់របស់អ្នក។
          </p>
        </div>
        <IconButton
          icon={<RefreshCw className="h-4 w-4" />}
          tooltip="ធ្វើឱ្យស្រស់"
          onClick={fetchUtilities}
        />
      </div>

      {error ? (
        <Alert variant="danger" title="កំហុស" description={error}>
          <Button size="sm" className="mt-3" onClick={fetchUtilities}>ព្យាយាមម្តងទៀត</Button>
        </Alert>
      ) : utilities.length === 0 ? (
        <Card className="py-12">
<EmptyState
              icon={Zap}
              title="គ្មានម៉ែត្រប្រើប្រាស់"
              description={
                profile && profile.contract
                  ? 'បច្ចុប្បន្នមិនមានម៉ែត្រទឹក ឬភ្លើងសកម្មសម្រាប់បន្ទប់របស់អ្នកទេ។'
                  : 'គ្មានកិច្ចសន្យាសកម្ម ដូច្នេះមិនមានទិន្នន័យប្រើប្រាស់ទឹកភ្លើងទេ។'
              }
            />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {utilities.map((item) => {
            const Icon = typeIcon(item.utilityTypeName);
            return (
              <Card
                key={item.meterId}
                title={item.utilityTypeName || 'ប្រើប្រាស់'}
                description={`លេខម៉ែត្រ: ${item.meterNumber}`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-4">
                  <InfoItem
                    icon={<Gauge className="h-4 w-4" />}
                    label="ការអានលើកចុងក្រោយ"
                    value={item.lastReading != null ? `${item.lastReading} ${item.unit || ''}` : '—'}
                  />
                  <InfoItem
                    icon={<Ruler className="h-4 w-4" />}
                    label="ការប្រើប្រាស់ចុងក្រោយ"
                    value={item.lastUsage != null ? `${item.lastUsage} ${item.unit || ''}` : '—'}
                  />
                  <InfoItem
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="ថ្ងៃអាន"
                    value={formatDate(item.readingDate)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}