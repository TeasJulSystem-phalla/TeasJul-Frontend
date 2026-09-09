import { useState } from 'react';
import { Mail, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { securityApi } from '../../api/security.api';

const RecoveryEmailPromptModal = ({ open, onClose, onVerified }) => {
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingVerify, setPendingVerify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const inputCls =
    "w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors disabled:opacity-50";

  const resetForm = () => {
    setRecoveryEmail('');
    setOtp('');
    setPendingVerify(false);
    setError('');
    setMsg('');
  };

  const handleClose = () => {
    resetForm();
    if (onClose) onClose();
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const res = await securityApi.addRecoveryEmail(recoveryEmail);
      setMsg(res.message);
      setPendingVerify(true);
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចផ្ញើលេខកូដផ្ទៀងផ្ទាត់បានទេ។');
    } finally {
      setBusy(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setMsg('');
    try {
      const res = await securityApi.addRecoveryEmail(recoveryEmail);
      setMsg(res.message);
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចផ្ញើលេខកូដផ្ទៀងផ្ទាត់ឡើងវិញបានទេ។');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const res = await securityApi.verifyRecoveryEmail(recoveryEmail, otp);
      setMsg(res.message);
      setOtp('');
      if (onVerified) onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'លេខកូដមិនត្រឹមត្រូវ ឬផុតកំណត់។');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="បន្ថែមអ៊ីមែលស្តារឡើងវិញ"
      description="គណនីរបស់អ្នកមិនទាន់មានអ៊ីមែលស្តារឡើងវិញដែលបានផ្ទៀងផ្ទាត់នៅឡើយទេ។ សូមបន្ថែមមួយ ដើម្បីការពារគណនីរបស់អ្នក និងអាចស្តារពាក្យសម្ងាត់ឡើងវិញបាន។"
      size="md"
      footer={
        <Button variant="ghost" onClick={handleClose} disabled={busy || resending}>
          ធ្វើក្រោយ
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        {msg && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {msg}
          </div>
        )}

        {!pendingVerify ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                អ៊ីមែលស្តារឡើងវិញ (ឧទាហរណ៍ Gmail របស់អ្នក)
              </label>
              <input
                type="email"
                required
                disabled={busy}
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="john.doe@gmail.com"
                className={inputCls}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              អ៊ីមែលស្តារឡើងវិញមិនអាចដូចគ្នាទៅនឹងអ៊ីមែលចូលប្រើប្រាស់របស់អ្នកបានទេ។
            </p>
            <Button 
              type="submit" 
              loading={busy} 
              disabled={!recoveryEmail.trim()} 
              fullWidth 
              leftIcon={<Mail className="h-4 w-4" />}
            >
              ផ្ញើលេខកូដផ្ទៀងផ្ទាត់
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <p>
                លេខកូដត្រូវបានផ្ញើទៅ <span className="font-semibold text-gray-900 dark:text-white">{recoveryEmail}</span>
              </p>
              <button
                type="button"
                onClick={() => setPendingVerify(false)}
                className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-1 h-3 w-3" /> ប្តូរ
              </button>
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                disabled={busy}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className={`${inputCls} text-center text-lg tracking-[0.5em] font-mono`}
              />
            </div>

            <Button 
              type="submit" 
              loading={busy} 
              disabled={otp.length !== 6} 
              fullWidth 
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              ផ្ទៀងផ្ទាត់
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                disabled={resending || busy}
                onClick={handleResendOtp}
                className="inline-flex items-center text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`mr-1 h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                ផ្ញើលេខកូដឡើងវិញ
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default RecoveryEmailPromptModal;