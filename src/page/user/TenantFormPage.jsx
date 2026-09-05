import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserRound, FileText, IdCard } from 'lucide-react';
import { useTenants } from '../../hooks/useTenants.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Button,
  Input,
  Textarea,
  Select,
  AsyncUserSelect,
  Radio,
  Label,
  Alert,
  Skeleton,
} from '../../components/ui/index.js';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'ប្រុស' },
  { value: 'FEMALE', label: 'ស្រី' },
  { value: 'OTHER', label: 'ផ្សេងទៀត' },
];

const OCCUPATION_OPTIONS = [
  { value: 'STUDENT', label: 'សិស្ស' },
  { value: 'EMPLOYEE', label: 'បុគ្គលិក' },
  { value: 'OTHER', label: 'ផ្សេងទៀត' },
];

const EMPTY_FORM = {
  mode: 'link', // 'link' = link existing user, 'without' = create without account
  userId: '',
  tenantCode: '',
  firstName: '',
  lastName: '',
  gender: 'OTHER',
  dateOfBirth: '',
  phone: '',
  email: '',
  occupationType: 'OTHER',
  occupation: '',
  schoolOrCompany: '',
  idType: '',
  idNumber: '',
  address: '',
};

const fullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `អ្នកជួល #${t.id}`;

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-gray-800">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

