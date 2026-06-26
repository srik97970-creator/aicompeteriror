import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../api';
import { useTranslation, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { useTheme } from './ThemeContext';
import { LayoutDashboard, FilePlus2, History, BarChart3, Settings as SettingsIcon, LogOut, Menu, X, ShieldCheck, Building2, Globe, Sun, Moon } from 'lucide-react';
export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = api.getUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t, currentLanguage, setLanguage } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const handleLogout = () => {
        api.logout();
        navigate('/login');
    };
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, role: 'sales_staff' },
        { name: 'Compare Products', path: '/generate', icon: FilePlus2, role: 'sales_staff' },
        { name: 'Brief History', path: '/history', icon: History, role: 'sales_staff' },
        { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, role: 'admin' },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, role: 'admin' },
        { name: 'Profile & Settings', path: '/settings', icon: SettingsIcon, role: 'sales_staff' },
    ];
    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (item.role === 'admin' && user?.role !== 'admin') {
            return false;
        }
        return true;
    });
    const getTranslatedName = (name) => {
        switch (name) {
            case 'Dashboard': return t('dashboard');
            case 'Compare Products': return t('compareProducts');
            case 'Brief History': return t('briefHistory');
            case 'Admin Panel': return t('adminPanel');
            case 'Analytics': return t('analytics');
            case 'Profile & Settings': return t('settings');
            default: return name;
        }
    };
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    return (<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-500"/>
          <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {t('brandName')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer" aria-label="Toggle dark/light mode">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500"/> : <Moon className="w-5 h-5 text-indigo-400"/>}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (<div className="md:hidden fixed inset-0 top-[53px] bg-slate-950/95 backdrop-blur-md z-40 flex flex-col p-6 border-t border-slate-800">
          <div className="flex-1 flex flex-col gap-2">
            {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (<Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
                  <Icon className="w-5 h-5"/>
                  {getTranslatedName(item.name)}
                </Link>);
            })}
          </div>

          <div className="border-t border-slate-800 pt-6 mt-auto flex flex-col gap-4">
            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-2 px-4">
              <Globe className="w-4 h-4 text-indigo-400"/>
              <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value)} className="block w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none">
                {SUPPORTED_LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-medium text-slate-200 text-sm">{user?.name}</p>
                <span className="text-xs text-indigo-500 capitalize bg-indigo-500/10 px-2 py-0.5 rounded-full font-semibold">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
            }} className="flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full text-sm font-semibold">
              <LogOut className="w-5 h-5"/>
              {t('logout')}
            </button>
          </div>
        </div>)}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Brand Logo */}
        <div className="px-6 py-8 border-b border-slate-800 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-500 shrink-0"/>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">
              {t('brandName')}
            </h1>
            <p className="text-[10px] text-indigo-500 font-semibold tracking-widest mt-0.5">
              {t('brandSubtitle')}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (<Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-205 ${active
                    ? 'bg-indigo-650 text-white font-semibold shadow-lg shadow-indigo-650/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Icon className="w-5 h-5 shrink-0"/>
                <span>{getTranslatedName(item.name)}</span>
              </Link>);
        })}
        </nav>

        {/* Desktop Language Switcher */}
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/40 border border-slate-800/60 rounded-xl">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0"/>
            <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value)} className="block w-full bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer">
              {SUPPORTED_LANGUAGES.map(lang => (<option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>))}
            </select>
          </div>
        </div>

        {/* Desktop Theme Switcher */}
        <div className="px-4 mb-4">
          <button onClick={toggleTheme} className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (<>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0"/>
                  <span>Light Mode</span>
                </>) : (<>
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0"/>
                  <span>Dark Mode</span>
                </>)}
            </div>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
              {theme}
            </span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 bg-slate-950/40 border border-slate-800/60 rounded-xl mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-200 text-xs truncate">{user?.name}</p>
              <span className="text-[9px] text-indigo-400 capitalize px-2 py-0.5 rounded-full bg-indigo-500/10 font-bold inline-block mt-0.5">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all w-full text-xs font-semibold">
            <LogOut className="w-4 h-4"/>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>);
}
