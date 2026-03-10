import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', church: '', password: '', confirm: '' });
  const [regErrors, setRegErrors] = useState<Partial<typeof regForm>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    setTimeout(() => {
      const ok = login(loginForm.email, loginForm.password);
      setLoginLoading(false);
      if (ok) {
        navigate('/dashboard');
      } else {
        setLoginError('Incorrect email or password. Try customer@demo.com / demo123');
      }
    }, 600);
  };

  const validateReg = () => {
    const e: Partial<typeof regForm> = {};
    if (!regForm.name.trim()) e.name = 'Name required';
    if (!regForm.email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) e.email = 'Invalid email';
    if (!regForm.church.trim()) e.church = 'Church name required';
    if (!regForm.password.trim()) e.password = 'Password required';
    else if (regForm.password.length < 6) e.password = 'Min 6 characters';
    if (regForm.confirm !== regForm.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateReg();
    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }
    // Demo: just log them in after "registering"
    navigate('/dashboard');
  };

  const inputCls = (error?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white ${
      error ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <div className="rounded-xl overflow-hidden grid grid-cols-2" style={{ width: 40, height: 40 }}>
              <div style={{ backgroundColor: '#2563EB' }} />
              <div style={{ backgroundColor: '#EF4444' }} />
              <div style={{ backgroundColor: '#FACC15' }} />
              <div style={{ backgroundColor: '#22C55E' }} />
            </div>
            <span className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              minashow
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm transition-all ${
                  activeTab === tab
                    ? 'border-b-2 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: activeTab === tab ? 700 : undefined,
                  color: activeTab === tab ? '#2563EB' : undefined,
                  borderColor: activeTab === tab ? '#2563EB' : undefined,
                  backgroundColor: activeTab === tab ? '#EFF6FF' : undefined,
                }}
              >
                {tab === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={inputCls()}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={inputCls()}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                {loginError && (
                  <p
                    className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full py-3 rounded-full transition-colors ${
                    loginLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    backgroundColor: loginLoading ? undefined : '#2563EB',
                  }}
                >
                  {loginLoading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Demo hint */}
                <div className="rounded-xl p-3 text-xs border" style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: '#FEFCE8', borderColor: '#FDE68A', color: '#92400E' }}>
                  <strong>Demo credentials:</strong><br />
                  Customer: customer@demo.com / demo123<br />
                  Admin: admin@minashow.com / admin123
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {[
                  { field: 'name', label: 'Full name', type: 'text', placeholder: 'Your name' },
                  { field: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                  { field: 'church', label: 'Church name', type: 'text', placeholder: 'e.g. St. Mark Church' },
                  { field: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                  { field: 'confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label
                      className="block text-gray-700 text-sm mb-1.5"
                      style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={regForm[field as keyof typeof regForm]}
                      onChange={(e) => {
                        setRegForm((f) => ({ ...f, [field]: e.target.value }));
                        if (regErrors[field as keyof typeof regErrors])
                          setRegErrors((e2) => ({ ...e2, [field]: undefined }));
                      }}
                      placeholder={placeholder}
                      className={inputCls(regErrors[field as keyof typeof regErrors])}
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    />
                    {regErrors[field as keyof typeof regErrors] && (
                      <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {regErrors[field as keyof typeof regErrors]}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full py-3 rounded-full text-white transition-colors hover:opacity-90"
                  style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, backgroundColor: '#2563EB' }}
                >
                  Create account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}