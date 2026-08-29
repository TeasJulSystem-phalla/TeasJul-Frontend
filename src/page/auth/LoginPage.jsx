import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, ShieldCheck, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('landlord');
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch {
      // error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* Light card wrapper floating over slate-100 background */}
      <div className="max-w-7xl w-full flex bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800">
        
        {/* Left Side: Dark Hero / Branding Column */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-700/30 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Teasjul</span>
          </div>

          {/* Highlight Hero Text */}
          <div className="max-w-md z-10 space-y-6">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-800 rounded-full border border-slate-700">
              ប្រព័ន្ធគ្រប់គ្រងការជួល
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              ការគ្រប់គ្រងអចលនទ្រព្យ និងកិច្ចសន្យាជួលដ៏ងាយស្រួល
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              ធ្វើស្វ័យប្រវត្តិកម្មការប្រមូលប្រាក់ជួល ធ្វើឱ្យសាមញ្ញនូវការស្នើជួសជុល និងតាមដានអ្នកជួលទាំងអស់ នៅលើវេទិការួមតែមួយ។
            </p>

            {/* Feature Bullet Points */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
                <span>កិច្ចសន្យាជួលដោយស្វ័យប្រវត្តិ និងហត្ថលេខាឌីជីថល</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <KeyRound className="w-5 h-5 text-slate-400 shrink-0" />
                <span>តាមដានប្រាក់ជួលតាមពេលវេលាជាក់ស្តែង និងការរំលឹកដោយស្វ័យប្រវត្តិ</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="z-10 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Teasjul Inc. រក្សាសិទ្ធិគ្រប់យ៉ាង។
          </div>
        </div>

        {/* Right Side: Clean White Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            
            {/* Mobile Logo Header */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <Building2 className="w-7 h-7 text-slate-900" />
              <span className="text-xl font-bold text-slate-900">Teasjul</span>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">ស្វាគមន៍មកកាន់វិញ</h2>
              <p className="mt-2 text-sm text-slate-600">
                សូមបញ្ចូលព័ត៌មានរបស់អ្នក ដើម្បីចូលប្រព័ន្ធ។
              </p>
            </div>

            {/* Role Switcher Tab (Dark Active Accent) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-sm font-medium border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`py-2 rounded-lg transition-all ${
                  role === 'landlord'
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ម្ចាស់អចលនទ្រព្យ / អ្នកគ្រប់គ្រង
              </button>
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`py-2 rounded-lg transition-all ${
                  role === 'tenant'
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                អ្នកជួល
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  អាសយដ្ឋានអ៊ីមែល
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    ពាក្យសម្ងាត់
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-slate-900 hover:underline">
                    ភ្លេចពាក្យសម្ងាត់?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2.5 text-sm text-slate-600 cursor-pointer select-none">
                  ចងចាំខ្ញុំរយៈពេល 30 ថ្ងៃ
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Black Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងចូលប្រព័ន្ធ...</span>
                  </>
                ) : (
                  <>
                    <span>ចូលប្រព័ន្ធ Teasjul</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Prompt */}
            <p className="text-center text-sm text-slate-600">
              មិនទាន់មានគណនី?{' '}
              <a href="#signup" className="font-semibold text-slate-900 hover:underline">
                ស្នើសុំសិទ្ធិចូលប្រើ / ចុះឈ្មោះអចលនទ្រព្យ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;