export default function TenantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';
  const basePath = useBasePath();

  const { getTenant, createTenant, updateTenant } = useTenants();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isEdit) return undefined;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const t = await getTenant(id);
        if (cancelled) return;
        setForm({
          mode: t.userId ? 'link' : 'without',
          userId: t.userId ?? '',
          tenantCode: t.tenantCode || '',
          firstName: t.firstName || '',
          lastName: t.lastName || '',
          gender: t.gender || 'OTHER',
          dateOfBirth: t.dateOfBirth || '',
          phone: t.phone || '',
          email: t.email || '',
          occupationType: t.occupationType || 'OTHER',
          occupation: t.occupation || '',
          schoolOrCompany: t.schoolOrCompany || '',
          idType: t.idType || '',
          idNumber: t.idNumber || '',
          address: t.address || '',
        });
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'ការផ្ទុកអ្នកជួលបានបរាជ័យ។'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, getTenant]);

  const handleUserSelect = (userId) => {
    setForm((prev) => ({ ...prev, userId }));
    if (formErrors.userId) setFormErrors((prev) => ({ ...prev, userId: undefined }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (form.mode === 'link' && !form.userId)
      errs.userId = 'តម្រូវឱ្យជ្រើសរើសអ្នកប្រើប្រាស់ ឬប្តូរទៅ "គ្មានគណនី"';
    if (!form.firstName.trim()) errs.firstName = 'តម្រូវឱ្យបញ្ចូលនាមត្រកូល';
    if (!form.lastName.trim()) errs.lastName = 'តម្រូវឱ្យបញ្ចូលគោត្តនាម';
    if (!form.phone.trim()) errs.phone = 'តម្រូវឱ្យបញ្ចូលលេខទូរស័ព្ទ';
    if (!isEdit && !form.tenantCode.trim()) errs.tenantCode = 'តម្រូវឱ្យបញ្ចូលលេខកូដអ្នកជួល';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const base = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      occupationType: form.occupationType,
      occupation: form.occupation.trim() || null,
      schoolOrCompany: form.schoolOrCompany.trim() || null,
      idType: form.idType.trim() || null,
      idNumber: form.idNumber.trim() || null,
      address: form.address.trim() || null,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTenant(id, base);
        toast.success(
          'បានកែប្រែអ្នកជួល',
          `${fullName({ ...form, id })} ត្រូវបានធ្វើបច្ចុប្បន្នភាព។`
        );
      } else {
        const payload = {
          ...base,
          tenantCode: form.tenantCode.trim(),
          userId: form.mode === 'link' && form.userId ? Number(form.userId) : null,
        };
        await createTenant(payload);
        toast.success('បានបង្កើតអ្នកជួល', 'បានបន្ថែមអ្នកជួលថ្មី។');
      }
      navigate(`${basePath}/tenants`);
    } catch (err) {
      toast.error(
        'កំហុស',
        err.response?.data?.message ||
          err.response?.data?.error ||
          'ប្រតិបត្តិការបានបរាជ័យ។'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`${basePath}/tenants`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅអ្នកជួល
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {isEdit ? 'កែប្រែអ្នកជួល' : 'បង្កើតអ្នកជួល'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit
              ? 'គ្រប់គ្រងព័ត៌មានលម្អិតអ្នកជួលនៅក្នុងទំព័រនេះ។'
              : 'បំពេញប្រវត្តិរូបអ្នកជួលថ្មី។'}
          </p>
        </div>
        {!loading && (
          <Button
            type="submit"
            form="tenantForm"
            leftIcon={<Save className="h-4 w-4" />}
            loading={submitting}
            onClick={() => document.getElementById('tenantForm')?.requestSubmit()}
          >
            {isEdit ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតអ្នកជួល'}
          </Button>
        )}
      </div>

      {loadError && (
        <Alert variant="danger" title="កំហុស" description={loadError} dismissible>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoadError(null);
                setLoading(true);
                setTimeout(() => window.location.reload(), 0);
              }}
            >
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form id="tenantForm" onSubmit={handleSubmit} className="space-y-6">
          <SectionCard
            icon={<UserRound className="h-5 w-5" />}
            title="គណនី"
            subtitle={isEdit ? 'អ្នកប្រើប្រាស់ដែលភ្ជាប់មិនអាចផ្លាស់ប្តូរបានទេ។' : 'ជ្រើសរើសភ្ជាប់គណនីអ្នកប្រើ ឬបង្កើតដោយគ្មានគណនី។'}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {isEdit ? (
                <Input label="លេខកូដអ្នកជួល" disabled value={form.tenantCode} />
              ) : (
                <Input
                  label="លេខកូដអ្នកជួល"
                  required
                  name="tenantCode"
                  value={form.tenantCode}
                  onChange={handleFormChange}
                  placeholder="ឧ. TN-0001"
                  error={formErrors.tenantCode}
                />
              )}

              {isEdit ? (
                <div>
                  <Label className="mb-1.5 block">គណនីអ្នកប្រើប្រាស់</Label>
                  <p className="rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-slate-400">
                    {form.userId ? `លេខសម្គាល់អ្នកប្រើ #${form.userId} (មិនអាចផ្លាស់ប្តូរបានទេ)` : 'គ្មានគណនីអ្នកប្រើ'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Radio
                      label="ភ្ជាប់គណនីអ្នកប្រើដែលមានស្រាប់"
                      checked={form.mode === 'link'}
                      onChange={() => setForm((prev) => ({ ...prev, mode: 'link' }))}
                    />
                    <Radio
                      label="គ្មានគណនីអ្នកប្រើ"
                      checked={form.mode === 'without'}
                      onChange={() => setForm((prev) => ({ ...prev, mode: 'without', userId: '' }))}
                    />
                  </div>

                  {form.mode === 'link' ? (
                    <AsyncUserSelect
                      label="អ្នកប្រើ"
                      value={form.userId}
                      onChange={handleUserSelect}
                      error={formErrors.userId}
                    />
                  ) : (
                    <div>
                      <Label className="mb-1.5 block">អ្នកប្រើ</Label>
                      <p className="rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-slate-400">
                        ប្រវត្តិរូបអ្នកជួលនឹងត្រូវបានបង្កើតដោយមិនភ្ជាប់គណនីចូលប្រើ។
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={<FileText className="h-5 w-5" />}
            title="ព័ត៌មានផ្ទាល់ខ្លួន"
            subtitle="ព័ត៌មានទំនាក់ទំនង និងមុខរបររបស់អ្នកជួល។"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="នាមត្រកូល" required name="firstName" value={form.firstName} onChange={handleFormChange} error={formErrors.firstName} />
              <Input label="គោត្តនាម" required name="lastName" value={form.lastName} onChange={handleFormChange} error={formErrors.lastName} />
              <Select label="ភេទ" name="gender" options={GENDER_OPTIONS} value={form.gender} onChange={handleFormChange} />
              <Input label="ថ្ងៃខែឆ្នាំកំណើត" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} />
              <Input label="លេខទូរស័ព្ទ" required name="phone" value={form.phone} onChange={handleFormChange} placeholder="ឧ. 0812-3456-789" error={formErrors.phone} />
              <Input label="អ៊ីមែល" type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="email@example.com" />
              <Select label="ប្រភេទមុខរបរ" name="occupationType" options={OCCUPATION_OPTIONS} value={form.occupationType} onChange={handleFormChange} />
              <Input label="មុខរបរ" name="occupation" value={form.occupation} onChange={handleFormChange} placeholder="ឧ. វិស្វករកម្មវិធី" />
            </div>
          </SectionCard>

          <SectionCard
            icon={<IdCard className="h-5 w-5" />}
            title="សាលារៀន / ក្រុមហ៊ុន និងអត្តសញ្ញាណ"
            subtitle="កន្លែងធ្វើការ ឬសិក្សា និងឯកសារសម្គាល់អត្តសញ្ញាណ។"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="សាលារៀន ឬក្រុមហ៊ុន" name="schoolOrCompany" value={form.schoolOrCompany} onChange={handleFormChange} />
              <Input label="ប្រភេទអត្តសញ្ញាណប័ណ្ណ" name="idType" value={form.idType} onChange={handleFormChange} placeholder="ឧ. NIK លិខិតឆ្លងដែន" />
              <Input label="លេខអត្តសញ្ញាណប័ណ្ណ" name="idNumber" value={form.idNumber} onChange={handleFormChange} />
              <Textarea label="អាសយដ្ឋាន" name="address" value={form.address} onChange={handleFormChange} rows={2} placeholder="អាសយដ្ឋានបច្ចុប្បន្ន..." />
            </div>
          </SectionCard>
        </form>
      )}
    </div>
  );
}