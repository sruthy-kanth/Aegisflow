import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Globe, LogOut, User, Radio, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, isSuperadmin, logout, login } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ml' ? 'en' : 'ml';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('aegisflow_lang', nextLang);
  };

  const handleQuickSwitchRole = async (targetRole) => {
    if (targetRole === 'SUPERADMIN') {
      await login('superadmin@aegisflow.gov.in', 'SuperAdmin@123!');
      navigate('/superadmin');
    } else {
      await login('admin.wayanad@aegisflow.gov.in', 'WayanadAdmin@123!');
      navigate('/admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-sky-200 bg-clip-text text-transparent">
                AegisFlow
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls & User Meta */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher for seamless evaluation */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
              Demo View:
            </span>
            <button
              onClick={() => handleQuickSwitchRole('SUPERADMIN')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                isSuperadmin
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Superadmin
            </button>
            <button
              onClick={() => handleQuickSwitchRole('ADMIN')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                !isSuperadmin
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Wayanad Admin
            </button>
          </div>

          {/* Bilingual Language Toggle (EN / മലയാളം) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition shadow-sm hover:border-cyan-500/50"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{i18n.language === 'ml' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* User Profile Capsule */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {isSuperadmin ? 'NATIONAL SUPERADMIN' : `ADMIN: ${user.regionId?.code || 'WYD'}`}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
