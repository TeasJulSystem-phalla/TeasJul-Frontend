import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Mail, ShieldCheck, Loader2, ArrowLeft,
  KeyRound, CheckCircle2, KeyRound as KeyIcon, AlertCircle
} from 'lucide-react';
import { securityApi } from '../../api/security.api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    try {
      const res = await securityApi.forgotPassword(email);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'មិនអាចស្នើសុំលេខកូដបានទេ។ សូមព្យាយាមម្តងទៀត។' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await securityApi.verifyPasswordResetOtp(email, otp);
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'លេខកូដមិនត្រឹមត្រូវ ឬផុតកំណត់។' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (newPassword !== confirmPassword) {
      setErrors({ form: 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។' });
      setLoading(false);
      return;
    }
    try {
      await securityApi.resetPassword(resetToken, newPassword, confirmPassword);
      setStep(4);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'មិនអាចកំណត់ពាក្យសម្ងាត់ឡើងវិញបានទេ។ សូមចាប់ផ្តើមឡើងវិញ។' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm";

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
        
        {/* Header / Brand */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Teasjul</span>
        </div>

        {step === 4 ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto border border-gray-200">
              <CheckCircle2 className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">បានកំណត់ពាក្យសម្ងាត់ជោគជ័យ</h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                ពាក្យសម្ងាត់របស់អ្នកត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ។ ឥឡូវនេះអ្នកអាចចូលប្រើប្រាស់ដោយប្រើពាក្យសម្ងាត់ថ្មីបានហើយ។
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors"
            >
              <KeyIcon className="w-4 h-4" />
              ត្រឡប់ទៅទំព័រចូលប្រើប្រាស់
            </Link>
          </div>
        ) : (
          <>
            {/* Simple Step Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                <span>ជំហានទី {step} នៃ ៣</span>
                <span>{step === 1 ? 'អ៊ីមែល' : step === 2 ? 'ផ្ទៀងផ្ទាត់' : 'ពាក្យសម្ងាត់ថ្មី'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1 flex-1 rounded-full transition-all ${
                      s <= step ? 'bg-gray-900' : 'bg-gray-200'
                    }`} 
                  />
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {step === 1 && 'បញ្ជូលអ៊ីមែលរបស់អ្នក'}
                {step === 2 && 'ផ្ទៀងផ្ទាត់លេខកូដ'}
                {step === 3 && 'បង្កើតពាក្យសម្ងាត់ថ្មី'}
              </h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {step === 1 && 'បញ្ចូលអ៊ីមែលចូលប្រើប្រាស់របស់អ្នក។ លេខកូដស្តារឡើងវិញនឹងត្រូវផ្ញើទៅកាន់អ៊ីមែលនេះ។'}
                {step === 2 && 'បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក។'}
                {step === 3 && 'សូមបង្កើតពាក្យសម្ងាត់ថ្មីដែលមានសុវត្ថិភាពសម្រាប់គណនីរបស់អ្នក។'}
              </p>
            </div>

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    អ៊ីមែលចូលប្រើប្រាស់
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@rental.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
                {errors.form && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-gray-600" />
                    <span>{errors.form}</span>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  ផ្ញើលេខកូដស្តារឡើងវិញ
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {message && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs">
                    {message}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    លេខកូដផ្ទៀងផ្ទាត់ (៦ ខ្ទង់)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={`${inputCls} tracking-widest text-center text-base font-mono`}
                  />
                </div>
                {errors.form && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-gray-600" />
                    <span>{errors.form}</span>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  ផ្ទៀងផ្ទាត់លេខកូដ
                </button>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> ផ្លាស់ប្តូរអ៊ីមែល
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="យ៉ាងហោចណាស់ ៨ តួអក្សរ"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ឡើងវិញ"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>
                {errors.form && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-gray-600" />
                    <span>{errors.form}</span>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  កំណត់ពាក្យសម្ងាត់ឡើងវិញ
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-gray-500">
              ចាំពាក្យសម្ងាត់របស់អ្នកឡើងវិញ?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:underline">
                ចូលប្រើប្រាស់
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;