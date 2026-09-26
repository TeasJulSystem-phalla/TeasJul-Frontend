import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Loader2, AlertCircle, Check,
  Building2, FileText, ReceiptText, Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

const REMEMBER_KEY = 'teasjul_login_email';

const FEATURES = [
  { icon: Building2, title: 'អចលនទ្រព្យ', desc: 'គ្រប់គ្រងផ្ទះ និងបន្ទប់' },
  { icon: Users, title: 'អ្នកជួល', desc: 'តាមដានព័ត៌មានអ្នកជួល' },
  { icon: FileText, title: 'កិច្ចសន្យា', desc: 'បង្កើត និងគ្រប់គ្រង' },
  { icon: ReceiptText, title: 'វិក្កយបត្រ', desc: 'ចេញ និងតាមដានចំណូល' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(REMEMBER_KEY) : '';
    return { email: saved || '', password: '', remember: Boolean(saved) };
  });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.remember) window.localStorage.setItem(REMEMBER_KEY, formData.email);
    else window.localStorage.removeItem(REMEMBER_KEY);
    try {
      const data = await login(formData.email, formData.password);
      if (data?.requiresTwoFactor) {
        navigate('/auth/2fa', { state: { challengeToken: data.challengeToken, redirectTo: '/dashboard' } });
        return;
      }
      navigate('/dashboard');
    } catch {}
  };
  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-white font-khmer">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:gap-12 lg:px-10">
        {/* ============ LEFT — BRAND PANEL ============ */}
        <div className="relative hidden overflow-hidden rounded-2xl bg-[#0f2942] p-10 lg:flex lg:flex-col lg:justify-between lg:self-stretch xl:p-14">
          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Logo */}
          <Link to="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg">
              <img src={logo} alt="TeasJul" className="h-full w-full object-contain p-1" />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-[0.1em] text-white">TEASJUL</p>
              <p className="text-[9.5px] uppercase tracking-[0.2em] text-sky-200/60">
                Property Management
              </p>
            </div>
          </Link>

          {/* Headline + features */}
          <div className="relative z-10 max-w-[420px]">
            <h2 className="text-[28px] font-bold leading-[1.3] tracking-tight text-white">
              គ្រប់គ្រងផ្ទះជួល<br />
              <span className="text-sky-300">ក្នុងប្រព័ន្ធតែមួយ</span>
            </h2>
            <p className="mt-4 text-[13px] leading-[1.7] text-slate-300/80">
              ចាប់ផ្តើមពីបន្ទប់ រហូតដល់កិច្ចសន្យា វិក្កយបត្រ និងរបាយការណ៍ចំណូល។
            </p>

            <ul className="mt-7 space-y-3.5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
                    <Icon className="h-3.5 w-3.5 text-sky-300" strokeWidth={1.9} />
                  </span>
                  <div className="leading-snug">
                    <p className="text-[12.5px] font-semibold text-white">{title}</p>
                    <p className="text-[11px] text-slate-300/70">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="relative z-10 text-[10.5px] text-white/40">
            © {new Date().getFullYear()} TeasJul. រក្សាសិទ្ធិគ្រប់បែបយ៉ាង។
          </p>
        </div>

        {/* ============ RIGHT — FORM ============ */}
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-[400px]">
            {/* Mobile logo */}
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                <img src={logo} alt="TeasJul" className="h-full w-full object-contain p-1" />
              </div>
              <span className="text-[14px] font-bold tracking-[0.1em] text-[#0f2942]">TEASJUL</span>
            </Link>

            {/* Heading */}
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-slate-900">
              សូមស្វាគមន៍ត្រឡប់មកវិញ
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              ចូលប្រើគណនីរបស់អ្នកដើម្បីបន្ត។
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                  អ៊ីមែល
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="abc@teasjul.com"
                  value={formData.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#0f2942] focus:ring-4 focus:ring-[#0f2942]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setField('password', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-3.5 pr-11 text-[13.5px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#0f2942] focus:ring-4 focus:ring-[#0f2942]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex cursor-pointer select-none items-center gap-2">
                  <span className="relative flex h-[16px] w-[16px] items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={formData.remember}
                      onChange={(e) => setField('remember', e.target.checked)}
                    />
                    <span className="h-[16px] w-[16px] rounded-[5px] border border-slate-300 bg-white transition-colors peer-checked:border-[#0f2942] peer-checked:bg-[#0f2942]" />
                    <Check className="pointer-events-none absolute h-[11px] w-[11px] text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                  </span>
                  <span className="text-[12.5px] text-slate-600">ចងចាំខ្ញុំ</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] font-medium text-[#0f2942] hover:underline"
                >
                  ភ្លេចពាក្យសម្ងាត់?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0f2942] text-[13.5px] font-semibold text-white transition-all hover:bg-[#1a3d5f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>កំពុងចូល...</span>
                  </>
                ) : (
                  'ចូលប្រើប្រាស់'
                )}
              </button>
            </form>

            {/* Signup */}
            <p className="mt-5 text-center text-[12.5px] text-slate-500">
              មិនទាន់មានគណនី?{' '}
              <Link to="/register-business" className="font-semibold text-[#0f2942] hover:underline">
                ចុះឈ្មោះអាជីវកម្ម
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}