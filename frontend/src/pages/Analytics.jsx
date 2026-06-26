import { useState, useEffect } from 'react';
import { api } from '../api';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Building2, TrendingUp, Users, Star, CalendarRange, BarChart3, ShieldAlert, MessageSquare } from 'lucide-react';
export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Loaded analytics parts
    const [general, setGeneral] = useState(null);
    const [quality, setQuality] = useState(null);
    const [trends, setTrends] = useState(null);
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError('');
                const [generalData, qualityData, trendsData] = await Promise.all([
                    api.get('/api/analytics'),
                    api.get('/api/analytics/quality'),
                    api.get('/api/analytics/trends')
                ]);
                setGeneral(generalData);
                setQuality(qualityData);
                setTrends(trendsData);
            }
            catch (err) {
                setError(err.message || 'Access denied. Administrator credentials required.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);
    if (loading) {
        return (<div className="space-y-6">
        <div className="h-10 w-48 bg-slate-900/60 rounded-xl animate-pulse"/>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (<div key={n} className="h-28 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse"/>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[300px] bg-slate-900/20 border border-slate-850 rounded-3xl animate-pulse"/>
          <div className="h-[300px] bg-slate-900/20 border border-slate-850 rounded-3xl animate-pulse"/>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert className="w-8 h-8"/>
        </div>
        <h3 className="font-extrabold text-slate-205">Unauthorized Access</h3>
        <p className="text-xs text-slate-505 leading-relaxed">
          {error}. Only users registered with administrative privileges can view store-wide metrics and rating diagnostics.
        </p>
      </div>);
    }
    const { stats, charts } = general;
    const COLORS = ['#6366f1', '#38bdf8', '#0ea5e9', '#0284c7', '#bae6fd'];
    return (<div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-500"/>
          Telemetry Analytics
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Monitor store-wide brief generations, quality ratings, and competitor comparisons for Nethi Mallikarjun Gupta.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Generations */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Generations</p>
            <h3 className="text-2xl font-black text-slate-200">{stats.totalGenerations}</h3>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 pt-1">
              <TrendingUp className="w-3.5 h-3.5"/> Cumulative Briefs
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500">
            <BarChart3 className="w-5 h-5"/>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Staff Accounts</p>
            <h3 className="text-2xl font-black text-slate-200">{stats.totalUsers}</h3>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 pt-1">
              Registered floor staff
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500">
            <Users className="w-5 h-5"/>
          </div>
        </div>

        {/* Average Quality Rating */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Quality Rating</p>
            <h3 className="text-2xl font-black text-slate-200">{stats.averageRating} / 5.0</h3>
            <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 pt-1">
              <Star className="w-3.5 h-3.5 fill-amber-500"/> Star Rating Average
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
            <Star className="w-5 h-5 fill-amber-500/10"/>
          </div>
        </div>

        {/* Reports Generated Today */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generated Today</p>
            <h3 className="text-2xl font-black text-slate-200">{stats.todayGenerations}</h3>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 pt-1">
              24-Hour window activity
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500">
            <CalendarRange className="w-5 h-5"/>
          </div>
        </div>

      </div>

      {/* Grid: Charts timeline daily & monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Timeline Area Chart (Daily generations) */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Daily Usage Activity (Last 7 Days)</h4>
            <p className="text-[11px] text-slate-500">Count of daily comparison briefs generated on the sales floor.</p>
          </div>

          <div className="h-64 text-[10px]">
            {charts.daily.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-600">No activity data recorded in the last 7 days.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.daily}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)"/>
                  <XAxis dataKey="date" stroke="var(--slate-550)"/>
                  <YAxis allowDecimals={false} stroke="var(--slate-550)"/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Briefs Generated"/>
                </AreaChart>
              </ResponsiveContainer>)}
          </div>
        </div>

        {/* Monthly Usage Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Monthly Generation Totals</h4>
            <p className="text-[11px] text-slate-500">Cumulative comparison telemetry logs aggregated by month.</p>
          </div>

          <div className="h-64 text-[10px]">
            {charts.monthly.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-600">No monthly logs recorded.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)"/>
                  <XAxis dataKey="month" stroke="var(--slate-550)"/>
                  <YAxis allowDecimals={false} stroke="var(--slate-550)"/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Briefs Generated"/>
                </BarChart>
              </ResponsiveContainer>)}
          </div>
        </div>

      </div>

      {/* Grid: Competitor Trends & Quality Star Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Most Compared Competitors (BarChart) */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md lg:col-span-2">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Most Compared Competitor Products</h4>
            <p className="text-[11px] text-slate-500">Top 5 competitor products queried by sales reps.</p>
          </div>

          <div className="h-64 text-[10px]">
            {!charts.topCompetitor || charts.topCompetitor.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-650">No comparisons logged yet.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.topCompetitor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)"/>
                  <XAxis type="number" stroke="var(--slate-550)" allowDecimals={false}/>
                  <YAxis dataKey="name" type="category" stroke="var(--slate-550)" width={120}/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Times Compared"/>
                </BarChart>
              </ResponsiveContainer>)}
          </div>
        </div>

        {/* Quality Star Review Distribution */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Star Rating Distribution</h4>
            <p className="text-[11px] text-slate-500">Aggregated floor quality review scores.</p>
          </div>

          <div className="h-64 text-[10px]">
            {!quality || quality.distribution.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-650">No feedback submitted.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <BarChart data={quality.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)"/>
                  <XAxis dataKey="stars" stroke="var(--slate-550)"/>
                  <YAxis stroke="var(--slate-550)" allowDecimals={false}/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                  <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Feedbacks Received"/>
                </BarChart>
              </ResponsiveContainer>)}
          </div>
        </div>

      </div>

      {/* Row Block: Top Competitor Brands & Recent User Feedback Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Competitor Brands (PieChart) */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Compared Competitor Brands</h4>
            <p className="text-[11px] text-slate-500">Share of competitor brand comparisons.</p>
          </div>

          <div className="h-60 text-[9px] flex items-center justify-center">
            {!trends || trends.competitorBrands.length === 0 ? (<div className="text-slate-650">No brand data available.</div>) : (<div className="w-full h-full flex flex-col items-center justify-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={trends.competitorBrands} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="count">
                        {trends.competitorBrands.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--slate-900)', borderColor: 'var(--slate-800)', color: 'var(--slate-100)', borderRadius: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400">
                  {trends.competitorBrands.map((brand, idx) => (<div key={brand.name} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}/>
                      <span>{brand.name} ({brand.count})</span>
                    </div>))}
                </div>
              </div>)}
          </div>
        </div>

        {/* Recent star feedback comments */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-md lg:col-span-2">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-1.5">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-400"/>
              Recent Floor Feedback Comments
            </h4>
            <p className="text-[11px] text-slate-500">Qualitative critiques submitted by sales staff on brief accuracy.</p>
          </div>

          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            {!quality || quality.comments.length === 0 ? (<div className="py-8 text-center text-slate-600 text-xs">No feedback comments recorded.</div>) : (quality.comments.map((comment) => (<div key={comment.id} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">{comment.staff_name}</span>
                      <span className="text-slate-500">on {comment.comparison}</span>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5"/>
                      {comment.rating} Star
                    </div>
                  </div>
                  <p className="text-slate-350 italic leading-relaxed pl-1">
                    {comment.comment || <span className="text-slate-600 font-normal">Rating review submitted with no comment text.</span>}
                  </p>
                </div>)))}
          </div>
        </div>

      </div>

    </div>);
}
