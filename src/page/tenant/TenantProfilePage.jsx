// src/page/tenant/TenantProfilePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Shield } from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import { useTenantProfile } from '../../hooks/useTenantProfile';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Alert,
  Button,
  Card,
  Input,
  Skeleton,
  Select,
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

export default function TenantProfilePage() {
  const { profile, loading, error, fetchProfile } = useTenantProfile();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      gender: profile.gender || 'OTHER',
      dateOfBirth: profile.dateOfBirth || '',
      phone: profile.phone || '',
      email: profile.email || '',
      occupationType: profile.occupationType || 'OTHER',
      occupation: profile.occupation || '',
      schoolOrCompany: profile.schoolOrCompany || '',
      idType: profile.idType || '',
      idNumber: profile.idNumber || '',
      address: profile.address || '',
    });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
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
      await tenantApi.updateMe(payload);
      await fetchProfile();
      toast.success('បានរក្សាទុក', 'ប្រវត្តិរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាព។');
    } catch (err) {
      toast.error(
        'កំហុស',
        err.response?.data?.message ||
          err.response?.data?.error ||
          'ការរក្សាទុកបានបរាជ័យ។'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Alert
        variant="danger"
        title="កំហុស"
        description={error || 'មិនអាចផ្ទុកព័ត៌មានរបស់អ្នកបានទេ។'}
        dismissible={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ប្រវត្តិរបស់ខ្ញុំ</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Shield className="h-4 w-4" />}
          onClick={() => navigate('/tenant/security')}
        >
          សន្តិសុខ
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="ព័ត៌មានផ្ទាល់ខ្លួន" description={`លេខកូដអ្នកជួល: ${profile.tenantCode}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="នាមត្រកូល"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="ឧ. សុខ"
            />
            <Input
              label="គោត្តនាម"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="ឧ. ដារ៉ា"
            />
            <Select
              label="ភេទ"
              name="gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={handleChange}
            />
            <Input
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
            <Input
              label="លេខទូរស័ព្ទ"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="ឧ. 012345678"
            />
            <Input
              label="អ៊ីមែល"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>
        </Card>

        <Card
          title="មុខរបរ និងអត្តសញ្ញាណ"
          description="ព័ត៌មានបំពេញបន្ថែមសម្រាប់កិច្ចសន្យា"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="ប្រភេទមុខរបរ"
              name="occupationType"
              options={OCCUPATION_OPTIONS}
              value={form.occupationType}
              onChange={handleChange}
            />
            <Input
              label="មុខរបរ"
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              placeholder="ឧ. វិស្វករ"
            />
            <Input
              label="សាលា / ក្រុមហ៊ុន"
              name="schoolOrCompany"
              value={form.schoolOrCompany}
              onChange={handleChange}
              placeholder="ឧ. សាកលវិទ្យាល័យ ..."
            />
            <Input
              label="ប្រភេទអត្តសញ្ញាណប័ណ្ណ"
              name="idType"
              value={form.idType}
              onChange={handleChange}
              placeholder="ឧ. NIK លិខិតឆ្លងដែន"
            />
            <Input
              label="លេខអត្តសញ្ញាណប័ណ្ណ"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
            />
          </div>
        </Card>

        <Card title="អាសយដ្ឋាន" description="អាសយដ្ឋានស្នាក់នៅបច្ចុប្បន្ន">
          <Input
            label="អាសយដ្ឋាន"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="ឧ. ភ្នំពេញ"
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={submitting} leftIcon={<Save className="h-4 w-4" />}>
            រក្សាទុក
          </Button>
        </div>
      </form>
    </div>
  );
}