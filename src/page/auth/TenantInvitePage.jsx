import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Building2,
  KeyRound,
  UserRound,
  AlertTriangle,
} from 'lucide-react';
import { tenantInvitationApi } from '../../api/tenantInvitation.api';
import {
  Card,
  Button,
  Input,
  Alert,
  Spinner,
} from '../../components/ui/index.js';

const REASON_MESSAGES = {
  INVALID_TOKEN: 'តំណអញ្ជើញមិនត្រឹមត្រូវ ឬមិនមាន។',
  INVITATION_EXPIRED:
    'តំណអញ្ជើញបានផុតកំណត់ហើយ។ សូមទាក់ទងអ្នកគ្រប់គ្រងអចលនទ្រព្យ ដើម្បីស្នើសុំតំណថ្មី។',
  INVITATION_ALREADY_USED: 'តំណអញ្ជើញនេះត្រូវបានប្រើប្រាស់រួចហើយ។',
  INVITATION_REVOKED: 'តំណអញ្ជើញត្រូវបានលុបចោលដោយអ្នកគ្រប់គ្រង។',
};

const getServerMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

const secondsUntil = (expiresAt) =>
  Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

const formatClock = (total) => {
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  username: '',
  email: '',
  password: '',
};

const TenantInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [stage, setStage] = useState('validating'); // validating | valid | invalid | done
  const [reason, setReason] = useState(null);
  const [invite, setInvite] = useState(null); // { email, houseName, expiresAt }
  const [loadError, setLoadError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const emailLocked = !!invite?.email;

  const applyValidation = (data) => {
    if (data && data.valid) {
      setInvite(data);
      setSecondsLeft(secondsUntil(data.expiresAt));
      setForm((prev) => ({ ...prev, email: data.email || prev.email }));
      setStage('valid');
    } else {
      setReason(data?.reason || 'INVALID_TOKEN');
      setStage('invalid');
    }
  };

  useEffect(() => {
    if (!token) {
      setReason('INVALID_TOKEN');
      setStage('invalid');
      return;
    }
    let cancelled = false;
    tenantInvitationApi
      .validateInvitation(token)
      .then((data) => {
        if (!cancelled) applyValidation(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('មិនអាចផ្ទៀងផ្ទាត់តំណអញ្ជើញបានទេ។ សូមពិនិត្យការតភ្ជាប់បណ្តាញរបស់អ្នក។');
          setStage('invalid');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (stage !== 'valid') return;
    const id = setInterval(() => {
      const left = secondsUntil(invite.expiresAt);
      setSecondsLeft(left);
      if (left <= 0) {
        setReason('INVITATION_EXPIRED');
        setStage('invalid');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [stage, invite]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'សូមបញ្ចូលនាមខ្លួន។';
    if (!form.lastName.trim()) next.lastName = 'សូមបញ្ចូលគោត្រកូល។';
    if (!form.phone.trim()) next.phone = 'សូមបញ្ចូលលេខទូរស័ព្ទ។';
    if (!emailLocked && !form.email.trim()) next.email = 'សូមបញ្ចូលអ៊ីមែល។';
    if (!form.username.trim()) next.username = 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់។';
    if (form.password.length < 8) next.password = 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ។';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await tenantInvitationApi.consumeInvitation({
        token,
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      setResult(data);
      setStage('done');
    } catch (err) {
      setSubmitError(getServerMessage(err, 'ការចុះឈ្មោះបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderInvalid = () => (
    <Card className="p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 rounded-full bg-red-50 p-4 dark:bg-red-950">
        <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
        តំណអញ្ជើញមិនអាចប្រើបាន
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {loadError || REASON_MESSAGES[reason] || 'តំណអញ្ជើញមិនត្រឹមត្រូវ។'}
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        ត្រឡប់ទៅចូលប្រព័ន្ធ
      </Link>
    </Card>
  );

  const renderValid = () => (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            {invite.houseName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">អចលនទ្រព្យ</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-xs text-yellow-800 sm:text-sm dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300">
        <Clock className="h-4 w-4 shrink-0" />
        <span>តំណនឹងផុតកំណត់ក្នុងរយៈពេល {formatClock(secondsLeft)}</span>
      </div>

      <Alert
        variant="info"
        className="mb-4"
        title="បំពេញព័ត៌មានរបស់អ្នក"
        description="សូមបំពេញព័ត៌មានខាងក្រោម ដើម្បីបង្កើតគណនីអ្នកជួលរបស់អ្នក។"
      />

      {submitError && (
        <Alert variant="danger" className="mb-4" title="ការចុះឈ្មោះបានបរាជ័យ" description={submitError} dismissible />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="នាមខ្លួន"
            required
            value={form.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            placeholder="ឧ. សុភា"
          />
          <Input
            label="គោត្រកូល"
            required
            value={form.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            placeholder="ឧ. ច័ន្ទ"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="លេខទូរស័ព្ទ"
            required
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
            placeholder="ឧ. 012 345 678"
            leftIcon={<UserRound className="h-4 w-4" />}
          />
          <Input
            label="អ៊ីមែល"
            required={!emailLocked}
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="john@rental.com"
            helpText="អ៊ីមែលគណនីត្រូវបញ្ចប់ដោយ @rental.com (ឧ. john@rental.com)"
            disabled={emailLocked}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="ឈ្មោះអ្នកប្រើប្រាស់"
            required
            value={form.username}
            onChange={handleChange('username')}
            error={errors.username}
            placeholder="ឧ. sopha.chan"
          />
          <Input
            label="ពាក្យសម្ងាត់"
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            placeholder="យ៉ាងហោចណាស់ ៨ តួអក្សរ"
            leftIcon={<KeyRound className="h-4 w-4" />}
          />
        </div>

        <Button type="submit" fullWidth loading={submitting}>
          បង្កើតគណនីអ្នកជួល
        </Button>
      </form>
    </>
  );

  const renderDone = () => (
    <Card className="p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 rounded-full bg-green-50 p-4 dark:bg-green-950">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
        ស្វាគមន៍ លោកអ្នក {result?.firstName} {result?.lastName}!
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        គណនីអ្នកជួលរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ។ អ្នកអាចចូលប្រព័ន្ធបានភ្លាមៗនៅពេលដែល
        អ្នកគ្រប់គ្រងអចលនទ្រព្យសកម្មគណនីរបស់អ្នក។
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        ចូលប្រព័ន្ធ
      </Link>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-3 sm:p-4">
      <div className="w-full min-w-0 max-w-lg space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-900 p-2.5 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">Teasjul</span>
        </div>

        <Card className="p-5 sm:p-6 md:p-8">
          {stage === 'validating' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Spinner />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                កំពុងផ្ទៀងផ្ទាត់តំណអញ្ជើញ...
              </p>
            </div>
          ) : stage === 'valid' ? (
            renderValid()
          ) : stage === 'done' ? (
            renderDone()
          ) : (
            renderInvalid()
          )}
        </Card>

        <p className="flex items-center justify-center gap-1.5 px-2 text-center text-xs text-gray-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>តំណនេះអាចប្រើបានតែម្តងប៉ុណ្ណោះ និងផុតកំណត់ក្នុងរយៈពេល ៥ នាទី។</span>
        </p>
      </div>
    </div>
  );
};

export default TenantInvitePage;