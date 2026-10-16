import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, Globe, ArrowRight, Activity, ShieldCheck, KeyRound } from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ml' ? 'en' : 'ml';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('aegisflow_lang', nextLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'SUPERADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top right language switch */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{i18n.language === 'ml' ? 'മലയാളം' : 'English'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-xl shadow-cyan-500/20 text-white">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          AegisFlow
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          {t('appSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300">Official Email</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aegisflow.gov.in"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Command Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Demo Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin@aegisflow.gov.in', 'SuperAdmin@123!')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Superadmin (National)
                  </div>
                  <div className="text-[10px] text-slate-400">superadmin@aegisflow.gov.in</div>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">Auto-fill &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin.wayanad@aegisflow.gov.in', 'WayanadAdmin@123!')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Wayanad Admin (Regional DDMA)
                  </div>
                  <div className="text-[10px] text-slate-400">admin.wayanad@aegisflow.gov.in</div>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">Auto-fill &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security architecture notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            Citizen, Volunteer & Warden access requires no password — authenticated via high-entropy tokenized links.
          </p>
        </div>
      </div>
    </div>
  );
}
