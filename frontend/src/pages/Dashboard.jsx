import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useTranslation } from '../utils/i18n';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Plus, FileText, Star, ArrowRight, Sparkles, ChevronRight, Calendar, Activity, TrendingUp } from 'lucide-react';
export default function Dashboard() {
    const navigate = useNavigate();
    const user = api.getUser();
    const { t } = useTranslation();
    const [analytics, setAnalytics] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [recentBriefs, setRecentBriefs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const analyticsData = await api.get('/api/analytics');
                setAnalytics(analyticsData);
                const temps = await api.get('/api/templates');
                setTemplates(temps);
                const briefsRes = await api.get('/api/comparison/history?limit=5');
                setRecentBriefs(briefsRes.comparisons || []);
            }
            catch (err) {
                console.error('Error fetching dashboard statistics:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    const handleSelectPreset = (presetId) => {
        navigate(`/generate?preset=${presetId}`);
    };
    return (<div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"/>
        <div>
          <div className="flex items-center gap-2 text-indigo-550 font-semibold text-sm tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400"/>
            {t('empoweringSubtitle')}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100">
            {t('welcomeTitle', { name: user?.name || 'Sales Professional' })}
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
            {t('welcomeDesc')}
          </p>
        </div>
        <Link to="/generate" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 group shrink-0">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"/>
          {t('newComparisonBtn')}
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalBriefs')}</p>
            <h3 className="text-2xl font-black text-slate-200 mt-1">
              {analytics?.stats.totalGenerations ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500">
            <FileText className="w-5 h-5"/>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('generatedToday')}</p>
            <h3 className="text-2xl font-black text-slate-200 mt-1">
              {analytics?.stats.todayGenerations ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-500">
            <Activity className="w-5 h-5"/>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('avgRating')}</p>
            <h3 className="text-2xl font-black text-slate-200 mt-1">
              {analytics?.stats.averageRating ? `${analytics.stats.averageRating} / 5.0` : 'N/A'}
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
            <Star className="w-5 h-5 fill-amber-500/10"/>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('telemetryStatus')}</p>
            <h3 className="text-lg font-black text-slate-200 mt-1">{t('operational')}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-5 h-5"/>
          </div>
        </div>
      </div>

      {/* Grid Block: Charts (Left 2/3) & History (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Usage Chart */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-200 text-sm">{t('floorUsageTitle')}</h3>
            <p className="text-[11px] text-slate-550">{t('floorUsageDesc')}</p>
          </div>
          <div className="h-60 text-[10px]">
            {loading ? (<div className="h-full bg-slate-900/20 rounded-2xl animate-pulse"/>) : !analytics || analytics.charts.daily.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-600">No chart details recorded.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.charts.daily}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)"/>
                  <XAxis dataKey="date" stroke="var(--slate-550)"/>
                  <YAxis allowDecimals={false} stroke="var(--slate-550)"/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsage)" name={t('totalBriefs')}/>
                </AreaChart>
              </ResponsiveContainer>)}
          </div>
        </div>

        {/* Recent History Sidebar */}
        <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-200 text-sm">{t('recentActivity')}</h3>
            <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-305 font-bold flex items-center gap-0.5">
              {t('viewAllHistory')} <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          <div className="divide-y divide-slate-800 space-y-3.5">
            {loading ? ([1, 2, 3].map(n => (<div key={n} className="py-2.5 h-12 bg-slate-900/20 rounded-xl animate-pulse"/>))) : recentBriefs.length === 0 ? (<div className="py-12 text-center text-slate-500 text-xs">
                No competitor reports generated yet.
              </div>) : (recentBriefs.map((brief) => (<div key={brief.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between group">
                  <div className="min-w-0 pr-2">
                    <Link to={`/generate?open=${brief.id}`} className="font-bold text-slate-350 hover:text-indigo-400 transition-colors text-sm truncate block">
                      {brief.our_product} vs {brief.competitor_product}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-550">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3.5 h-3.5"/>
                        {new Date(brief.created_at).toLocaleDateString()}
                      </span>
                      {brief.rating !== null && brief.rating !== undefined && (<span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500"/>
                          {brief.rating}
                        </span>)}
                    </div>
                  </div>
                  <Link to={`/generate?open=${brief.id}`} className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4"/>
                  </Link>
                </div>)))}
          </div>
        </div>
      </div>

      {/* Product Template Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-200 tracking-wide">
            {t('autofillPresets')}
          </h2>
          <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/15">
            {t('storeDefaults')}
          </span>
        </div>

        {loading ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (<div key={n} className="bg-slate-900/20 border border-slate-850 h-36 rounded-2xl animate-pulse"/>))}
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((temp) => {
                const data = temp.preset_data;
                return (<div key={temp.id} onClick={() => handleSelectPreset(temp.id)} className="bg-slate-900/40 hover:bg-slate-900/90 border border-slate-850 hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between group relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase">
                        Template
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-550 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"/>
                    </div>
                    <h4 className="font-extrabold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">
                      {temp.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      Compare competitor {data.competitor_product} vs our {data.our_product}
                    </p>
                  </div>

                  <div className="border-t border-slate-850/60 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[120px]">Brand: {data.competitor_brand}</span>
                    <span className="text-indigo-400 font-bold group-hover:underline">{t('autofillFormBtn')}</span>
                  </div>
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
