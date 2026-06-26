import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../components/ui/Toast';
import { Building2, KeyRound, Mail, Eye, EyeOff, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
export default function Login() {
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');
    // Redirect if already logged in, or auto-fill email
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            navigate('/', { replace: true });
            return;
        }
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, [navigate]);
    const handleLogin = async (e) => {
        e.preventDefault();
        setValidationError('');
        if (!email || !password) {
            setValidationError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            const data = await api.post('/api/auth/login', { email, password });
            api.setToken(data.token);
            api.setUser(data.user);
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            }
            else {
                localStorage.removeItem('remembered_email');
            }
            success(`Logged in successfully as ${data.user.name}!`);
            // Redirect based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            }
            else {
                navigate('/');
            }
        }
        catch (err) {
            toastError(err.message || 'Invalid email or password.');
            setValidationError(err.message || 'Verification failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button onClick={toggleTheme} className="p-2.5 bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer" title="Toggle dark/light theme">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500"/> : <Moon className="w-5 h-5 text-indigo-400"/>}
        </button>
      </div>

      {/* Background radial highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"/>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"/>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2.5">
          <Building2 className="w-10 h-10 text-indigo-500"/>
          <h2 className="text-xl font-black tracking-widest text-slate-100 uppercase">
            NETHI MALLIKARJUN GUPTA
          </h2>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400 font-medium tracking-wide">
          COMPETITOR FEATURE COMPARISON BRIEF GENERATOR
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          <h3 className="text-lg font-bold text-slate-200 mb-6 text-center">Account Sign In</h3>
          
          <form className="space-y-5" onSubmit={handleLogin}>
            {validationError && (<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5"/>
                <span>{validationError}</span>
              </div>)}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-500"/>
                </div>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 transition-colors" placeholder="name@nethigupta.com"/>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 h-5 text-slate-500"/>
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 transition-colors" placeholder="••••••••"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 rounded cursor-pointer"/>
                <label htmlFor="remember-me" className="ml-2 block text-slate-400 font-medium select-none cursor-pointer">
                  Remember email
                </label>
              </div>

              <div className="text-sm">
                <button type="button" onClick={() => toastError('Please contact the Nethi Mallikarjun Gupta IT administrator to reset your password.')} className="font-semibold text-indigo-400 hover:text-indigo-305 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 text-sm">
                {loading ? (<span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
                  </span>) : ('Sign In to Floor Terminal')}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-850 pt-5 text-center">
            <span className="text-xs text-slate-500">New employee on the sales floor?</span>
            <Link to="/register" className="ml-1 text-xs font-bold text-indigo-400 hover:text-indigo-350 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
