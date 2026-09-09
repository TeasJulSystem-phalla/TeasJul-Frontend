import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { securityApi } from '../../api/security.api';
import { useAuthStore } from '../../store/auth.store';

const TwoFactorVerifyPage = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const challengeToken = location.state?.challengeToken;
  const redirectTo = location.state?.redirectTo || '/';

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!challengeToken) {
      setError('Your sign-in session has expired. Please sign in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await securityApi.verifyTwoFactor(challengeToken, otp);
      setAuth(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'The code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm text-center text-2xl tracking-[0.5em]";

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-slate-900 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Teasjul</span>
          </div>

          <div className="mb-6 text-center">
            <div className="mx-auto w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-slate-900" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Two-factor authentication</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter the 6-digit code sent to your verified recovery email to complete sign-in.
            </p>
          </div>

          {!challengeToken && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              Your sign-in session has expired. Please sign in again.
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={inputCls}
                autoFocus
              />
            </div>
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Verify & Sign In
            </button>
          </form>

          <button
            onClick={() => navigate('/login')}
            className="mt-5 w-full py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerifyPage;
