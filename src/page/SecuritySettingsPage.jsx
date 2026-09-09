import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Mail, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound, ArrowLeft,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { securityApi } from '../api/security.api';
import { useAuthStore } from '../store/auth.store';
import { useMyRoles } from '../hooks/useMyRoles';

const SecuritySettingsPage = () => {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingVerify, setPendingVerify] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const logout = useAuthStore((s) => s.logout);
  const { loading: rolesLoading } = useMyRoles();
  const navigate = useNavigate();

  const fetchSecurity = useCallback(async () => {
    try {
      const data = await securityApi.getMySecurity();
      setSecurity(data);
      setRecoveryEmail(data.recoveryEmail || '');
      setPendingVerify(data.recoveryEmail && !data.recoveryEmailVerified);
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចទាញយកការកំណត់សុវត្ថិភាពបានទេ។');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurity();
  }, [fetchSecurity]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setActionMsg('');
    try {
      const res = await securityApi.addRecoveryEmail(recoveryEmail);
      setActionMsg(res.message);
      setPendingVerify(true);
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចផ្ញើលេខកូដផ្ទៀងផ្ទាត់បានទេ។');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setActionMsg('');
    try {
      const res = await securityApi.verifyRecoveryEmail(recoveryEmail, otp);
      setActionMsg(res.message);
      setOtp('');
      setPendingVerify(false);
      await fetchSecurity();
    } catch (err) {
      setError(err.response?.data?.message || 'លេខកូដមិនត្រឹមត្រូវ ឬផុតកំណត់។');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setBusy(true);
    setError('');
    setActionMsg('');
    try {
      if (security?.twoFactorEnabled) {
        await securityApi.disableTwoFactor();
      } else {
        await securityApi.enableTwoFactor();
      }
      await fetchSecurity();
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចធ្វើបច្ចុប្បន្នភាពការផ្ទៀងផ្ទាត់ពីរជំហានបានទេ។');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white";

  if (loading || rolesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const recoveryState = () => {
    if (!security?.recoveryEmail) return { label: 'មិនទាន់កំណត់', variant: 'neutral' };
    if (security?.recoveryEmailVerified) return { label: 'បានផ្ទៀងផ្ទាត់', variant: 'success' };
    return { label: 'រង់ចាំការផ្ទៀងផ្ទាត់', variant: 'warning' };
  };
  const recoveryStateBadge = recoveryState();

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> ត្រឡប់ក្រោយ
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">សុវត្ថិភាព</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        គ្រប់គ្រងអ៊ីមែលស្តារឡើងវិញ និងការផ្ទៀងផ្ទាត់ពីរជំហានរបស់អ្នក។
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {actionMsg && (
        <div className="mb-6 flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      <Card
        title="អ៊ីមែលស្តារឡើងវិញ"
        description="អ៊ីមែលខាងក្រៅពិតប្រាកដដែលប្រើដើម្បីស្តារគណនីរបស់អ្នក និងទទួលលេខកូដផ្ទៀងផ្ទាត់។"
        className="mb-6"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  អ៊ីមែលស្តារឡើងវិញបច្ចុប្បន្ន
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {security?.recoveryEmail || 'មិនទាន់មានអ៊ីមែលស្តារឡើងវិញនៅឡើយទេ'}
                </p>
              </div>
            </div>
            <Badge variant={recoveryStateBadge.variant}>{recoveryStateBadge.label}</Badge>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                អ៊ីមែលស្តារឡើងវិញ (ឧទាហរណ៍ Gmail របស់អ្នក)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="john.doe@gmail.com"
                  className={inputCls}
                />
              </div>
            </div>
            <Button type="submit" loading={busy} leftIcon={<Mail className="h-4 w-4" />}
              disabled={security?.recoveryEmailVerified && security?.recoveryEmail === recoveryEmail}>
              ផ្ញើលេខកូដផ្ទៀងផ្ទាត់
            </Button>
          </form>

          {pendingVerify && (
            <form onSubmit={handleVerifyOtp} className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលបានផ្ញើទៅកាន់ <span className="font-medium">{recoveryEmail}</span>។
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className={`${inputCls} max-w-[140px] tracking-widest`}
                />
                <Button type="submit" loading={busy} disabled={otp.length !== 6}
                  leftIcon={<ShieldCheck className="h-4 w-4" />}>
                  ផ្ទៀងផ្ទាត់
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">
            អ៊ីមែលស្តារឡើងវិញរបស់អ្នកនឹងត្រូវទុកចិត្តបានលុះត្រាតែបានផ្ទៀងផ្ទាត់ ហើយមិនអាចដូចគ្នាទៅនឹងអ៊ីមែលចូលប្រើប្រាស់បានឡើយ។
          </p>
        </div>
      </Card>

      {/* ការផ្ទៀងផ្ទាត់ពីរជំហាន (Two-Factor Authentication) */}
      <Card
        title="ការផ្ទៀងផ្ទាត់ពីរជំហាន"
        description="បន្ថែមស្រទាប់សុវត្ថិភាពបន្ថែម។ លេខកូដផ្ទៀងផ្ទាត់នឹងត្រូវបានតម្រូវនៅពេលអ្នកចូលប្រើប្រាស់។"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ការផ្ទៀងផ្ទាត់ពីរជំហានតាមអ៊ីមែល
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                {security?.twoFactorEnabled
                  ? 'បានបើក។ អ្នកនឹងត្រូវស្នើសុំលេខកូដដែលបានផ្ញើទៅកាន់អ៊ីមែលស្តារឡើងវិញរបស់អ្នកនៅពេលចូលប្រើប្រាស់។'
                  : 'បានបិទ។ តម្រូវឱ្យមានអ៊ីមែលស្តារឡើងវិញដែលបានផ្ទៀងផ្ទាត់ដើម្បីបើកដំណើរការ។'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={security?.twoFactorEnabled ? 'success' : 'neutral'}>
              {security?.twoFactorEnabled ? 'បានបើក' : 'បានបិទ'}
            </Badge>
            <Button
              variant={security?.twoFactorEnabled ? 'outline' : 'primary'}
              onClick={handleToggleTwoFactor}
              loading={busy}
              disabled={!security?.recoveryEmailVerified}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              {security?.twoFactorEnabled ? 'បិទ' : 'បើក'}
            </Button>
          </div>
        </div>
        {!security?.recoveryEmailVerified && (
          <p className="mt-4 flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            សូមផ្ទៀងផ្ទាត់អ៊ីមែលស្តារឡើងវិញខាងលើ ជាមុនសិន មុននឹងបើកការផ្ទៀងផ្ទាត់ពីរជំហាន។
          </p>
        )}
      </Card>

      <div className="mt-8">
        <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }}>
          ចាកចេញ
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;