import { api } from '../api';
import { useTheme } from '../components/ThemeContext';
import { Building2, Shield, ShieldCheck, HelpCircle, Sun, Moon } from 'lucide-react';
export default function Settings() {
    const user = api.getUser();
    const { theme, setTheme } = useTheme();
    return (<div className="space-y-8 max-w-4xl animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-550"/>
          Store Profile & Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Review your account profile details and corporate branding directives for Nethi Mallikarjun Gupta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"/>

          <div className="w-16 h-16 rounded-full bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xl font-black mb-4">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <h3 className="font-extrabold text-slate-200 text-sm truncate">{user?.name}</h3>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="mt-5 w-full">
            <span className="text-[10px] text-indigo-400 font-extrabold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-550/20 uppercase tracking-widest inline-flex items-center gap-1">
              {user?.role === 'admin' ? (<>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-450"/>
                  Administrator
                </>) : (<>
                  <Shield className="w-3.5 h-3.5 text-slate-500"/>
                  Sales Floor Staff
                </>)}
            </span>
          </div>
        </div>

        {/* Branding & App Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h4 className="font-extrabold text-slate-200 text-sm border-b border-slate-850 pb-3">Corporate Branding System</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Company Owner</span>
                <p className="font-bold text-slate-305">NETHI MALLIKARJUN GUPTA</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Comparison Engine</span>
                <p className="font-bold text-slate-305">AI Brief Generator v1.0.0</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Core Theme Palette</span>
                <p className="font-bold text-slate-305">White + Slate + Indigo Blue</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Primary Retail Channel</span>
                <p className="font-bold text-slate-350">Store Floor Counter-Sales</p>
              </div>
            </div>
          </div>

          {/* Theme Preference Settings */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h4 className="font-extrabold text-slate-200 text-sm border-b border-slate-850 pb-3">Theme Settings</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggle between dark and light themes for optimal visibility and comfort during floor consultations.
            </p>
            <div className="flex gap-4 pt-1">
              <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-205 cursor-pointer ${theme === 'light'
            ? 'bg-indigo-650 border-indigo-650 text-white shadow-lg shadow-indigo-650/15'
            : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-805'}`}>
                <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`}/>
                Light Theme
              </button>
              <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-205 cursor-pointer ${theme === 'dark'
            ? 'bg-indigo-650 border-indigo-650 text-white shadow-lg shadow-indigo-650/15'
            : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-805'}`}>
                <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-500'}`}/>
                Dark Theme
              </button>
            </div>
          </div>

          {/* Help & Support guidelines */}
          <div className="bg-slate-900/20 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400"/>
              Floor Staff Guidelines
            </h4>
            <div className="space-y-3 text-[11px] text-slate-400 leading-relaxed pl-1">
              <p>
                1. <strong className="text-slate-300">Be Factual First:</strong> Ensure competitor features match what the client describes. The AI highlights stocked advantages, but honesty retains customer trust.
              </p>
              <p>
                2. <strong className="text-slate-300">Value Over Price:</strong> If our stocked product has a positive price difference (more expensive), highlight the extended warranty, lifetime frame/motor coverage, or local service.
              </p>
              <p>
                3. <strong className="text-slate-300">Use Talking Points:</strong> Conversational cues are crafted to sound natural on the floor. Avoid reading briefs word-for-word; adjust to the client's mood.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
